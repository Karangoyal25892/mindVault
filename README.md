# MindVault Backend

A RESTful API backend for MindVault — a document and note management application with AI-powered summarization. Built with TypeScript, Express, MongoDB, and JWT authentication.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express v5
- **Database:** MongoDB (Mongoose)
- **Auth:** JSON Web Tokens (access + refresh tokens)
- **Validation:** Zod
- **Security:** Helmet, bcryptjs, CORS
- **Logging:** Morgan
- **File Upload:** Multer
- **PDF Parsing:** pdf-parse
- **AI Summarization:** OpenAI API (gpt-4.1-mini)

## Project Structure

```
src/
├── app.ts                        # Express app setup (middleware, routes)
├── server.ts                     # Server entry point
├── config/
│   └── env.ts                    # Environment variable config
├── controllers/
│   ├── auth.controller.ts        # Register, login, profile, refresh token
│   ├── note.controller.ts        # Create, get, delete notes
│   ├── upload.controller.ts      # File upload + PDF text extraction
│   └── document.controller.ts   # Document summarization via OpenAI
├── middleware/
│   ├── auth.middleware.ts        # JWT verification
│   ├── validate.middleware.ts    # Zod request validation
│   ├── upload.middleware.ts      # Multer file upload config
│   └── error.middleware.ts       # Global error handler
├── models/
│   ├── user.ts                   # User schema
│   ├── note.ts                   # Note schema
│   └── document.ts               # Document schema
├── routes/
│   ├── auth.routes.ts            # /api/auth/*
│   ├── note.routes.ts            # /api/note/*
│   ├── upload.routes.ts          # /api/upload/*
│   └── document.routes.ts        # /api/document/*
├── services/
│   ├── auth.service.ts           # Register/login business logic
│   ├── note.service.ts           # Note CRUD business logic
│   ├── upload.service.ts         # Document storage logic
│   ├── document.service.ts       # Document retrieval logic
│   └── ai.service.ts             # OpenAI summarization
├── types/
│   ├── express.d.ts              # Express Request type augmentation
│   └── auth.types.ts             # Auth-related types
└── validators/
    └── auth.validator.ts         # Zod schemas for auth endpoints
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)
- OpenAI API key

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mindvault
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_api_key
```

### Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

## API Reference

Base URL: `http://localhost:5000/api`

All protected routes require the `Authorization: Bearer <token>` header.

---

### Authentication `/api/auth`

#### POST `/auth/register`

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Validation:** name ≥ 2 chars, valid email, password ≥ 6 chars

**Response `201`:**
```json
{
  "message": "User registered successfully",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

---

#### POST `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "message": "User logged in successfully",
  "token": "<jwt_access_token>",
  "refreshToken": "<jwt_refresh_token>"
}
```

Token expiry: access token `1h`, refresh token `7d`.

---

#### GET `/auth/profile` `[Protected]`

**Response `200`:**
```json
{
  "message": "Protected profile route accessed"
}
```

---

#### GET `/auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "<jwt_refresh_token>"
}
```

**Response `200`:**
```json
{
  "message": "Token refreshed successfully",
  "token": "<new_jwt_access_token>"
}
```

---

### Notes `/api/note` `[Protected]`

#### POST `/note`

Create a new note.

**Request Body:**
```json
{
  "title": "My Note",
  "content": "Note content here"
}
```

**Response `201`:**
```json
{
  "message": "Note created successfully"
}
```

---

#### GET `/note`

Get paginated notes for the authenticated user.

**Query Params:** `page` (default: 1), `limit` (default: 10)

**Response `200`:**
```json
{
  "notes": [
    {
      "_id": "...",
      "title": "My Note",
      "content": "Note content here",
      "owner": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

#### DELETE `/note/:id`

Delete a note by ID. Only the owner can delete.

**Response `200`:**
```json
{
  "message": "Note deleted successfully"
}
```

---

### File Upload `/api/upload` `[Protected]`

#### POST `/upload`

Upload a PDF file. The server extracts the text content and stores it in the database.

**Request:** `multipart/form-data` with a `file` field (PDF).

**Response `200`:**
```json
{
  "filename": "document.pdf",
  "success": true,
  "path": "uploads/...",
  "mimetype": "application/pdf",
  "size": 12345,
  "documentId": "..."
}
```

---

### Documents `/api/document` `[Protected]`

#### GET `/document/:id/summarize`

Summarize a previously uploaded document using OpenAI.

**Response `200`:**
```json
{
  "documentId": "...",
  "summary": "AI-generated summary of the document..."
}
```

---

## Data Models

### User

| Field     | Type   | Required | Notes  |
|-----------|--------|----------|--------|
| name      | String | Yes      |        |
| email     | String | Yes      | Unique |
| password  | String | Yes      | Hashed |
| createdAt | Date   | —        | Auto   |
| updatedAt | Date   | —        | Auto   |

### Note

| Field     | Type     | Required | Notes     |
|-----------|----------|----------|-----------|
| title     | String   | Yes      |           |
| content   | String   | Yes      |           |
| owner     | ObjectId | Yes      | Ref: User |
| createdAt | Date     | —        | Auto      |
| updatedAt | Date     | —        | Auto      |

### Document

| Field         | Type     | Required | Notes     |
|---------------|----------|----------|-----------|
| filename      | String   | Yes      |           |
| originalName  | String   | Yes      |           |
| mimetype      | String   | Yes      |           |
| size          | Number   | Yes      |           |
| path          | String   | Yes      |           |
| extractedText | String   | Yes      | PDF text  |
| owner         | ObjectId | Yes      | Ref: User |
| createdAt     | Date     | —        | Auto      |
| updatedAt     | Date     | —        | Auto      |
