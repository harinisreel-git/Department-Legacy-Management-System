from sqlalchemy.orm import Session

from .auth import hash_password
from .models import Faculty, Feedback, Lab, Milestone, Placement, Project, Student, User


def seed_if_empty(db: Session) -> None:
    if db.query(User).count() == 0:
        db.add(
            User(
                username="admin",
                hashed_password=hash_password("admin123"),
                full_name="Dr. R. Thangarajan",
                role="staff",
            )
        )

    if db.query(Student).count() == 0:
        db.add_all(
            [
                Student(
                    roll_no="20IT001",
                    name="Aakash S",
                    batch_year=2024,
                    email="aakash.s@alumni.kongu.edu",
                    phone="9876500001",
                    current_company="Zoho Corporation",
                    job_role="Software Engineer",
                    career_notes="Working on product engineering for cloud applications.",
                    status="alumni",
                ),
                Student(
                    roll_no="20IT042",
                    name="Bhavana M",
                    batch_year=2024,
                    email="bhavana.m@alumni.kongu.edu",
                    phone="9876500002",
                    current_company="Amazon AWS",
                    job_role="Cloud Associate",
                    career_notes="Supports DevOps tooling and cloud migrations.",
                    status="alumni",
                ),
                Student(
                    roll_no="21IT089",
                    name="Dinesh Kumar K",
                    batch_year=2025,
                    email="dinesh.k@kongu.edu",
                    phone="9876500003",
                    current_company="",
                    job_role="Intern, TCS Digital",
                    career_notes="Final-year intern exploring full-stack and AI services.",
                    status="student",
                ),
                Student(
                    roll_no="21IT120",
                    name="Kavya R",
                    batch_year=2025,
                    email="kavya.r@kongu.edu",
                    phone="9876500004",
                    current_company="Kaar Technologies",
                    job_role="SAP Associate (offer)",
                    career_notes="Placed in SAP enterprise solutions.",
                    status="student",
                ),
                Student(
                    roll_no="19IT077",
                    name="Harini V",
                    batch_year=2023,
                    email="harini.v@alumni.kongu.edu",
                    phone="9876500005",
                    current_company="Accenture",
                    job_role="Security Analyst",
                    career_notes="Cybersecurity track with publications in student symposiums.",
                    status="alumni",
                ),
            ]
        )

    if db.query(Project).count() == 0:
        db.add_all(
            [
                Project(
                    title="Smart Campus Navigation using Indoor Mapping",
                    year=2024,
                    category="project",
                    authors="Aakash S, Bhavana M",
                    technologies="Flutter, Firebase, BLE beacons",
                    description="Capstone project that helps visitors locate labs and seminar halls across the IT block.",
                ),
                Project(
                    title="Lightweight Anomaly Detection for Campus Networks",
                    year=2023,
                    category="research",
                    authors="Harini V, Dr. P. Natesan",
                    technologies="Python, scikit-learn, packet capture",
                    description="Research paper on detecting unusual traffic patterns in departmental lab networks.",
                ),
                Project(
                    title="Accessible Feedback Kiosk for Department Guests",
                    year=2025,
                    category="innovation",
                    authors="Dinesh Kumar K, Kavya R",
                    technologies="HTML, FastAPI, SQLite",
                    description="Prototype kiosk for parents and recruiters to search alumni records and leave feedback.",
                ),
            ]
        )

    if db.query(Milestone).count() == 0:
        db.add_all(
            [
                Milestone(
                    year=1998,
                    title="Department inception",
                    category="history",
                    description="B.Tech Information Technology established with an initial intake of 60 students.",
                ),
                Milestone(
                    year=2007,
                    title="Autonomous accreditation",
                    category="accreditation",
                    description="UGC autonomous status and NBA accreditation for curriculum quality.",
                ),
                Milestone(
                    year=2015,
                    title="Anna University research centre",
                    category="achievement",
                    description="Recognized as a Ph.D. research centre for AI, cloud, and security work.",
                ),
                Milestone(
                    year=2021,
                    title="Intake expansion and AI labs",
                    category="award",
                    description="Intake increased to 180 seats with GPU-accelerated computing facilities.",
                ),
            ]
        )

    if db.query(Faculty).count() == 0:
        db.add_all(
            [
                Faculty(
                    name="Dr. R. Thangarajan",
                    designation="Professor & Head of Department",
                    specialization="Cloud computing, high performance networks, IoT",
                    publications=85,
                    experience_years=24,
                    photo_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
                ),
                Faculty(
                    name="Dr. S. Varadhaganapathy",
                    designation="Professor",
                    specialization="Big data analytics, deep learning, AI systems",
                    publications=60,
                    experience_years=21,
                    photo_url="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80",
                ),
                Faculty(
                    name="Dr. P. Natesan",
                    designation="Associate Professor",
                    specialization="Cyber security, cryptography, information security",
                    publications=45,
                    experience_years=18,
                    photo_url="https://images.unsplash.com/photo-1580894732413-a72359d99326?auto=format&fit=crop&w=300&q=80",
                ),
                Faculty(
                    name="Dr. K. Sangeetha",
                    designation="Associate Professor",
                    specialization="Natural language processing and data mining",
                    publications=38,
                    experience_years=16,
                    photo_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                ),
            ]
        )

    if db.query(Lab).count() == 0:
        db.add_all(
            [
                Lab(
                    name="High Performance AI & Cloud Lab",
                    description="NVIDIA workstations, high-speed LAN, and dedicated cloud servers for student projects.",
                    photo_url="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
                ),
                Lab(
                    name="Collaborative Software Incubator",
                    description="Open workspace for hackathons, open-source work, and student startup prototypes.",
                    photo_url="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
                ),
                Lab(
                    name="Smart Seminar Hall",
                    description="Department hall with dual projectors and video conferencing for guest lectures.",
                    photo_url="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
                ),
                Lab(
                    name="IT Department Library",
                    description="Reference volumes, IEEE digital access, and research journals for faculty and students.",
                    photo_url="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
                ),
            ]
        )

    if db.query(Placement).count() == 0:
        db.add_all(
            [
                Placement(company="Zoho Corporation", job_role="Software Product Engineer", year=2025, offers_count=24, package_lpa=12.0),
                Placement(company="Amazon AWS", job_role="Cloud Solutions Associate", year=2025, offers_count=6, package_lpa=14.0),
                Placement(company="TCS Digital", job_role="Full Stack Developer", year=2025, offers_count=42, package_lpa=7.5),
                Placement(company="Cognizant", job_role="Enterprise Software Engineer", year=2024, offers_count=38, package_lpa=6.8),
                Placement(company="Kaar Technologies", job_role="SAP Associate", year=2024, offers_count=15, package_lpa=8.0),
                Placement(company="Accenture", job_role="Cloud & Security Engineer", year=2024, offers_count=28, package_lpa=6.5),
            ]
        )

    if db.query(Feedback).count() == 0:
        db.add(
            Feedback(
                name="Parent Visitor",
                email="parent@example.com",
                kind="inquiry",
                subject="Placement statistics for 2025",
                message="Could you share recent recruiter roles for the IT department?",
            )
        )

    db.commit()
