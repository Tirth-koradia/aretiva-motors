"""Authentication request and response schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from aretiva.db.models.user import UserRole


class RegistrationRequest(BaseModel):
    """Fields accepted by public customer registration."""

    model_config = ConfigDict(extra="forbid")

    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str) -> str:
        """Trim surrounding and repeated whitespace."""
        return " ".join(value.split())

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        """Store email addresses using a stable case-insensitive representation."""
        return str(value).strip().casefold()


class UserResponse(BaseModel):
    """Safe public representation of a user account."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: EmailStr
    role: UserRole
    created_at: datetime
