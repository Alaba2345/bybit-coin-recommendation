@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --bg: #07111f;
  --bg-2: #0d1b2a;
  --panel: rgba(15, 23, 42, 0.9);
  --panel-alt: rgba(15, 118, 110, 0.12);
  --card-border: rgba(148, 163, 184, 0.18);
  --text: #e5ecf5;
  --muted: #8aa0b8;
  --positive: #34d399;
  --positive-strong: #10b981;
  --negative: #f87171;
  --neutral: #fbbf24;
  --accent: #38bdf8;
  --accent-2: #818cf8;
  --shadow: 0 20px 45px rgba(15, 23, 42, 0.45);
}

* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  min-height: 100%;
  font-family: 'Inter', sans-serif;
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 28%),
    radial-gradient(circle at right, rgba(129, 140, 248, 0.18), transparent 20%),
    var(--bg);
  color: var(--text);
}

body {
  min-height: 100vh;
}

button, input {
  font: inherit;
}

.app-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 20px 60px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  font-weight: 700;
}

.topbar h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.1;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar input {
  width: min(320px, 58vw);
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid var(--card-border);
  color: var(--text);
  border-radius: 12px;
  padding: 12px 14px;
  outline: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.stat-card,
.strategy-card,
.table-card {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--card-border);
  border-radius: 18px;
  box-shadow: var(--shadow);
}

.stat-card {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-card.accent {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(129, 140, 248, 0.08));
}

.stat-card span {
  color: var(--muted);
  font-size: 0.8rem;
}

.stat-card strong {
  font-size: clamp(1.5rem, 2vw, 2rem);
  line-height: 1.1;
}

.stat-card small {
  color: var(--muted);
}

.strategy-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.strategy-card {
  position: relative;
  padding: 18px;
  overflow: hidden;
}

.strategy-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
}

.rank-pill {
  position: absolute;
  right: 16px;
  top: 16px;
  background: rgba(56, 189, 248, 0.2);
  color: var(--accent);
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.strategy-card h3 {
  margin: 0 0 12px;
  font-size: 1.5rem;
}

.trade-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.trade-row:last-child {
  border-bottom: none;
}

.trade-row span {
  color: var(--muted);
}

.signal-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 0.72rem;
  font-weight: 700;
  margin-bottom: 14px;
}

.positive {
  color: var(--positive);
}

.negative {
  color: var(--negative);
}

.neutral {
  color: var(--neutral);
}

.breakout {
  color: #a78bfa;
}

.signal-badge.positive,
.signal-badge.breakout,
.signal-badge.neutral,
.signal-badge.negative {
  background: rgba(148, 163, 184, 0.08);
}

.table-card {
  padding: 18px 18px 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.table-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.table-header span {
  color: var(--muted);
  font-size: 0.85rem;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

th, td {
  padding: 12px 10px;
  text-align: left;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

th {
  color: var(--muted);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.symbol-name {
  font-weight: 700;
  color: #f8fafc;
}

.loading,
.alert {
  padding: 14px 16px;
  border-radius: 12px;
  margin-bottom: 18px;
  border: 1px solid var(--card-border);
}

.loading {
  color: var(--muted);
  background: rgba(15, 23, 42, 0.8);
}

.alert.error {
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.28);
  color: #fecaca;
}

@media (max-width: 920px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }

  .strategy-row {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 560px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .toolbar input {
    width: 100%;
  }
}
