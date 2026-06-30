"""
Database engine and session configuration.

Design decision: SQLite for the assessment. It requires zero setup (no
external DB server to provision), ships as a single file that's trivial
to seed/reset, and is more than sufficient for the read/write patterns
this app needs. Trade-off: SQLite doesn't handle concurrent writes well
at scale, so a production version of this app would move to Postgres
(the codebase uses SQLAlchemy ORM throughout specifically so that swap
is a one-line connection string change, not a rewrite).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./finnet.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # check_same_thread is needed only for SQLite, since FastAPI may use
    # the same session across different threads for a single request.
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and guarantees closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
