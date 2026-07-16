import express from 'express';
import cors from 'cors';
import { predictorEngine } from './src/predictor.js';
import { generateMockCrashes, analyzeSignals } from './src/signals.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Get prediction for next crash
app.post('/predict', (req, res) => {
  const { history = [], confidence = 0.75 } = req.body;
  const prediction = predictorEngine.predict(history, confidence);
  res.json(prediction);
});

// Analyze signals from historical data
app.post('/analyze', (req, res) => {
  const { crashes = [], windowSize = 20 } = req.body;
  const signals = analyzeSignals(crashes, windowSize);
  res.json(signals);
});

// Get mock data for testing
app.get('/mock-data', (req, res) => {
  const count = parseInt(req.query.count) || 100;
  const data = generateMockCrashes(count);
  res.json(data);
});

// Get real-time signal stream (WebSocket endpoint would go here)
app.get('/signals-status', (req, res) => {
  const status = predictorEngine.getStatus();
  res.json(status);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Aviator Crash Predictor Server running on http://localhost:${PORT}`);
  console.log(`📊 Endpoints:`);
  console.log(`   POST /predict - Get crash prediction`);
  console.log(`   POST /analyze - Analyze signals`);
  console.log(`   GET /mock-data - Get mock crash data`);
  console.log(`   GET /signals-status - Get predictor status\n`);
});
