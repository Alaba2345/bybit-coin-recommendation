# Bybit Coin Recommendation Dashboard

Advanced cryptocurrency trading recommendation system with real-time technical analysis, RSI/MACD indicators, buy/sell signals, and interactive chart view.

**Live Demo**: Coming soon after Vercel deployment

## Features

### 1. Real-Time Market Data
- Fetches all Bybit spot and linear market coins
- Real-time price updates every 2 minutes
- Backend caching (60s TTL) for optimal performance

### 2. Technical Analysis
- **RSI (Relative Strength Index)**: 14-period overbought/oversold detection
- **MACD (Moving Average Convergence Divergence)**: Trend momentum and signal crossovers
- **Bollinger Bands**: Volatility and support/resistance levels
- **Moving Averages**: SMA20, SMA50 for trend confirmation

### 3. Trading Signals
- **Buy Signals**: Triggered by RSI < 30 + MACD bullish + BB lower band + MA crossover
- **Sell Signals**: Triggered by RSI > 70 + MACD bearish + BB upper band
- **Signal Strength**: 0-4 scale confidence metric

### 4. Risk Management
- **Stop Loss**: 5% below entry price
- **Take Profit 1**: 5% above entry price  
- **Take Profit 2**: 10% above entry price
- Automatic calculation for each recommended coin

### 5. Interactive Charts
- 4H OHLCV candle data visualization
- Price action and volume bars
- Real-time technical indicator overlay
- One-click modal chart viewer

### 6. Performance Optimization
- Node-cache backend with 60s TTL
- Kline data cached for 120s
- Concurrent coin + chart loading
- Minimal API calls

## Local Installation

```bash
git clone https://github.com/Alaba2345/bybit-coin-recommendation.git
cd bybit-coin-recommendation
npm install
```

## Running Locally

```bash
npm run dev
```

Then open:
- Dashboard: http://localhost:5173
- API: http://localhost:3001/api/recommendations

## Deployment to Vercel

### Quick Deploy Button (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Alaba2345/bybit-coin-recommendation)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow prompts** and select your GitHub account

4. **Your live app** will be available at `https://bybit-coin-recommendation.vercel.app`

## API Endpoints

### GET /api/recommendations
Fetch top recommended coins with scores and signals.

```json
{
  "count": 20,
  "coins": [
    {
      "symbol": "BTCUSDT",
      "lastPrice": 63240.12,
      "price24hPcnt": 1.35,
      "volume24h": 4500000000,
      "score": 12.84,
      "signal": "Bullish",
      "volatility": 1.2,
      "stopLoss": 60078.11,
      "takeProfit1": 66402.13,
      "takeProfit2": 69564.13
    }
  ]
}
```

### GET /api/coin/:symbol
Fetch chart data and technical indicators for a specific coin.

```json
{
  "symbol": "BTCUSDT",
  "interval": "4h",
  "chartData": [...],
  "indicators": {
    "rsi": 65.4,
    "macd": { "macdLine": -0.032, "signalLine": -0.028, "histogram": -0.004 },
    "bollingerBands": { "upper": 65000, "middle": 63240, "lower": 61480 }
  },
  "signals": {
    "buySignal": false,
    "sellSignal": false,
    "strength": 2.5
  }
}
```

### GET /api/health
Health check endpoint.

```json
{
  "ok": true,
  "service": "bybit-ai-screen",
  "cacheSize": 12
}
```

## Scoring Algorithm

The recommendation score combines multiple factors:

1. **24h Price Momentum** (55%): Positive trends get higher scores
2. **Volume Weight** (15%): High volume indicates strong interest
3. **Turnover Score** (20%): Large market cap movements
4. **Risk Penalty** (10%): High volatility reduces score

## Signal Definitions

- **Breakout**: Score ≥ 12 (strong bullish momentum)
- **Bullish**: Score ≥ 6 (positive momentum)
- **Neutral**: Score > -2 (balanced)
- **Risky**: Score ≤ -2 (negative momentum)

## Technical Indicator Thresholds

- **RSI**: < 30 (oversold/buy), > 70 (overbought/sell)
- **MACD**: Bullish histogram > 0, Bearish histogram < 0
- **Bollinger Bands**: Touch lower/upper for extremes
- **MA Crossover**: SMA20 > SMA50 = bullish

## Performance

- Dashboard updates: Every 2 minutes
- API response time: < 500ms (cached)
- Chart load time: < 1s per coin
- Concurrent requests: Fully supported

## Technologies

- **Frontend**: React 18, Vite, Recharts
- **Backend**: Express, Axios, Node-cache
- **Data**: Bybit REST API v5
- **Styling**: Custom CSS with dark theme
- **Hosting**: Vercel

## Important Notes

⚠️ **Disclaimer**: This tool is for educational and analysis purposes only. It does not provide financial advice. Always conduct your own research and risk assessment before trading.

## License

MIT
