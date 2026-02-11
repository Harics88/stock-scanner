/**
 * Technical Indicators Calculator
 * Implements all indicators matching the Python version
 */

/**
 * Simple Moving Average
 */
function sma(data, period) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push(NaN);
        } else {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            result.push(sum / period);
        }
    }
    return result;
}

/**
 * Exponential Moving Average
 */
function ema(data, period) {
    const result = [];
    const multiplier = 2 / (period + 1);

    // Start with SMA for the first value
    let emaValue = data.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push(NaN);
        } else if (i === period - 1) {
            result.push(emaValue);
        } else {
            emaValue = (data[i] - emaValue) * multiplier + emaValue;
            result.push(emaValue);
        }
    }
    return result;
}

/**
 * Relative Strength Index (RSI)
 */
function rsi(data, period = 14) {
    const changes = [];
    for (let i = 1; i < data.length; i++) {
        changes.push(data[i] - data[i - 1]);
    }

    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? -c : 0);

    const avgGains = sma(gains, period);
    const avgLosses = sma(losses, period);

    const result = [NaN]; // First value is NaN
    for (let i = 0; i < avgGains.length; i++) {
        if (isNaN(avgGains[i]) || isNaN(avgLosses[i])) {
            result.push(NaN);
        } else {
            const rs = avgLosses[i] === 0 ? 100 : avgGains[i] / avgLosses[i];
            result.push(100 - (100 / (1 + rs)));
        }
    }

    return result;
}

/**
 * MACD (Moving Average Convergence Divergence)
 */
function macd(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const fastEma = ema(data, fastPeriod);
    const slowEma = ema(data, slowPeriod);

    const macdLine = fastEma.map((fast, i) => fast - slowEma[i]);
    const signalLine = ema(macdLine.filter(v => !isNaN(v)), signalPeriod);

    // Pad signal line with NaNs to match length
    const paddedSignal = [...Array(macdLine.length - signalLine.length).fill(NaN), ...signalLine];

    const histogram = macdLine.map((m, i) => m - paddedSignal[i]);

    return {
        macd: macdLine,
        signal: paddedSignal,
        histogram: histogram
    };
}

/**
 * Bollinger Bands (using sample standard deviation)
 */
function bollingerBands(data, period = 20, stdDev = 2) {
    const smaValues = sma(data, period);
    const upper = [];
    const lower = [];
    const middle = smaValues;

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            upper.push(NaN);
            lower.push(NaN);
        } else {
            const slice = data.slice(i - period + 1, i + 1);
            const mean = smaValues[i];

            // Sample standard deviation (ddof=1)
            const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (period - 1);
            const std = Math.sqrt(variance);

            upper.push(mean + stdDev * std);
            lower.push(mean - stdDev * std);
        }
    }

    return { upper, middle, lower };
}

/**
 * Average True Range (ATR)
 */
function atr(high, low, close, period = 14) {
    const tr = [high[0] - low[0]]; // First TR is just high - low

    for (let i = 1; i < high.length; i++) {
        const hl = high[i] - low[i];
        const hc = Math.abs(high[i] - close[i - 1]);
        const lc = Math.abs(low[i] - close[i - 1]);
        tr.push(Math.max(hl, hc, lc));
    }

    return sma(tr, period);
}

/**
 * Average Directional Index (ADX)
 */
function adx(high, low, close, period = 14) {
    const tr = [high[0] - low[0]];
    const dmPlus = [0];
    const dmMinus = [0];

    for (let i = 1; i < high.length; i++) {
        // True Range
        const hl = high[i] - low[i];
        const hc = Math.abs(high[i] - close[i - 1]);
        const lc = Math.abs(low[i] - close[i - 1]);
        tr.push(Math.max(hl, hc, lc));

        //Directional Movement
        const highDiff = high[i] - high[i - 1];
        const lowDiff = low[i - 1] - low[i];

        dmPlus.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
        dmMinus.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
    }

    const atrValues = sma(tr, period);
    const diPlus = dmPlus.map((dm, i) => atrValues[i] === 0 ? 0 : (dm / atrValues[i]) * 100);
    const diMinus = dmMinus.map((dm, i) => atrValues[i] === 0 ? 0 : (dm / atrValues[i]) * 100);

    const dx = diPlus.map((plus, i) => {
        const sum = plus + diMinus[i];
        return sum === 0 ? 0 : (Math.abs(plus - diMinus[i]) / sum) * 100;
    });

    const adxValues = sma(dx, period);

    return {
        adx: adxValues,
        diPlus: diPlus,
        diMinus: diMinus
    };
}

/**
 * Stochastic Oscillator
 */
function stochastic(high, low, close, kPeriod = 14, dPeriod = 3, smoothK = 3) {
    const k = [];

    for (let i = 0; i < close.length; i++) {
        if (i < kPeriod - 1) {
            k.push(NaN);
        } else {
            const highestHigh = Math.max(...high.slice(i - kPeriod + 1, i + 1));
            const lowestLow = Math.min(...low.slice(i - kPeriod + 1, i + 1));
            const range = highestHigh - lowestLow;
            k.push(range === 0 ? 50 : ((close[i] - lowestLow) / range) * 100);
        }
    }

    const smoothedK = sma(k.filter(v => !isNaN(v)), smoothK);
    const paddedK = [...Array(k.length - smoothedK.length).fill(NaN), ...smoothedK];
    const d = sma(paddedK.filter(v => !isNaN(v)), dPeriod);
    const paddedD = [...Array(paddedK.length - d.length).fill(NaN), ...d];

    return { k: paddedK, d: paddedD };
}

/**
 * On-Balance Volume (OBV)
 */
function obv(close, volume) {
    const result = [volume[0]];

    for (let i = 1; i < close.length; i++) {
        if (close[i] > close[i - 1]) {
            result.push(result[i - 1] + volume[i]);
        } else if (close[i] < close[i - 1]) {
            result.push(result[i - 1] - volume[i]);
        } else {
            result.push(result[i - 1]);
        }
    }

    return result;
}

/**
 * Relative Volume (RVOL)
 */
function rvol(volume, period = 20) {
    const avgVolume = sma(volume, period);
    return volume.map((v, i) => avgVolume[i] === 0 ? 1 : v / avgVolume[i]);
}

/**
 * Support/Resistance using Pivot Points
 */
function pivotPoints(high, low, close) {
    const pivot = (high + low + close) / 3;
    const range = high - low;

    return {
        pivot: pivot,
        r1: 2 * pivot - low,
        r2: pivot + range,
        s1: 2 * pivot - high,
        s2: pivot - range
    };
}
