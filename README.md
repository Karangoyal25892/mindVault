# MindVault

A full-stack document and note management application with AI-powered summarization. Upload PDFs, take notes, and get instant AI summaries.

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
- **AI Summarization:** OpenAI API (gpt-4.1-mini)
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
│       │   └── document.controller.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── validate.middleware.ts
│       │   ├── upload.middleware.ts
│       │   └── error.middleware.ts
│       ├── models/
│       │   ├── user.ts
│       │   ├── note.ts
│       │   └── document.ts
│       ├── queues/
│       │   └── documentProcessing.queue.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── note.routes.ts
│       │   ├── upload.routes.ts
│       │   └── document.routes.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── note.service.ts
│       │   ├── upload.service.ts
│       │   ├── document.service.ts
│       │   ├── pdf.service.ts
│       │   └── ai.service.ts
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
            │   └── dashboard/
            ├── service/
            │   └── TokenService.ts
            └── store/
                ├── auth.store.ts
                └── notes.store.ts
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- OpenAI API key

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

| Path         | Component | Auth Required | Description       |
|--------------|-----------|---------------|-------------------|
| `/`          | Login     | No            | Login page        |
| `/register`  | Register  | No            | Registration page |
| `/dashboard` | Dashboard | Yes           | Notes + search    |

- **`auth-guard`** — reads the `authenticated` signal from `AuthStore`; redirects to `/` if not logged in.
- **`auth-interceptor`** — attaches `Authorization: Bearer <token>` to every outgoing HTTP request via `TokenService`.

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

| Method         | Description                                                  |
|----------------|--------------------------------------------------------------|
| `search(term)` | Debounced (300ms) search — calls notes API, updates `notes`  |

---

## Document Processing Pipeline

Uploads are processed asynchronously via an in-memory queue and worker:

1. **Upload** — `POST /api/upload` accepts a PDF, stores file metadata in MongoDB with status `UPLOADED`, and adds the document ID to the queue.
2. **Queue** — `documentProcessing.queue.ts` manages a FIFO queue of document IDs.
3. **Worker** — `document.processor.ts` runs one document at a time:
   - Sets status → `PROCESSING`
   - Calls `pdf.service.ts` to extract text from the file
   - Sets status → `PROCESSED`, stores `extractedText` and `processedAt`
   - On failure: sets status → `FAILED`, stores `processingError`
4. **Summarize** — `POST /api/document/:id/summarize` passes `extractedText` to OpenAI and returns the summary.

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

#### POST `/auth/register`
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```
Validation: name ≥ 2 chars, valid email, password ≥ 6 chars.

**Response `201`:**
```json
{ "message": "User registered successfully", "user": { "id": "...", "name": "...", "email": "..." } }
```

#### POST `/auth/login`
```json
{ "email": "john@example.com", "password": "secret123" }
```
**Response `200`:** Access token (1h) in body; refresh token (7d) set in httpOnly cookie.
```json
{ "message": "User logged in successfully", "token": "<access_token>", "role": "USER" }
```

#### POST `/auth/refreshtoken`
Reads refresh token from httpOnly cookie.

**Response `200`:**
```json
{ "message": "Token refreshed successfully", "token": "<new_access_token>" }
```

---

### Notes `/api/note` `[Protected]`

| Method | Endpoint    | Description                |
|--------|-------------|----------------------------|
| POST   | `/note`     | Create a note              |
| GET    | `/note`     | List notes (paginated)     |
| DELETE | `/note/:id` | Delete a note (owner only) |

**GET `/note`** query params: `page` (default: 1), `limit` (default: 10). Returns notes sorted by `createdAt` descending.

---

### File Upload `/api/upload` `[Protected]`

| Method | Endpoint  | Description                                   |
|--------|-----------|-----------------------------------------------|
| POST   | `/upload` | Upload a PDF — queues it for text extraction  |

Request: `multipart/form-data`, field name `file`.

**Response `200`:**
```json
{ "filename": "doc.pdf", "success": true, "documentId": "...", "mimetype": "application/pdf", "size": 12345 }
```

---

### Documents `/api/document` `[Protected]`

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| POST   | `/document/:id/summarize` | Summarize a processed document via AI |
| GET    | `/document/:id/status`    | Get document processing status        |

**GET `/document/:id/status` Response `200`:**
```json
{ "status": "PROCESSED" }
```
Possible statuses: `UPLOADED` → `PROCESSING` → `PROCESSED` | `FAILED`

**POST `/document/:id/summarize` Response `200`:**
```json
{ "documentId": "...", "summary": "AI-generated summary..." }
```

---

## Data Models

### User
| Field        | Type   | Notes                         |
|--------------|--------|-------------------------------|
| name         | String | Required                      |
| email        | String | Required, unique              |
| password     | String | Hashed (bcrypt)               |
| role         | String | `USER` \| `ADMIN`, default `USER` |
| tokenVersion | Number | Default 0                     |
| createdAt    | Date   | Auto                          |
| updatedAt    | Date   | Auto                          |

### Note
| Field     | Type     | Notes     |
|-----------|----------|-----------|
| title     | String   | Required  |
| content   | String   | Required  |
| owner     | ObjectId | Ref: User |
| createdAt | Date     | Auto      |
| updatedAt | Date     | Auto      |

### Document
| Field          | Type     | Notes                                              |
|----------------|----------|----------------------------------------------------|
| filename       | String   | Required                                           |
| originalName   | String   | Required                                           |
| mimetype       | String   | Required                                           |
| size           | Number   | Required                                           |
| path           | String   | Required                                           |
| extractedText  | String   | Populated after processing                         |
| status         | String   | `UPLOADED` \| `PROCESSING` \| `PROCESSED` \| `FAILED` |
| processingError| String   | Populated on failure                               |
| processedAt    | Date     | Populated on success                               |
| owner          | ObjectId | Ref: User                                          |
| createdAt      | Date     | Auto                                               |
| updatedAt      | Date     | Auto                                               |
