import os
import time
import logging
import json
import requests
import tweepy
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants from Secret Environment Variables
X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN")
FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS")

# Validate required variables
if not all([X_BEARER_TOKEN, FIREBASE_CREDENTIALS_JSON]):
    logger.error("Missing required environment variables: X_BEARER_TOKEN or FIREBASE_CREDENTIALS")
    exit(1)

# Initialize Firebase
try:
    cred_dict = json.loads(FIREBASE_CREDENTIALS_JSON)
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    logger.error(f"Error initializing Firebase: {e}")
    exit(1)

# Initialize Tweepy Client (X API v2)
client = tweepy.Client(
    bearer_token=X_BEARER_TOKEN,
    wait_on_rate_limit=True
)

def get_or_create_user_id(username):
    """Resolve and cache user_id for a username."""
    # Clean username
    username = username.strip().replace("@", "")
    
    doc_ref = db.collection('user_id_cache').document(username)
    doc = doc_ref.get()
    
    if doc.exists:
        return doc.to_dict().get('user_id')
    
    try:
        user_resp = client.get_user(username=username)
        if not user_resp or not user_resp.data:
            logger.warning(f"User {username} not found on X.")
            return None
        
        user_id = str(user_resp.data.id)
        doc_ref.set({
            'username': username,
            'user_id': user_id,
            'updated_at': firestore.SERVER_TIMESTAMP
        })
        return user_id
    except Exception as e:
        logger.error(f"Error resolving user {username}: {e}")
        return None

def get_last_seen_id(sync_id):
    """Fetch the last processed tweet ID for a specific sync pipeline."""
    doc_ref = db.collection('sync_tracking').document(str(sync_id))
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict().get('last_tweet_id')
    return None

def update_last_seen_id(sync_id, last_tweet_id):
    """Update the last processed tweet ID for a specific sync pipeline."""
    db.collection('sync_tracking').document(str(sync_id)).set({
        'last_tweet_id': str(last_tweet_id),
        'updated_at': firestore.SERVER_TIMESTAMP
    }, merge=True)

def send_discord_webhook(webhook_url, content, image_url=None):
    """Sends a message to Discord."""
    payload = {'content': content}
    if image_url:
        payload['embeds'] = [{'image': {'url': image_url}}]
        
    try:
        response = requests.post(webhook_url, json=payload, timeout=15)
        response.raise_for_status()
        time.sleep(0.5) # Rate limit protection
        return True
    except Exception as e:
        logger.error(f"Failed to send Discord message to {webhook_url}: {e}")
        return False

def check_keywords(text, keywords_str):
    """Checks if text contains any of the keywords/phrases."""
    if not keywords_str:
        return True
        
    # Basic keyword parser (respects quotes)
    import re
    regex = r'"[^"]+"|[^\s,]+'
    keywords = [m.replace('"', '').lower() for m in re.findall(regex, keywords_str)]
    
    text_lower = text.lower()
    return any(kw in text_lower for kw in keywords)

def process_sync(sync):
    """Process a single sync configuration from Firestore."""
    sync_id = sync.get('id')
    name = sync.get('name')
    source_names = sync.get('sourceNames', '')
    webhook_url = sync.get('webhookUrl')
    skip_replies = sync.get('skipReplies', True)
    skip_retweets = sync.get('skipRetweets', True)
    filter_keywords = sync.get('filterKeywords', '')
    
    if not webhook_url or not source_names:
        logger.warning(f"Skipping sync '{name}': Missing Webhook or Sources")
        return

    usernames = [u.strip() for u in source_names.split(',') if u.strip()]
    last_processed_id = get_last_seen_id(sync_id)
    
    new_overall_last_id = last_processed_id
    total_sent = 0

    for username in usernames:
        user_id = get_or_create_user_id(username)
        if not user_id: continue
        
        logger.info(f"Processing @{username} for Sync '{name}'...")
        
        kwargs = {
            'id': user_id,
            'max_results': 20,
            'expansions': ["attachments.media_keys"],
            'tweet_fields': ["created_at", "text", "referenced_tweets"],
            'media_fields': ["url", "type"],
            'user_auth': False
        }
        if last_processed_id:
            kwargs['since_id'] = last_processed_id

        try:
            resp = client.get_users_tweets(**kwargs)
            if not resp or not resp.data:
                continue
                
            tweets = list(reversed(resp.data)) # Process oldest first
            media_pool = {m['media_key']: m for m in resp.includes.get('media', [])} if resp.includes else {}
            
            for tweet in tweets:
                # 1. Check Filters
                is_retweet = tweet.referenced_tweets and any(r.type == 'retweeted' for r in tweet.referenced_tweets)
                is_reply = tweet.referenced_tweets and any(r.type == 'replied_to' for r in tweet.referenced_tweets)
                
                if skip_retweets and is_retweet: continue
                if skip_replies and is_reply: continue
                
                # 2. Check Keywords
                if not check_keywords(tweet.text, filter_keywords): continue
                
                # 3. Extract Media
                photo_url = None
                if tweet.attachments and 'media_keys' in tweet.attachments:
                    for mk in tweet.attachments['media_keys']:
                        media = media_pool.get(mk)
                        if media and media.get('type') == 'photo':
                            photo_url = media.get('url')
                            break # Just one photo for simplicity
                
                # 4. Format & Send
                content = f"**@{username}**\n{tweet.text}\n\nhttps://x.com/{username}/status/{tweet.id}"
                if send_discord_webhook(webhook_url, content, photo_url):
                    total_sent += 1
                
                # Track latest ID
                if not new_overall_last_id or int(tweet.id) > int(new_overall_last_id):
                    new_overall_last_id = tweet.id
                    
        except Exception as e:
            logger.error(f"Error processing @{username}: {e}")

    if new_overall_last_id and new_overall_last_id != last_processed_id:
        update_last_seen_id(sync_id, new_overall_last_id)
        logger.info(f"Sync '{name}' complete. Sent {total_sent} messages. Last ID: {new_overall_last_id}")

def main():
    logger.info("Sync Engine Started")
    # Fetch all active Twitter syncs from Firestore
    syncs_ref = db.collection('syncs').where('status', '==', 'Active').where('source', '==', 'Twitter')
    syncs = syncs_ref.stream()
    
    count = 0
    for doc_snap in syncs:
        sync_data = doc_snap.to_dict()
        # Add the doc ID as the logical ID if the record doesn't have a numeric one
        if 'id' not in sync_data:
            sync_data['id'] = doc_snap.id
        process_sync(sync_data)
        count += 1
        
    logger.info(f"Sync Engine finished processing {count} active pipeline(s)")

if __name__ == "__main__":
    main()
