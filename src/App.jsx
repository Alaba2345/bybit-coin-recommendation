import { useEffect, useMemo, useState } from 'react';

const formatPrice = (value) => {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 1 ? 4 : 8,
  }).format(value);
};

const formatCompact = (value) => {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value);
};

const signalColor = (signal) => {
  switch (signal) {
    case 'Bullish':
      return 'positive';
    case 'Breakout':
      return 'breakout';
    case 'Neutral':
      return 'neutral';
    case 'Risky':
      return 'negative';
    default:
      return 'neutral';
  }
};

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await fetch('/api/recommendations?limit=20');
        if (!resp.ok) {
          throw new Error(`Request failed with ${resp.status}`);
        }
        const data = await resp.json();
        setCoins(data.coins || []);
        setError('');
      } catch (err) {
        setError(err.message || 'Unable to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredCoins = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return coins;
    return coins.filter((coin) => coin.symbol.toLowerCase().includes(normalized));
  }, [coins, query]);

  const topCoins = filteredCoins.slice(0, 3);
  const averageScore = filteredCoins.length
    ? filteredCoins.reduce((sum, coin) => sum + coin.score, 0) / filteredCoins.length
    : 0;
  const bullishCount = filteredCoins.filter((coin) => coin.signal === 'Bullish' || coin.signal === 'Breakout').length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Bybit Intelligence</p>
          <h1>Crypto Trading Strategy Dashboard</h1>
        </div>
        <div className="toolbar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter symbol..."
            aria-label="Filter symbol"
          />
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <section className="stats-grid">
        <div className="stat-card accent">
          <span>Top recommendation</span>
          <strong>{topCoins[0]?.symbol || '—'}</strong>
          <small>{topCoins[0]?.score || 0} score</small>
        </div>
        <div className="stat-card">
          <span>Average score</span>
          <strong>{averageScore.toFixed(1)}</strong>
          <small>{filteredCoins.length} tracked coins</small>
        </div>
        <div className="stat-card">
          <span>Momentum setups</span>
          <strong>{bullishCount}</strong>
          <small>positive signal count</small>
        </div>
        <div className="stat-card">
          <span>Market tone</span>
          <strong>{averageScore > 50 ? 'Bullish' : averageScore > 25 ? 'Neutral' : 'Cautious'}</strong>
          <small>risk adjusted</small>
        </div>
      </section>

      <section className="strategy-row">
        {topCoins.slice(0, 3).map((coin, index) => (
          <article key={coin.symbol} className="strategy-card">
            <div className="rank-pill">#{index + 1}</div>
            <h3>{coin.symbol}</h3>
            <div className={`signal-badge ${signalColor(coin.signal)}`}>{coin.signal}</div>
            <div className="trade-row">
              <span>Entry</span>
              <strong>{formatPrice(coin.lastPrice)}</strong>
            </div>
            <div className="trade-row">
              <span>24h</span>
              <strong className={coin.price24hPcnt >= 0 ? 'positive' : 'negative'}>
                {coin.price24hPcnt.toFixed(2)}%
              </strong>
            </div>
            <div className="trade-row">
              <span>Volume</span>
              <strong>{formatCompact(coin.volume24h)}</strong>
            </div>
            <div className="trade-row">
              <span>Score</span>
              <strong>{coin.score.toFixed(1)}</strong>
            </div>
          </article>
        ))}
      </section>

      {loading ? (
        <div className="loading">Loading Bybit market data...</div>
      ) : (
        <section className="table-card">
          <div className="table-header">
            <h2>Recommended Coin List</h2>
            <span>Updated from Bybit market feed</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Symbol</th>
                  <th>Price</th>
                  <th>24h %</th>
                  <th>Volume</th>
                  <th>Signal</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoins.map((coin, index) => (
                  <tr key={coin.symbol}>
                    <td>#{index + 1}</td>
                    <td className="symbol-name">{coin.symbol}</td>
                    <td>{formatPrice(coin.lastPrice)}</td>
                    <td className={coin.price24hPcnt >= 0 ? 'positive' : 'negative'}>
                      {coin.price24hPcnt.toFixed(2)}%
                    </td>
                    <td>{formatCompact(coin.volume24h)}</td>
                    <td>
                      <span className={`signal-badge ${signalColor(coin.signal)}`}>{coin.signal}</span>
                    </td>
                    <td>{coin.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
