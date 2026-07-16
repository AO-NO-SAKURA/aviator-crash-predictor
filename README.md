# Aviator Crash Predictor 🎮

An advanced signal analysis system for predicting Aviator game crash multipliers using technical indicators, pattern recognition, and machine learning algorithms.

## Features

✨ **Core Functionality:**
- Real-time crash prediction with confidence scores
- Technical analysis indicators (RSI, Bollinger Bands, MACD, Moving Averages)
- Pattern detection and trend analysis
- Time-based signal generation
- Multiplier-based signal analysis
- Risk assessment
- Mock data generation for testing

## Installation

```bash
npm install
```

## Usage

### Start Server
```bash
npm start
```

Server runs on `http://localhost:3000`

### API Endpoints

#### 1. Get Crash Prediction
```bash
POST /predict
Content-Type: application/json

{
  "history": [1.5, 1.8, 2.1, 1.9, 2.3, 2.0, 1.7, 2.2, 2.4, 2.1],
  "confidence": 0.75
}
```

**Response:**
```json
{
  "success": true,
  "predicted_multiplier": 2.15,
  "confidence": 82,
  "trend": "BULLISH",
  "signal": "BUY",
  "indicators": {
    "ma10": 2.05,
    "ma20": 1.98,
    "volatility": 0.28,
    "pattern_detected": true,
    "pattern_type": "ASCENDING"
  },
  "recommendation": "Strong BULLISH signal. Consider entering with position size based on volatility.",
  "risk_level": "LOW"
}
```

#### 2. Analyze Signals
```bash
POST /analyze
Content-Type: application/json

{
  "crashes": [1.5, 1.8, 2.1, 1.9, 2.3, ...],
  "windowSize": 20
}
```

#### 3. Get Mock Data
```bash
GET /mock-data?count=100
```

Returns 100 simulated crash events for testing.

#### 4. Get Status
```bash
GET /signals-status
```

## Technical Indicators

### Moving Averages (MA)
- MA10: 10-period moving average (short-term trend)
- MA20: 20-period moving average (long-term trend)
- Cross-over signals for trend changes

### RSI (Relative Strength Index)
- Range: 0-100
- Overbought > 70
- Oversold < 30
- Neutral: 40-60

### Bollinger Bands
- Upper/Lower bands for volatility assessment
- Price breakout signals
- Support/Resistance identification

### MACD (Moving Average Convergence Divergence)
- Momentum indicator
- Trend confirmation
- Divergence detection

### Pattern Detection
- Ascending patterns
- Descending patterns
- Consolidation zones

## Signal Types

### Time Signals
- `ACCELERATING`: Crashes happening faster
- `SLOWING`: Crashes happening slower
- Frequency analysis

### Multiplier Signals
- Directional changes (UP/DOWN)
- Change strength (STRONG/WEAK)
- Momentum indicators

## Risk Levels
- `LOW`: High confidence, low volatility
- `MEDIUM`: Moderate confidence or volatility
- `HIGH`: Low confidence or high volatility

## Example Usage

```javascript
import { predictorEngine } from './src/predictor.js';
import { generateMockCrashes, analyzeSignals } from './src/signals.js';

// Generate mock data
const crashes = generateMockCrashes(50);

// Get prediction
const prediction = predictorEngine.predict(
  crashes.map(c => c.multiplier),
  0.75 // confidence threshold
);

console.log(prediction);

// Analyze signals
const signals = analyzeSignals(crashes, 20);
console.log(signals);
```

## Testing

Run the test suite:
```bash
npm test
```

This runs comprehensive tests on:
- Mock data generation
- Predictions
- Signal analysis
- Technical indicators
- Edge cases
- Engine status

## Configuration

Edit `.env` to customize:
```
PORT=3000
NODE_ENV=development
```

## Performance Metrics

- Prediction accuracy tracked over time
- Confidence scores for each prediction
- Historical analysis of signal effectiveness
- Risk/reward ratio calculations

## Important Notes

⚠️ **Disclaimer:**
- This is a technical analysis tool for educational purposes
- No prediction algorithm is 100% accurate
- Always use proper risk management
- This tool should not be considered financial advice
- Use with caution in live trading environments

## Future Enhancements

- [ ] WebSocket support for real-time streams
- [ ] Machine learning models (Neural Networks, LSTM)
- [ ] Advanced pattern recognition
- [ ] Live API integration
- [ ] Database for historical analysis
- [ ] Dashboard UI
- [ ] Backtesting engine

## License

MIT

## Support

For issues, questions, or contributions, please open an issue in the repository.
