"""Common schemas shared across domains."""

from typing import Generic, TypeVar

from sqlmodel import SQLModel

T = TypeVar("T")


class Message(SQLModel):
    """Generic message response schema."""

    message: str


class PaginatedResponse(SQLModel, Generic[T]):
    """Generic paginated response for list endpoints.

    Provides consistent pagination structure across all domains.

    Example:
        @router.get("/", response_model=PaginatedResponse[UserPublic])
        def read_users(session: SessionDep, skip: int = 0, limit: int = 100):
            users = user_service.get_multi(session, skip=skip, limit=limit)
            count = user_service.count(session)
            return PaginatedResponse(data=users, count=count, skip=skip, limit=limit)
    """

    data: list[T]
    count: int
    skip: int = 0
    limit: int = 100
