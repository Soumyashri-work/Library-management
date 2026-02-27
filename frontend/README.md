# Library Admin UI

React frontend for the FastAPI Library API.

# Project Structure


library-ui/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Modal.jsx
│   │   ├── ConfirmDialog.jsx
│   │   └── BookForm.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Books.jsx
│   │   ├── Authors.jsx
│   │   └── Stats.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── main.py       
├── index.html
├── vite.config.js
└── package.json


# Setup & Run

# 1. Start FastAPI Backend

cd your-fastapi-folder
# Activate your venv
.\venvi\Scripts\activate      # Windows


pip install fastapi uvicorn sqlalchemy pydantic
uvicorn main:app --reload

Backend will run at: http://localhost:8000

# 2. Install & Start React Frontend

Open a NEW terminal window, navigate to this `library-ui` folder:

cd library-ui
npm install
npm run dev

Frontend will run at: http://localhost:5173

Open http://localhost:5173 in your browser.

# Features

- Dashboard: Total books, average year, top authors, busy years
- Books Page: Full CRUD + filters by author/category/year/limit + A-Z sort
- Authors Page: Full CRUD + detail view with book list, earliest/latest book
- Stats Page: 6+ stats/checks including author range, category checks, insights
