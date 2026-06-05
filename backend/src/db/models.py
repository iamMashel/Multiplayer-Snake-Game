from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from .database import Base
from ..models import GameMode

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    scores = relationship("Score", back_populates="user")

class Score(Base):
    __tablename__ = "scores"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    mode = Column(String, nullable=False)  # Storing Enum as string
    # Daily-challenge date (UTC, "YYYY-MM-DD") for daily runs; NULL for normal games
    challenge_id = Column(String, nullable=True, index=True)
    played_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="scores")
