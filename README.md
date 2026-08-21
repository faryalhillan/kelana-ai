# KelanaAI

KelanaAI is a travel planning App for creating and managing trips.

## Program

Mastering Artificial Intelligence for Nation 2026  
**Alkademi**

## Tech Stack

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- PostgreSQL
- Uvicorn

## Setup

Install the dependencies:

```bash
pip install -r backend/requirements.txt
```

Create `backend/.env` and configure the database connection:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

Start the API from the project root:

```bash
cd backend
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

Interactive documentation is available at `http://127.0.0.1:8000/docs`.

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | Welcome message |
| GET | `/health` | Health check |
| POST | `/api/v1/trips` | Create a trip |
| GET | `/api/v1/trips` | List all trips |
| GET | `/api/v1/trips/{trip_id}` | Get one trip |
| PUT | `/api/v1/trips/{trip_id}` | Update a trip |
| DELETE | `/api/v1/trips/{trip_id}` | Delete a trip |
