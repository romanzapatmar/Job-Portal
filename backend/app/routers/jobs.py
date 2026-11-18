from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import require_admin
from ..models import Application, ApplicationStatus, Job, JobStatus, JobType, User
from ..schemas import AdminJobOut, JobIn, JobOut, StatsOut

public_router = APIRouter(prefix="/api/jobs", tags=["jobs"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin"])


def _get_job_or_404(db: Session, job_id: int) -> Job:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


# ---------------------------------------------------------------- public
@public_router.get("", response_model=list[JobOut])
def list_jobs(
    search: str | None = None,
    location: str | None = None,
    job_type: JobType | None = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    stmt = select(Job).where(Job.status == JobStatus.open)
    if search and search.strip():
        term = f"%{search.strip()}%"
        stmt = stmt.where(or_(Job.title.ilike(term), Job.description.ilike(term)))
    if location and location.strip():
        stmt = stmt.where(Job.location.ilike(f"%{location.strip()}%"))
    if job_type:
        stmt = stmt.where(Job.job_type == job_type)
    stmt = stmt.order_by(Job.created_at.desc()).limit(limit).offset(offset)
    return db.scalars(stmt).all()


@public_router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    return _get_job_or_404(db, job_id)


# ----------------------------------------------------------------- admin
@admin_router.get("/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    def count_apps(*conditions):
        return db.scalar(select(func.count(Application.id)).where(*conditions)) or 0

    return StatsOut(
        open_jobs=db.scalar(select(func.count(Job.id)).where(Job.status == JobStatus.open)) or 0,
        total_applications=count_apps(),
        new_applications=count_apps(Application.status == ApplicationStatus.applied),
        shortlisted=count_apps(Application.status == ApplicationStatus.shortlisted),
    )


@admin_router.get("/jobs", response_model=list[AdminJobOut])
def admin_list_jobs(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = db.execute(
        select(Job, func.count(Application.id))
        .outerjoin(Application, Application.job_id == Job.id)
        .group_by(Job.id)
        .order_by(Job.created_at.desc())
    ).all()

    result = []
    for job, count in rows:
        item = AdminJobOut.model_validate(job)
        item.applications_count = count
        result.append(item)
    return result


@admin_router.post("/jobs", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def create_job(data: JobIn, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    job = Job(**data.model_dump(), created_by=admin.id)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@admin_router.put("/jobs/{job_id}", response_model=JobOut)
def update_job(
    job_id: int,
    data: JobIn,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    job = _get_job_or_404(db, job_id)
    for field, value in data.model_dump().items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return job


@admin_router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    _get_job_or_404(db, job_id)
    db.execute(delete(Job).where(Job.id == job_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)