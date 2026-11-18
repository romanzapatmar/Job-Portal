import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import require_candidate
from ..models import (
    Application,
    ApplicationStatus,
    ApplicationStatusHistory,
    CandidateProfile,
    Job,
    JobStatus,
    User,
)
from ..schemas import (
    ApplicationCreatedOut,
    HistoryOut,
    MyApplicationOut,
    ProfileIn,
    ProfileOut,
)

router = APIRouter(prefix="/api", tags=["candidate"])

# backend/uploads/resumes  (resumes are stored under random names, never the user's file name)
UPLOAD_ROOT = Path(__file__).resolve().parents[2] / "uploads"
RESUME_DIR = UPLOAD_ROOT / "resumes"
RESUME_DIR.mkdir(parents=True, exist_ok=True)

MAX_RESUME_BYTES = 5 * 1024 * 1024
MAX_COVER_NOTE_CHARS = 2000


def _get_or_create_profile(db: Session, user: User) -> CandidateProfile:
    profile = db.scalar(select(CandidateProfile).where(CandidateProfile.user_id == user.id))
    if profile is None:
        profile = CandidateProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


# --------------------------------------------------------------- profile
@router.get("/candidate/profile", response_model=ProfileOut)
def get_profile(user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    return _get_or_create_profile(db, user)


@router.put("/candidate/profile", response_model=ProfileOut)
def update_profile(
    data: ProfileIn,
    user: User = Depends(require_candidate),
    db: Session = Depends(get_db),
):
    profile = _get_or_create_profile(db, user)
    for field, value in data.model_dump().items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


# ---------------------------------------------------------- applications
@router.post("/applications", response_model=ApplicationCreatedOut, status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    job_id: int = Form(...),
    cover_note: str = Form(""),
    resume: UploadFile = File(...),
    user: User = Depends(require_candidate),
    db: Session = Depends(get_db),
):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != JobStatus.open:
        raise HTTPException(status_code=400, detail="This job is closed")

    already = db.scalar(
        select(Application.id).where(Application.job_id == job_id, Application.candidate_id == user.id)
    )
    if already:
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    if len(cover_note) > MAX_COVER_NOTE_CHARS:
        raise HTTPException(status_code=400, detail=f"Cover note must be under {MAX_COVER_NOTE_CHARS} characters")

    content = await resume.read(MAX_RESUME_BYTES + 1)
    if len(content) > MAX_RESUME_BYTES:
        raise HTTPException(status_code=400, detail="Resume must be under 5 MB")
    if not content.startswith(b"%PDF"):
        raise HTTPException(status_code=400, detail="Resume must be a valid PDF file")

    filename = f"{uuid.uuid4().hex}.pdf"
    (RESUME_DIR / filename).write_bytes(content)

    application = Application(
        job_id=job.id,
        candidate_id=user.id,
        resume_path=f"resumes/{filename}",
        cover_note=cover_note.strip() or None,
        status=ApplicationStatus.applied,
    )
    application.history.append(
        ApplicationStatusHistory(status=ApplicationStatus.applied, changed_by=user.id)
    )
    db.add(application)
    try:
        db.commit()
    except IntegrityError:  # two quick clicks: the unique (job, candidate) constraint caught it
        db.rollback()
        (RESUME_DIR / filename).unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    db.refresh(application)
    return application


@router.get("/applications/me", response_model=list[MyApplicationOut])
def my_applications(user: User = Depends(require_candidate), db: Session = Depends(get_db)):
    apps = db.scalars(
        select(Application)
        .options(selectinload(Application.job), selectinload(Application.history))
        .where(Application.candidate_id == user.id)
        .order_by(Application.applied_at.desc())
    ).all()

    return [
        MyApplicationOut(
            id=a.id,
            job_id=a.job_id,
            job_title=a.job.title,
            status=a.status,
            applied_at=a.applied_at,
            history=[
                HistoryOut(status=h.status, changed_at=h.changed_at)
                for h in sorted(a.history, key=lambda h: (h.changed_at, h.id))
            ],
        )
        for a in apps
    ]