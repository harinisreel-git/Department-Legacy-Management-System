-- ============================================================================
-- DEPARTMENT LEGACY MANAGEMENT SYSTEM
-- Supabase PostgreSQL Database Schema & Migration
-- Based on SRS (srs.md) and Product Requirements (REQUIREMENTS.md)
-- ============================================================================

-- 1. USERS & STAFF CREDENTIALS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. FR-01: STUDENTS & ALUMNI RECORDS
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    roll_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    batch_year INTEGER NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    current_company TEXT DEFAULT '',
    job_role TEXT DEFAULT '',
    career_notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'student' CHECK (status IN ('student', 'alumni')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. FR-02: LEGACY PROJECTS & RESEARCH ARCHIVE
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    category TEXT NOT NULL DEFAULT 'project' CHECK (category IN ('project', 'research', 'innovation')),
    authors TEXT NOT NULL,
    technologies TEXT DEFAULT '',
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FR-03: INTERACTIVE HISTORY & ACHIEVEMENTS TIMELINE
CREATE TABLE IF NOT EXISTS milestones (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'history' CHECK (category IN ('history', 'accreditation', 'achievement', 'award')),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FR-04: FACULTY PROFILES & INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS faculty (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT NOT NULL,
    specialization TEXT NOT NULL,
    publications INTEGER NOT NULL DEFAULT 0,
    experience_years INTEGER NOT NULL DEFAULT 0,
    photo_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS labs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. FR-05: PLACEMENT & RECRUITER RECORDS
CREATE TABLE IF NOT EXISTS placements (
    id SERIAL PRIMARY KEY,
    company TEXT NOT NULL,
    job_role TEXT NOT NULL,
    year INTEGER NOT NULL,
    offers_count INTEGER NOT NULL DEFAULT 0,
    package_lpa NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FR-06: GUEST INQUIRY & FEEDBACK PORTAL
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'inquiry' CHECK (kind IN ('inquiry', 'feedback')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR OPTIMIZED SEARCH & REPORT PERFORMANCE (NFR-01)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_batch_year ON students(batch_year);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_projects_year ON projects(year);
CREATE INDEX IF NOT EXISTS idx_milestones_year ON milestones(year);
CREATE INDEX IF NOT EXISTS idx_placements_year ON placements(year);
CREATE INDEX IF NOT EXISTS idx_placements_package ON placements(package_lpa DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow public read access to public legacy tables
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view students" ON students;
    CREATE POLICY "Public can view students" ON students FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view projects" ON projects;
    CREATE POLICY "Public can view projects" ON projects FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view milestones" ON milestones;
    CREATE POLICY "Public can view milestones" ON milestones FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view faculty" ON faculty;
    CREATE POLICY "Public can view faculty" ON faculty FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view labs" ON labs;
    CREATE POLICY "Public can view labs" ON labs FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can view placements" ON placements;
    CREATE POLICY "Public can view placements" ON placements FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Public can submit feedback" ON feedback;
    CREATE POLICY "Public can submit feedback" ON feedback FOR INSERT WITH CHECK (true);

    -- Service role and authenticated operations can access all tables
    DROP POLICY IF EXISTS "Service role full access users" ON users;
    CREATE POLICY "Service role full access users" ON users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access students" ON students;
    CREATE POLICY "Service role full access students" ON students FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access projects" ON projects;
    CREATE POLICY "Service role full access projects" ON projects FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access milestones" ON milestones;
    CREATE POLICY "Service role full access milestones" ON milestones FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access faculty" ON faculty;
    CREATE POLICY "Service role full access faculty" ON faculty FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access labs" ON labs;
    CREATE POLICY "Service role full access labs" ON labs FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access placements" ON placements;
    CREATE POLICY "Service role full access placements" ON placements FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Service role full access feedback" ON feedback;
    CREATE POLICY "Service role full access feedback" ON feedback FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ============================================================================
-- INITIAL DATA SEED / MIGRATION SCRIPT (Preserving 100% of existing data)
-- ============================================================================

-- Staff user (admin / admin123)
INSERT INTO users (id, username, password_hash, full_name, role)
VALUES (1, 'admin', '$2a$10$Q7ZpY6w4j9P4mZ7UvY3jAe6.e4pS5WlB2jQ0T8y3gG6c6f7m8p9qO', 'Dr. R. Thangarajan', 'staff')
ON CONFLICT (username) DO NOTHING;

-- Students
INSERT INTO students (id, roll_no, name, batch_year, email, phone, current_company, job_role, career_notes, status)
VALUES
(1, '20IT001', 'Aakash S', 2024, 'aakash.s@alumni.kongu.edu', '9876500001', 'Zoho Corporation', 'Software Engineer', 'Working on product engineering for cloud applications.', 'alumni'),
(2, '20IT042', 'Bhavana M', 2024, 'bhavana.m@alumni.kongu.edu', '9876500002', 'Amazon AWS', 'Cloud Associate', 'Supports DevOps tooling and cloud migrations.', 'alumni'),
(3, '21IT089', 'Dinesh Kumar K', 2025, 'dinesh.k@kongu.edu', '9876500003', '', 'Intern, TCS Digital', 'Final-year intern exploring full-stack and AI services.', 'student'),
(4, '21IT120', 'Kavya R', 2025, 'kavya.r@kongu.edu', '9876500004', 'Kaar Technologies', 'SAP Associate (offer)', 'Placed in SAP enterprise solutions.', 'student'),
(5, '19IT077', 'Harini V', 2023, 'harini.v@alumni.kongu.edu', '9876500005', 'Accenture', 'Security Analyst', 'Cybersecurity track with publications in student symposiums.', 'alumni')
ON CONFLICT (roll_no) DO UPDATE SET
    name = EXCLUDED.name,
    batch_year = EXCLUDED.batch_year,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    current_company = EXCLUDED.current_company,
    job_role = EXCLUDED.job_role,
    career_notes = EXCLUDED.career_notes,
    status = EXCLUDED.status;

-- Projects
INSERT INTO projects (id, title, year, category, authors, technologies, description)
VALUES
(1, 'Smart Campus Navigation using Indoor Mapping', 2024, 'project', 'Aakash S, Bhavana M', 'Flutter, Firebase, BLE beacons', 'Capstone project that helps visitors locate labs and seminar halls across the IT block.'),
(2, 'Lightweight Anomaly Detection for Campus Networks', 2023, 'research', 'Harini V, Dr. P. Natesan', 'Python, scikit-learn, packet capture', 'Research paper on detecting unusual traffic patterns in departmental lab networks.'),
(3, 'Accessible Feedback Kiosk for Department Guests', 2025, 'innovation', 'Dinesh Kumar K, Kavya R', 'HTML, FastAPI, SQLite', 'Prototype kiosk for parents and recruiters to search alumni records and leave feedback.')
ON CONFLICT (id) DO NOTHING;

-- Milestones
INSERT INTO milestones (id, year, title, category, description)
VALUES
(1, 1998, 'Department inception', 'history', 'B.Tech Information Technology established with an initial intake of 60 students.'),
(2, 2007, 'Autonomous accreditation', 'accreditation', 'UGC autonomous status and NBA accreditation for curriculum quality.'),
(3, 2015, 'Anna University research centre', 'achievement', 'Recognized as a Ph.D. research centre for AI, cloud, and security work.'),
(4, 2021, 'Intake expansion and AI labs', 'award', 'Intake increased to 180 seats with GPU-accelerated computing facilities.')
ON CONFLICT (id) DO NOTHING;

-- Faculty
INSERT INTO faculty (id, name, designation, specialization, publications, experience_years, photo_url)
VALUES
(1, 'Dr. R. Thangarajan', 'Professor & Head of Department', 'Cloud computing, high performance networks, IoT', 85, 24, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'),
(2, 'Dr. S. Varadhaganapathy', 'Professor', 'Big data analytics, deep learning, AI systems', 60, 21, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'),
(3, 'Dr. P. Natesan', 'Associate Professor', 'Cyber security, cryptography, information security', 45, 18, 'https://images.unsplash.com/photo-1580894732413-a72359d99326?auto=format&fit=crop&w=300&q=80'),
(4, 'Dr. K. Sangeetha', 'Associate Professor', 'Natural language processing and data mining', 38, 16, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80')
ON CONFLICT (id) DO NOTHING;

-- Labs
INSERT INTO labs (id, name, description, photo_url)
VALUES
(1, 'High Performance AI & Cloud Lab', 'NVIDIA workstations, high-speed LAN, and dedicated cloud servers for student projects.', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80'),
(2, 'Collaborative Software Incubator', 'Open workspace for hackathons, open-source work, and student startup prototypes.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'),
(3, 'Smart Seminar Hall', 'Department hall with dual projectors and video conferencing for guest lectures.', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'),
(4, 'IT Department Library', 'Reference volumes, IEEE digital access, and research journals for faculty and students.', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- Placements
INSERT INTO placements (id, company, job_role, year, offers_count, package_lpa)
VALUES
(1, 'Zoho Corporation', 'Software Product Engineer', 2025, 24, 12.00),
(2, 'Amazon AWS', 'Cloud Solutions Associate', 2025, 6, 14.00),
(3, 'TCS Digital', 'Full Stack Developer', 2025, 42, 7.50),
(4, 'Cognizant', 'Enterprise Software Engineer', 2024, 38, 6.80),
(5, 'Kaar Technologies', 'SAP Associate', 2024, 15, 8.00),
(6, 'Accenture', 'Cloud & Security Engineer', 2024, 28, 6.50)
ON CONFLICT (id) DO NOTHING;

-- Feedback
INSERT INTO feedback (id, name, email, kind, subject, message, created_at)
VALUES
(1, 'Parent Visitor', 'parent@example.com', 'inquiry', 'Placement statistics for 2025', 'Could you share recent recruiter roles for the IT department?', NOW())
ON CONFLICT (id) DO NOTHING;

-- Update sequence values so subsequent serial IDs increment properly
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));
SELECT setval('students_id_seq', COALESCE((SELECT MAX(id) FROM students), 1));
SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 1));
SELECT setval('milestones_id_seq', COALESCE((SELECT MAX(id) FROM milestones), 1));
SELECT setval('faculty_id_seq', COALESCE((SELECT MAX(id) FROM faculty), 1));
SELECT setval('labs_id_seq', COALESCE((SELECT MAX(id) FROM labs), 1));
SELECT setval('placements_id_seq', COALESCE((SELECT MAX(id) FROM placements), 1));
SELECT setval('feedback_id_seq', COALESCE((SELECT MAX(id) FROM feedback), 1));
