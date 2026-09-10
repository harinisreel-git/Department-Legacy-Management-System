from .database import Base, SessionLocal, engine
from .models import Faculty, Feedback, Lab, Milestone, Placement, Project, Student, User  # noqa: F401
from .seed import seed_if_empty

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed_if_empty(db)
finally:
    db.close()
