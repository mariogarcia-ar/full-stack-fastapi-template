# Backend Reusability Recommendations

## Overview

This document outlines recommendations for improving component reusability in the FastAPI backend following the domain-driven architecture migration.

**Analysis Date:** 2025-12-29
**Architecture:** Domain-Driven Design (DDD)
**Focus:** Reducing code duplication, standardizing patterns, improving maintainability

---

## Current State Analysis

### Identified Patterns with Duplication

| Pattern | Current Implementation | Occurrences |
|---------|----------------------|-------------|
| CRUD operations | Manual per domain service | 3+ domains |
| Pagination response | Repeated `data/count` structure | Every list endpoint |
| Ownership checks | Inline permission logic | Multiple routes |
| Get-or-404 pattern | Repeated in each route | Every GET by ID |
| List with count | Duplicate query logic | Every list endpoint |

---

## Recommendations

### 1. Generic Base Service Class

**Problem:** Each domain service repeats identical CRUD patterns.

**Solution:** Create `app/common/base_service.py` with generic operations.

```python
from typing import TypeVar, Generic, Type
from uuid import UUID
from sqlmodel import Session, SQLModel, select, func

ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=SQLModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=SQLModel)

class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """Generic CRUD operations reusable across domains."""

    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, session: Session, id: UUID) -> ModelType | None:
        return session.get(self.model, id)

    def get_multi(
        self, session: Session, *, skip: int = 0, limit: int = 100
    ) -> list[ModelType]:
        statement = select(self.model).offset(skip).limit(limit)
        return list(session.exec(statement).all())

    def count(self, session: Session) -> int:
        statement = select(func.count()).select_from(self.model)
        return session.exec(statement).one()

    def create(self, session: Session, *, obj_in: CreateSchemaType) -> ModelType:
        db_obj = self.model.model_validate(obj_in)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def update(
        self, session: Session, *, db_obj: ModelType, obj_in: UpdateSchemaType
    ) -> ModelType:
        update_data = obj_in.model_dump(exclude_unset=True)
        db_obj.sqlmodel_update(update_data)
        session.add(db_obj)
        session.commit()
        session.refresh(db_obj)
        return db_obj

    def delete(self, session: Session, *, id: UUID) -> None:
        obj = session.get(self.model, id)
        if obj:
            session.delete(obj)
            session.commit()
```

**Domain Usage Example:**
```python
# domains/items/service.py
from app.common.base_service import BaseService
from .models import Item
from .schemas import ItemCreate, ItemUpdate

class ItemService(BaseService[Item, ItemCreate, ItemUpdate]):
    def __init__(self):
        super().__init__(Item)

    def get_by_owner(self, session: Session, owner_id: UUID) -> list[Item]:
        """Domain-specific method extends base functionality."""
        statement = select(Item).where(Item.owner_id == owner_id)
        return list(session.exec(statement).all())

item_service = ItemService()
```

**Benefits:**
- Eliminates ~50 lines of duplicate code per domain
- Consistent behavior across all domains
- Single point of change for CRUD logic
- Type-safe with generics

---

### 2. Generic Paginated Response Schema

**Problem:** Every list endpoint defines its own pagination structure.

**Solution:** Add generic `PaginatedResponse[T]` to `app/common/schemas.py`.

```python
from typing import TypeVar, Generic
from sqlmodel import SQLModel

T = TypeVar("T")

class PaginatedResponse(SQLModel, Generic[T]):
    """Generic paginated response for list endpoints."""
    data: list[T]
    count: int
    skip: int = 0
    limit: int = 100

class Message(SQLModel):
    """Generic message response."""
    message: str
```

**Usage:**
```python
from app.common.schemas import PaginatedResponse
from .schemas import UserPublic

@router.get("/", response_model=PaginatedResponse[UserPublic])
def read_users(session: SessionDep, skip: int = 0, limit: int = 100):
    users = user_service.get_multi(session, skip=skip, limit=limit)
    count = user_service.count(session)
    return PaginatedResponse(data=users, count=count, skip=skip, limit=limit)
```

**Benefits:**
- Consistent pagination across all endpoints
- Self-documenting API responses
- Easy to add metadata (total_pages, has_next, etc.)

---

### 3. Reusable Authorization Helpers

**Problem:** Permission checks are duplicated inline in routes.

**Solution:** Create `app/common/auth.py` with reusable functions.

```python
from fastapi import HTTPException, status
from uuid import UUID
from typing import Protocol

class HasId(Protocol):
    id: UUID

class HasSuperuser(Protocol):
    is_superuser: bool
    id: UUID

def require_owner_or_superuser(
    resource_owner_id: UUID,
    current_user: HasSuperuser
) -> None:
    """Check if user owns resource or is superuser."""
    if not current_user.is_superuser and resource_owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

def require_superuser(current_user: HasSuperuser) -> None:
    """Check if user is superuser."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )

def require_not_self(
    target_user_id: UUID,
    current_user: HasId,
    message: str = "Cannot perform this action on yourself"
) -> None:
    """Prevent user from performing action on themselves."""
    if target_user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
```

**Usage:**
```python
from app.common.auth import require_owner_or_superuser

@router.get("/{id}")
def read_item(session: SessionDep, current_user: CurrentUser, id: UUID):
    item = session.get(Item, id)
    if not item:
        raise NotFoundError("Item not found")
    require_owner_or_superuser(item.owner_id, current_user)
    return item
```

**Benefits:**
- Centralized permission logic
- Consistent error messages
- Easier to audit security

---

### 4. Get-or-404 Dependency Factory

**Problem:** Every route repeats the "get by ID or raise 404" pattern.

**Solution:** Add factory to `app/common/deps.py`.

```python
from typing import Type, TypeVar, Annotated
from uuid import UUID
from fastapi import HTTPException, Depends
from sqlmodel import Session, SQLModel
from app.core.db import engine

ModelType = TypeVar("ModelType", bound=SQLModel)

def get_db():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_db)]

def get_or_404(model: Type[ModelType]):
    """Factory for 'get resource or 404' dependencies."""
    def _get_or_404(id: UUID, session: SessionDep) -> ModelType:
        obj = session.get(model, id)
        if not obj:
            raise HTTPException(
                status_code=404,
                detail=f"{model.__name__} not found"
            )
        return obj
    return _get_or_404
```

**Usage:**
```python
from app.common.deps import get_or_404
from .models import Item

ItemDep = Annotated[Item, Depends(get_or_404(Item))]

@router.get("/{id}")
def read_item(item: ItemDep, current_user: CurrentUser):
    require_owner_or_superuser(item.owner_id, current_user)
    return item

@router.put("/{id}")
def update_item(item: ItemDep, current_user: CurrentUser, item_in: ItemUpdate):
    require_owner_or_superuser(item.owner_id, current_user)
    return item_service.update(session, db_obj=item, obj_in=item_in)
```

**Benefits:**
- Eliminates repetitive null checks
- Automatic 404 with proper model name
- Cleaner route signatures

---

## Implementation Plan

### Priority Order

| Priority | Component | Impact | Effort | Files Changed |
|----------|-----------|--------|--------|---------------|
| 1 | `BaseService` class | High | Low | New file + 3 services |
| 2 | `PaginatedResponse[T]` | Medium | Low | common/schemas.py + routes |
| 3 | Auth helpers | Medium | Low | New file + routes |
| 4 | `get_or_404` factory | Medium | Low | common/deps.py + routes |

### File Changes Summary

**New Files:**
- `app/common/base_service.py` - Generic service class
- `app/common/auth.py` - Authorization helpers

**Modified Files:**
- `app/common/schemas.py` - Add PaginatedResponse
- `app/common/deps.py` - Add get_or_404 factory
- `app/domains/users/service.py` - Extend BaseService
- `app/domains/items/service.py` - Extend BaseService
- `app/domains/*/routes.py` - Use new helpers

---

## Success Criteria

- [ ] All existing tests pass
- [ ] No duplicate CRUD code in domain services
- [ ] Consistent pagination across all list endpoints
- [ ] Authorization checks use shared helpers
- [ ] Code coverage maintained or improved

---

## Future Enhancements

### Route Factory (Phase 2)

For domains with identical CRUD patterns, a route factory could generate standard endpoints:

```python
def create_crud_router(
    service: BaseService,
    response_model: Type[SQLModel],
    create_model: Type[SQLModel],
    prefix: str,
    tags: list[str],
) -> APIRouter:
    """Generate standard CRUD routes automatically."""
    # Implementation generates GET, POST, PUT, DELETE
```

### Query Builder (Phase 2)

Generic filtering and sorting:

```python
class QueryBuilder(Generic[T]):
    def filter_by(self, **kwargs) -> Self: ...
    def order_by(self, field: str, desc: bool = False) -> Self: ...
    def paginate(self, skip: int, limit: int) -> Self: ...
    def execute(self, session: Session) -> list[T]: ...
```

---

## Appendix: Current vs Proposed Comparison

### Before (Current)
```python
# domains/items/service.py - 40+ lines of boilerplate
def get_item(session: Session, id: UUID) -> Item | None:
    return session.get(Item, id)

def get_items(session: Session, skip: int, limit: int) -> list[Item]:
    statement = select(Item).offset(skip).limit(limit)
    return list(session.exec(statement).all())

def create_item(session: Session, item_in: ItemCreate, owner_id: UUID) -> Item:
    db_item = Item.model_validate(item_in, update={"owner_id": owner_id})
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item
# ... more functions
```

### After (Proposed)
```python
# domains/items/service.py - 15 lines total
from app.common.base_service import BaseService

class ItemService(BaseService[Item, ItemCreate, ItemUpdate]):
    def __init__(self):
        super().__init__(Item)

    def create_with_owner(
        self, session: Session, item_in: ItemCreate, owner_id: UUID
    ) -> Item:
        return self.create(session, obj_in=item_in, update={"owner_id": owner_id})

    def get_by_owner(self, session: Session, owner_id: UUID) -> list[Item]:
        statement = select(Item).where(Item.owner_id == owner_id)
        return list(session.exec(statement).all())

item_service = ItemService()
```

**Lines of Code Reduction:** ~60% per domain service
