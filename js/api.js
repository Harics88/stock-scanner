// API Configuration - Tradier Production (Real-time data)
// API key is stored in localStorage for security (not exposed in GitHub repo)
const TRADIER_API_KEY = localStorage.getItem('tradier_api_key') || '';
const TRADIER_BASE_URL = 'https://api.tradier.com/v1'; // Production endpoint

/**
 * Fetch stock quote (current price and basic info)
 */
async function fetchQuote(symbol) {
    const url = `${TRADIER_BASE_URL}/markets/quotes?symbols=${symbol}&greeks=false`;

    console.log('Fetching quote for:', symbol);

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${TRADIER_API_KEY}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`Failed to fetch quote for ${symbol}. Check API key and symbol.`);
    }

    const data = await response.json();

    if (!data.quotes || !data.quotes.quote) {
        throw new Error(`No data available for ${symbol}`);
    }

    const quote = data.quotes.quote;

    if (quote.type === 'null' || !quote.last) {
        throw new Error(`Invalid symbol: ${symbol}`);
    }

    return {
        c: quote.last || quote.close,
        d: quote.change || 0,
        dp: quote.change_percentage || 0,
        h: quote.high || quote.last,
        l: quote.low || quote.last,
        o: quote.open || quote.last,
        pc: quote.prevclose || quote.last
    };
}

/**
 * Fetch historical candle data (OHLCV)
 * @param {string} symbol - Stock ticker
 */
async function fetchCandles(symbol) {
    // Get date range - request 400 calendar days to ensure 200+ trading days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 400); // Increased to ensure 200+ trading days

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    const url = `${TRADIER_BASE_URL}/markets/history?symbol=${symbol}&interval=daily&start=${start}&end=${end}`;

    console.log('Fetching candles for:', symbol, '- Requesting', start, 'to', end);

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${TRADIER_API_KEY}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`Failed to fetch candle data for ${symbol}. Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.history || !data.history.day) {
        throw new Error(`No historical data available for ${symbol}`);
    }

    console.log('Candle data received, processing...');

    return transformCandleData(data.history.day);
}

/**
 * Transform Tradier history data into candle format
 */
function transformCandleData(historyData) {
    const candles = [];

    // Ensure historyData is an array
    const dataArray = Array.isArray(historyData) ? historyData : [historyData];

    dataArray.forEach(day => {
        const date = new Date(day.date + 'T00:00:00');

        candles.push({
            timestamp: Math.floor(date.getTime() / 1000),
            date: date,
            open: parseFloat(day.open),
            high: parseFloat(day.high),
            low: parseFloat(day.low),
            close: parseFloat(day.close),
            volume: parseInt(day.volume)
        });
    });

    // Sort by date ascending
    candles.sort((a, b) => a.timestamp - b.timestamp);

    return candles;
}

/**
 * Main function to fetch all required stock data
 */
async function fetchStockData(symbol) {
    try {
        // Fetch quote and candles in parallel (Tradier has better rate limits)
        const [quote, candles] = await Promise.all([
            fetchQuote(symbol),
            fetchCandles(symbol)
        ]);

        return {
            symbol: symbol.toUpperCase(),
            currentPrice: quote.c,
            change: quote.d,
            changePercent: quote.dp,
            high: quote.h,
            low: quote.l,
            open: quote.o,
            previousClose: quote.pc,
            candles: candles
        };
    } catch (error) {
        console.error('Error fetching stock data:', error);
        throw error;
    }
}

/**
 * Check if API key is configured
 */
function isApiKeyConfigured() {
    const apiKey = localStorage.getItem('tradier_api_key');
    return apiKey && apiKey.length > 0;
}

/**
 * Save API key to localStorage
 */
function saveApiKey(apiKey) {
    localStorage.setItem('tradier_api_key', apiKey.trim());
}

/**
 * Get current API key
 */
function getApiKey() {
    return localStorage.getItem('tradier_api_key') || '';
}
