// Moving Average
export function calculateMA(data, period) {
  if (data.length < period) return null;
  const subset = data.slice(-period);
  return subset.reduce((a, b) => a + b) / period;
}

// Volatility (Standard Deviation)
export function calculateVolatility(data, period = 20) {
  if (data.length < period) return 0;
  const subset = data.slice(-period);
  const mean = subset.reduce((a, b) => a + b) / period;
  const squaredDiffs = subset.map(x => Math.pow(x - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b) / period;
  return Math.sqrt(variance);
}

// RSI (Relative Strength Index)
export function calculateRSI(data, period = 14) {
  if (data.length < period + 1) return 50; // Neutral

  let gains = 0;
  let losses = 0;

  for (let i = data.length - period; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Bollinger Bands
export function calculateBollingerBands(data, period = 20, stdDev = 2) {
  if (data.length < period) return null;

  const subset = data.slice(-period);
  const mean = subset.reduce((a, b) => a + b) / period;
  const variance = subset.reduce((sq, x) => sq + Math.pow(x - mean, 2), 0) / period;
  const std = Math.sqrt(variance);

  return {
    upper: mean + std * stdDev,
    middle: mean,
    lower: mean - std * stdDev
  };
}

// MACD (Moving Average Convergence Divergence)
export function calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (data.length < slowPeriod) return null;

  const ema12 = calculateEMA(data, fastPeriod);
  const ema26 = calculateEMA(data, slowPeriod);
  const macdLine = ema12 - ema26;

  // Signal line (EMA of MACD)
  const signalLine = calculateEMA(Array(signalPeriod).fill(macdLine), signalPeriod);
  const histogram = macdLine - signalLine;

  return {
    macd: Math.round(macdLine * 100) / 100,
    signal: Math.round(signalLine * 100) / 100,
    histogram: Math.round(histogram * 100) / 100,
    trend: macdLine > signalLine ? 'BULLISH' : 'BEARISH'
  };
}

// Exponential Moving Average
function calculateEMA(data, period) {
  if (data.length === 0) return 0;
  
  const multiplier = 2 / (period + 1);
  let ema = data[0];

  for (let i = 1; i < data.length; i++) {
    ema = data[i] * multiplier + ema * (1 - multiplier);
  }

  return ema;
}

// Pattern Detection
export function detectPatterns(data) {
  if (data.length < 3) return { detected: false, type: 'NONE' };

  const last3 = data.slice(-3);
  
  // Detect ascending pattern
  if (last3[0] < last3[1] && last3[1] < last3[2]) {
    return { detected: true, type: 'ASCENDING', strength: 'STRONG' };
  }
  
  // Detect descending pattern
  if (last3[0] > last3[1] && last3[1] > last3[2]) {
    return { detected: true, type: 'DESCENDING', strength: 'STRONG' };
  }
  
  // Detect consolidation
  const avg = last3.reduce((a, b) => a + b) / 3;
  const variance = last3.reduce((sq, x) => sq + Math.pow(x - avg, 2), 0) / 3;
  if (Math.sqrt(variance) < 0.2) {
    return { detected: true, type: 'CONSOLIDATION', strength: 'MODERATE' };
  }

  return { detected: false, type: 'NONE' };
}
