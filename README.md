Project structure:

Library-management/
├── backend/ # FastAPI backend
├── frontend/ # React frontend
├── README.md
 

In Library-management folder

Backend Setup in terminal 1:

cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

Run the backend:
uvicorn app.main:app --reload

Backend will be available at:
http://localhost:8000

API docs:
http://localhost:8000/docs


Frontend Setup in terminal 2:

cd frontend
npm install
npm run dev

Frontend will be available at:
http://localhost:5173