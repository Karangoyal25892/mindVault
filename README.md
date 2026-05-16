# MindVault

A personal knowledge vault application with a secure authentication backend built with TypeScript, Express.js, and MongoDB.

---

## Tech Stack

**Backend**
- Node.js + Express.js (v5)
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcrypt password hashing
- Helmet, CORS, Morgan

**Frontend**
- Coming soon

---

## Project Structure

```
mindvault/
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Express app setup
│   │   ├── server.ts               # Entry point
│   │   ├── config/env.ts           # Environment config
│   │   ├── database/connectDB.ts   # MongoDB connection
│   │   ├── models/user.ts          # User schema
│   │   ├── routes/auth.routes.ts   # Auth routes
│   │   ├── controllers/            # Request handlers
│   │   ├── services/               # Business logic
│   │   ├── middleware/             # Auth middleware
│   │   └── validators/             # Input validators
│   ├── dist/                       # Compiled JS output
│   ├── package.json
│   └── tsconfig.json
└── frontend/                       # Coming soon
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally on port `27017`

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mindvault
JWT_SECRET=your_secret_key
```

### Running the Server

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

Server starts at `http://localhost:5000`

---

## API Endpoints

### Health Check

```
GET /
```

Response: `MindVault Started!`

---

### Auth

#### Register

```
POST /api/auth/register
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login

```
POST /api/auth/login
```

Request body:
```json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
```

Response:
```json
{
  "message": "User logged in successfully",
  "token": "<JWT token>"
}
```

JWT tokens expire after **1 hour**.

---

## Roadmap

- [ ] Frontend (Angular)
- [ ] Auth middleware for protected routes
- [ ] Input validators
- [ ] Note/vault CRUD operations
- [ ] Unit and integration tests

---

## License

MIT
