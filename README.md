# MindVault

A full-stack document, note management, and AI knowledge assistant application. Upload PDFs, take notes, get AI summaries, and query an indexed knowledge base using semantic search and RAG.

---

## Tech Stack

### Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Express v5
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (access + refresh tokens via httpOnly cookie)
- **Validation:** Zod
- **Security:** Helmet, bcryptjs, CORS
- **File Upload:** Multer
- **PDF Parsing:** pdf-parse
- **AI Summarization / LLM:** OpenAI API (gpt-4.1-mini) or Ollama (llama3.2:3b)
- **Embeddings:** OpenAI (`text-embedding-3-small`) or local (`Xenova/all-MiniLM-L6-v2`)
- **Logging:** Morgan

### Frontend
- **Framework:** Angular 21
- **Language:** TypeScript
- **State Management:** Angular Signals + RxJS Subjects
- **Styling:** SCSS
- **HTTP:** Angular HttpClient

---

## Project Structure

```
mindvault/
├── backend/
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   └── env.ts
│       ├── database/
│       │   └── connectDB.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── note.controller.ts
│       │   ├── upload.controller.ts
│       │   ├── document.controller.ts
│       │   └── knowledge.controller.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── validate.middleware.ts
│       │   ├── upload.middleware.ts
│       │   └── error.middleware.ts
│       ├── models/
│       │   ├── user.ts
│       │   ├── note.ts
│       │   ├── document.ts
│       │   └── knowledgeChunk.ts
│       ├── queues/
│       │   └── documentProcessing.queue.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── note.routes.ts
│       │   ├── upload.routes.ts
│       │   ├── document.routes.ts
│       │   └── knowledge.routes.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── note.service.ts
│       │   ├── upload.service.ts
│       │   ├── document.service.ts
│       │   ├── pdf.service.ts
│       │   ├── ai.service.ts
│       │   ├── embedding.service.ts
│       │   ├── knowledge.service.ts
│       │   ├── knowledgeIndexer.service.ts
│       │   └── llm.service.ts
│       ├── types/
│       │   ├── express.d.ts
│       │   └── auth.types.ts
│       ├── validators/
│       │   └── auth.validator.ts
│       └── workers/
│           └── document.processor.ts
└── frontend/
    └── src/
        └── app/
            ├── app.ts
            ├── app.routes.ts
            ├── app.config.ts
            ├── api/
            │   ├── auth.api.ts
            │   ├── notes.api.ts
            │   └── document.api.ts
            ├── guards/
            │   └── auth-guard.ts
            ├── interceptors/
            │   └── auth-interceptor.ts
            ├── model/
            │   ├── user.model.ts
            │   └── note.model.ts
            ├── pages/
            │   ├── login/
            │   ├── register/
            │   ├── dashboard/
            │   │   └── dashboard.routes.ts
            │   ├── notes/
            │   └── knowledge-assistant/
            ├── service/
            │   ├── TokenService.ts
            │   └── knowledge.service.ts
            └── store/
                ├── auth.store.ts
                └── notes.store.ts
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- OpenAI API key (or Ollama running locally for LLM + local embeddings)

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mindvault
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key

# Knowledge base indexing
KNOWLEDGE_SOURCE_PATH=/path/to/knowledge/files

# LLM provider: "openai" or leave unset for Ollama (llama3.2:3b on localhost:11434)
LLM_PROVIDER=openai

# Embedding provider: "openai" or leave unset for local (Xenova/all-MiniLM-L6-v2)
EMBEDDING_PROVIDER=openai

# OpenAI embedding model (used when EMBEDDING_PROVIDER=openai)
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

---

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```

Open `http://localhost:4200`. The backend must be running on `http://localhost:5000`.

```bash
# Production build
ng build
```

---

## Frontend Routes

| Path                   | Component              | Auth | Description                        |
|------------------------|------------------------|------|------------------------------------|
| `/`                    | Login                  | No   | Login page                         |
| `/register`            | Register               | No   | Registration page                  |
| `/dashboard`           | Dashboard → Notes      | Yes  | Notes list with search (default)   |
| `/dashboard/knowledge` | Dashboard → Knowledge  | Yes  | AI Knowledge Assistant             |

- **`auth-guard`** — uses `canMatch`; reads `authenticated` signal from `AuthStore`. Redirects to `/` if not logged in.
- **`auth-interceptor`** — attaches `Authorization: Bearer <token>` to every outgoing HTTP request via `TokenService`.
- The dashboard uses lazy-loaded child routes defined in `dashboard.routes.ts`.

---

## State Management

### AuthStore
Signals: `authenticated` (bool), `role` (`USER` | `ADMIN`), `loading` (bool), `error` (string).

| Method             | Description                                             |
|--------------------|---------------------------------------------------------|
| `login(email, pw)` | Calls auth API, stores token, navigates to `/dashboard` |
| `register()`       | Calls register API                                      |
| `logout()`         | Removes token, resets state, navigates to `/`           |

### NotesStore
Signals: `notes` (Note[]), `loading` (bool), `error` (string\|null). Computed: `noteCount`.

| Method         | Description                                                 |
|----------------|-------------------------------------------------------------|
| `search(term)` | Debounced (300ms) search — calls notes API, updates `notes` |

---

## Document Processing Pipeline

Uploads are processed asynchronously via an in-memory queue and worker:

1. **Upload** — `POST /api/upload` stores file metadata with status `UPLOADED` and adds the document ID to the queue.
2. **Queue** — `documentProcessing.queue.ts` manages a FIFO queue of document IDs.
3. **Worker** — `document.processor.ts` processes one document at a time:
   - Sets status → `PROCESSING`
   - Calls `pdf.service.ts` to extract text
   - Sets status → `PROCESSED`, stores `extractedText` and `processedAt`
   - On failure: sets status → `FAILED`, stores `processingError`
4. **Summarize** — `POST /api/document/:id/summarize` passes `extractedText` to OpenAI and returns the summary.

---

## Knowledge Base (RAG)

The knowledge system indexes component definition files and their JavaScript implementations, then answers natural-language questions using semantic search + LLM generation.

### Indexing
`POST /api/knowledge/index` scans `KNOWLEDGE_SOURCE_PATH` for:
- **`.cp.json` files** — component definitions (label, tagName, interactions, summaries)
- **`interaction*.js` files** — raw JS implementations (parsed per function)

Each piece of content is embedded and stored as a `KnowledgeChunk` in MongoDB.

### Query Flow (`/api/knowledge/ask`)
1. Embeds the user query
2. Runs cosine similarity against all stored chunks to find the top interaction match
3. Fetches the linked JS implementation chunk
4. Sends query + context to the LLM (OpenAI or Ollama) using a QA-engineer-focused prompt
5. Returns: AI explanation, matched interaction details, and relevant code snippets

### Embedding Providers
| Provider | Model | Set via |
|----------|-------|---------|
| Local (default) | `Xenova/all-MiniLM-L6-v2` | `EMBEDDING_PROVIDER` unset |
| OpenAI | `text-embedding-3-small` (configurable) | `EMBEDDING_PROVIDER=openai` |

### LLM Providers
| Provider | Model | Set via |
|----------|-------|---------|
| Ollama (default) | `llama3.2:3b` at `localhost:11434` | `LLM_PROVIDER` unset |
| OpenAI | `gpt-5.5` (configurable) | `LLM_PROVIDER=openai` |

---

## API Reference

Base URL: `http://localhost:5000/api`

All protected routes require `Authorization: Bearer <token>`.

### Auth `/api/auth`

| Method | Endpoint             | Auth | Description              |
|--------|----------------------|------|--------------------------|
| POST   | `/auth/register`     | No   | Register a new user      |
| POST   | `/auth/login`        | No   | Login, returns tokens    |
| GET    | `/auth/profile`      | Yes  | Access protected profile |
| POST   | `/auth/refreshtoken` | No   | Refresh access token     |

**POST `/auth/register`** — body: `{ name, email, password }` (name ≥ 2 chars, password ≥ 6 chars)
**POST `/auth/login`** — returns access token (1h) in body and refresh token (7d) in httpOnly cookie.

---

### Notes `/api/note` `[Protected]`

| Method | Endpoint    | Description                |
|--------|-------------|----------------------------|
| POST   | `/note`     | Create a note              |
| GET    | `/note`     | List notes (paginated)     |
| DELETE | `/note/:id` | Delete a note (owner only) |

**GET `/note`** query params: `page` (default: 1), `limit` (default: 10). Sorted by `createdAt` descending.

---

### File Upload `/api/upload` `[Protected]`

| Method | Endpoint  | Description                                  |
|--------|-----------|----------------------------------------------|
| POST   | `/upload` | Upload a PDF — queues it for text extraction |

Request: `multipart/form-data`, field name `file`.

---

### Documents `/api/document` `[Protected]`

| Method | Endpoint                  | Description                           |
|--------|---------------------------|---------------------------------------|
| POST   | `/document/:id/summarize` | Summarize a processed document via AI |
| GET    | `/document/:id/status`    | Get document processing status        |

Possible statuses: `UPLOADED` → `PROCESSING` → `PROCESSED` | `FAILED`

---

### Knowledge `/api/knowledge`

| Method | Endpoint                    | Auth | Description                                     |
|--------|-----------------------------|------|-------------------------------------------------|
| POST   | `/knowledge/index`          | No   | Index component + JS files from source path     |
| POST   | `/knowledge/search`         | No   | Full-text search over knowledge chunks          |
| POST   | `/knowledge/semantic-search`| No   | Vector similarity search over knowledge chunks  |
| POST   | `/knowledge/ask`            | No   | RAG-style Q&A — semantic search + LLM answer   |

**POST `/knowledge/search`** — body: `{ query: string }`

**POST `/knowledge/semantic-search`** — body: `{ query: string, topK?: number, componentName?: string }`

**POST `/knowledge/ask`** — body: `{ query: string, componentName?: string }`

**Response `200`:**
```json
{
  "success": true,
  "answer": "SUMMARY:\n...\n\nFLOW:\n1. ...",
  "interaction": {
    "component": "Lightning Lookup",
    "name": "selectItem",
    "title": "Select an item",
    "type": "click",
    "summary": "...",
    "implementation": "..."
  },
  "codeSnippets": [
    { "title": "object.function", "code": "...", "linkedFrom": "..." }
  ]
}
```

---

## Data Models

### User
| Field        | Type   | Notes                             |
|--------------|--------|-----------------------------------|
| name         | String | Required                          |
| email        | String | Required, unique                  |
| password     | String | Hashed (bcrypt)                   |
| role         | String | `USER` \| `ADMIN`, default `USER` |
| tokenVersion | Number | Default 0                         |
| createdAt    | Date   | Auto                              |
| updatedAt    | Date   | Auto                              |

### Note
| Field     | Type     | Notes     |
|-----------|----------|-----------|
| title     | String   | Required  |
| content   | String   | Required  |
| owner     | ObjectId | Ref: User |
| createdAt | Date     | Auto      |
| updatedAt | Date     | Auto      |

### Document
| Field          | Type     | Notes                                                  |
|----------------|----------|--------------------------------------------------------|
| filename       | String   | Required                                               |
| originalName   | String   | Required                                               |
| mimetype       | String   | Required                                               |
| size           | Number   | Required                                               |
| path           | String   | Required                                               |
| extractedText  | String   | Populated after processing                             |
| status         | String   | `UPLOADED` \| `PROCESSING` \| `PROCESSED` \| `FAILED` |
| processingError| String   | Populated on failure                                   |
| processedAt    | Date     | Populated on success                                   |
| owner          | ObjectId | Ref: User                                              |
| createdAt      | Date     | Auto                                                   |
| updatedAt      | Date     | Auto                                                   |

### KnowledgeChunk
| Field         | Type     | Notes                                                        |
|---------------|----------|--------------------------------------------------------------|
| sourceType    | String   | `component` \| `interaction-js`                             |
| componentName | String   | Optional                                                     |
| tagName       | String   | Optional                                                     |
| chunkType     | String   | `overview` \| `attribute` \| `interaction` \| `js-function` |
| title         | String   | Required                                                     |
| content       | String   | Required — raw text used for search and embedding            |
| embedding     | Number[] | Vector embedding of content                                  |
| metadata      | Object   | Flexible — stores interaction name, JS snippet, file path, etc. |
| createdAt     | Date     | Auto                                                         |
| updatedAt     | Date     | Auto                                                         |
