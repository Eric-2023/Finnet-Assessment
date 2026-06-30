"""
Pydantic schemas — request/response shapes for the API.

Design decision: Company and Address are represented as nested schemas
in the response (matching the spec's `company.name`, `address.city`,
`address.street` shape) even though they're flat columns in the DB.
`from_attributes` config plus small property-style accessors keep the
ORM model simple while the API contract stays exactly what's required.
"""
from pydantic import BaseModel, Field, field_validator


class Company(BaseModel):
    name: str


class Address(BaseModel):
    city: str
    street: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    company: Company
    address: Address

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_user(cls, user) -> "UserOut":
        return cls(
            id=user.id,
            name=user.name,
            email=user.email,
            company=Company(name=user.company_name),
            address=Address(city=user.address_city, street=user.address_street),
        )


class PostOut(BaseModel):
    id: int
    title: str
    body: str
    userId: int

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_post(cls, post) -> "PostOut":
        return cls(id=post.id, title=post.title, body=post.body, userId=post.user_id)


class PostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=5000)

    @field_validator("title", "body")
    @classmethod
    def not_blank(cls, v: str) -> str:
        # Catches whitespace-only input ("   ") that min_length alone
        # would let through, per the spec's "empty fields" validation requirement.
        if not v.strip():
            raise ValueError("must not be blank")
        return v.strip()
