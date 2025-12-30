# FastAPI Backend

Production-ready FastAPI backend with domain-driven architecture, JWT authentication, and SQLModel ORM.

## Requirements

- [Docker](https://www.docker.com/)
- [uv](https://docs.astral.sh/uv/) for Python package management

## Quick Start

**Docker (recommended):**

```bash
docker compose watch
```

**Local development:**

```bash
cd backend
uv sync
source .venv/bin/activate
```

See [../development.md](../development.md) for full setup guide.

## Architecture

The backend uses **domain-driven modular architecture**:

| Layer | Purpose | Location |
|-------|---------|----------|
| Core | Config, database, security | `app/core/` |
| Common | Shared deps and schemas | `app/common/` |
| Domains | Feature modules | `app/domains/` |
| API | Router aggregation | `app/api/` |

```
backend/app/
├── main.py                    # FastAPI app initialization
├── utils.py                   # Email utilities
├── api/
│   └── router.py              # Aggregates all domain routers
├── common/
│   ├── deps.py                # SessionDep dependency
│   └── schemas.py             # Generic schemas (Message)
├── core/
│   ├── config.py              # Settings & configuration
│   ├── db.py                  # Database engine
│   ├── security.py            # Password hashing & JWT
│   └── exceptions.py          # Custom exception classes
├── domains/
│   ├── users/                 # User management
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── service.py
│   │   ├── routes.py
│   │   └── deps.py
│   ├── items/                 # Item management
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── service.py
│   │   └── routes.py
│   ├── auth/                  # Authentication
│   │   ├── schemas.py
│   │   ├── service.py
│   │   ├── routes.py
│   │   └── deps.py
│   ├── admin/                 # Admin endpoints
│   │   └── routes.py
│   └── utils/                 # Utility endpoints
│       └── routes.py
├── alembic/                   # Database migrations
└── email-templates/           # Email assets
```

## Adding a New Domain

1. Create directory: `app/domains/orders/`
2. Add files:
   - `models.py` - SQLModel table
   - `schemas.py` - Request/response schemas
   - `service.py` - Business logic
   - `routes.py` - API endpoints
   - `deps.py` - Dependencies (optional)
3. Register router in `app/api/router.py`
4. Import models in `app/alembic/env.py`

## Development

**VS Code** is pre-configured for debugging and test discovery.

**Docker override** (`docker-compose.override.yml`) enables:
- Hot reload on code changes
- Volume mounts for live editing
- Single-process mode for debugging

**Access container shell:**

```bash
docker compose exec backend bash
```

**Run dev server manually:**

```bash
fastapi run --reload app/main.py
```

## Testing

```bash
# From project root
bash ./scripts/test.sh

# Inside container
docker compose exec backend bash scripts/tests-start.sh

# Stop on first error
docker compose exec backend bash scripts/tests-start.sh -x
```

Coverage report: `htmlcov/index.html`

## Migrations

Models are registered in `app/alembic/env.py`.

```bash
# Enter container
docker compose exec backend bash

# Create migration
alembic revision --autogenerate -m "Add column to User"

# Apply migration
alembic upgrade head
```

**For new domains**, add model import to `env.py`:

```python
from app.domains.your_domain.models import YourModel  # noqa
```

**To disable migrations**, uncomment `SQLModel.metadata.create_all(engine)` in `app/core/db.py` and comment out `alembic upgrade head` in `scripts/prestart.sh`.

## Email Templates

Templates in `app/email-templates/`:
- `src/` - MJML source files
- `build/` - Compiled HTML

**Workflow:**
1. Install [MJML extension](https://marketplace.visualstudio.com/items?itemName=attilabuti.vscode-mjml)
2. Create template in `src/`
3. `Ctrl+Shift+P` → `MJML: Export to HTML`
4. Save to `build/`
