import { calculateMA, calculateVolatility, detectPatterns } from './analysis.js';

class PredictorEngine {
  constructor() {
    this.history = [];
    this.predictions = [];
    this.accuracy = 0;
    this.lastUpdate = null;
  }

  predict(crashHistory = [], confidenceThreshold = 0.75) {
    if (crashHistory.length < 5) {
      return {
        success: false,
        error: 'Need at least 5 historical data points',
        minRequired: 5,
        provided: crashHistory.length
      };
    }

    try {
      // Extract multipliers
      const multipliers = crashHistory.map(c => 
        typeof c === 'number' ? c : c.multiplier
      );

      // Calculate technical indicators
      const ma10 = calculateMA(multipliers, 10);
      const ma20 = calculateMA(multipliers, 20);
      const volatility = calculateVolatility(multipliers);
      const patterns = detectPatterns(multipliers);

      // Generate prediction signal
      const lastValue = multipliers[multipliers.length - 1];
      const trend = ma10 > ma20 ? 'BULLISH' : 'BEARISH';
      
      // Calculate predicted multiplier based on moving averages
      let predictedMultiplier = (ma10 * 0.6 + ma20 * 0.4);
      
      // Apply volatility adjustment
      const volatilityFactor = volatility > 0.5 ? 0.95 : 1.05;
      predictedMultiplier *= volatilityFactor;

      // Calculate confidence
      const confidence = this._calculateConfidence(
        multipliers,
        patterns,
        volatility
      );

      const shouldSignal = confidence >= confidenceThreshold;

      const prediction = {
        success: true,
        timestamp: new Date().toISOString(),
        predicted_multiplier: Math.round(predictedMultiplier * 100) / 100,
        confidence: Math.round(confidence * 100),
        trend,
        signal: shouldSignal ? 'BUY' : 'WAIT',
        indicators: {
          ma10: Math.round(ma10 * 100) / 100,
          ma20: Math.round(ma20 * 100) / 100,
          volatility: Math.round(volatility * 100) / 100,
          last_multiplier: lastValue,
          pattern_detected: patterns.detected,
          pattern_type: patterns.type
        },
        recommendation: this._getRecommendation(shouldSignal, confidence, trend),
        risk_level: this._calculateRiskLevel(volatility, confidence)
      };

      this.predictions.push(prediction);
      this.lastUpdate = new Date();

      return prediction;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  _calculateConfidence(multipliers, patterns, volatility) {
    let confidence = 0.5; // Base 50%

    // Pattern detected = +15%
    if (patterns.detected) {
      confidence += 0.15;
    }

    // Low volatility = +15% (more predictable)
    if (volatility < 0.3) {
      confidence += 0.15;
    } else if (volatility > 0.7) {
      confidence -= 0.1; // High volatility = -10%
    }

    // Consistency check
    const recentAvg = multipliers.slice(-5).reduce((a, b) => a + b) / 5;
    const overallAvg = multipliers.reduce((a, b) => a + b) / multipliers.length;
    if (Math.abs(recentAvg - overallAvg) < overallAvg * 0.2) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  _getRecommendation(shouldSignal, confidence, trend) {
    if (!shouldSignal) {
      return 'Confidence too low. Wait for clearer signals.';
    }
    if (confidence > 0.85) {
      return `Strong ${trend} signal. Consider entering with position size based on volatility.`;
    }
    if (confidence > 0.75) {
      return `Moderate ${trend} signal. Consider entry with proper risk management.`;
    }
    return `Weak signal. Use additional confirmation before entering.`;
  }

  _calculateRiskLevel(volatility, confidence) {
    if (volatility > 0.7 || confidence < 0.6) return 'HIGH';
    if (volatility > 0.4 || confidence < 0.75) return 'MEDIUM';
    return 'LOW';
  }

  getStatus() {
    return {
      engine_status: 'active',
      predictions_made: this.predictions.length,
      last_update: this.lastUpdate,
      version: '1.0.0',
      ready: true
    };
  }
}

export const predictorEngine = new PredictorEngine();
