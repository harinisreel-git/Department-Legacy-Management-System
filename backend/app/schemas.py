from __future__ import annotations

from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

CURRENT_YEAR = datetime.now().year
MAX_VALID_YEAR = max(CURRENT_YEAR + 10, 2035)


def validate_year(value: int) -> int:
    if value < 1980 or value > MAX_VALID_YEAR:
        raise ValueError(f"Year must be between 1980 and {MAX_VALID_YEAR}")
    return value


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=6, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    full_name: str
    username: str


class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class StudentIn(BaseModel):
    roll_no: str = Field(min_length=3, max_length=40)
    name: str = Field(min_length=2, max_length=120)
    batch_year: int
    email: EmailStr
    phone: str = Field(default="", max_length=30)
    current_company: str = Field(default="", max_length=160)
    job_role: str = Field(default="", max_length=160)
    career_notes: str = Field(default="", max_length=2000)
    status: Literal["student", "alumni"] = "alumni"

    @field_validator("roll_no", "name")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field cannot be empty")
        return cleaned

    @field_validator("batch_year")
    @classmethod
    def check_year(cls, value: int) -> int:
        return validate_year(value)


class StudentOut(StudentIn):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ProjectIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    year: int
    category: Literal["project", "research", "innovation"]
    authors: str = Field(min_length=2, max_length=240)
    technologies: str = Field(default="", max_length=240)
    description: str = Field(min_length=10, max_length=4000)

    @field_validator("year")
    @classmethod
    def check_year(cls, value: int) -> int:
        return validate_year(value)


class ProjectOut(ProjectIn):
    id: int

    model_config = ConfigDict(from_attributes=True)


class MilestoneIn(BaseModel):
    year: int
    title: str = Field(min_length=3, max_length=200)
    category: Literal["history", "award", "accreditation", "achievement"]
    description: str = Field(min_length=10, max_length=4000)

    @field_validator("year")
    @classmethod
    def check_year(cls, value: int) -> int:
        return validate_year(value)


class MilestoneOut(MilestoneIn):
    id: int

    model_config = ConfigDict(from_attributes=True)


class FacultyIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    designation: str = Field(min_length=2, max_length=120)
    specialization: str = Field(min_length=2, max_length=240)
    publications: int = Field(ge=0, le=500)
    experience_years: int = Field(ge=0, le=50)
    photo_url: str = Field(default="", max_length=400)


class FacultyOut(FacultyIn):
    id: int

    model_config = ConfigDict(from_attributes=True)


class LabIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    description: str = Field(min_length=10, max_length=2000)
    photo_url: str = Field(default="", max_length=400)


class LabOut(LabIn):
    id: int

    model_config = ConfigDict(from_attributes=True)


class PlacementIn(BaseModel):
    company: str = Field(min_length=2, max_length=160)
    job_role: str = Field(min_length=2, max_length=160)
    year: int
    offers_count: int = Field(ge=0, le=500)
    package_lpa: float = Field(ge=0, le=100)

    @field_validator("year")
    @classmethod
    def check_year(cls, value: int) -> int:
        return validate_year(value)


class PlacementOut(PlacementIn):
    id: int

    model_config = ConfigDict(from_attributes=True)


class FeedbackIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    kind: Literal["inquiry", "feedback"]
    subject: str = Field(min_length=3, max_length=200)
    message: str = Field(min_length=10, max_length=4000)


class FeedbackOut(FeedbackIn):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SearchResponse(BaseModel):
    students: list[StudentOut] = Field(default_factory=list)
    projects: list[ProjectOut] = Field(default_factory=list)
    milestones: list[MilestoneOut] = Field(default_factory=list)
    faculty: list[FacultyOut] = Field(default_factory=list)
    placements: list[PlacementOut] = Field(default_factory=list)


class DashboardStats(BaseModel):
    students: int
    alumni: int
    projects: int
    milestones: int
    faculty: int
    labs: int
    placements: int
    feedback: int
    total_offers: int
    highest_package: float
    recent_students: list[StudentOut]
    recent_feedback: list[FeedbackOut]


class PlacementReportRow(BaseModel):
    year: int
    companies: int
    offers: int
    highest_package: float
    average_package: float


class StudentReportRow(BaseModel):
    batch_year: int
    total: int
    alumni: int
    students: int


class ReportsResponse(BaseModel):
    placements_by_year: list[PlacementReportRow]
    students_by_batch: list[StudentReportRow]
    top_recruiters: list[PlacementOut]
