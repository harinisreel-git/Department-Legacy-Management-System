from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(40), default="staff")


class Student(Base):
    __tablename__ = "students"
    __table_args__ = (UniqueConstraint("roll_no", name="uq_student_roll"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    roll_no: Mapped[str] = mapped_column(String(40), index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    batch_year: Mapped[int] = mapped_column(Integer, index=True)
    email: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str] = mapped_column(String(30), default="")
    current_company: Mapped[str] = mapped_column(String(160), default="")
    job_role: Mapped[str] = mapped_column(String(160), default="")
    career_notes: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="alumni")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    year: Mapped[int] = mapped_column(Integer, index=True)
    category: Mapped[str] = mapped_column(String(40))
    authors: Mapped[str] = mapped_column(String(240))
    technologies: Mapped[str] = mapped_column(String(240), default="")
    description: Mapped[str] = mapped_column(Text)


class Milestone(Base):
    __tablename__ = "milestones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    year: Mapped[int] = mapped_column(Integer, index=True)
    title: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(40))
    description: Mapped[str] = mapped_column(Text)


class Faculty(Base):
    __tablename__ = "faculty"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    designation: Mapped[str] = mapped_column(String(120))
    specialization: Mapped[str] = mapped_column(String(240))
    publications: Mapped[int] = mapped_column(Integer, default=0)
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    photo_url: Mapped[str] = mapped_column(String(400), default="")


class Lab(Base):
    __tablename__ = "labs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    photo_url: Mapped[str] = mapped_column(String(400), default="")


class Placement(Base):
    __tablename__ = "placements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    company: Mapped[str] = mapped_column(String(160), index=True)
    job_role: Mapped[str] = mapped_column(String(160))
    year: Mapped[int] = mapped_column(Integer, index=True)
    offers_count: Mapped[int] = mapped_column(Integer, default=0)
    package_lpa: Mapped[float] = mapped_column(Float, default=0.0)


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(160))
    kind: Mapped[str] = mapped_column(String(20))
    subject: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
