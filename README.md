# KelanaAI

**KelanaAI** is a premium AI-powered travel planning application. Tell it where you want to go and it builds a complete, personalised day-by-day itinerary — tailored to your budget, travel style, and curiosity.

🌐 **Live demo:** [https://kelana-ai-faryal.vercel.app](https://kelana-ai-faryal.vercel.app)

---

## Program

MAIN 2026
**Alkademi Foundation**

---

## Features

- **AI Trip Generation** — Submits trip parameters (destinations, budget, days, travel style) to Amazon Bedrock (Claude); structured JSON itinerary is parsed and persisted to PostgreSQL
- **RAG Travel Assistant** — Ask AI page queries an Amazon Bedrock Knowledge Base with uploaded travel documents; returns grounded answers with source citations
- **AI Chat** — Persistent multi-turn conversation with Claude via a `/conversations` API; messages stored per user in PostgreSQL and rendered with a custom markdown parser
- **JWT Authentication** — Stateless auth with bcrypt password hashing and PyJWT token signing; all protected routes use a `get_current_user` FastAPI dependency

### Features Added Outside Program Sessions
- **Trip Management** — Full CRUD for trips with PostgreSQL persistence; supports editing parameters and regenerating the AI itinerary on save
- **AI Trip Refinement** — Per-trip conversation thread linked to a saved trip; sends trip context + user message to Claude, returns proposed itinerary changes, and applies diffs back to the trip record on confirmation
- **User Preferences** — Theme preference (light/dark) stored on the User model, synced to the backend via PATCH on toggle and loaded on session start
- **Country Data** — RestCountries API integration with in-memory caching for flag images and country metadata used in the trip form

---

## Tech Stack

**Backend:** Python · FastAPI · PostgreSQL (NeonDB) · SQLAlchemy · Amazon Bedrock (Claude + Knowledge Base) · JWT auth · Uvicorn

**Frontend:** Next.js 16 · TypeScript · Tailwind CSS · Lucide React

**Deployment:** Vercel (frontend) · FastAPI Cloud (backend) · NeonDB (database)

---

## Project Structure

```
kelana-ai/
├── backend/
│   ├── main.py                 # FastAPI app + all routes
│   ├── database.py             # SQLAlchemy setup
│   ├── migrate.py              # SQL migration runner
│   ├── models/                 # SQLAlchemy models (User, Trip, Conversation)
│   ├── services/               # Business logic (auth, bedrock, trip, RAG, refinement)
│   ├── migrations/             # SQL migration files
│   └── requirements.txt
└── frontend/
    ├── app/                    # Next.js App Router pages
    ├── components/             # Reusable UI components
    ├── contexts/               # React context (ThemeContext)
    ├── services/               # API client functions
    ├── utils/                  # Markdown renderer
    └── lib/                    # Country data
```

---

## Backend Setup

### 1. Install dependencies

```bash
pip install -r backend/requirements.txt
```

### 2. Configure environment

Create `backend/.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
MODEL_ID=your_bedrock_model_id
KNOWLEDGE_BASE_ID=your_kb_id
JWT_SECRET=your_jwt_secret
```

### 3. Run migrations

```bash
cd backend
python migrate.py
```

### 4. Start the API

```bash
cd backend
uvicorn main:app --reload
```

API runs at `http://127.0.0.1:8000`.  
Interactive docs at `http://127.0.0.1:8000/docs`.

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start the dev server

```bash
cd frontend
npm run dev
```

App runs at `http://localhost:3000`.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |
| GET | `/api/v1/auth/me` | Get current user profile |
| PATCH | `/api/v1/auth/preferences` | Update user preferences (e.g. theme) |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/trips` | Create a new trip |
| GET | `/api/v1/trips` | List all trips for current user |
| GET | `/api/v1/trips/{trip_id}` | Get a single trip |
| PUT | `/api/v1/trips/{trip_id}` | Update trip details |
| DELETE | `/api/v1/trips/{trip_id}` | Delete a trip |
| POST | `/api/v1/trips/{trip_id}/generate` | Generate AI itinerary for a trip |

### AI & Chat
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/ask` | RAG-powered travel Q&A |
| GET | `/api/v1/conversations` | List conversations |
| POST | `/api/v1/conversations` | Create a conversation |
| DELETE | `/api/v1/conversations/{id}` | Delete a conversation |
| GET | `/api/v1/conversations/{id}/messages` | Get messages in a conversation |
| POST | `/api/v1/conversations/{id}/messages` | Send a message |
| POST | `/api/v1/trips/{trip_id}/refine` | Refine trip itinerary via AI |
| POST | `/api/v1/trips/{trip_id}/apply-changes` | Apply proposed AI changes to a trip |
| GET | `/api/v1/trips/{trip_id}/conversation` | Get or create trip-linked conversation |

### Utility
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/countries` | List all countries with flags |
| GET | `/api/v1/countries/{name}` | Get country data by name |
| GET | `/` | Welcome message |
