import { useEffect, useMemo, useState } from 'react';
import ChartView from './components/ChartView';
import CoinTable from './components/CoinTable';
import StrategyCards from './components/StrategyCards';
import StatsGrid from './components/StatsGrid';
import { mockCoins } from './mockData';

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setCoins(mockCoins);
        setError('');
      } catch (err) {
        setError('Unable to load recommendations');
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
