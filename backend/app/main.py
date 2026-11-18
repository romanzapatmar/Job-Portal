from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import admin_applications, auth, candidate, jobs

# Phase 1: create tables directly. We'll switch to Alembic migrations later.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Job Portal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jobs.public_router)
app.include_router(jobs.admin_router)
app.include_router(candidate.router)
app.include_router(admin_applications.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}