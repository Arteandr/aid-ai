from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from src.config import get_config

config = get_config()
engine_sync = create_engine(config.db_url, echo=True)

SessionLocal = sessionmaker(
    bind=engine_sync, autocommit=False, autoflush=False, class_=Session
)


def get_sync_db(request: Request) -> Session:
    session = request.state.db
    return session


DbSession = Annotated[Session, Depends(get_sync_db)]
