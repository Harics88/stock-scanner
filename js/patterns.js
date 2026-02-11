/**
 * Candlestick Pattern Detection
 * Matches the Python implementation
 */

/**
 * Detect Doji pattern
 * Body is very small (< 10% of candle range)
 */
function detectDoji(candle) {
    const range = candle.high - candle.low;
    const body = Math.abs(candle.close - candle.open);

    return body <= (range * 0.1);
}

/**
 * Detect Hammer pattern
 * Small body, long lower wick (approx 2x body), little upper wick
 */
function detectHammer(candle) {
    const body = Math.abs(candle.close - candle.open);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    const upperWick = candle.high - Math.max(candle.open, candle.close);

    return (lowerWick >= 2 * body) && (upperWick <= body);
}

/**
 * Detect Bullish Engulfing pattern
 * Previous candle is red, current is green
 * Current open < prev close, current close > prev open
 */
function detectBullishEngulfing(currentCandle, previousCandle) {
    const prevRed = previousCandle.close < previousCandle.open;
    const currGreen = currentCandle.close > currentCandle.open;
    const engulfs = (currentCandle.open <= previousCandle.close) &&
        (currentCandle.close >= previousCandle.open);

    return prevRed && currGreen && engulfs;
}

/**
 * Detect all patterns for the latest candle
 */
function detectPatterns(candles) {
    if (candles.length < 2) {
        return { patterns: [], descriptions: [] };
    }

    const latest = candles[candles.length - 1];
    const previous = candles[candles.length - 2];

    const patterns = [];
    const descriptions = [];

    if (detectDoji(latest)) {
        patterns.push('Doji');
        descriptions.push({
            name: 'DOJI',
            description: 'Indecision candle. Small body shows buyers and sellers are balanced. Often signals potential reversal when at support/resistance. Wait for next candle to confirm direction.'
        });
    }

    if (detectHammer(latest)) {
        patterns.push('Hammer');
        descriptions.push({
            name: 'HAMMER',
            description: 'Bullish reversal signal. Long lower wick shows strong rejection of lower prices. Most reliable when found at support levels or after a downtrend. Consider buying if confirmed by next candle.'
        });
    }

    if (detectBullishEngulfing(latest, previous)) {
        patterns.push('Bullish Engulfing');
        descriptions.push({
            name: 'BULLISH ENGULFING',
            description: 'Strong reversal pattern. Today\'s green candle completely engulfs yesterday\'s red candle. Shows shift in momentum from sellers to buyers. High-probability buy signal, especially with high volume.'
        });
    }

    return {
        patterns: patterns,
        patternString: patterns.length > 0 ? patterns.join(', ') : 'None',
        descriptions: descriptions
    };
}
