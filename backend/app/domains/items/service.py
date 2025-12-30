"""Item domain service with business logic."""

from uuid import UUID

from sqlmodel import Session, func, select

from app.common.base_service import BaseService
from app.domains.items.models import Item
from app.domains.items.schemas import ItemCreate, ItemUpdate


class ItemService(BaseService[Item, ItemCreate, ItemUpdate]):
    """Item service extending BaseService with domain-specific methods."""

    def __init__(self):
        super().__init__(Item)

    def get_by_owner(
        self, session: Session, owner_id: UUID, *, skip: int = 0, limit: int = 100
    ) -> list[Item]:
        """Get items owned by a specific user.

        Args:
            session: Database session.
            owner_id: Owner's UUID.
            skip: Number of records to skip.
            limit: Maximum records to return.

        Returns:
            List of items owned by the user.
        """
        statement = (
            select(Item).where(Item.owner_id == owner_id).offset(skip).limit(limit)
        )
        return list(session.exec(statement).all())

    def count_by_owner(self, session: Session, owner_id: UUID) -> int:
        """Count items owned by a specific user.

        Args:
            session: Database session.
            owner_id: Owner's UUID.

        Returns:
            Count of items owned by the user.
        """
        statement = (
            select(func.count()).select_from(Item).where(Item.owner_id == owner_id)
        )
        return session.exec(statement).one()

    def create_with_owner(
        self, session: Session, *, item_in: ItemCreate, owner_id: UUID
    ) -> Item:
        """Create an item with an owner.

        Args:
            session: Database session.
            item_in: Item creation data.
            owner_id: Owner's UUID.

        Returns:
            Created item.
        """
        return self.create(session, obj_in=item_in, owner_id=owner_id)


# Singleton instance for use across the application
item_service = ItemService()
