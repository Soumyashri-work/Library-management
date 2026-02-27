import { useState, useEffect } from 'react';

export default function BookForm({ initial, authors, categories, onSubmit, loading, error }) {
  const [form, setForm] = useState({
    title: '',
    isbn: '',
    publication_year: '',
    author_id: '',
    category_id: '',
    ...initial,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) setForm({ ...initial, publication_year: initial.publication_year ?? '' });
  }, [initial]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.isbn.trim()) e.isbn = 'ISBN is required';
    if (!form.author_id) e.author_id = 'Author is required';
    if (!form.category_id) e.category_id = 'Category is required';
    if (form.publication_year) {
      const y = Number(form.publication_year);
      if (isNaN(y) || y < 1000 || y > 2100) e.publication_year = 'Enter a valid year (1000–2100)';
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({
      ...form,
      author_id: Number(form.author_id),
      category_id: Number(form.category_id),
      publication_year: form.publication_year ? Number(form.publication_year) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-group">
        <label className="form-label">Title <span className="required">*</span></label>
        <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Book title" />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">ISBN <span className="required">*</span></label>
          <input className="form-input" value={form.isbn} onChange={e => set('isbn', e.target.value)} placeholder="e.g. 978-3-16-148410-0" />
          {errors.isbn && <span className="form-error">{errors.isbn}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Publication Year</label>
          <input className="form-input" type="number" value={form.publication_year} onChange={e => set('publication_year', e.target.value)} placeholder="e.g. 2023" />
          {errors.publication_year && <span className="form-error">{errors.publication_year}</span>}
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Author <span className="required">*</span></label>
          <select className="form-select" value={form.author_id} onChange={e => set('author_id', e.target.value)}>
            <option value="">Select author...</option>
            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          {errors.author_id && <span className="form-error">{errors.author_id}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Category <span className="required">*</span></label>
          <select className="form-select" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
            <option value="">Select category...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.category_id && <span className="form-error">{errors.category_id}</span>}
        </div>
      </div>
      <div className="modal-footer" style={{marginTop:0, paddingTop:0, borderTop:'none', justifyContent:'flex-end'}}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Book'}
        </button>
      </div>
    </form>
  );
}
