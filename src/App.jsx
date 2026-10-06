import { useEffect, useMemo, useState } from 'react';
import ChartView from './components/ChartView';
import CoinTable from './components/CoinTable';
import StrategyCards from './components/StrategyCards';
import StatsGrid from './components/StatsGrid';

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

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
    const interval = setInterval(load, 120000); // Refresh every 2 minutes
    return () => clearInterval(interval);
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

      <StatsGrid coins={filteredCoins} topCoins={topCoins} averageScore={averageScore} bullishCount={bullishCount} />

      {!loading && <StrategyCards coins={topCoins} onSelectCoin={setSelectedCoin} />}

      {selectedCoin && <ChartView symbol={selectedCoin} onClose={() => setSelectedCoin(null)} />}

      {loading ? (
        <div className="loading">Loading Bybit market data...</div>
      ) : (
        <CoinTable coins={filteredCoins} onSelectCoin={setSelectedCoin} />
      )}
    </div>
  );
}

export default App;
