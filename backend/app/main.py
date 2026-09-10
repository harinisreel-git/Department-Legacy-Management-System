from __future__ import annotations

from pathlib import Path
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import case, func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .auth import create_access_token, get_current_user, verify_password
from .database import get_db
from .models import Faculty, Feedback, Lab, Milestone, Placement, Project, Student, User
from .schemas import (
    DashboardStats,
    FacultyIn,
    FacultyOut,
    FeedbackIn,
    FeedbackOut,
    LabIn,
    LabOut,
    LoginRequest,
    MilestoneIn,
    MilestoneOut,
    PlacementIn,
    PlacementOut,
    PlacementReportRow,
    ProjectIn,
    ProjectOut,
    ReportsResponse,
    SearchResponse,
    StudentIn,
    StudentOut,
    StudentReportRow,
    TokenResponse,
    UserOut,
)
from . import bootstrap  # noqa: F401

app = FastAPI(title="Department Legacy Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def commit_or_409(db: Session, message: str) -> None:
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=message) from exc


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username.strip()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = create_access_token(user.username)
    return TokenResponse(access_token=token, full_name=user.full_name, username=user.username)


@app.get("/api/auth/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)):
    return current


def student_filters(query, q: Optional[str], batch_year: Optional[int]):
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Student.name.ilike(like),
                Student.roll_no.ilike(like),
                Student.current_company.ilike(like),
                Student.job_role.ilike(like),
                Student.career_notes.ilike(like),
            )
        )
    if batch_year:
        query = query.filter(Student.batch_year == batch_year)
    return query


@app.get("/api/students", response_model=List[StudentOut])
def list_students(
    q: Optional[str] = None,
    batch_year: Optional[int] = Query(default=None, ge=1980),
    db: Session = Depends(get_db),
):
    query = student_filters(db.query(Student), q, batch_year)
    return query.order_by(Student.batch_year.desc(), Student.name.asc()).all()


@app.get("/api/students/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@app.post("/api/students", response_model=StudentOut, status_code=201)
def create_student(payload: StudentIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    student = Student(**payload.model_dump())
    db.add(student)
    commit_or_409(db, "Roll number already exists")
    db.refresh(student)
    return student


@app.put("/api/students/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    payload: StudentIn,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in payload.model_dump().items():
        setattr(student, key, value)
    commit_or_409(db, "Roll number already exists")
    db.refresh(student)
    return student


@app.delete("/api/students/{student_id}", status_code=204)
def delete_student(student_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return None


@app.get("/api/projects", response_model=List[ProjectOut])
def list_projects(q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Project)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(Project.title.ilike(like), Project.authors.ilike(like), Project.technologies.ilike(like), Project.description.ilike(like))
        )
    return query.order_by(Project.year.desc(), Project.title.asc()).all()


@app.post("/api/projects", response_model=ProjectOut, status_code=201)
def create_project(payload: ProjectIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Project(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/projects/{item_id}", response_model=ProjectOut)
def update_project(item_id: int, payload: ProjectIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Project).filter(Project.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/projects/{item_id}", status_code=204)
def delete_project(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Project).filter(Project.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(item)
    db.commit()
    return None


@app.get("/api/milestones", response_model=List[MilestoneOut])
def list_milestones(db: Session = Depends(get_db)):
    return db.query(Milestone).order_by(Milestone.year.asc()).all()


@app.post("/api/milestones", response_model=MilestoneOut, status_code=201)
def create_milestone(payload: MilestoneIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Milestone(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/milestones/{item_id}", response_model=MilestoneOut)
def update_milestone(item_id: int, payload: MilestoneIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Milestone).filter(Milestone.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Milestone not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/milestones/{item_id}", status_code=204)
def delete_milestone(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Milestone).filter(Milestone.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Milestone not found")
    db.delete(item)
    db.commit()
    return None


@app.get("/api/faculty", response_model=List[FacultyOut])
def list_faculty(q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Faculty)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(Faculty.name.ilike(like), Faculty.specialization.ilike(like), Faculty.designation.ilike(like)))
    return query.order_by(Faculty.name.asc()).all()


@app.post("/api/faculty", response_model=FacultyOut, status_code=201)
def create_faculty(payload: FacultyIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Faculty(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/faculty/{item_id}", response_model=FacultyOut)
def update_faculty(item_id: int, payload: FacultyIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Faculty).filter(Faculty.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Faculty not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/faculty/{item_id}", status_code=204)
def delete_faculty(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Faculty).filter(Faculty.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Faculty not found")
    db.delete(item)
    db.commit()
    return None


@app.get("/api/labs", response_model=List[LabOut])
def list_labs(db: Session = Depends(get_db)):
    return db.query(Lab).order_by(Lab.name.asc()).all()


@app.post("/api/labs", response_model=LabOut, status_code=201)
def create_lab(payload: LabIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Lab(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/labs/{item_id}", response_model=LabOut)
def update_lab(item_id: int, payload: LabIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Lab).filter(Lab.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lab not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/labs/{item_id}", status_code=204)
def delete_lab(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Lab).filter(Lab.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lab not found")
    db.delete(item)
    db.commit()
    return None


@app.get("/api/placements", response_model=List[PlacementOut])
def list_placements(q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Placement)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(Placement.company.ilike(like), Placement.job_role.ilike(like)))
    return query.order_by(Placement.year.desc(), Placement.package_lpa.desc()).all()


@app.post("/api/placements", response_model=PlacementOut, status_code=201)
def create_placement(payload: PlacementIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = Placement(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put("/api/placements/{item_id}", response_model=PlacementOut)
def update_placement(item_id: int, payload: PlacementIn, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Placement).filter(Placement.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Placement not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/api/placements/{item_id}", status_code=204)
def delete_placement(item_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    item = db.query(Placement).filter(Placement.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Placement not found")
    db.delete(item)
    db.commit()
    return None


@app.post("/api/feedback", response_model=FeedbackOut, status_code=201)
def create_feedback(payload: FeedbackIn, db: Session = Depends(get_db)):
    item = Feedback(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.get("/api/feedback", response_model=List[FeedbackOut])
def list_feedback(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()


@app.get("/api/search", response_model=SearchResponse)
def public_search(q: str = Query(..., min_length=1, max_length=80), db: Session = Depends(get_db)):
    like = f"%{q.strip()}%"
    students = (
        db.query(Student)
        .filter(
            or_(
                Student.name.ilike(like),
                Student.roll_no.ilike(like),
                Student.current_company.ilike(like),
                Student.job_role.ilike(like),
                Student.career_notes.ilike(like),
            )
        )
        .limit(20)
        .all()
    )
    projects = (
        db.query(Project)
        .filter(or_(Project.title.ilike(like), Project.authors.ilike(like), Project.technologies.ilike(like), Project.description.ilike(like)))
        .limit(20)
        .all()
    )
    milestones = (
        db.query(Milestone)
        .filter(or_(Milestone.title.ilike(like), Milestone.description.ilike(like), Milestone.category.ilike(like)))
        .limit(20)
        .all()
    )
    faculty = (
        db.query(Faculty)
        .filter(or_(Faculty.name.ilike(like), Faculty.specialization.ilike(like), Faculty.designation.ilike(like)))
        .limit(20)
        .all()
    )
    placements = (
        db.query(Placement)
        .filter(or_(Placement.company.ilike(like), Placement.job_role.ilike(like)))
        .limit(20)
        .all()
    )
    return SearchResponse(students=students, projects=projects, milestones=milestones, faculty=faculty, placements=placements)


@app.get("/api/dashboard", response_model=DashboardStats)
def dashboard(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_offers = db.query(func.coalesce(func.sum(Placement.offers_count), 0)).scalar() or 0
    highest = db.query(func.coalesce(func.max(Placement.package_lpa), 0.0)).scalar() or 0.0
    return DashboardStats(
        students=db.query(Student).count(),
        alumni=db.query(Student).filter(Student.status == "alumni").count(),
        projects=db.query(Project).count(),
        milestones=db.query(Milestone).count(),
        faculty=db.query(Faculty).count(),
        labs=db.query(Lab).count(),
        placements=db.query(Placement).count(),
        feedback=db.query(Feedback).count(),
        total_offers=int(total_offers),
        highest_package=float(highest),
        recent_students=db.query(Student).order_by(Student.id.desc()).limit(5).all(),
        recent_feedback=db.query(Feedback).order_by(Feedback.created_at.desc()).limit(5).all(),
    )


@app.get("/api/reports", response_model=ReportsResponse)
def reports(_: User = Depends(get_current_user), db: Session = Depends(get_db)):
    placement_rows = (
        db.query(
            Placement.year,
            func.count(Placement.id),
            func.sum(Placement.offers_count),
            func.max(Placement.package_lpa),
            func.avg(Placement.package_lpa),
        )
        .group_by(Placement.year)
        .order_by(Placement.year.desc())
        .all()
    )
    student_rows = (
        db.query(
            Student.batch_year,
            func.count(Student.id),
            func.sum(case((Student.status == "alumni", 1), else_=0)),
            func.sum(case((Student.status == "student", 1), else_=0)),
        )
        .group_by(Student.batch_year)
        .order_by(Student.batch_year.desc())
        .all()
    )
    top = db.query(Placement).order_by(Placement.package_lpa.desc(), Placement.offers_count.desc()).limit(8).all()
    return ReportsResponse(
        placements_by_year=[
            PlacementReportRow(
                year=row[0],
                companies=int(row[1] or 0),
                offers=int(row[2] or 0),
                highest_package=float(row[3] or 0),
                average_package=round(float(row[4] or 0), 2),
            )
            for row in placement_rows
        ],
        students_by_batch=[
            StudentReportRow(
                batch_year=row[0],
                total=int(row[1] or 0),
                alumni=int(row[2] or 0),
                students=int(row[3] or 0),
            )
            for row in student_rows
        ],
        top_recruiters=top,
    )


FRONTEND_DIR = Path(__file__).resolve().parents[2] / "Frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
