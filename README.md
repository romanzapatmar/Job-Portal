Job Portal
Single-company job portal. FastAPI + PostgreSQL backend, React (Vite) frontend.

Backend setup (Windows PowerShell)
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env      # then edit DATABASE_URL, SECRET_KEY, admin details
Create the database (once):

psql -U postgres -c "CREATE DATABASE jobportal;"
Create the admin user, then run the API:

python -m app.seed_admin
uvicorn app.main:app --reload
Open http://localhost:8000/docs to test register / login / me.
