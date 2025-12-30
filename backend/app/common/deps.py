"""Common dependencies shared across domains."""

from collections.abc import Generator
from typing import Annotated, TypeVar
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlmodel import Session, SQLModel

from app.core.db import engine

ModelType = TypeVar("ModelType", bound=SQLModel)


def get_db() -> Generator[Session, None, None]:
    """Database session dependency."""
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]


def get_or_404(model: type[ModelType]):
    """Factory for 'get resource or 404' dependencies.

    Creates a dependency that fetches a model by ID or raises 404.
    FastAPI automatically maps the path parameter to the function parameter.

    Args:
        model: The SQLModel class to fetch.

    Returns:
        A dependency function that returns the model instance.

    Example:
        from app.common.deps import get_or_404
        from .models import Item

        ItemDep = Annotated[Item, Depends(get_or_404(Item))]

        @router.get("/{id}")
        def read_item(item: ItemDep, current_user: CurrentUser):
            return item
    """

    def _get_or_404(id: UUID, session: SessionDep) -> ModelType:
        obj = session.get(model, id)
        if not obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{model.__name__} not found",
            )
        return obj

    return _get_or_404
