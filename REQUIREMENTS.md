# Department Legacy Management System – Requirements

This document translates `SRS.md` into implementable product requirements. Nothing outside the SRS six-feature scope is required.

## 1. Actors

| Actor | Access |
| --- | --- |
| Guest | Public search and view of legacy records; submit inquiry or feedback |
| Staff | Authenticated access to dashboard, reports, and record management |

## 2. Feature Mapping (SRS)

| SRS ID | Capability |
| --- | --- |
| FR-01 | Search and view student/alumni batch and career records; staff student CRUD |
| FR-02 | Store and display capstone projects, research papers, and innovations |
| FR-03 | Display departmental milestones, awards, accreditations, and achievements by year |
| FR-04 | Display faculty profiles, publications, labs, and event/lab photos |
| FR-05 | Display recruiting companies, job roles, and placement statistics |
| FR-06 | Guest search of public records and submission of inquiries/feedback |

## 3. Application Requirements

### 3.1 Authentication (NFR-02)

* Staff shall log in with username and password.
* Passwords shall be stored hashed.
* Protected APIs shall reject unauthenticated requests.
* Guests shall not access staff dashboard, reports, student write operations, or feedback inbox.

### 3.2 Student records (FR-01)

* Public users can search by name, roll number, batch year, company, or role.
* Staff can create, read, update, and delete student/alumni records.
* Each record stores identity, batch, and career information (not attendance or academics).

### 3.3 Projects and research (FR-02)

* Public users can browse and search projects, papers, and innovations.
* Staff can create, update, and delete archive entries.

### 3.4 History and achievements (FR-03)

* Public users can view a year-ordered timeline.
* Staff can manage milestone records (award, accreditation, achievement, history).

### 3.5 Faculty and infrastructure (FR-04)

* Public users can view faculty profiles, publications, labs, and photos.
* Staff can manage faculty and lab/photo records.

### 3.6 Placements (FR-05)

* Public users can view companies, roles, offers, and packages.
* Staff can manage recruiter records.
* Placement statistics are shown on the public placements page and in staff reports.

### 3.7 Guest portal (FR-06)

* Guests can search public records from one search field.
* Guests can submit inquiry or feedback with name, email, subject, and message.

### 3.8 Dashboard and reports (staff)

* Dashboard shows counts and recent activity for in-scope records only.
* Reports summarize students by batch and placements by year/company.

### 3.9 Validation and persistence (NFR-04)

* Required fields, unique roll numbers, valid emails, and valid years are enforced on API and UI.
* Successfully saved records persist in SQLite.

## 4. Technical Requirements

* Backend: Python FastAPI
* Database: SQLite
* Frontend: HTML, CSS, and JavaScript connected to the REST API
* Default staff account is documented in `README.md` for local setup

## 5. Explicitly Out of Scope

Do not implement attendance marking, academic grading/CGPA management, circulars unrelated to legacy, online recruitment workflows, project evaluation, or placement training.
