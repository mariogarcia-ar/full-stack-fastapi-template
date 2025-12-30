"""Generic base service class for common CRUD operations."""

from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlmodel import Session, SQLModel, func, select

ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=SQLModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=SQLModel)


class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Generic CRUD operations reusable across domains.

    Provides standard get, get_multi, count, create, update, and delete operations.
    Extend this class and override methods for domain-specific behavior.

    Example:
        class ItemService(BaseService[Item, ItemCreate, ItemUpdate]):
            def __init__(self):
                super().__init__(Item)

            def get_by_owner(self, session: Session, owner_id: UUID) -> list[Item]:
                statement = select(Item).where(Item.owner_id == owner_id)
                return list(session.exec(statement).all())

        item_service = ItemService()
    """

    def __init__(self, model: type[ModelType]):
        """Initialize service with model class.

        Args:
            model: The SQLModel class this service manages.
        """
        self.model = model

    def get(self, session: Session, id: UUID) -> ModelType | None:
        """Get a single record by ID.

        Args:
            session: Database session.
            id: Record UUID.

        Returns:
            Model instance or None if not found.
        """
        return session.get(self.model, id)

    def get_multi(
        self, session: Session, *, skip: int = 0, limit: int = 100
    ) -> list[ModelType]:
        """Get multiple records with pagination.

        Args:
            session: Database session.
            skip: Number of records to skip.
            limit: Maximum records to return.

        Returns:
            List of model instances.
        """
        statement = select(self.model).offset(skip).limit(limit)
        return list(session.exec(statement).all())

    def count(self, session: Session) -> int:
        """Count total records.

        Args:
            session: Database session.

        Returns:
            Total count of records.
        """
        statement = select(func.count()).select_from(self.model)
        return session.exec(statement).one()

    def create(
        self, session: Session, *, obj_in: CreateSchemaType, **extra_fields: Any
    ) -> ModelType:
        """Create a new record.

        Args:
            session: Database session.
            obj_in: Creation schema with input data.
            **extra_fields: Additional fields to set on the model.

        Returns:
            Created model instance.
        """
        db_obj = self.model.model_validate(obj_in, update=extra_fields)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def update(
        self,
        session: Session,
        *,
        db_obj: ModelType,
        obj_in: UpdateSchemaType,
        **extra_fields: Any,
    ) -> ModelType:
        """Update an existing record.

        Args:
            session: Database session.
            db_obj: Existing model instance to update.
            obj_in: Update schema with new data.
            **extra_fields: Additional fields to update.

        Returns:
            Updated model instance.
        """
        update_data = obj_in.model_dump(exclude_unset=True)
        db_obj.sqlmodel_update(update_data, update=extra_fields)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def delete(self, session: Session, *, db_obj: ModelType) -> None:
        """Delete a record.

        Args:
            session: Database session.
            db_obj: Model instance to delete.
        """
        session.delete(db_obj)
        session.commit()

    def delete_by_id(self, session: Session, *, id: UUID) -> bool:
        """Delete a record by ID.

        Args:
            session: Database session.
            id: Record UUID.

        Returns:
            True if deleted, False if not found.
        """
        obj = self.get(session, id)
        if obj:
            self.delete(session, db_obj=obj)
            return True
        return False
