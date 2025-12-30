"""Item domain API routes."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends

from app.common.auth import require_owner_or_superuser
from app.common.deps import SessionDep, get_or_404
from app.common.schemas import Message
from app.domains.items.models import Item
from app.domains.items.schemas import ItemCreate, ItemPublic, ItemsPublic, ItemUpdate
from app.domains.items.service import item_service
from app.domains.users.deps import CurrentUser

router = APIRouter(prefix="/items", tags=["items"])

# Dependency for getting item by ID or 404
ItemDep = Annotated[Item, Depends(get_or_404(Item))]


@router.get("/", response_model=ItemsPublic)
def read_items(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """Retrieve items. Superusers see all, others see only their own."""
    if current_user.is_superuser:
        count = item_service.count(session)
        items = item_service.get_multi(session, skip=skip, limit=limit)
    else:
        count = item_service.count_by_owner(session, current_user.id)
        items = item_service.get_by_owner(
            session, current_user.id, skip=skip, limit=limit
        )

    return ItemsPublic(data=items, count=count)


@router.get("/{id}", response_model=ItemPublic)
def read_item(item: ItemDep, current_user: CurrentUser) -> Any:
    """Get item by ID."""
    require_owner_or_superuser(item.owner_id, current_user)
    return item


@router.post("/", response_model=ItemPublic)
def create_item(
    *, session: SessionDep, current_user: CurrentUser, item_in: ItemCreate
) -> Any:
    """Create new item."""
    return item_service.create_with_owner(
        session, item_in=item_in, owner_id=current_user.id
    )


@router.put("/{id}", response_model=ItemPublic)
def update_item(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    item: ItemDep,
    item_in: ItemUpdate,
) -> Any:
    """Update an item."""
    require_owner_or_superuser(item.owner_id, current_user)
    return item_service.update(session, db_obj=item, obj_in=item_in)


@router.delete("/{id}")
def delete_item(session: SessionDep, current_user: CurrentUser, item: ItemDep) -> Message:
    """Delete an item."""
    require_owner_or_superuser(item.owner_id, current_user)
    item_service.delete(session, db_obj=item)
    return Message(message="Item deleted successfully")
