"""Create the first admin user. Run once:  python -m app.seed_admin"""
from sqlalchemy import select

from .config import settings
from .database import Base, SessionLocal, engine
from .models import User, UserRole
from .security import hash_password


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        email = settings.admin_email.lower()
        if db.scalar(select(User).where(User.email == email)):
            print(f"Admin already exists: {email}")
            return
        db.add(
            User(
                name=settings.admin_name,
                email=email,
                password_hash=hash_password(settings.admin_password),
                role=UserRole.admin,
            )
        )
        db.commit()
        print(f"Admin created: {email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
