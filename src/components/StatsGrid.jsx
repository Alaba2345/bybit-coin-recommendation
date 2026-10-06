function StatsGrid({ coins, topCoins, averageScore, bullishCount }) {
  return (
    <section className="stats-grid">
      <div className="stat-card accent">
        <span>Top recommendation</span>
        <strong>{topCoins[0]?.symbol || '—'}</strong>
        <small>{topCoins[0]?.score || 0} score</small>
      </div>
      <div className="stat-card">
        <span>Average score</span>
        <strong>{averageScore.toFixed(1)}</strong>
        <small>{coins.length} tracked coins</small>
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
  );
}

export default StatsGrid;
