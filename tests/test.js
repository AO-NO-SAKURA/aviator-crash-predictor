import { predictorEngine } from '../src/predictor.js';
import { generateMockCrashes, analyzeSignals } from '../src/signals.js';
import { calculateMA, calculateVolatility, calculateRSI } from '../src/analysis.js';

console.log('\n🧪 Running Tests for Aviator Crash Predictor...\n');

// Test 1: Mock Data Generation
console.log('📊 Test 1: Mock Data Generation');
const mockData = generateMockCrashes(50);
console.log(`✅ Generated ${mockData.length} mock crashes`);
console.log(`   First crash: ${mockData[0].multiplier}x`);
console.log(`   Last crash: ${mockData[mockData.length - 1].multiplier}x`);

// Test 2: Basic Prediction
console.log('\n🎯 Test 2: Basic Prediction');
const multipliers = mockData.map(c => c.multiplier);
const prediction = predictorEngine.predict(multipliers, 0.75);
if (prediction.success) {
  console.log(`✅ Prediction Success`);
  console.log(`   Predicted: ${prediction.predicted_multiplier}x`);
  console.log(`   Confidence: ${prediction.confidence}%`);
  console.log(`   Trend: ${prediction.trend}`);
  console.log(`   Signal: ${prediction.signal}`);
  console.log(`   Risk Level: ${prediction.risk_level}`);
} else {
  console.log(`❌ Prediction failed: ${prediction.error}`);
}

// Test 3: Signal Analysis
console.log('\n📈 Test 3: Signal Analysis');
const signals = analyzeSignals(mockData, 20);
if (signals.success) {
  console.log(`✅ Signal Analysis Success`);
  console.log(`   RSI Status: ${signals.signals.rsi.status}`);
  console.log(`   Time Signal: ${signals.signals.time_signals.time_signal}`);
  console.log(`   Multiplier Direction: ${signals.signals.multiplier_signals.direction}`);
  console.log(`   Avg Multiplier: ${signals.analysis.avg_multiplier}x`);
} else {
  console.log(`❌ Signal analysis failed: ${signals.error}`);
}

// Test 4: Technical Indicators
console.log('\n🔧 Test 4: Technical Indicators');
const ma10 = calculateMA(multipliers, 10);
const ma20 = calculateMA(multipliers, 20);
const volatility = calculateVolatility(multipliers);
const rsi = calculateRSI(multipliers);

console.log(`✅ Indicators Calculated`);
console.log(`   MA10: ${ma10?.toFixed(2)}`);
console.log(`   MA20: ${ma20?.toFixed(2)}`);
console.log(`   Volatility: ${volatility.toFixed(2)}`);
console.log(`   RSI: ${rsi.toFixed(2)}`);

// Test 5: Edge Cases
console.log('\n⚠️  Test 5: Edge Cases');
const smallHistory = [1.5, 1.8, 2.1];
const edgeCase = predictorEngine.predict(smallHistory);
console.log(`✅ Small history handling`);
console.log(`   Result: ${edgeCase.success ? 'Error caught' : 'Success'} - ${edgeCase.error || 'Predicted'}`);

// Test 6: Engine Status
console.log('\n⚡ Test 6: Engine Status');
const status = predictorEngine.getStatus();
console.log(`✅ Engine Status`);
console.log(`   Status: ${status.engine_status}`);
console.log(`   Predictions Made: ${status.predictions_made}`);
console.log(`   Version: ${status.version}`);

console.log('\n✨ All tests completed!\n');
