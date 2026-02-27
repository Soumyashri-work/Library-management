import { useState, useEffect } from 'react';
import { getBookCount, getAverageYear, getInsights, getBooks, getAuthors, getCategories } from '../services/api';

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [count, setCount] = useState(null);
  const [avgYear, setAvgYear] = useState(null);
  const [insights, setInsights] = useState(null);
  const [authorCount, setAuthorCount] = useState(null);
  const [categoryCount, setCategoryCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getBookCount(),
      getAverageYear(),
      getInsights(),
      getAuthors(),
      getCategories(),
    ])
      .then(([c, avg, ins, authors, cats]) => {
        setCount(c.total_books);
        setAvgYear(avg.average_year ? Math.round(avg.average_year) : null);
        setInsights(ins);
        setAuthorCount(authors.length);
        setCategoryCount(cats.length);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-wrap"><div className="spinner" /><span>Loading dashboard...</span></div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Library overview and key metrics</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stat-grid">
        <StatCard label="Total Books" value={count ?? 0} sub="in collection" />
        <StatCard label="Average Year" value={avgYear ?? 'N/A'} sub={avgYear ? 'publication year' : 'no data yet'} />
        <StatCard label="Authors" value={authorCount ?? 0} sub="registered" />
        <StatCard label="Categories" value={categoryCount ?? 0} sub="genres" />
      </div>

      {insights && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '8px' }}>
          {/* Top Authors */}
          <div className="stats-card">
            <div className="stats-card-title">✒️ Top Authors by Books</div>
            {insights.top_authors?.length === 0 ? (
              <div className="state-empty" style={{padding:'20px 0'}}>
                <div style={{color:'var(--text-dim)'}}>No data yet</div>
              </div>
            ) : (
              <ul className="insights-list">
                {insights.top_authors?.map((a, i) => (
                  <li key={a.author}>
                    <span style={{display:'flex',gap:'10px',alignItems:'center'}}>
                      <span className="rank">#{i + 1}</span>
                      <span>{a.author}</span>
                    </span>
                    <span className="badge badge-gold">{a.book_count} {a.book_count === 1 ? 'book' : 'books'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Busy Years */}
          <div className="stats-card">
            <div className="stats-card-title"> Active Publication Years</div>
            {!insights.busy_years || Object.keys(insights.busy_years).length === 0 ? (
              <div style={{color:'var(--text-dim)', fontSize:'0.875rem', padding:'8px 0'}}>
                No years with 2+ books yet.
              </div>
            ) : (
              <ul className="insights-list">
                {Object.entries(insights.busy_years).map(([year, titles]) => (
                  <li key={year} style={{flexDirection:'column', gap:'6px', alignItems:'flex-start'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <span className="busy-year-tag">{year}</span>
                      <span style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{titles.length} books</span>
                    </div>
                    <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>
                      {titles.join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
