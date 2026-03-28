export const INITIAL_SYNCS = [
  {
    id: 1,
    name: "Flight Hack Alerts",
    deliveredCount: 42,
    source: "Twitter",
    sourceNames: "@airmaharaj, @united, @rove",
    filterKeywords: 'award, 75x, "business class"',
    destination: "Discord",
    status: "Active",
    lastRun: "2h ago",
    skipReplies: true,
    skipRetweets: false,
    webhookUrl: "https://discord.com/api/webhooks/123456789/global-flight-hacks",
    isFiltered: true
  },
  {
    id: 2,
    name: "Tech News Aggregator",
    deliveredCount: 156,
    source: "RSS",
    sourceNames: "https://techcrunch.com/feed, https://news.ycombinator.com/rss",
    filterKeywords: 'AI, LLM, "open source"',
    destination: "Slack",
    status: "Active",
    lastRun: "30m ago",
    skipReplies: false,
    skipRetweets: false,
    webhookUrl: "https://hooks.slack.com/services/T000/B000/XXXX",
    isFiltered: true
  },
  {
    id: 3,
    name: "Personal Mentions",
    deliveredCount: 5,
    source: "Twitter",
    sourceNames: "@harics88",
    filterKeywords: "",
    destination: "Discord",
    status: "Paused",
    lastRun: "1d ago",
    skipReplies: false,
    skipRetweets: false,
    webhookUrl: "",
    isFiltered: false
  }
];

export const PLATFORMS_SOURCE = [
  { id: 'Twitter', name: 'X / Twitter' },
  { id: 'RSS', name: 'RSS Feed' }
];

export const PLATFORMS_DESTINATION = [
  { id: 'Discord', name: 'Discord Webhook' },
  { id: 'Slack', name: 'Slack Webhook' }
];
