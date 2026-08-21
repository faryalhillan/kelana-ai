# KelanaAI

KelanaAI is a travel planning App for creating and managing trips.

## Program

Mastering Artificial Intelligence for Nation 2026  
**Alkademi**

## Tech Stack

- Python
- FastAPI
- PostgreSQL
- Uvicorn
- Amazon Bedrock

## Setup

Install the dependencies:

```bash
pip install -r backend/requirements.txt
```

Create `backend/.env` and configure PostgreSQL and Amazon Bedrock:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
AWS_BEARER_TOKEN_BEDROCK=your_bedrock_token
AWS_REGION=
MODEL_ID=
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
| POST | `/api/v1/trips/{trip_id}/generate` | Generate and save an AI itinerary |
