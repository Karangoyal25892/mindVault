# MindVault Backend

A RESTful API backend for MindVault — a note-taking application with PDF document upload and text extraction. Built with TypeScript, Express, MongoDB, and JWT authentication.

## Tech Stack

| Layer | Library |
|---|---|
| Runtime | Node.js + TypeScript |
| Framework | Express v5 |
| Database | MongoDB (Mongoose) |
| Authentication | JSON Web Tokens (access + refresh tokens) |
| Password Hashing | bcrypt |
| Validation | Zod |
| File Upload | Multer |
| PDF Parsing | pdf-parse |
| Security | Helmet, CORS |
| Logging | Morgan |

## Project Structure

```
src/
├── app.ts                        # Express app setup (middleware, routes)
├── server.ts                     # Server entry point
├── config/
│   └── env.ts                    # Environment variable config
├── controllers/
│   ├── auth.controller.ts        # Register, login, profile, refresh token
│   ├── note.controller.ts        # Create, list, delete notes
│   └── upload.controller.ts      # PDF upload and text extraction
├── database/
│   └── connectDB.ts              # MongoDB connection
├── middleware/
│   ├── auth.middleware.ts        # JWT verification
│   ├── validate.middleware.ts    # Zod request body validation
│   ├── error.middleware.ts       # Global error handler
│   └── upload.middleware.ts      # Multer disk storage config
├── models/
│   ├── user.ts                   # User schema
│   ├── note.ts                   # Note schema
│   └── document.ts               # Uploaded document schema
├── routes/
│   ├── auth.routes.ts            # /api/auth/*
│   ├── note.routes.ts            # /api/note/*
│   └── upload.routes.ts          # /api/upload/*
├── services/
│   ├── auth.service.ts           # Register/login business logic
│   ├── note.service.ts           # Note CRUD business logic
│   └── upload.service.ts         # Document persistence logic
├── types/
│   ├── auth.types.ts             # AuthPayload interface
│   └── express.d.ts              # Express Request type augmentation
└── validators/
    └── auth.validator.ts         # Zod schemas for auth endpoints
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB instance (local or Atlas)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mindvault
JWT_SECRET=your_secret_key
```

### Running the Server

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

Uploaded files are saved to the `uploads/` directory in the project root. Create it if it doesn't exist:

```bash
mkdir uploads
```

## API Reference

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

### Auth — `/api/auth`

#### POST `/auth/register`

Register a new user.

**Body:**
```json
{
  "name": "John Doe",       // min 2 characters
  "email": "john@example.com",
  "password": "secret123"  // min 6 characters
}
```

**Response `201`:**
```json
{
  "message": "User registered successfully",
  "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

---

#### POST `/auth/login`

Login and receive access + refresh tokens.

**Body:**
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
  "token": "<access_token>",       // expires in 1h
  "refreshToken": "<refresh_token>" // expires in 7d
}
```

---

#### GET `/auth/profile` `[Protected]`

Verify a valid access token.

**Response `200`:**
```json
{
  "message": "Protected profile route accessed"
}
```

---

#### GET `/auth/refresh-token`

Exchange a refresh token for a new access token.

**Body:**
```json
{
  "refreshToken": "<refresh_token>"
}
```

**Response `200`:**
```json
{
  "message": "Token refreshed successfully",
  "token": "<new_access_token>"
}
```

---

### Notes — `/api/note`

#### POST `/note` `[Protected]`

Create a new note.

**Body:**
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

#### GET `/note` `[Protected]`

Get paginated notes for the authenticated user, sorted newest first.

**Query Params:**

| Param | Default | Description |
|---|---|---|
| page | 1 | Page number |
| limit | 10 | Results per page |

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

#### DELETE `/note/:id` `[Protected]`

Delete a note by ID. Only the owner can delete their notes.

**Response `200`:**
```json
{
  "message": "Note deleted successfully"
}
```

---

### Upload — `/api/upload`

#### POST `/upload` `[Protected]`

Upload a PDF file. The server extracts its text content and stores it in the database.

**Content-Type:** `multipart/form-data`

**Form Field:** `file` — the PDF file to upload

**Response `200`:**
```json
{
  "success": true,
  "filename": "document.pdf",
  "path": "uploads/1234567890-document.pdf",
  "mimetype": "application/pdf",
  "size": 102400
}
```

The extracted text from the PDF is saved to the `Document` model and linked to the authenticated user.

---

## Error Responses

Validation errors (Zod):
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

General errors:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Data Models

### User

| Field | Type | Notes |
|---|---|---|
| name | String | Required |
| email | String | Required, unique |
| password | String | Required, hashed with bcrypt |
| createdAt | Date | Auto |
| updatedAt | Date | Auto |

### Note

| Field | Type | Notes |
|---|---|---|
| title | String | Required |
| content | String | Required |
| owner | ObjectId | Ref: User |
| createdAt | Date | Auto |
| updatedAt | Date | Auto |

### Document

| Field | Type | Notes |
|---|---|---|
| filename | String | Stored filename (timestamped) |
| originalName | String | Original uploaded filename |
| mimetype | String | File MIME type |
| size | Number | File size in bytes |
| path | String | Path on disk |
| extractedText | String | Text extracted from PDF |
| owner | ObjectId | Ref: User |
| createdAt | Date | Auto |
| updatedAt | Date | Auto |
