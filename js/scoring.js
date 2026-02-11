/**
 * Scoring System - matches Python implementation exactly
 * Calculates score, recommendation, position sizing, and warnings
 */

function calculateScore(indicators, price, patterns, candles) {
    let score = 0;
    const breakdown = [];
    const warnings = [];

    const latest = candles[candles.length - 1];
    const previous = candles[candles.length - 2];

    // 1. RSI Scoring
    const rsiValue = indicators.rsi;
    if (rsiValue < 30) {
        score += 2;
        breakdown.push(`✓ RSI Oversold (${rsiValue.toFixed(1)}) → +2`);
    } else if (rsiValue > 70) {
        score -= 2;
        breakdown.push(`✗ RSI Overbought (${rsiValue.toFixed(1)}) → -2`);
    } else {
        breakdown.push(`○ RSI Neutral (${rsiValue.toFixed(1)}) → 0`);
    }

    // 2. MACD Scoring
    if (indicators.macdValue > indicators.macdSignal) {
        score += 2;
        breakdown.push('✓ MACD Bullish → +2');
    } else {
        score -= 2;
        breakdown.push('✗ MACD Bearish → -2');
    }

    // 3. Bollinger Band Scoring
    if (price < indicators.bbLower) {
        score += 2;
        breakdown.push('✓ Price bounced off Lower BB → +2');
    } else if (price > indicators.bbUpper) {
        score -= 2;
        breakdown.push('✗ Price rejected at Upper BB → -2');
    } else {
        const bandwidth = ((indicators.bbUpper - indicators.bbLower) / indicators.bbMiddle) * 100;
        if (bandwidth < 5) {
            warnings.push('⚠️ Bollinger Squeeze: Explosive move imminent - Direction unknown');
            breakdown.push('⚠️ Bollinger Squeeze detected → 0');
        } else {
            breakdown.push('○ Price within Bollinger Bands → 0');
        }
    }

    // 4. Price vs SMA_5 Scoring
    if (price > indicators.sma5) {
        score += 1;
        breakdown.push('✓ Price ABOVE 5-Day SMA → +1');
    } else {
        score -= 1;
        breakdown.push('✗ Price BELOW 5-Day SMA → -1');
    }

    // 5. ADX + Trend Scoring
    const adxValue = indicators.adx;
    if (adxValue > 25) {
        if (price > indicators.sma5) {
            score += 2;
            breakdown.push(`✓ Strong uptrend (ADX=${adxValue.toFixed(1)}, Price>SMA) → +2`);
        } else {
            score -= 2;
            breakdown.push(`✗ Strong downtrend (ADX=${adxValue.toFixed(1)}, Price<SMA) → -2`);
        }
    } else if (adxValue < 20) {
        warnings.push(`⚠️ ADX < 20 (${adxValue.toFixed(1)}): Weak trend - Reduce position size by 50%`);
        breakdown.push(`⚠️ Weak trend (ADX=${adxValue.toFixed(1)}) → 0`);
    } else {
        breakdown.push(`○ Trend developing (ADX=${adxValue.toFixed(1)}) → 0`);
    }

    // 6. RVOL Scoring
    const rvolValue = indicators.rvol;
    const atSupport = Math.abs(price - indicators.support) < (price * 0.02);
    const atResistance = Math.abs(price - indicators.resistance) < (price * 0.02);

    if (rvolValue > 2.0) {
        if (atSupport) {
            score += 2;
            breakdown.push(`✓ High Volume at Support (RVOL=${rvolValue.toFixed(1)}x) → +2`);
        } else if (atResistance) {
            score -= 2;
            breakdown.push(`✗ High Volume at Resistance (RVOL=${rvolValue.toFixed(1)}x) → -2`);
        } else {
            breakdown.push(`○ High Volume (RVOL=${rvolValue.toFixed(1)}x) → 0`);
        }
    } else if (rvolValue < 0.8) {
        warnings.push(`⚠️ RVOL < 0.8 (${rvolValue.toFixed(1)}x): Low volume - Moves lack conviction`);
        breakdown.push(`⚠️ Low Volume (RVOL=${rvolValue.toFixed(1)}x) → 0`);
    } else {
        breakdown.push(`○ Normal Volume (RVOL=${rvolValue.toFixed(1)}x) → 0`);
    }

    // 7. Long-term Trend Alignment
    if (indicators.ema50 > indicators.ema200) {
        score += 1;
        breakdown.push('✓ Long-term Golden Cross → +1');
    } else {
        score -= 1;
        breakdown.push('✗ Long-term Death Cross → -1');
    }

    // 8. OBV Trend
    const obvTrend = indicators.obv > indicators.obvPrev;
    if (obvTrend) {
        score += 1;
        breakdown.push('✓ OBV Increasing → +1');
    } else {
        score -= 1;
        breakdown.push('✗ OBV Decreasing → -1');
    }

    // 9. Stochastic Scoring
    const stochK = indicators.stochK;
    if (stochK < 20) {
        score += 1;
        breakdown.push(`✓ Stoch Oversold (K=${stochK.toFixed(1)}) → +1`);
    } else if (stochK > 80) {
        score -= 1;
        breakdown.push(`✗ Stoch Overbought (K=${stochK.toFixed(1)}) → -1`);
    }

    return { score, breakdown, warnings };
}

function generateRecommendation(score, warnings) {
    let recommendation, confidence, positionSize, emoji;

    if (score >= 6) {
        recommendation = 'STRONG BUY';
        confidence = 'HIGH';
        positionSize = '100%';
        emoji = '🟢🟢🟢';
    } else if (score >= 3) {
        recommendation = 'BUY';
        confidence = 'MEDIUM';
        positionSize = '50-75%';
        emoji = '🟢🟢';
    } else if (score >= 1) {
        recommendation = 'WEAK BUY';
        confidence = 'LOW';
        positionSize = '25%';
        emoji = '🟢';
    } else if (score <= -6) {
        recommendation = 'STRONG SELL';
        confidence = 'HIGH';
        positionSize = 'Exit 100%';
        emoji = '🔴🔴🔴';
    } else if (score <= -3) {
        recommendation = 'SELL';
        confidence = 'MEDIUM';
        positionSize = 'Exit 50-75%';
        emoji = '🔴🔴';
    } else if (score <= -1) {
        recommendation = 'WEAK SELL';
        confidence = 'LOW';
        positionSize = 'Consider Exit';
        emoji = '🔴';
    } else {
        recommendation = 'WAIT';
        confidence = 'NONE';
        positionSize = '0% (Stay in cash)';
        emoji = '⏸️';
    }

    // Adjust for warnings
    if (warnings.some(w => w.includes('ADX < 20'))) {
        if (recommendation.includes('BUY')) {
            positionSize = `${positionSize} → Reduced to 25-50% due to weak trend`;
        } else if (recommendation.includes('SELL')) {
            positionSize = `${positionSize} → Reduced due to weak trend`;
        }
    }

    // Generate reason
    let reason;
    if (score === 0) {
        reason = 'Mixed signals - Best to wait for clearer direction';
    } else if (Math.abs(score) < 3) {
        reason = 'Weak signals - Low conviction setup';
    } else if (warnings.length > 0) {
        reason = `Caution advised due to ${warnings.length} warning flag(s)`;
    } else {
        reason = `${Math.abs(score)} factors aligned for this ${recommendation.toLowerCase()}`;
    }

    return {
        recommendation,
        confidence,
        positionSize,
        emoji,
        reason
    };
}

function generateSuggestedActions(recommendation, price, support, resistance, adx, rvol, macdValue, macdSignal) {
    const actions = [];

    if (recommendation === 'WAIT') {
        if (adx < 25) {
            actions.push(`WAIT for ADX to rise above 25 for trend confirmation (current: ${adx.toFixed(1)})`);
        }
        if (rvol < 1.2) {
            actions.push(`WAIT for RVOL to exceed 1.2 for volume confirmation (current: ${rvol.toFixed(1)}x)`);
        }
        if (macdValue < macdSignal) {
            actions.push('Monitor for MACD bullish crossover');
        }
        actions.push('If entering anyway, use MAXIMUM 25% position size due to weak signals');
    } else if (recommendation.includes('BUY')) {
        actions.push(`Enter at current price: $${price.toFixed(2)}`);
        actions.push(`Set stop-loss at: $${support.toFixed(2)} (Support) - Risk: $${(price - support).toFixed(2)} per share`);
        actions.push(`Target resistance: $${resistance.toFixed(2)} - Potential: $${(resistance - price).toFixed(2)} per share`);
        const riskReward = (price - support) > 0 ? (resistance - price) / (price - support) : 0;
        actions.push(`Risk/Reward Ratio: 1:${riskReward.toFixed(2)}`);
    } else if (recommendation.includes('SELL')) {
        actions.push(`Exit at current price: $${price.toFixed(2)}`);
        actions.push(`If holding, set stop-loss at: $${resistance.toFixed(2)} (Resistance)`);
        actions.push(`Target support: $${support.toFixed(2)}`);
    }

    return actions;
}
