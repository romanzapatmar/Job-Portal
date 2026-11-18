from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import ApplicationStatus, JobStatus, JobType, UserRole


# ---------- auth ----------
class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    phone: str | None = Field(default=None, max_length=20)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    role: UserRole


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- jobs ----------
class JobIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10)
    location: str = Field(min_length=2, max_length=120)
    job_type: JobType = JobType.full_time
    salary_range: str | None = Field(default=None, max_length=80)
    status: JobStatus = JobStatus.open


class JobOut(JobIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class AdminJobOut(JobOut):
    applications_count: int = 0


class StatsOut(BaseModel):
    open_jobs: int
    total_applications: int
    new_applications: int
    shortlisted: int


# ---------- candidate profile ----------
class ProfileIn(BaseModel):
    phone: str | None = Field(default=None, max_length=20)
    skills: str | None = Field(default=None, max_length=1000)
    experience_years: int | None = Field(default=None, ge=0, le=60)
    education: str | None = Field(default=None, max_length=2000)


class ProfileOut(ProfileIn):
    model_config = ConfigDict(from_attributes=True)


# ---------- applications ----------
class ApplicationCreatedOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    status: ApplicationStatus


class HistoryOut(BaseModel):
    status: ApplicationStatus
    changed_at: datetime


class MyApplicationOut(BaseModel):
    id: int
    job_id: int
    job_title: str
    status: ApplicationStatus
    applied_at: datetime
    history: list[HistoryOut]


class ApplicantOut(BaseModel):
    id: int
    candidate_name: str
    candidate_email: EmailStr
    candidate_phone: str | None = None
    skills: str | None = None
    experience_years: int | None = None
    cover_note: str | None = None
    status: ApplicationStatus
    applied_at: datetime


class StatusUpdateIn(BaseModel):
    status: ApplicationStatus