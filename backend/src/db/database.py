from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Use SQLite for local development, or DATABASE_URL env var for production
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./snake.db")

# Some hosts (Render, Heroku) hand out "postgres://" URLs, which SQLAlchemy 2.x
# no longer accepts — normalize to the "postgresql://" scheme it expects.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# check_same_thread is needed for SQLite only
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(
    DATABASE_URL, connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
