# HireLens
  
HireLens is a job-fit web app that compares a candidate's resume and short profile against a job description and returns:

- a match percentage
- matched skills
- missing skills
- recommendation suggestions for career growth

## Stack

- Frontend: React + Vite
- Backend: FastAPI

## Run locally

### 1) Start the backend

```bash
cd Backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2) Start the frontend

```bash
cd Frontend
npm install
npm run dev -- --host 0.0.0.0
```

Then open:

- Frontend: http://localhost:5173
- API: http://localhost:8000/docs

## Current demo behavior

This starter version uses a keyword-based matching system to estimate fit percentage and suggest future improvements. It is designed to be expanded later with:

- PDF resume upload
- real AI-based extraction
- database and login
- recruiter dashboard
- job recommendations

