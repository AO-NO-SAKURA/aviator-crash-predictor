import express from 'express';
import cors from 'cors';
import { predictorEngine } from './src/predictor.js';
import { aviatorAlgorithm } from './src/aviator-algorithm.js';
import { realDataProvider } from './src/real-data-provider.js';
import { generateMockCrashes, analyzeSignals } from './src/signals.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==================== REAL AVIATOR ALGORITHM ENDPOINTS ====================

/**
 * Generate real Aviator crash multiplier using provably fair algorithm
 */
app.post('/aviator/generate-crash', (req, res) => {
  const { serverSeed, clientSeed, nonce } = req.body;
  
  if (!serverSeed || !clientSeed || nonce === undefined) {
    return res.status(400).json({
      error: 'Missing required parameters: serverSeed, clientSeed, nonce'
    });
  }

  const result = aviatorAlgorithm.generateCrashMultiplier(serverSeed, clientSeed, nonce);
  res.json(result);
});

/**
 * Verify a crash result (for player verification)
 */
app.post('/aviator/verify-crash', (req, res) => {
  const { multiplier, serverSeed, clientSeed, nonce } = req.body;
  
  if (multiplier === undefined || !serverSeed || !clientSeed || nonce === undefined) {
    return res.status(400).json({
      error: 'Missing required parameters'
    });
  }

  const isValid = aviatorAlgorithm.verifyCrashResult(multiplier, serverSeed, clientSeed, nonce);
  res.json({
    valid: isValid,
    multiplier,
    verification: isValid ? 'PASSED' : 'FAILED'
  });
});

/**
 * Simulate multiple crashes using real algorithm
 */
app.get('/aviator/simulate', (req, res) => {
  const count = parseInt(req.query.count) || 100;
  const baseSeed = req.query.seed || null;
  
  const crashes = aviatorAlgorithm.simulateCrashes(count, baseSeed);
  const stats = aviatorAlgorithm.calculateHouseEdgeStats(crashes);
  
  res.json({
    success: true,
    crashes,
    statistics: stats,
    algorithm: 'REAL_AVIATOR_PROVABLY_FAIR'
  });
});

/**
 * Get house edge statistics from simulated crashes
 */
app.get('/aviator/statistics', (req, res) => {
  const count = parseInt(req.query.count) || 1000;
  const crashes = aviatorAlgorithm.simulateCrashes(count);
  const stats = aviatorAlgorithm.calculateHouseEdgeStats(crashes);
  
  res.json({
    success: true,
    statistics: stats,
    methodology: 'Provably fair algorithm with 1-in-33 forced crash mechanism'
  });
});

/**
 * Generate new seeds for a round
 */
app.get('/aviator/generate-seeds', (req, res) => {
  res.json({
    serverSeed: aviatorAlgorithm.generateServerSeed(),
    clientSeed: aviatorAlgorithm.generateClientSeed(),
    timestamp: new Date().toISOString(),
    note: 'Server seed is revealed after round completes for fairness verification'
  });
});

// ==================== REAL DATA PROVIDER ENDPOINTS ====================

/**
 * Fetch real crash history from casino API
 */
app.post('/real-data/fetch-crashes', async (req, res) => {
  const { provider = 'spribe', limit = 100 } = req.body;
  
  const result = await realDataProvider.fetchRealCrashes(provider, limit);
  res.json(result);
});

/**
 * Get current live round data
 */
app.post('/real-data/live-round', async (req, res) => {
  const { provider = 'spribe' } = req.body;
  
  const result = await realDataProvider.getLiveRound(provider);
  res.json(result);
});

/**
 * Get verified crash history
 */
app.get('/real-data/verified-history', (req, res) => {
  const history = realDataProvider.getVerifiedHistory();
  res.json({
    success: true,
    verifiedCrashes: history,
    totalCrashes: history.length,
    allVerified: history.every(c => c.verified)
  });
});

/**
 * Get live statistics from real data
 */
app.get('/real-data/live-statistics', (req, res) => {
  const stats = realDataProvider.getLiveStatistics();
  res.json(stats);
});

// ==================== LEGACY PREDICTION ENDPOINTS ====================

/**
 * Get prediction for next crash (uses technical analysis on real or mock data)
 */
app.post('/predict', (req, res) => {
  const { history = [], confidence = 0.75, useRealData = false } = req.body;
  
  let crashHistory = history;
  
  // If no history provided, try to use real data
  if (history.length === 0 && useRealData) {
    const realCrashes = realDataProvider.cache.crashes;
    if (realCrashes.length > 0) {
      crashHistory = realCrashes.map(c => c.multiplier).slice(0, 50);
    }
  }
  
  const prediction = predictorEngine.predict(crashHistory, confidence);
  res.json({
    ...prediction,
    dataSource: useRealData && history.length === 0 ? 'REAL_CASINO_API' : 'PROVIDED_HISTORY'
  });
});

/**
 * Analyze signals from historical data
 */
app.post('/analyze', (req, res) => {
  const { crashes = [], windowSize = 20, useRealData = false } = req.body;
  
  let crashData = crashes;
  
  // Use real data if requested and no crashes provided
  if (crashes.length === 0 && useRealData) {
    crashData = realDataProvider.cache.crashes.slice(0, 100);
  }
  
  const signals = analyzeSignals(crashData, windowSize);
  res.json({
    ...signals,
    dataSource: useRealData && crashes.length === 0 ? 'REAL_CASINO_API' : 'PROVIDED_DATA'
  });
});

/**
 * Get mock data for testing (legacy)
 */
app.get('/mock-data', (req, res) => {
  const count = parseInt(req.query.count) || 100;
  const data = generateMockCrashes(count);
  res.json({
    success: true,
    data,
    source: 'MOCK_GENERATED',
    note: 'Use /aviator/simulate for real algorithm-based simulation'
  });
});

/**
 * Get system status
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'running',
    modules: {
      aviatorAlgorithm: 'active',
      realDataProvider: 'active',
      predictor: 'active'
    }
  });
});

app.get('/signals-status', (req, res) => {
  const status = predictorEngine.getStatus();
  res.json({
    ...status,
    aviatorAlgorithmReady: true,
    realDataProviderReady: true,
    timestamp: new Date().toISOString()
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Aviator Crash Predictor Server running on http://localhost:${PORT}`);
  console.log(`\n📊 Real Aviator Algorithm Endpoints:`);
  console.log(`   POST /aviator/generate-crash - Generate crash using real algorithm`);
  console.log(`   POST /aviator/verify-crash - Verify crash result`);
  console.log(`   GET /aviator/simulate?count=100 - Simulate crashes with real algorithm`);
  console.log(`   GET /aviator/statistics - Get house edge statistics`);
  console.log(`   GET /aviator/generate-seeds - Generate new seeds\n`);
  console.log(`📡 Real Data Provider Endpoints:`);
  console.log(`   POST /real-data/fetch-crashes - Fetch from live casino API`);
  console.log(`   POST /real-data/live-round - Get current live round`);
  console.log(`   GET /real-data/verified-history - Get verified crash history`);
  console.log(`   GET /real-data/live-statistics - Get live statistics\n`);
  console.log(`🔮 Prediction Endpoints:`);
  console.log(`   POST /predict - Get crash prediction`);
  console.log(`   POST /analyze - Analyze signals\n`);
});
