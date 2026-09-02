# Department Legacy Management System – SRS

## 1. Purpose and Scope

**Purpose:** To store and provide access to departmental legacy information, including students, projects, history, faculty, placements, and guest feedback.

**In Scope:**

* Alumni and student records
* Projects and research
* Department history and achievements
* Faculty and infrastructure
* Placement and recruiter records
* Guest inquiries and feedback

**Out of Scope:**

* Attendance or academic management
* Online recruitment
* Project evaluation
* Placement training
* Other departments

## 2. Functional Requirements

* **FR-01:** The system shall allow users to search and view student batch and career records.
* **FR-02:** The system shall store and display projects, research papers, and innovations.
* **FR-03:** The system shall display milestones, awards, accreditations, and achievements by year.
* **FR-04:** The system shall display faculty profiles, publications, labs, and event photos.
* **FR-05:** The system shall display recruiting companies, job roles, and placement statistics.
* **FR-06:** The system shall allow guests to search public records and submit inquiries or feedback.

## 3. Non-Functional Requirements

* **NFR-01:** The system shall return results within **3 seconds** for **95%** of searches.
* **NFR-02:** The system shall restrict **100%** of unauthorized access attempts.
* **NFR-03:** The system shall allow guests to complete searches within **5 minutes**.
* **NFR-04:** The system shall preserve **100%** of successfully saved records.

## 4. Assumptions

* The department provides accurate data.
* SQLite is sufficient for the expected data volume.

## 5. Constraints

* The system shall use **Python and SQLite**.
* The system is limited to the six specified features.
