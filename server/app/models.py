"""
ORM models for User and Post.

Design decision: company and address are modeled as flat columns
(company_name, address_city, address_street) rather than separate
related tables. The spec only ever needs these as read-only fields
attached to a user — there's no independent lifecycle for "company" or
"address" (no querying companies on their own, no reuse across users).
Normalizing them into their own tables would add joins and complexity
with no corresponding benefit at this scope. Pydantic schemas reshape
these flat columns back into nested company/address objects on the way
out, so the API surface matches the spec exactly.
"""
from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    company_name = Column(String, nullable=False)
    address_city = Column(String, nullable=False)
    address_street = Column(String, nullable=False)

    posts = relationship(
        "Post", back_populates="author", cascade="all, delete-orphan"
    )


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    author = relationship("User", back_populates="posts")
