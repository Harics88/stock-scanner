/**
 * Main Application Logic
 * Orchestrates data fetching, calculations, and UI updates
 */

// DOM Elements
let tickerInput, scanButton, loadingState, errorState, resultsSection;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    tickerInput = document.getElementById('tickerInput');
    scanButton = document.getElementById('scanButton');
    loadingState = document.getElementById('loadingState');
    errorState = document.getElementById('errorState');
    resultsSection = document.getElementById('results');

    // Event listeners
    scanButton.addEventListener('click', handleScan);
    tickerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleScan();
    });

    // Auto-focus input
    tickerInput.focus();
});

async function handleScan() {
    const ticker = tickerInput.value.trim().toUpperCase();

    if (!ticker) {
        showError('Please enter a ticker symbol');
        return;
    }

    if (!isApiKeyConfigured()) {
        showError('API key not configured. Please edit js/api.js and add your Finnhub API key.');
        return;
    }

    showLoading();

    try {
        await analyzeStock(ticker);
    } catch (error) {
        showError(error.message || 'Failed to analyze stock. Please check the ticker and try again.');
    }
}

async function analyzeStock(ticker) {
    // Fetch data
    const stockData = await fetchStockData(ticker);
    const candles = stockData.candles;

    if (candles.length < 200) {
        throw new Error('Insufficient historical data. Minimum 200 days required.');
    }

    // Extract price arrays
    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume);

    const latest = candles[candles.length - 1];
    const previous = candles[candles.length - 2];
    const price = latest.close;

    // Calculate all indicators
    const rsiValues = rsi(closes);
    const macdData = macd(closes);
    const bbData = bollingerBands(closes);
    const ema20Values = ema(closes, 20);
    const ema50Values = ema(closes, 50);
    const ema200Values = ema(closes, 200);
    const sma5Values = sma(closes, 5);
    const atrValues = atr(highs, lows, closes);
    const adxData = adx(highs, lows, closes);
    const stochData = stochastic(highs, lows, closes);
    const obvValues = obv(closes, volumes);
    const rvolValues = rvol(volumes);
    const pivots = pivotPoints(latest.high, latest.low, latest.close);

    // Get latest values
    const idx = closes.length - 1;

    const indicators = {
        rsi: rsiValues[idx],
        macdValue: macdData.macd[idx],
        macdSignal: macdData.signal[idx],
        bbUpper: bbData.upper[idx],
        bbMiddle: bbData.middle[idx],
        bbLower: bbData.lower[idx],
        ema20: ema20Values[idx],
        ema50: ema50Values[idx],
        ema200: ema200Values[idx],
        sma5: sma5Values[idx],
        atr: atrValues[idx],
        adx: adxData.adx[idx],
        stochK: stochData.k[idx],
        stochD: stochData.d[idx],
        obv: obvValues[idx],
        obvPrev: obvValues[idx - 1],
        rvol: rvolValues[idx],
        support: pivots.s2,
        resistance: pivots.r2
    };

    // Pattern detection
    const patternData = detectPatterns(candles);

    // Calculate score
    const { score, breakdown, warnings } = calculateScore(indicators, price, patternData, candles);

    // Generate recommendation
    const recommendation = generateRecommendation(score, warnings);

    // Generate suggested actions
    const suggestedActions = generateSuggestedActions(
        recommendation.recommendation,
        price,
        indicators.support,
        indicators.resistance,
        indicators.adx,
        indicators.rvol,
        indicators.macdValue,
        indicators.macdSignal
    );

    // Generate trading tips
    const tips = generateTradingTips(indicators, price, patternData);

    // Display results
    displayResults(ticker, price, indicators, score, breakdown, warnings, recommendation, suggestedActions, tips, patternData);
}

function generateTradingTips(indicators, price, patternData) {
    const tips = [];

    // 1. RSI
    if (indicators.rsi > 70) {
        tips.push('RSI is Overbought (>70). Watch for a potential pullback or reversal.');
    } else if (indicators.rsi < 30) {
        tips.push('RSI is Oversold (<30). Watch for a potential bounce.');
    } else {
        tips.push(`RSI is Neutral (${indicators.rsi.toFixed(1)}). Trend is steady.`);
    }

    // 2. Bollinger Bands
    if (price > indicators.bbUpper) {
        tips.push('Price is ABOVE the Upper Bollinger Band. Short-term overextended (Mean Reversion likely).');
    } else if (price < indicators.bbLower) {
        tips.push('Price is BELOW the Lower Bollinger Band. Short-term oversold (Mean Reversion likely).');
    } else {
        const bandwidth = ((indicators.bbUpper - indicators.bbLower) / indicators.bbMiddle) * 100;
        if (bandwidth < 5) {
            tips.push('Bollinger Bands are tightening (Squeeze). Watch for an explosive breakout.');
        } else {
            tips.push('Price is within Bollinger Bands. Normal volatility.');
        }
    }

    // 3. MACD
    if (indicators.macdValue > indicators.macdSignal) {
        tips.push('MACD is Bullish (MACD > Signal). Momentum is positive.');
    } else {
        tips.push('MACD is Bearish (MACD < Signal). Momentum is negative.');
    }

    // 4. SMA 5 Trend
    if (price > indicators.sma5) {
        tips.push('Price is ABOVE the 5-Day SMA. Short-term trend is UP.');
    } else {
        tips.push('Price is BELOW the 5-Day SMA. Short-term trend is DOWN.');
    }

    // 5. ADX
    if (indicators.adx > 25) {
        tips.push(`ADX is ${indicators.adx.toFixed(1)} (>25). Strong trend detected. Trade with the trend.`);
    } else if (indicators.adx < 20) {
        tips.push(`ADX is ${indicators.adx.toFixed(1)} (<20). Weak trend / Choppy market. Caution on breakouts.`);
    }

    // 6. RVOL
    if (indicators.rvol > 2.0) {
        tips.push(`High Relative Volume (${indicators.rvol.toFixed(1)}x). Strong conviction in today's move.`);
    } else if (indicators.rvol < 0.8) {
        tips.push(`Low Relative Volume (${indicators.rvol.toFixed(1)}x). Move may lack conviction.`);
    }

    // 7. Long-term trend
    if (indicators.ema50 > indicators.ema200) {
        tips.push('Long-term trend is BULLISH (Golden Cross). Consider waiting for pullback.');
    } else {
        tips.push('Long-term trend is BEARISH (Death Cross). Trade with caution.');
    }

    // 8. Patterns
    if (patternData.patterns.length > 0) {
        tips.push(`Pattern Detected: ${patternData.patternString}`);
        patternData.descriptions.forEach(desc => {
            tips.push(`  → ${desc.name}: ${desc.description}`);
        });
    }

    return tips;
}

function displayResults(ticker, price, indicators, score, breakdown, warnings, recommendation, actions, tips, patterns) {
    hideLoading();
    hideError();

    // Display indicators
    displayIndicators(price, indicators, patterns);

    // Display score
    displayScore(score, breakdown, warnings);

    // Display recommendation
    displayRecommendation(recommendation);

    // Display actions
    displayActions(actions);

    // Display tips
    displayTips(tips);

    // Show results section
    resultsSection.classList.remove('hidden');

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayIndicators(price, indicators, patterns) {
    const grid = document.getElementById('indicatorsGrid');
    grid.innerHTML = '';

    // Group indicators by category
    const categories = [
        {
            name: '💰 Price & Levels',
            indicators: [
                { label: 'Current Price', value: `$${price.toFixed(2)}`, highlight: true },
                { label: 'Support (S2)', value: `$${indicators.support.toFixed(2)}` },
                { label: 'Resistance (R2)', value: `$${indicators.resistance.toFixed(2)}` },
                { label: '5-Day SMA', value: `$${indicators.sma5.toFixed(2)}` }
            ]
        },
        {
            name: '📊 Trend Indicators',
            indicators: [
                { label: 'Mid-Term (EMA 20/50)', value: indicators.ema20 > indicators.ema50 ? 'Uptrend 🟢' : 'Downtrend 🔴' },
                { label: 'Long-Term (EMA 50/200)', value: indicators.ema50 > indicators.ema200 ? 'Golden Cross 🟢' : 'Death Cross 🔴' },
                { label: 'ADX (Trend Strength)', value: `${indicators.adx.toFixed(1)} ${indicators.adx > 25 ? '💪' : indicators.adx < 20 ? '💤' : ''}` },
                { label: 'MACD', value: indicators.macdValue > indicators.macdSignal ? 'Bullish 🟢' : 'Bearish 🔴' }
            ]
        },
        {
            name: '🎯 Momentum Indicators',
            indicators: [
                { label: 'RSI (14)', value: `${indicators.rsi.toFixed(1)} ${indicators.rsi > 70 ? '(Overbought)' : indicators.rsi < 30 ? '(Oversold)' : ''}` },
                { label: 'Stochastic K/D', value: `${indicators.stochK.toFixed(1)} / ${indicators.stochD.toFixed(1)}` },
                { label: 'Bollinger Bands', value: `${indicators.bbLower.toFixed(2)} - ${indicators.bbUpper.toFixed(2)}` }
            ]
        },
        {
            name: '📈 Volume & Volatility',
            indicators: [
                { label: 'RVOL (Relative Volume)', value: `${indicators.rvol.toFixed(2)}x ${indicators.rvol > 2 ? '🔥' : indicators.rvol < 0.8 ? '💤' : ''}` },
                { label: 'OBV Trend', value: indicators.obv >= indicators.obvPrev ? 'Increasing 📈' : 'Decreasing 📉' },
                { label: 'ATR (Volatility)', value: indicators.atr.toFixed(2) }
            ]
        },
        {
            name: '🕯️ Patterns',
            indicators: [
                { label: 'Detected Pattern', value: patterns.patternString, highlight: patterns.patterns.length > 0 }
            ]
        }
    ];

    categories.forEach(category => {
        // Category header
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.textContent = category.name;
        grid.appendChild(categoryHeader);

        // Category indicators
        category.indicators.forEach(item => {
            const div = document.createElement('div');
            div.className = 'indicator-item';
            if (item.highlight) div.classList.add('highlight');
            div.innerHTML = `
                <span class="indicator-label">${item.label}</span>
                <span class="indicator-value">${item.value}</span>
            `;
            grid.appendChild(div);
        });
    });
}

function displayScore(score, breakdown, warnings) {
    const scoreValue = document.getElementById('scoreValue');
    const scoreEmoji = document.getElementById('scoreEmoji');
    const scoreBreakdownEl = document.getElementById('scoreBreakdown');
    const warningFlagsEl = document.getElementById('warningFlags');

    scoreValue.textContent = score >= 0 ? `+${score}` : score;
    scoreValue.className = 'score-value';
    if (score > 0) scoreValue.classList.add('positive');
    else if (score < 0) scoreValue.classList.add('negative');
    else scoreValue.classList.add('neutral');

    scoreEmoji.textContent = score >= 6 ? '🟢🟢🟢' : score >= 3 ? '🟢🟢' : score >= 1 ? '🟢' :
        score <= -6 ? '🔴🔴🔴' : score <= -3 ? '🔴🔴' : score <= -1 ? '🔴' : '⏸️';

    scoreBreakdownEl.innerHTML = '<h3 style="margin-bottom: 1rem;">Score Breakdown:</h3>' +
        breakdown.map(item => `<p>${item}</p>`).join('');

    if (warnings.length > 0) {
        warningFlagsEl.classList.remove('hidden');
        warningFlagsEl.innerHTML = '<h3 style="margin-bottom: 0.5rem;">Warning Flags:</h3>' +
            warnings.map(w => `<p>${w}</p>`).join('');
    } else {
        warningFlagsEl.classList.add('hidden');
    }
}

function displayRecommendation(rec) {
    document.getElementById('recommendationText').textContent = rec.recommendation;
    document.getElementById('recommendationText').className = 'recommendation-text';
    if (rec.recommendation.includes('BUY')) {
        document.getElementById('recommendationText').classList.add('buy');
    } else if (rec.recommendation.includes('SELL')) {
        document.getElementById('recommendationText').classList.add('sell');
    } else {
        document.getElementById('recommendationText').classList.add('wait');
    }

    document.getElementById('recommendationEmoji').textContent = rec.emoji;
    document.getElementById('confidenceLevel').textContent = rec.confidence;
    document.getElementById('positionSize').textContent = rec.positionSize;
    document.getElementById('recommendationReason').textContent = rec.reason;
}

function displayActions(actions) {
    const section = document.getElementById('actionsSection');
    const list = document.getElementById('actionsList');

    if (actions.length > 0) {
        section.classList.remove('hidden');
        list.innerHTML = actions.map(action => `<li>${action}</li>`).join('');
    } else {
        section.classList.add('hidden');
    }
}

function displayTips(tips) {
    const section = document.getElementById('tipsSection');
    const list = document.getElementById('tipsList');

    if (tips.length > 0) {
        section.classList.remove('hidden');
        list.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
    } else {
        section.classList.add('hidden');
    }
}

function showLoading() {
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    resultsSection.classList.add('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

function showError(message) {
    hideLoading();
    resultsSection.classList.add('hidden');
    errorState.classList.remove('hidden');
    document.getElementById('errorMessage').textContent = message;
}

function hideError() {
    errorState.classList.add('hidden');
}
