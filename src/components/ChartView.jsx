import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ChartView({ symbol, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await fetch(`/api/coin/${symbol}`);
        if (!resp.ok) {
          throw new Error(`Failed to load chart data`);
        }
        const chartData = await resp.json();
        setData(chartData);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [symbol]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{symbol} Technical Analysis</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="loading">Loading chart data...</div>
        ) : error ? (
          <div className="alert error">{error}</div>
        ) : data ? (
          <div className="chart-container">
            <div className="indicators-row">
              <div className="indicator-box">
                <h4>RSI (14)</h4>
                {data.indicators.rsi !== null ? (
                  <div className={`indicator-value ${data.indicators.rsi > 70 ? 'overbought' : data.indicators.rsi < 30 ? 'oversold' : ''}`}>
                    {data.indicators.rsi.toFixed(2)}
                  </div>
                ) : (
                  <div className="indicator-value">—</div>
                )}
              </div>
              <div className="indicator-box">
                <h4>MACD</h4>
                {data.indicators.macd ? (
                  <div className="indicator-value">
                    {data.indicators.macd.histogram > 0 ? '↑' : '↓'} {Math.abs(data.indicators.macd.histogram).toFixed(6)}
                  </div>
                ) : (
                  <div className="indicator-value">—</div>
                )}
              </div>
              <div className="indicator-box">
                <h4>Signals</h4>
                <div className="indicator-value">
                  {data.signals.buySignal ? '🟢 BUY' : data.signals.sellSignal ? '🔴 SELL' : '⚪ HOLD'}
                </div>
              </div>
              <div className="indicator-box">
                <h4>Signal Strength</h4>
                <div className="indicator-value">{data.signals.strength.toFixed(2)}</div>
              </div>
            </div>

            <h4 style={{ marginTop: '20px' }}>Price Chart (4H)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="close" stroke="#38bdf8" name="Close" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>

            <h4 style={{ marginTop: '20px' }}>Volume</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#818cf8" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ChartView;
