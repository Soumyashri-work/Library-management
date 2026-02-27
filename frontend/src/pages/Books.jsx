import { useState, useEffect, useCallback } from 'react';
import { getBooks, getAuthors, getCategories, createBook, deleteBook } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import BookForm from '../components/BookForm';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterLimit, setFilterLimit] = useState('20');
  const [sortAZ, setSortAZ] = useState(false);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadMeta = useCallback(() =>
    Promise.all([getAuthors(), getCategories()]).then(([a, c]) => {
      setAuthors(a); setCategories(c);
    }), []);

  const loadBooks = useCallback(() => {
    setLoading(true); setError('');
    const params = {};
    if (filterAuthor) params.author_id = filterAuthor;
    if (filterCategory) params.category_id = filterCategory;
    if (filterYear) params.year = filterYear;
    if (filterLimit) params.limit = filterLimit;
    getBooks(params)
      .then(data => {
        let result = data;
        if (sortAZ) result = [...data].sort((a, b) => a.title.localeCompare(b.title));
        setBooks(result);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filterAuthor, filterCategory, filterYear, filterLimit, sortAZ]);

  useEffect(() => { loadMeta(); }, []);
  useEffect(() => { loadBooks(); }, [loadBooks]);

  const authorMap = Object.fromEntries(authors.map(a => [a.id, a.name]));
  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

  const handleCreate = async (data) => {
    setSubmitting(true); setSubmitError('');
    try {
      await createBook(data);
      setShowCreate(false);
      loadBooks();
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Note: FastAPI template only has POST for books, no PUT. We'll add a note.
  const handleEdit = async (data) => {
    setSubmitting(true); setSubmitError('');
    try {
      // Try PUT, backend may not support it - show clear message
      const res = await fetch(`/api/books/${editBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 405) throw new Error('Edit not supported by API (no PUT /books/{id} endpoint)');
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Error ${res.status}`);
      }
      setEditBook(null);
      loadBooks();
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/books/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.status === 404) throw new Error('Book not found — it may have already been deleted.');
      if (!res.ok) throw new Error(`Failed to delete (status ${res.status})`);
      setDeleteTarget(null);
      loadBooks();
    } catch (e) {
      setError(e.message);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Books</h1>
          <p className="page-subtitle">Manage your library collection</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowCreate(true); setSubmitError(''); }}>
          + Add Book
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label">Author</label>
          <select className="filter-select" value={filterAuthor} onChange={e => setFilterAuthor(e.target.value)}>
            <option value="">All authors</option>
            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Year</label>
          <input className="filter-input" type="number" placeholder="e.g. 2020" value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{width:'110px'}} />
        </div>
        <div className="filter-group">
          <label className="filter-label">Limit</label>
          <input className="filter-input" type="number" value={filterLimit} onChange={e => setFilterLimit(e.target.value)} style={{width:'80px'}} min="1" max="200" />
        </div>
        <div className="filter-group">
          <label className="filter-label">Sort A–Z</label>
          <button
            className={`btn btn-sm ${sortAZ ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSortAZ(s => !s)}
            style={{marginTop:'1px'}}
          >
            {sortAZ ? '✓ A–Z' : 'A–Z'}
          </button>
        </div>
        <div className="filter-group" style={{justifyContent:'flex-end'}}>
          <label className="filter-label">&nbsp;</label>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            setFilterAuthor(''); setFilterCategory(''); setFilterYear(''); setFilterLimit('20'); setSortAZ(false);
          }}>
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div className="loading-wrap"><div className="spinner" /><span>Loading books...</span></div>
        ) : books.length === 0 ? (
          <div className="state-empty">
            <div className="icon"></div>
            <h3>No books found</h3>
            <p>Try adjusting filters or add a new book.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>ISBN</th>
                <th>Year</th>
                <th>Author</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td className="td-muted" style={{fontFamily:'monospace',fontSize:'0.8rem'}}>{book.isbn}</td>
                  <td className="td-muted">{book.publication_year ?? '—'}</td>
                  <td>
                    <span className="badge badge-blue">{authorMap[book.author_id] || `#${book.author_id}`}</span>
                  </td>
                  <td>
                    <span className="badge badge-gold">{categoryMap[book.category_id] || `#${book.category_id}`}</span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditBook(book); setSubmitError(''); }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(book)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={{marginTop:'10px', fontSize:'0.8rem', color:'var(--text-dim)'}}>
        Showing {books.length} result{books.length !== 1 ? 's' : ''}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Add New Book" onClose={() => setShowCreate(false)}>
          <BookForm
            authors={authors}
            categories={categories}
            onSubmit={handleCreate}
            loading={submitting}
            error={submitError}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editBook && (
        <Modal title="Edit Book" onClose={() => setEditBook(null)}>
          <BookForm
            initial={editBook}
            authors={authors}
            categories={categories}
            onSubmit={handleEdit}
            loading={submitting}
            error={submitError}
          />
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
