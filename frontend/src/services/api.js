const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// Books
export const getBooks = (params = {}) => {
  const q = new URLSearchParams();
  if (params.author_id) q.set('author_id', params.author_id);
  if (params.category_id) q.set('category_id', params.category_id);
  if (params.year) q.set('year', params.year);
  if (params.limit) q.set('limit', params.limit);
  return request(`/books?${q.toString()}`);
};

export const getBook = (id) => request(`/books/${id}`);

export const createBook = (data) =>
  request('/books', { method: 'POST', body: JSON.stringify(data) });

export const updateBook = (id, data) =>
  request(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteBook = (id) =>
  request(`/books/${id}`, { method: 'DELETE' });

// Authors
export const getAuthors = () => request('/authors');
export const getAuthor = (id) => request(`/authors/${id}`);

export const createAuthor = (data) =>
  request('/authors', { method: 'POST', body: JSON.stringify(data) });

export const updateAuthor = (id, data) =>
  request(`/authors/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteAuthor = (id) =>
  request(`/authors/${id}`, { method: 'DELETE' });

// Categories
export const getCategories = () => request('/categories');

export const createCategory = (data) =>
  request('/categories', { method: 'POST', body: JSON.stringify(data) });

// Stats
export const getBookCount = () => request('/stats/book-count');
export const getAverageYear = () => request('/stats/average-year');
export const getAuthorRange = (authorId) => request(`/stats/author-range/${authorId}`);
export const getAuthorHasBooks = (authorId) => request(`/stats/author-has-books/${authorId}`);
export const getInsights = () => request('/books/insights');
