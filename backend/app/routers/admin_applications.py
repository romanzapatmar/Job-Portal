from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..deps import require_admin
from ..models import Application, ApplicationStatusHistory, Job, User
from ..schemas import ApplicantOut, ApplicationCreatedOut, StatusUpdateIn
from .candidate import UPLOAD_ROOT

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _get_application_or_404(db: Session, application_id: int) -> Application:
    application = db.get(Application, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.get("/jobs/{job_id}/applications", response_model=list[ApplicantOut])
def job_applicants(job_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if db.get(Job, job_id) is None:
        raise HTTPException(status_code=404, detail="Job not found")

    apps = db.scalars(
        select(Application)
        .options(joinedload(Application.candidate).joinedload(User.profile))
        .where(Application.job_id == job_id)
        .order_by(Application.applied_at.desc())
    ).all()

    result = []
    for a in apps:
        profile = a.candidate.profile
        result.append(
            ApplicantOut(
                id=a.id,
                candidate_name=a.candidate.name,
                candidate_email=a.candidate.email,
                candidate_phone=profile.phone if profile else None,
                skills=profile.skills if profile else None,
                experience_years=profile.experience_years if profile else None,
                cover_note=a.cover_note,
                status=a.status,
                applied_at=a.applied_at,
            )
        )
    return result


@router.patch("/applications/{application_id}/status", response_model=ApplicationCreatedOut)
def update_status(
    application_id: int,
    data: StatusUpdateIn,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    application = _get_application_or_404(db, application_id)
    if application.status != data.status:
        application.status = data.status
        db.add(
            ApplicationStatusHistory(
                application_id=application.id, status=data.status, changed_by=admin.id
            )
        )
        db.commit()
        db.refresh(application)
    return application


@router.get("/applications/{application_id}/resume")
def download_resume(
    application_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    application = _get_application_or_404(db, application_id)
    path = (UPLOAD_ROOT / application.resume_path).resolve()
    # make sure the stored path can never point outside the uploads folder
    if UPLOAD_ROOT.resolve() not in path.parents or not path.is_file():
        raise HTTPException(status_code=404, detail="Resume file not found")
    return FileResponse(path, media_type="application/pdf", filename=f"resume-{application.id}.pdf")