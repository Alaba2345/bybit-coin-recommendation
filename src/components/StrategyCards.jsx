function StrategyCards({ coins, onSelectCoin }) {
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

  const formatPrice = (value) => {
    if (!Number.isFinite(value)) return '—';
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: value >= 1 ? 4 : 8,
    }).format(value);
  };

  return (
    <section className="strategy-row">
      {coins.slice(0, 3).map((coin, index) => (
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

          <div className="risk-section">
            <div className="risk-label">Stop Loss</div>
            <div className="risk-value">{formatPrice(coin.stopLoss)}</div>

            <div className="risk-label" style={{ marginTop: '8px' }}>
              Take Profit 1
            </div>
            <div className="risk-value">{formatPrice(coin.takeProfit1)}</div>

            <div className="risk-label" style={{ marginTop: '8px' }}>
              Take Profit 2
            </div>
            <div className="risk-value">{formatPrice(coin.takeProfit2)}</div>
          </div>

          <div className="trade-row">
            <span>Score</span>
            <strong>{coin.score.toFixed(1)}</strong>
          </div>

          <button className="view-chart-btn" onClick={() => onSelectCoin(coin.symbol)}>
            View Chart
          </button>
        </article>
      ))}
    </section>
  );
}

export default StrategyCards;
