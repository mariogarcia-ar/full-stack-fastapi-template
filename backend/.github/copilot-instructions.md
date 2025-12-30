# FastAPI Backend - AI Coding Agent Instructions

## Architecture Overview

This is a **domain-driven FastAPI backend** using SQLModel ORM, PostgreSQL, and JWT authentication. The architecture separates concerns into layers:

- **Core** (`app/core/`): Database engine, config (Pydantic Settings), security (JWT/bcrypt)
- **Common** (`app/common/`): Shared dependencies (`SessionDep`, `get_or_404`), base service class, auth helpers
- **Domains** (`app/domains/`): Self-contained feature modules (users, items, auth, admin, utils)
- **API** (`app/api/router.py`): Aggregates all domain routers into a single entry point

**Key Pattern**: All models use `UUID` primary keys (via `uuid.uuid4()`), not integers. Foreign keys use `ondelete="CASCADE"` for automatic cleanup.

## Domain Structure (Follow This Pattern)

Each domain follows a strict 5-file structure:

```
app/domains/items/
├── models.py      # SQLModel table definitions with relationships
├── schemas.py     # Pydantic schemas (Create, Update, Public, List)
├── service.py     # Business logic extending BaseService
├── routes.py      # FastAPI route handlers
└── deps.py        # Domain-specific dependencies (optional)
```

### Creating a New Domain

1. **Models** inherit from `SQLModel` base classes:
   ```python
   class ItemBase(SQLModel):
       title: str = Field(min_length=1, max_length=255)
   
   class Item(ItemBase, table=True):
       id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
       owner_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
   ```

2. **Schemas** separate concerns (Create/Update/Public):
   ```python
   class ItemCreate(ItemBase): pass
   class ItemUpdate(ItemBase):
       title: str | None = Field(default=None, ...)  # All fields optional
   class ItemPublic(ItemBase):
       id: uuid.UUID
   class ItemsPublic(SQLModel):  # For paginated lists
       data: list[ItemPublic]
       count: int
   ```

3. **Service** extends `BaseService[Model, Create, Update]`:
   ```python
   class ItemService(BaseService[Item, ItemCreate, ItemUpdate]):
       def __init__(self):
           super().__init__(Item)
       
       # Add domain-specific methods
       def get_by_owner(self, session: Session, owner_id: UUID, ...):
           statement = select(Item).where(Item.owner_id == owner_id)
           return list(session.exec(statement).all())
   
   # Singleton instance
   item_service = ItemService()
   ```

4. **Routes** use dependency injection patterns:
   ```python
   router = APIRouter(prefix="/items", tags=["items"])
   ItemDep = Annotated[Item, Depends(get_or_404(Item))]  # Auto-fetch by path ID
   
   @router.get("/{id}")
   def read_item(item: ItemDep, current_user: CurrentUser):
       require_owner_or_superuser(item.owner_id, current_user)
       return item
   ```

5. **Register** in `app/api/router.py`:
   ```python
   from app.domains.items import routes as items_routes
   api_router.include_router(items_routes.router)
   ```

6. **Import models** in `app/alembic/env.py` for migrations:
   ```python
   from app.domains.items.models import Item  # noqa
   ```

## Key Dependencies & Patterns

### Standard Dependencies
- `SessionDep`: Database session (`Annotated[Session, Depends(get_db)]`)
- `CurrentUser`: Authenticated user (`Annotated[User, Depends(get_current_user)]`)
- `get_or_404(Model)`: Factory for path param fetching with 404 handling

### Authorization Helpers (`app/common/auth.py`)
```python
require_owner_or_superuser(resource_owner_id, current_user)  # Raises 400 if unauthorized
require_superuser(current_user)  # Raises 403 if not superuser
```

### BaseService Methods
All services inherit: `get()`, `get_multi()`, `count()`, `create()`, `update()`, `delete()`. Override or extend for domain logic.

## Database Migrations

**Always use Alembic** for schema changes:
```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Downgrade one revision
alembic downgrade -1
```

**Critical**: Import all new models in `app/alembic/env.py` before generating migrations, or relationships won't be detected.

## Development Workflows

### Local Development
```bash
cd backend
uv sync                    # Install dependencies
source .venv/bin/activate
fastapi dev app/main.py    # Hot-reload server
```

### Docker (Recommended)
```bash
docker compose watch       # Auto-rebuilds on changes
```

### Testing
```bash
bash scripts/test.sh       # Runs pytest with coverage report
```

### Linting & Formatting
```bash
bash scripts/lint.sh       # Ruff linter
bash scripts/format.sh     # Ruff formatter
```

## Configuration

Settings use **Pydantic Settings** (`app/core/config.py`) with `.env` file support (loads from `../.env` relative to backend/).

**Environment-specific routes**: Admin routes only load when `settings.ENVIRONMENT == "local"` (see `app/api/router.py`).

## Common Pitfalls

1. **Don't use integer IDs**: All models use UUIDs (migration `d98dd8ec85a3` converted legacy integer IDs)
2. **Don't forget CASCADE deletes**: Foreign keys should specify `ondelete="CASCADE"` (see migration `1a31ce608336`)
3. **Import models in alembic/env.py**: Otherwise autogenerate won't detect them
4. **Use singleton service instances**: Export `item_service = ItemService()` at module level
5. **Type annotations for dependencies**: Use `Annotated[Type, Depends(...)]` for FastAPI dependency injection
6. **Optional update fields**: All fields in `*Update` schemas should be optional (`str | None = Field(default=None, ...)`)

## VS Code Debugging

Pre-configured launch configs available. Attach to container or run locally with breakpoints in the editor.
