# Department Legacy Management System

A production-ready Progressive Web App (PWA) and digital archive for the **Department of Information Technology**, preserving and celebrating institutional achievements: alumni and student career trajectories, capstone and research archives, historical milestones, faculty and laboratory infrastructure, recruiter records and placement statistics, and visitor inquiries with an integrated AI Legacy Assistant.

---

## Production Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Responsive Vanilla JavaScript (ES6+), HTML5, CSS3 Custom Properties Design System, Progressive Web App (Service Worker, Web App Manifest, Standalone Mode, Offline Caching) |
| **Backend** | Node.js (>= 18.0.0 ESM), Express.js REST API, JSON Web Token (JWT) Bearer Authentication, bcryptjs password hashing |
| **Database** | Dual Architecture: Supabase PostgreSQL (Production Persistent Cloud DB) with automated fallback to High-Fidelity In-Memory Store |
| **AI Integration** | Google Gemini API (`@google/genai`) with grounded departmental retrieval and structured contextual guidance |
| **Security** | Production HTTP security headers, CORS protection, JWT Bearer verification, parameter validation, role-based access control (NFR-02 compliance) |

---

## Architecture Overview

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │           Progressive Web Application (PWA)            │
                                  │      Desktop & Mobile Responsive · Offline Cache       │
                                  │           Service Worker (sw.js) · Manifest            │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │ HTTPS / JSON REST API
                                                              ▼
                                  ┌────────────────────────────────────────────────────────┐
                                  │               Node.js Express Server                   │
                                  │     JWT Auth · Security Middlewares · Health & CRUD    │
                                  └─────────────┬────────────────────────────┬─────────────┘
                                                │                            │
                                                ▼                            ▼
                 ┌──────────────────────────────────────────┐    ┌───────────────────────────┐
                 │       Supabase PostgreSQL Database       │    │     Google Gemini API     │
                 │   Tables: students, projects, faculty,   │    │  Conversational Assistant │
                 │      milestones, labs, placements        │    │    Grounded Retrieval     │
                 └──────────────────────────────────────────┘    └───────────────────────────┘
```

---

## Key Features & Functional Requirements

- **FR-01: Integrated Student & Alumni Directory**: Real-time search, batch filtering, placement trajectories, and full administrative CRUD with unique roll number enforcement.
- **FR-02: Legacy Project & Research Archive**: Capstone innovations, patents, and research publications filterable by category and year.
- **FR-03: History & Milestones Timeline**: Chronological accreditation milestones, NBA certifications, and institutional honors.
- **FR-04: Faculty & Infrastructure Showcase**: Faculty academic portfolios, publication records, and laboratory facility profiles.
- **FR-05: Placement & Recruiter Records**: Recruiter company directories, compensation packages, and yearly placement analytics.
- **FR-06: Guest Inquiries & Unified Archive Search**: Global archive keyword search across all categories and an interactive inquiry submission portal.
- **AI Legacy Assistant**: Natural language assistant grounded in departmental data, answering inquiries about alumni, faculty, projects, and admissions.
- **Progressive Web App (PWA)**: Installable on Android, iOS, Windows, macOS, and Linux with full offline reading support.

---

## Default Staff Credentials

For local development and administrative testing:
- **Username**: `admin`
- **Password**: `admin123`

> **Production Security Note**: For production deployments, change `DLMS_SECRET_KEY` in environment variables and rotate the administrator password.

---

## Environment Variables

Configure these in your hosting provider's environment settings or in a local `.env` file (copied from `.env.example`):

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `3000` | Port on which the HTTP server listens |
| `NODE_ENV` | Optional | `production` | Node environment (`production` or `development`) |
| `DLMS_SECRET_KEY` | **Required** in prod | dev fallback | Secret key for signing and verifying JWT tokens |
| `SUPABASE_URL` | Optional | `""` | Supabase PostgreSQL project URL |
| `SUPABASE_KEY` | Optional | `""` | Supabase Service Role or Anon API Key |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API Key for conversational AI assistant |
| `TEST_BASE_URL` | Optional | `http://127.0.0.1:3000` | Target URL for automated integration tests |

---

## Local Setup & Quickstart

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/your-username/department-legacy-management-system.git
cd department-legacy-management-system

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your preferred settings

# 4. Start development server
npm run dev

# 5. Access application
# Open http://localhost:3000 in your browser
```

---

## Automated Test Suite

Run the full end-to-end integration and API verification test suite:

```bash
npm test
```

The test runner validates:
1. `GET /api/health` system health status
2. Bad password authentication rejection (`401 Unauthorized`)
3. Unauthenticated mutation rejection (`401 Unauthorized`)
4. Student & Alumni CRUD, query filters, and report aggregations
5. Guest inquiry input validation (RFC email compliance and minimum length)
6. **NFR-02 Compliance**: Unauthorized write rejection across staff endpoints
7. Unique roll number constraint conflicts (`409 Conflict`)
8. Project and Milestone CRUD operations
9. Faculty, Laboratory, and Placement CRUD operations
10. Unified cross-category search (`GET /api/search?q=...`)
11-15. AI Chatbot responses (Faculty, Placements, Capstones, Guest Inquiries, and Validation)

---

## Production Deployment Guidelines

### 1. Google Cloud Run (Recommended Container Deployment)

```bash
# Build and deploy directly to Cloud Run
gcloud run deploy dlms-app \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=3000,DLMS_SECRET_KEY="your-strong-production-secret"
```

### 2. Docker Container

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t dlms-app .
docker run -p 3000:3000 -e DLMS_SECRET_KEY="your-production-secret" dlms-app
```

### 3. Render / Railway / Heroku

1. Connect your GitHub repository.
2. Select **Node.js** environment.
3. Build Command: `npm run build`
4. Start Command: `npm start`
5. Configure Environment Variables: `DLMS_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`.

---

## Database Provisioning with Supabase (Optional)

1. Create a project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in the Supabase dashboard.
3. Paste the contents of `supabase_schema.sql` and click **Run**.
4. Retrieve your **Project URL** and **Service Role Key** from Settings > API.
5. Set `SUPABASE_URL` and `SUPABASE_KEY` in your environment.

---

## License

This project is licensed for the Department of Information Technology, Kongu Engineering College.
