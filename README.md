# Department Legacy Management System

A full-stack web application for the **Department of Information Technology** to preserve, organize, and share departmental legacy records: alumni and student career trajectories, capstone and research archives, historical milestones and accreditations, faculty and laboratory infrastructure, recruiter records and placement statistics, and guest feedback.

The system strictly adheres to the scope defined in `SRS.md` and `REQUIREMENTS.md`. Modules outside the six core functional requirements (such as attendance marking, academic grading/CGPA management, and recruitment workflows) are explicitly excluded.

---

## System Architecture

```
                       ┌─────────────────────────────────────┐
                       │   Responsive Modern Web Frontend    │
                       │     HTML5 · CSS3 · Vanilla ES6+     │
                       └──────────────────┬──────────────────┘
                                          │ REST API & Static Files
                                          ▼
                       ┌─────────────────────────────────────┐
                       │          FastAPI Backend            │
                       │ JWT Auth · Pydantic V2 Validation   │
                       └──────────────────┬──────────────────┘
                                          │ SQLAlchemy ORM
                                          ▼
                       ┌─────────────────────────────────────┐
                       │          SQLite Database            │
                       │     backend/data/legacy.db          │
                       └─────────────────────────────────────┘
```

- **Frontend (`Frontend/`)**: Modern responsive single-page portal styled with CSS custom properties, responsive sidebar drawer, glassmorphic header, interactive modals, and floating toast notifications.
- **Backend (`backend/app/`)**: Python FastAPI application implementing JWT Bearer authentication, PBKDF2-SHA256 password hashing, Pydantic v2 schemas, and CORS middleware.
- **Database (`backend/data/legacy.db`)**: SQLite database automatically provisioned and seeded on initial startup.

---

## Features (SRS Mapping)

| SRS ID | Feature | Guest Access | Staff Access |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Integrated Student & Alumni Directory** | Search and filter by name, roll number, batch year, company, or role | Full CRUD (Create, Read, Update, Delete) with unique roll number enforcement |
| **FR-02** | **Legacy Project & Research Archive** | Browse and filter capstone projects, research papers, and technical innovations | Full CRUD management for archive entries |
| **FR-03** | **Interactive History & Achievements Timeline** | Chronological timeline view of departmental milestones, NBA accreditations, and awards | Full CRUD management for milestone records |
| **FR-04** | **Faculty & Infrastructure Showcase** | Explore faculty profiles (publications, experience) and laboratory photo gallery | Full CRUD management for faculty and facility records |
| **FR-05** | **Placement & Recruiter Records** | View recruiter companies, job roles, offers, and package statistics | Full CRUD management for recruiter and placement records |
| **FR-06** | **Guest Portal with Inquiry & Feedback** | Single unified search across all legacy records; submit inquiries and feedback | Dedicated feedback inbox to review visitor inquiries |

### Additional Capabilities
- **Staff Dashboard**: Real-time aggregated metrics (students, alumni, projects, milestones, offers, packages, recent students, recent guest inquiries).
- **Legacy Reports**: Aggregated batch totals and placement statistics by year and recruiter.
- **Security & Authorization (NFR-02)**: 100% rejection of unauthorized write operations and staff-only endpoints.

---

## Default Staff Login

For local development and administrative management:
- **Username**: `admin`
- **Password**: `admin123`

*Note: For production deployments, rotate the secret key (`DLMS_SECRET_KEY`) and administrator password.*

---

## Local Setup & Installation

### Prerequisites
- Python 3.9 or newer (Python 3.9, 3.10, 3.11, 3.12, 3.13 supported)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### 1. Windows (PowerShell)

```powershell
# Navigate to backend folder
cd c:\prompt\backend

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. macOS / Linux (Bash / Zsh)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## Running the Application

From the `backend` directory with the virtual environment activated:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Access URLs
- **Web Application Portal**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger API Documentation**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Alternative ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **API Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## Automated Testing

Run the test suite from the `backend` directory:

```powershell
cd c:\prompt\backend
.\.venv\Scripts\python.exe -m pytest -v
```

The test suite validates:
1. API Health endpoint (`GET /api/health`)
2. Bad password authentication rejection (401)
3. Unauthenticated student creation rejection (401)
4. Full Student CRUD, query filtering, and report aggregation
5. Feedback input validation (EmailStr, min length)
6. **NFR-02 Compliance**: 100% rejection of unauthorized requests across all protected staff endpoints
7. Unique roll number constraint conflict handling (409 Conflict)
8. Project and Milestone CRUD operations
9. Faculty, Lab, and Placement CRUD operations
10. Unified Public Search across all five record categories (`GET /api/search?q=...`)

---

## API Reference Summary

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | System health check |
| `POST` | `/api/auth/login` | No | Staff authentication (returns JWT bearer token) |
| `GET` | `/api/auth/me` | Yes | Get currently authenticated user profile |
| `GET` | `/api/search?q={term}` | No | Unified search across public legacy records |
| `GET` | `/api/students` | No | List and filter students/alumni (`q`, `batch_year`) |
| `POST` | `/api/students` | Yes | Create student record (enforces unique `roll_no`) |
| `PUT` | `/api/students/{id}` | Yes | Update student record |
| `DELETE`| `/api/students/{id}` | Yes | Delete student record |
| `GET` | `/api/projects` | No | List legacy projects and research (`q`) |
| `POST` | `/api/projects` | Yes | Add project or research archive entry |
| `PUT` | `/api/projects/{id}` | Yes | Update project or research entry |
| `DELETE`| `/api/projects/{id}` | Yes | Delete project or research entry |
| `GET` | `/api/milestones` | No | List historical milestones ordered by year |
| `POST` | `/api/milestones` | Yes | Add milestone record |
| `PUT` | `/api/milestones/{id}` | Yes | Update milestone record |
| `DELETE`| `/api/milestones/{id}` | Yes | Delete milestone record |
| `GET` | `/api/faculty` | No | List faculty profiles |
| `POST` | `/api/faculty` | Yes | Add faculty profile |
| `PUT` | `/api/faculty/{id}` | Yes | Update faculty profile |
| `DELETE`| `/api/faculty/{id}` | Yes | Delete faculty profile |
| `GET` | `/api/labs` | No | List laboratories and facilities |
| `POST` | `/api/labs` | Yes | Add laboratory profile |
| `PUT` | `/api/labs/{id}` | Yes | Update laboratory profile |
| `DELETE`| `/api/labs/{id}` | Yes | Delete laboratory profile |
| `GET` | `/api/placements` | No | List recruiter and placement records |
| `POST` | `/api/placements` | Yes | Add recruiter and placement record |
| `PUT` | `/api/placements/{id}` | Yes | Update recruiter and placement record |
| `DELETE`| `/api/placements/{id}` | Yes | Delete recruiter and placement record |
| `POST` | `/api/feedback` | No | Submit public guest inquiry or feedback |
| `GET` | `/api/feedback` | Yes | Read guest feedback inbox |
| `GET` | `/api/dashboard` | Yes | Aggregate dashboard metrics and recent submissions |
| `GET` | `/api/reports` | Yes | Aggregate batch and yearly placement reports |

