from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database.core import DbSession
from .models import User

def get_user_by_email(db: DbSession, email: str):
    return db.query(User).filter(User.email == email).one_or_none()

def create(db: DbSession, email: str, hashed_password: str):
    user = User(email=email,password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
