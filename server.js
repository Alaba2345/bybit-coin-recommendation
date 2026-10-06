import express from 'express';
import cors from 'cors';
import axios from 'axios';
import NodeCache from 'node-cache';

const app = express();
const port = 3001;
const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

app.use(cors());
app.use(express.json());

const BYBIT_ENDPOINT = 'https://api.bybit.com/v5/market/tickers';
const BYBIT_KLINES = 'https://api.bybit.com/v5/market/kline';

// ============================================
// Technical Analysis Functions
// ============================================

function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

function calculateEMA(prices, period) {
  if (prices.length < period) return null;
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * multiplier + ema * (1 - multiplier);
  }
  return ema;
}

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - change) / period;
    }
  }

  const rs = avgGain / (avgLoss || 1);
  return 100 - 100 / (1 + rs);
}

function calculateMACD(prices) {
  if (prices.length < 26) return null;

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  if (!ema12 || !ema26) return null;

  const macdLine = ema12 - ema26;
  const signalLine = calculateEMA([macdLine], 9);
  const histogram = macdLine - (signalLine || 0);

  return { macdLine, signalLine, histogram };
}

function calculateBollingerBands(prices, period = 20, stdDevs = 2) {
  if (prices.length < period) return null;

  const sma = calculateSMA(prices, period);
  if (!sma) return null;

  const recentPrices = prices.slice(-period);
  const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: sma + stdDevs * stdDev,
    middle: sma,
    lower: sma - stdDevs * stdDev,
  };
}

function generateSignalsFromIndicators(prices, lastPrice) {
  if (prices.length < 26) return { buySignal: false, sellSignal: false, strength: 0 };

  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const bb = calculateBollingerBands(prices);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);

  let buyScore = 0;
  let sellScore = 0;

  // RSI signals
  if (rsi !== null) {
    if (rsi < 30) buyScore += 2;
    if (rsi > 70) sellScore += 2;
  }

  // MACD signals
  if (macd && macd.histogram > 0) buyScore += 1.5;
  if (macd && macd.histogram < 0) sellScore += 1.5;

  // Bollinger Bands signals
  if (bb) {
    if (lastPrice < bb.lower) buyScore += 1;
    if (lastPrice > bb.upper) sellScore += 1;
  }

  // Moving Average signals
  if (sma20 && sma50) {
    if (sma20 > sma50) buyScore += 1;
    else sellScore += 1;
  }

  const buySignal = buyScore >= 3;
  const sellSignal = sellScore >= 3;
  const strength = Math.max(buyScore, sellScore);

  return { buySignal, sellSignal, strength, rsi, macd, bb };
}

function scoreCoin(item) {
  const lastPrice = Number(item.lastPrice || 0);
  const priceChange = Number(item.price24hPcnt || 0);
  const volume24h = Number(item.volume24h || 0);
  const turnover24h = Number(item.turnover24h || 0);
  const high = Number(item.highPrice24h || lastPrice);
  const low = Number(item.lowPrice24h || lastPrice);

  const volatility = low > 0 ? (high - low) / low : 0;
  const volumeWeight = Math.log1p(volume24h || 1) * 0.8;
  const trendScore = priceChange * 3.5;
  const turnoverScore = turnover24h > 0 ? Math.log10(turnover24h + 1) * 1.2 : 0;
  const riskPenalty = volatility * 200;

  const score = trendScore + volumeWeight + turnoverScore - riskPenalty;

  if (score >= 12) return { signal: 'Breakout', score: Math.max(0, score) };
  if (score >= 6) return { signal: 'Bullish', score: Math.max(0, score) };
  if (score > -2) return { signal: 'Neutral', score: Math.max(0, score) };
  return { signal: 'Risky', score: Math.max(0, score) };
}

async function fetchBybitTickers(category = 'spot') {
  const cacheKey = `tickers-${category}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const response = await axios.get(BYBIT_ENDPOINT, {
    params: { category },
    timeout: 20000,
  });

  if (response.data?.retCode !== 0) {
    throw new Error(response.data?.retMsg || 'Bybit API request failed');
  }

  const data = response.data?.result?.list || [];
  cache.set(cacheKey, data, 60);
  return data;
}

async function fetchBybitKlines(symbol, interval = '4h', limit = 60) {
  const cacheKey = `klines-${symbol}-${interval}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(BYBIT_KLINES, {
      params: {
        category: symbol.endsWith('USDT') ? 'spot' : 'linear',
        symbol,
        interval,
        limit,
      },
      timeout: 20000,
    });

    if (response.data?.retCode !== 0) {
      return [];
    }

    const klines = (response.data?.result?.list || []).map((k) => ({
      time: Number(k[0]),
      open: Number(k[1]),
      high: Number(k[2]),
      low: Number(k[3]),
      close: Number(k[4]),
      volume: Number(k[5]),
    }));

    cache.set(cacheKey, klines, 120);
    return klines;
  } catch (error) {
    console.error(`Failed to fetch klines for ${symbol}:`, error.message);
    return [];
  }
}

app.get('/api/recommendations', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 10), 30);
    const spot = await fetchBybitTickers('spot');
    const linear = await fetchBybitTickers('linear');

    const pool = [...spot, ...linear]
      .filter((entry) => {
        const symbol = entry?.symbol || '';
        return symbol.toUpperCase().endsWith('USDT') || symbol.toUpperCase().endsWith('USDC');
      })
      .map((entry) => {
        const { signal, score } = scoreCoin(entry);
        const lastPrice = Number(entry.lastPrice || 0);
        const volatility = Math.abs(Number(entry.price24hPcnt || 0));

        // Calculate risk levels
        const stopLoss = (lastPrice * 0.95).toFixed(8); // 5% below
        const takeProfit1 = (lastPrice * 1.05).toFixed(8); // 5% above
        const takeProfit2 = (lastPrice * 1.10).toFixed(8); // 10% above

        return {
          symbol: entry.symbol,
          lastPrice: Number(lastPrice.toFixed(8)),
          price24hPcnt: Number(entry.price24hPcnt || 0),
          volume24h: Number(entry.volume24h || 0),
          turnover24h: Number(entry.turnover24h || 0),
          signal,
          score: Number(score.toFixed(2)),
          volatility,
          stopLoss: Number(stopLoss),
          takeProfit1: Number(takeProfit1),
          takeProfit2: Number(takeProfit2),
        };
      })
      .sort((a, b) => b.score - a.score);

    res.json({ count: pool.length, coins: pool.slice(0, limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

app.get('/api/coin/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const interval = req.query.interval || '4h';

    const klines = await fetchBybitKlines(symbol, interval, 100);
    if (!klines || klines.length === 0) {
      return res.status(404).json({ message: 'No chart data available' });
    }

    const prices = klines.map((k) => k.close);
    const { buySignal, sellSignal, strength, rsi, macd, bb } = generateSignalsFromIndicators(
      prices,
      prices[prices.length - 1]
    );

    const chartData = klines.map((k) => ({
      time: new Date(k.time).toLocaleString(),
      close: k.close,
      open: k.open,
      high: k.high,
      low: k.low,
      volume: k.volume,
    }));

    res.json({
      symbol,
      interval,
      chartData,
      indicators: {
        rsi: rsi ? Number(rsi.toFixed(2)) : null,
        macd,
        bollingerBands: bb,
      },
      signals: {
        buySignal,
        sellSignal,
        strength: Number(strength.toFixed(2)),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'bybit-ai-screen', cacheSize: cache.keys().length });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Cache initialized with 60s TTL`);
});
