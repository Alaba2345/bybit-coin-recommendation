import { useEffect, useMemo, useState } from 'react';
import ChartView from './components/ChartView';
import CoinTable from './components/CoinTable';
import StrategyCards from './components/StrategyCards';
import StatsGrid from './components/StatsGrid';
import { getLiveCoins, getTopRecommendations, sortCoins, filterCoins, paginateCoins } from './mockData';

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(1000); // 1 second default
  
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

  // Auto-refresh live data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const liveCoins = getLiveCoins();
      setCoins(liveCoins);
      setLastUpdate(new Date());
      setLoading(false);
    }, refreshInterval);

    // Initial load
    const liveCoins = getLiveCoins();
    setCoins(liveCoins);
    setLastUpdate(new Date());
    setLoading(false);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

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

  // Get auto-recommended coins (top 5)
  const autoRecommended = useMemo(() => {
    return getTopRecommendations(coins, 5);
  }, [coins]);

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

  const formatTime = (date) => {
    return date.toLocaleTimeString();
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">⚡ Bybit Live Intelligence</p>
          <h1>Real-Time Crypto Trading Dashboard</h1>
          <small style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Auto-updating • Last refresh: {formatTime(lastUpdate)}
          </small>
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
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="filter-select"
            title="Auto-refresh interval"
          >
            <option value={500}>Refresh 2x/sec</option>
            <option value={1000}>Refresh 1x/sec</option>
            <option value={2000}>Refresh 0.5x/sec</option>
            <option value={5000}>Refresh 5 sec</option>
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '12px 16px',
              background: autoRefresh ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)',
              border: `1px solid ${autoRefresh ? '#34d399' : '#f87171'}`,
              color: autoRefresh ? '#34d399' : '#f87171',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
            title="Toggle auto-refresh"
          >
            {autoRefresh ? '🟢 LIVE' : '🔴 PAUSED'}
          </button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}

      <StatsGrid coins={sorted} topCoins={topCoins} averageScore={averageScore} bullishCount={bullishCount} />

      {/* Auto-Recommended Section */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.1), rgba(34, 197, 94, 0.08))',
        border: '2px solid rgba(52, 211, 153, 0.3)',
        borderRadius: '18px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h2 style={{ margin: '0 0 16px', color: '#34d399', fontSize: '1.3rem' }}>🎯 Auto-Detected Recommendations</h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
          These coins are automatically detected as having the strongest signals right now
        </p>
        {autoRecommended.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
          }}>
            {autoRecommended.map((coin, index) => (
              <div key={coin.symbol} style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                hover: { borderColor: 'rgba(52, 211, 153, 0.6)' },
              }} onClick={() => setSelectedCoin(coin.symbol)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>#{index + 1}</strong>
                  <span style={{
                    background: 'rgba(52, 211, 153, 0.2)',
                    color: '#34d399',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                  }}>
                    {coin.signal}
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>
                  {coin.symbol}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '6px' }}>
                  ${coin.lastPrice.toFixed(6)}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: coin.price24hPcnt >= 0 ? '#34d399' : '#f87171',
                }}>
                  {coin.price24hPcnt > 0 ? '+' : ''}{coin.price24hPcnt.toFixed(2)}%
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--accent)',
                  marginTop: '8px',
                  fontWeight: '600',
                }}>
                  Score: {coin.score.toFixed(1)}/100
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)' }}>No strong recommendations detected yet. Analyzing market...</p>
        )}
      </section>

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
        <div className="loading">🔄 Analyzing live market data...</div>
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
