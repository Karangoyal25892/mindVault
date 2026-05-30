# MindVault Frontend

The Angular frontend for MindVault — a document and note management application with AI-powered summarization.

## Tech Stack

- **Framework:** Angular 21
- **Language:** TypeScript
- **Styling:** SCSS
- **HTTP:** Angular HttpClient
- **Testing:** Vitest

## Project Structure

```
src/
├── index.html
├── main.ts
├── styles.scss
└── app/
    ├── app.ts                    # Root component
    ├── app.routes.ts             # Route definitions
    ├── app.config.ts             # App-level providers
    ├── pages/
    │   ├── login/                # Login page (/)
    │   └── dashboard/            # Dashboard page (/dashboard)
    └── services/
        └── document.ts           # API service (auth, documents)
```

## Routes

| Path         | Component | Description         |
|--------------|-----------|---------------------|
| `/`          | Login     | Login / registration |
| `/dashboard` | Dashboard | Main app view        |

## Getting Started

### Prerequisites

- Node.js >= 18
- MindVault backend running on `http://localhost:5000`

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
ng serve
```

Open `http://localhost:4200` in your browser. The app auto-reloads on file changes.

### Production Build

```bash
ng build
```

Build artifacts are output to the `dist/` directory.

## Running Tests

```bash
ng test
```

## API Integration

The frontend connects to the backend at `http://localhost:5000`. The `Document` service in [src/app/services/document.ts](src/app/services/document.ts) handles API calls:

| Method     | Endpoint                    | Description              |
|------------|-----------------------------|--------------------------|
| GET        | `/`                         | Health check             |
| POST       | `/api/auth/register`        | Register a new user      |
| POST       | `/api/auth/login`           | Login                    |
| POST       | `/api/upload`               | Upload a PDF document    |
| GET        | `/api/document/:id/summarize` | Summarize a document   |

## Code Scaffolding

Generate a new component:

```bash
ng generate component component-name
```

See all available schematics:

```bash
ng generate --help
```
