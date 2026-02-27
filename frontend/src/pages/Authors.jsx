import { useState, useEffect, useCallback } from 'react';
import {
  getAuthors, createAuthor, updateAuthor, deleteAuthor,
  getBooks, getAuthorRange, getAuthorHasBooks
} from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

function AuthorForm({ initial, onSubmit, loading, error }) {
  const [form, setForm] = useState({ name: '', bio: '', ...initial });
  const [errors, setErrors] = useState({});

  useEffect(() => { if (initial) setForm({ name: initial.name || '', bio: initial.bio || '' }); }, [initial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrors({ name: 'Name is required' }); return; }
    onSubmit({ name: form.name.trim(), bio: form.bio.trim() || null });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label className="form-label">Name <span className="required">*</span></label>
        <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Author's full name" />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Bio</label>
        <textarea className="form-input" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short biography (optional)" style={{resize:'vertical'}} />
      </div>
      <div style={{display:'flex', justifyContent:'flex-end', marginTop:'8px'}}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Author'}
        </button>
      </div>
    </form>
  );
}

function AuthorDetail({ author, onClose }) {
  const [books, setBooks] = useState([]);
  const [range, setRange] = useState(null);
  const [hasBooks, setHasBooks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getBooks({ author_id: author.id, limit: 100 }),
      getAuthorRange(author.id),
      getAuthorHasBooks(author.id),
    ])
      .then(([b, r, h]) => {
        const sorted = [...b].sort((a, z) => (a.publication_year || 9999) - (z.publication_year || 9999));
        setBooks(sorted);
        setRange(r);
        setHasBooks(h.has_books);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [author.id]);

  return (
    <Modal title={author.name} onClose={onClose} footer={
      <button className="btn btn-secondary" onClick={onClose}>Close</button>
    }>
      <div className="author-hero" style={{background:'var(--surface2)', marginBottom:'20px', padding:'18px', borderRadius:'var(--radius)'}}>
        <div className="author-avatar"></div>
        <div>
          <div style={{fontWeight:600, fontSize:'1rem'}}>{author.name}</div>
          <div style={{color:'var(--text-muted)', fontSize:'0.85rem', marginTop:'4px'}}>{author.bio || 'No biography available'}</div>
          <div style={{marginTop:'8px'}}>
            Has books: <span className={hasBooks ? 'yn-yes' : 'yn-no'}>{hasBooks === null ? '…' : hasBooks ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /><span>Loading...</span></div>
      ) : (
        <>
          {range && !range.message && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px'}}>
              <div className="stats-card" style={{padding:'14px'}}>
                <div className="stats-card-title">Earliest Book</div>
                <div style={{fontWeight:600, fontSize:'0.9rem'}}>{range.earliest}</div>
              </div>
              <div className="stats-card" style={{padding:'14px'}}>
                <div className="stats-card-title">Latest Book</div>
                <div style={{fontWeight:600, fontSize:'0.9rem'}}>{range.latest}</div>
              </div>
            </div>
          )}

          <div className="section-header">
            <span className="section-title">Books ({books.length})</span>
            <span className="badge badge-gold">{books.length}</span>
          </div>
          {books.length === 0 ? (
            <div className="state-empty" style={{padding:'20px 0'}}>
              <p>No books for this author yet.</p>
            </div>
          ) : (
            <div style={{maxHeight:'260px', overflowY:'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Year</th>
                    <th>ISBN</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(b => (
                    <tr key={b.id}>
                      <td>{b.title}</td>
                      <td className="td-muted">{b.publication_year ?? '—'}</td>
                      <td className="td-muted" style={{fontFamily:'monospace',fontSize:'0.78rem'}}>{b.isbn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [editAuthor, setEditAuthor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewAuthor, setViewAuthor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true); setError('');
    getAuthors().then(setAuthors).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, []);

  const handleCreate = async (data) => {
    setSubmitting(true); setSubmitError('');
    try { await createAuthor(data); setShowCreate(false); load(); }
    catch (e) { setSubmitError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleEdit = async (data) => {
    setSubmitting(true); setSubmitError('');
    try {
      const res = await fetch(`/api/authors/${editAuthor.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 405) throw new Error('Edit not supported by API (no PUT /authors/{id} endpoint)');
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }
      setEditAuthor(null); load();
    }
    catch (e) { setSubmitError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/authors/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.status === 404) throw new Error('Author not found.');
      if (res.status === 409 || res.status === 422) throw new Error('Cannot delete — author has associated books.');
      if (!res.ok) throw new Error(`Failed to delete (status ${res.status})`);
      setDeleteTarget(null); load();
    }
    catch (e) { setError(e.message); setDeleteTarget(null); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Authors</h1>
          <p className="page-subtitle">Manage author profiles</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowCreate(true); setSubmitError(''); }}>
          + Add Author
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrap">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /><span>Loading authors...</span></div>
        ) : authors.length === 0 ? (
          <div className="state-empty">
            <div className="icon"></div>
            <h3>No authors yet</h3>
            <p>Add your first author to get started.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Bio</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {authors.map(a => (
                <tr key={a.id}>
                  <td className="td-muted" style={{width:'48px'}}>{a.id}</td>
                  <td style={{fontWeight:600}}>{a.name}</td>
                  <td className="td-muted" style={{maxWidth:'320px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {a.bio || <em style={{opacity:0.4}}>No bio</em>}
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewAuthor(a)}>View</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditAuthor(a); setSubmitError(''); }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(a)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <Modal title="Add New Author" onClose={() => setShowCreate(false)}>
          <AuthorForm onSubmit={handleCreate} loading={submitting} error={submitError} />
        </Modal>
      )}

      {editAuthor && (
        <Modal title="Edit Author" onClose={() => setEditAuthor(null)}>
          <AuthorForm initial={editAuthor} onSubmit={handleEdit} loading={submitting} error={submitError} />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete author "${deleteTarget.name}"? If they have associated books, the delete may fail.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {viewAuthor && <AuthorDetail author={viewAuthor} onClose={() => setViewAuthor(null)} />}
    </div>
  );
}
