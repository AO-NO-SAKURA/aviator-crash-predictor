import { calculateRSI, calculateBollingerBands, calculateMACD } from './analysis.js';

export function analyzeSignals(crashes = [], windowSize = 20) {
  if (crashes.length < windowSize) {
    return {
      success: false,
      error: `Need at least ${windowSize} data points`,
      provided: crashes.length
    };
  }

  const multipliers = crashes.map(c => typeof c === 'number' ? c : c.multiplier);
  const recentWindow = multipliers.slice(-windowSize);

  const rsi = calculateRSI(recentWindow);
  const bb = calculateBollingerBands(recentWindow);
  const macd = calculateMACD(multipliers);

  // Generate time-based signals
  const timeSignals = generateTimeSignals(crashes);
  
  // Generate multiplier-based signals
  const multiplierSignals = generateMultiplierSignals(multipliers);

  return {
    success: true,
    timestamp: new Date().toISOString(),
    signals: {
      rsi: {
        value: Math.round(rsi * 100) / 100,
        status: rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : 'NEUTRAL',
        signal: rsi > 70 ? 'SELL' : rsi < 30 ? 'BUY' : 'HOLD'
      },
      bollinger_bands: {
        upper: Math.round(bb.upper * 100) / 100,
        middle: Math.round(bb.middle * 100) / 100,
        lower: Math.round(bb.lower * 100) / 100,
        current: Math.round(recentWindow[recentWindow.length - 1] * 100) / 100
      },
      macd,
      time_signals: timeSignals,
      multiplier_signals: multiplierSignals
    },
    analysis: {
      total_crashes: crashes.length,
      window_size: windowSize,
      avg_multiplier: Math.round((multipliers.reduce((a, b) => a + b) / multipliers.length) * 100) / 100,
      max_multiplier: Math.round(Math.max(...multipliers) * 100) / 100,
      min_multiplier: Math.round(Math.min(...multipliers) * 100) / 100
    }
  };
}

function generateTimeSignals(crashes) {
  if (crashes.length < 2) return { status: 'INSUFFICIENT_DATA' };

  const timestamps = crashes.map(c => 
    typeof c === 'number' ? Date.now() : (c.timestamp || Date.now())
  );

  // Calculate time differences
  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push((timestamps[i] - timestamps[i - 1]) / 1000); // in seconds
  }

  const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
  const lastInterval = intervals[intervals.length - 1];

  return {
    avg_interval_seconds: Math.round(avgInterval),
    last_interval_seconds: Math.round(lastInterval),
    frequency: crashes.length,
    time_signal: lastInterval > avgInterval ? 'SLOWING' : 'ACCELERATING'
  };
}

function generateMultiplierSignals(multipliers) {
  const currentMultiplier = multipliers[multipliers.length - 1];
  const previousMultiplier = multipliers[multipliers.length - 2];
  const change = ((currentMultiplier - previousMultiplier) / previousMultiplier) * 100;

  return {
    current: currentMultiplier,
    previous: previousMultiplier,
    change_percent: Math.round(change * 100) / 100,
    direction: change > 0 ? 'UP' : 'DOWN',
    strength: Math.abs(change) > 20 ? 'STRONG' : 'WEAK'
  };
}

export function generateMockCrashes(count = 100) {
  const crashes = [];
  let baseMultiplier = 1.5;

  for (let i = 0; i < count; i++) {
    // Realistic crash simulation with some volatility
    const volatility = (Math.random() - 0.5) * 2;
    const trend = Math.sin(i / 10) * 0.1;
    const randomWalk = (Math.random() - 0.5) * 0.5;
    
    const multiplier = Math.max(1.01, baseMultiplier + volatility + trend + randomWalk);
    baseMultiplier = multiplier * 0.9 + 1.2 * 0.1; // mean reversion

    crashes.push({
      id: i,
      multiplier: Math.round(multiplier * 100) / 100,
      timestamp: Date.now() - (count - i) * 10000,
      duration_ms: Math.round(Math.random() * 5000 + 2000)
    });
  }

  return crashes;
}
