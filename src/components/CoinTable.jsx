function CoinTable({ coins, onSelectCoin }) {
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

  return (
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
              <th>Stop Loss</th>
              <th>TP1 / TP2</th>
              <th>Signal</th>
              <th>Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin, index) => (
              <tr key={coin.symbol}>
                <td>#{index + 1}</td>
                <td className="symbol-name">{coin.symbol}</td>
                <td>{formatPrice(coin.lastPrice)}</td>
                <td className={coin.price24hPcnt >= 0 ? 'positive' : 'negative'}>
                  {coin.price24hPcnt.toFixed(2)}%
                </td>
                <td>{formatCompact(coin.volume24h)}</td>
                <td className="risk-cell">{formatPrice(coin.stopLoss)}</td>
                <td className="risk-cell">
                  {formatPrice(coin.takeProfit1)} / {formatPrice(coin.takeProfit2)}
                </td>
                <td>
                  <span className={`signal-badge ${signalColor(coin.signal)}`}>{coin.signal}</span>
                </td>
                <td>{coin.score.toFixed(1)}</td>
                <td>
                  <button className="action-btn" onClick={() => onSelectCoin(coin.symbol)}>
                    Chart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CoinTable;
