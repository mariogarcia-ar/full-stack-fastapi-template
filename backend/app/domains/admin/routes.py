from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from app.common.deps import SessionDep
from app.core.security import get_password_hash
from app.domains.users.models import User
from app.domains.users.schemas import UserPublic

router = APIRouter(tags=["private"], prefix="/private")


class PrivateUserCreate(BaseModel):
    """Schema for private user creation (debug only)."""

    email: str
    password: str
    full_name: str
    is_verified: bool = False


@router.post("/users/", response_model=UserPublic)
def create_user(user_in: PrivateUserCreate, session: SessionDep) -> Any:
    """Create a new user (private/debug endpoint)."""
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
    )

    session.add(user)
    session.commit()

    return user
