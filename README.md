# MindVault Backend

A RESTful API backend for MindVault — a note-taking application. Built with TypeScript, Express, MongoDB, and JWT authentication.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express v5
- **Database:** MongoDB (Mongoose)
- **Auth:** JSON Web Tokens (access + refresh tokens)
- **Validation:** Zod
- **Security:** Helmet, bcryptjs, CORS
- **Logging:** Morgan

## Project Structure

```
src/
├── app.ts                    # Express app setup (middleware, routes)
├── server.ts                 # Server entry point
├── config/
│   └── env.ts                # Environment variable config
├── controllers/
│   ├── auth.controller.ts    # Register, login, profile, refresh token
│   └── note.controller.ts    # Create, get, delete notes
├── middleware/
│   ├── auth.middleware.ts    # JWT verification
│   ├── validate.middleware.ts# Zod request validation
│   └── error.middleware.ts   # Global error handler
├── models/
│   ├── user.ts               # User schema
│   └── note.ts               # Note schema
├── routes/
│   ├── auth.routes.ts        # /api/auth/*
│   └── note.routes.ts        # /api/notes/*
├── services/
│   ├── auth.service.ts       # Register/login business logic
│   └── note.service.ts       # Note CRUD business logic
├── types/
│   └── express.d.ts          # Express Request type augmentation
└── validators/
    └── auth.validator.ts     # Zod schemas for auth endpoints
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
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

## API Reference

Base URL: `http://localhost:5000/api`

### Authentication

All protected routes require the `Authorization: Bearer <token>` header.

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

Login and receive access + refresh tokens.

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

Returns a confirmation that the protected route was accessed.

**Response `200`:**
```json
{
  "message": "Protected profile route accessed"
}
```

---

#### GET `/auth/refresh-token`

Get a new access token using a refresh token.

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

### Notes

All note routes are protected and scoped to the authenticated user.

#### POST `/notes` `[Protected]`

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

#### GET `/notes` `[Protected]`

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

#### DELETE `/notes/:id` `[Protected]`

Delete a note by ID. Only the note's owner can delete it.

**Response `200`:**
```json
{
  "message": "Note deleted successfully"
}
```

## Data Models

### User

| Field     | Type   | Required | Notes        |
|-----------|--------|----------|--------------|
| name      | String | Yes      |              |
| email     | String | Yes      | Unique       |
| password  | String | Yes      | Hashed       |
| createdAt | Date   | —        | Auto         |
| updatedAt | Date   | —        | Auto         |

### Note

| Field     | Type     | Required | Notes             |
|-----------|----------|----------|-------------------|
| title     | String   | Yes      |                   |
| content   | String   | Yes      |                   |
| owner     | ObjectId | Yes      | Ref: User         |
| createdAt | Date     | —        | Auto              |
| updatedAt | Date     | —        | Auto              |
