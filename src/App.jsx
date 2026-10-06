import { useEffect, useMemo, useState } from 'react';
import ChartView from './components/ChartView';
import CoinTable from './components/CoinTable';
import StrategyCards from './components/StrategyCards';
import StatsGrid from './components/StatsGrid';
import { mockCoins, sortCoins, filterCoins, paginateCoins } from './mockData';

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  
  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('score');
  const [perPage, setPerPage] = useState(50);

  // Filtering
  const [filters, setFilters] = useState({
    minMarketCap: null,
    maxMarketCap: null,
    minVolume: null,
    maxVolume: null,
    minPriceChange: null,
    maxPriceChange: null,
    signal: null,
    minScore: null,
  });

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

  // Apply search filter
  const searchFiltered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return coins;
    return coins.filter((coin) => coin.symbol.toLowerCase().includes(normalized));
  }, [coins, query]);

  // Apply advanced filters
  const advancedFiltered = useMemo(() => {
    return filterCoins(searchFiltered, filters);
  }, [searchFiltered, filters]);

  // Apply sorting
  const sorted = useMemo(() => {
    return sortCoins(advancedFiltered, sortBy);
  }, [advancedFiltered, sortBy]);

  // Apply pagination
  const paginated = useMemo(() => {
    return paginateCoins(sorted, page, perPage);
  }, [sorted, page, perPage]);

  const topCoins = sorted.slice(0, 3);
  const averageScore = sorted.length
    ? sorted.reduce((sum, coin) => sum + coin.score, 0) / sorted.length
    : 0;
  const bullishCount = sorted.filter((coin) => coin.signal === 'Bullish' || coin.signal === 'Breakout').length;

  const handleResetPage = () => {
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    handleResetPage();
  };

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
            onChange={(e) => {
              setQuery(e.target.value);
              handleResetPage();
            }}
            placeholder="Filter symbol..."
            aria-label="Filter symbol"
          />
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              handleResetPage();
            }}
            className="filter-select"
          >
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <StatsGrid coins={sorted} topCoins={topCoins} averageScore={averageScore} bullishCount={bullishCount} />

      {!loading && <StrategyCards coins={topCoins} onSelectCoin={setSelectedCoin} />}

      {selectedCoin && <ChartView symbol={selectedCoin} onClose={() => setSelectedCoin(null)} />}

      <section className="controls-card">
        <h3>Filters & Sorting</h3>
        <div className="controls-grid">
          <div className="control-group">
            <label>Sort By:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="score">Top Score</option>
              <option value="topGainers">Top Gainers 24h</option>
              <option value="topLosers">Top Losers 24h</option>
              <option value="marketCap">Market Cap</option>
              <option value="volume">Volume</option>
            </select>
          </div>

          <div className="control-group">
            <label>Min Market Cap ($):</label>
            <input
              type="number"
              value={filters.minMarketCap || ''}
              onChange={(e) => handleFilterChange({ ...filters, minMarketCap: e.target.value ? Number(e.target.value) : null })}
              placeholder="0"
            />
          </div>

          <div className="control-group">
            <label>Min Volume 24h ($):</label>
            <input
              type="number"
              value={filters.minVolume || ''}
              onChange={(e) => handleFilterChange({ ...filters, minVolume: e.target.value ? Number(e.target.value) : null })}
              placeholder="0"
            />
          </div>

          <div className="control-group">
            <label>Signal:</label>
            <select value={filters.signal || ''} onChange={(e) => handleFilterChange({ ...filters, signal: e.target.value || null })}>
              <option value="">All Signals</option>
              <option value="Bullish">Bullish</option>
              <option value="Breakout">Breakout</option>
              <option value="Neutral">Neutral</option>
              <option value="Risky">Risky</option>
            </select>
          </div>

          <div className="control-group">
            <label>Min Score:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.minScore || ''}
              onChange={(e) => handleFilterChange({ ...filters, minScore: e.target.value ? Number(e.target.value) : null })}
              placeholder="0"
            />
          </div>

          <div className="control-group">
            <label>24h Change (%):</label>
            <input
              type="number"
              value={filters.minPriceChange || ''}
              onChange={(e) => handleFilterChange({ ...filters, minPriceChange: e.target.value ? Number(e.target.value) : null })}
              placeholder="min"
            />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="loading">Loading Bybit market data...</div>
      ) : (
        <>
          <CoinTable coins={paginated.data} onSelectCoin={setSelectedCoin} />

          <div className="pagination">
            <div className="pagination-info">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, paginated.total)} of {paginated.total} coins
            </div>
            <div className="pagination-controls">
              <button onClick={() => setPage(page - 1)} disabled={!paginated.hasPrevPage} className="pagination-btn">
                ← Previous
              </button>
              <span className="pagination-page">
                Page {page} of {paginated.totalPages}
              </span>
              <button onClick={() => setPage(page + 1)} disabled={!paginated.hasNextPage} className="pagination-btn">
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
