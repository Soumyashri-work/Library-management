import { useState, useEffect } from 'react';
import {
  getBookCount, getAverageYear, getAuthorRange,
  getAuthorHasBooks, getInsights, getBooks, getAuthors, getCategories
} from '../services/api';

function StatRow({ label, value }) {
  return (
    <div className="stats-row">
      <span className="stats-row-label">{label}</span>
      <span className="stats-row-value">{value}</span>
    </div>
  );
}

export default function Stats() {
  const [bookCount, setBookCount] = useState(null);
  const [avgYear, setAvgYear] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [authorRange, setAuthorRange] = useState(null);
  const [authorRangeLoading, setAuthorRangeLoading] = useState(false);
  const [authorHasBooks, setAuthorHasBooks] = useState(null);
  const [insights, setInsights] = useState(null);
  const [categoryBooks, setCategoryBooks] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [catAllHaveYear, setCatAllHaveYear] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getBookCount(),
      getAverageYear(),
      getAuthors(),
      getCategories(),
      getInsights(),
    ])
      .then(([c, avg, a, cats, ins]) => {
        setBookCount(c.total_books);
        setAvgYear(avg.average_year ? avg.average_year.toFixed(1) : null);
        setAuthors(a);
        setCategories(cats);
        setInsights(ins);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const checkAuthor = async (id) => {
    if (!id) { setAuthorRange(null); setAuthorHasBooks(null); return; }
    setAuthorRangeLoading(true);
    try {
      const [range, hasBooks] = await Promise.all([getAuthorRange(id), getAuthorHasBooks(id)]);
      setAuthorRange(range);
      setAuthorHasBooks(hasBooks.has_books);
    } catch (e) {
      setAuthorRange(null);
      setAuthorHasBooks(null);
    } finally {
      setAuthorRangeLoading(false);
    }
  };

  const checkCategory = async (id) => {
    if (!id) { setCategoryBooks(null); setCatAllHaveYear(null); return; }
    setCatLoading(true);
    try {
      const books = await getBooks({ category_id: id, limit: 100 });
      setCategoryBooks(books);
      const allHaveYear = books.length > 0 && books.every(b => b.publication_year != null);
      setCatAllHaveYear(allHaveYear);
    } catch (e) {
      setCategoryBooks(null);
    } finally {
      setCatLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-wrap"><div className="spinner" /><span>Loading stats...</span></div>
  );

  const booksPerCategory = categories.map(cat => {
    return cat;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stats & Reports</h1>
          <p className="page-subtitle">Library analytics and checks</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        {/* Quick Stats */}
        <div className="stats-card">
          <div className="stats-card-title"> Quick Stats</div>
          <StatRow label="Total Books" value={bookCount ?? 0} />
          <StatRow label="Average Publication Year" value={avgYear ? avgYear : 'N/A'} />
          <StatRow label="Total Authors" value={authors.length} />
          <StatRow label="Total Categories" value={categories.length} />
        </div>

        {/* Author Checks */}
        <div className="stats-card">
          <div className="stats-card-title">✒️ Author Checks</div>
          <div className="form-group" style={{marginBottom:'16px'}}>
            <label className="filter-label">Select Author</label>
            <select
              className="filter-select"
              style={{width:'100%'}}
              value={selectedAuthor}
              onChange={e => {
                setSelectedAuthor(e.target.value);
                checkAuthor(e.target.value);
              }}
            >
              <option value="">Choose an author...</option>
              {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          {authorRangeLoading && <div className="loading-wrap" style={{padding:'12px'}}><div className="spinner" /></div>}
          {!authorRangeLoading && selectedAuthor && (
            <>
              <StatRow
                label="Has Books?"
                value={<span className={authorHasBooks ? 'yn-yes' : 'yn-no'}>{authorHasBooks ? 'Yes ✓' : 'No ✗'}</span>}
              />
              {authorRange && !authorRange.message && (
                <>
                  <StatRow label="Earliest Book" value={authorRange.earliest} />
                  <StatRow label="Latest Book" value={authorRange.latest} />
                </>
              )}
              {authorRange?.message && (
                <div style={{color:'var(--text-dim)', fontSize:'0.85rem', padding:'8px 0'}}>{authorRange.message}</div>
              )}
            </>
          )}
          {!selectedAuthor && (
            <div style={{color:'var(--text-dim)', fontSize:'0.85rem', padding:'8px 0'}}>Select an author to see their stats.</div>
          )}
        </div>

        {/* Category Check */}
        <div className="stats-card">
          <div className="stats-card-title"> Category Checks</div>
          <div className="form-group" style={{marginBottom:'16px'}}>
            <label className="filter-label">Select Category</label>
            <select
              className="filter-select"
              style={{width:'100%'}}
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                checkCategory(e.target.value);
              }}
            >
              <option value="">Choose a category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {catLoading && <div className="loading-wrap" style={{padding:'12px'}}><div className="spinner" /></div>}
          {!catLoading && selectedCategory && categoryBooks !== null && (
            <>
              <StatRow label="Books in Category" value={categoryBooks.length} />
              <StatRow
                label="All Books Have a Year?"
                value={<span className={catAllHaveYear ? 'yn-yes' : 'yn-no'}>{catAllHaveYear ? 'Yes ✓' : 'No ✗'}</span>}
              />
            </>
          )}
          {!selectedCategory && (
            <div style={{color:'var(--text-dim)', fontSize:'0.85rem', padding:'8px 0'}}>Select a category to check its books.</div>
          )}
        </div>

        {/* Top Authors from Insights */}
        <div className="stats-card">
          <div className="stats-card-title"> Top 5 Authors by Book Count</div>
          {!insights?.top_authors?.length ? (
            <div style={{color:'var(--text-dim)', fontSize:'0.85rem'}}>No data yet.</div>
          ) : (
            <ul className="insights-list">
              {insights.top_authors.map((a, i) => (
                <li key={a.author}>
                  <span style={{display:'flex',gap:'10px',alignItems:'center'}}>
                    <span className="rank">#{i+1}</span>
                    <span>{a.author}</span>
                  </span>
                  <span className="badge badge-gold">{a.book_count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Busy Years */}
        <div className="stats-card">
          <div className="stats-card-title"> Busy Years (2+ books)</div>
          {!insights?.busy_years || Object.keys(insights.busy_years).length === 0 ? (
            <div style={{color:'var(--text-dim)', fontSize:'0.85rem'}}>No years with 2+ books yet.</div>
          ) : (
            <ul className="insights-list">
              {Object.entries(insights.busy_years).map(([year, titles]) => (
                <li key={year} style={{flexDirection:'column', gap:'4px', alignItems:'flex-start', padding:'10px 0'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span className="busy-year-tag">{year}</span>
                    <span style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{titles.length} books</span>
                  </div>
                  <div style={{fontSize:'0.78rem', color:'var(--text-dim)'}}>
                    {titles.slice(0,3).join(', ')}{titles.length > 3 ? ` +${titles.length-3} more` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Distinct Author Names */}
        <div className="stats-card">
          <div className="stats-card-title"> All Author Names</div>
          {authors.length === 0 ? (
            <div style={{color:'var(--text-dim)', fontSize:'0.85rem'}}>No authors yet.</div>
          ) : (
            <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
              {authors.map(a => (
                <span key={a.id} className="badge badge-blue" style={{fontSize:'0.8rem'}}>{a.name}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
