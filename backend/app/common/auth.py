"""Reusable authorization helpers for route handlers."""

from typing import Protocol
from uuid import UUID

from fastapi import HTTPException, status


class HasId(Protocol):
    """Protocol for objects with an id attribute."""

    id: UUID


class HasSuperuser(Protocol):
    """Protocol for objects with superuser and id attributes."""

    is_superuser: bool
    id: UUID


def require_owner_or_superuser(
    resource_owner_id: UUID,
    current_user: HasSuperuser,
    detail: str = "Not enough permissions",
    status_code: int = status.HTTP_400_BAD_REQUEST,
) -> None:
    """Check if user owns the resource or is a superuser.

    Args:
        resource_owner_id: UUID of the resource owner.
        current_user: Current authenticated user.
        detail: Error message if check fails.
        status_code: HTTP status code to return on failure (default 400).

    Raises:
        HTTPException: With specified status_code if user doesn't own resource
            and isn't superuser.

    Example:
        @router.get("/{id}")
        def read_item(item: ItemDep, current_user: CurrentUser):
            require_owner_or_superuser(item.owner_id, current_user)
            return item
    """
    if not current_user.is_superuser and resource_owner_id != current_user.id:
        raise HTTPException(
            status_code=status_code,
            detail=detail,
        )


def require_superuser(
    current_user: HasSuperuser,
    detail: str = "The user doesn't have enough privileges",
) -> None:
    """Check if user is a superuser.

    Args:
        current_user: Current authenticated user.
        detail: Error message if check fails.

    Raises:
        HTTPException: 403 if user is not a superuser.

    Example:
        @router.post("/admin-only")
        def admin_action(current_user: CurrentUser):
            require_superuser(current_user)
            # ... admin-only logic
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


def require_not_self(
    target_user_id: UUID,
    current_user: HasId,
    detail: str = "Cannot perform this action on yourself",
) -> None:
    """Prevent user from performing action on themselves.

    Args:
        target_user_id: UUID of the target user.
        current_user: Current authenticated user.
        detail: Error message if check fails.

    Raises:
        HTTPException: 403 if target is the current user.

    Example:
        @router.delete("/{user_id}")
        def delete_user(user_id: UUID, current_user: CurrentUser):
            require_not_self(user_id, current_user, "Cannot delete yourself")
            # ... delete logic
    """
    if target_user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


def require_active(
    is_active: bool,
    detail: str = "Inactive user",
) -> None:
    """Check if user/resource is active.

    Args:
        is_active: Active status flag.
        detail: Error message if check fails.

    Raises:
        HTTPException: 400 if not active.
    """
    if not is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )
