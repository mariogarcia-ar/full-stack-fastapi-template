# Backend Folder Structure Migration Plan

## Overview

This document outlines the migration from a flat layered architecture to a domain-driven modular architecture for the FastAPI backend.

**Migration Date:** 2025-12-29
**Estimated Effort:** 2-4 hours
**Risk Level:** Medium (comprehensive refactor with full test coverage)

---

## Current Structure (Before)

```
backend/app/
├── main.py                    # App entry
├── models.py                  # ALL models + schemas (16 classes, 114 lines)
├── crud.py                    # ALL CRUD operations (5 functions, 55 lines)
├── utils.py                   # Email utilities
├── core/
│   ├── config.py              # Settings
│   ├── db.py                  # Database engine
│   └── security.py            # Password hashing, JWT
├── api/
│   ├── main.py                # Router aggregation
│   ├── deps.py                # Dependency injection
│   └── routes/
│       ├── login.py           # Auth endpoints
│       ├── users.py           # User endpoints
│       ├── items.py           # Item endpoints
│       ├── private.py         # Debug endpoints
│       └── utils.py           # Utility endpoints
├── alembic/                   # Migrations
└── email-templates/           # Email assets
```

### Problems with Current Structure

1. **Monolithic models.py** - 16 classes mixing DB models and Pydantic schemas
2. **Single crud.py** - All CRUD operations in one file
3. **No domain boundaries** - User/Item/Auth logic intermixed
4. **Scaling issues** - Adding new entities increases merge conflicts

---

## Target Structure (After)

```
backend/app/
├── main.py                         # App entry (updated imports)
│
├── core/                           # Cross-cutting infrastructure
│   ├── __init__.py
│   ├── config.py                   # Settings (unchanged)
│   ├── db.py                       # Database engine (unchanged)
│   ├── security.py                 # Auth utilities (unchanged)
│   └── exceptions.py               # Custom exception classes (NEW)
│
├── common/                         # Shared utilities (NEW)
│   ├── __init__.py
│   ├── schemas.py                  # Generic schemas (Message, Pagination)
│   └── deps.py                     # Shared dependencies (SessionDep)
│
├── domains/                        # Feature modules (NEW)
│   ├── __init__.py
│   │
│   ├── users/                      # User domain
│   │   ├── __init__.py
│   │   ├── models.py               # User SQLModel table
│   │   ├── schemas.py              # UserCreate, UserUpdate, UserPublic
│   │   ├── service.py              # Business logic
│   │   ├── routes.py               # API endpoints
│   │   └── deps.py                 # CurrentUser dependency
│   │
│   ├── items/                      # Item domain
│   │   ├── __init__.py
│   │   ├── models.py               # Item SQLModel table
│   │   ├── schemas.py              # ItemCreate, ItemUpdate, ItemPublic
│   │   ├── service.py              # Business logic
│   │   └── routes.py               # API endpoints
│   │
│   └── auth/                       # Auth domain
│       ├── __init__.py
│       ├── schemas.py              # Token, TokenPayload, NewPassword
│       ├── service.py              # authenticate, verify_token
│       └── routes.py               # login, password-reset endpoints
│
├── api/                            # API aggregation (simplified)
│   ├── __init__.py
│   └── router.py                   # Combines all domain routers
│
├── alembic/                        # Migrations (unchanged)
└── email-templates/                # Email assets (unchanged)
```

---

## Migration Steps

### Phase 1: Create New Structure (Non-Breaking)

#### Step 1.1: Create core/exceptions.py
- Add custom exception classes (NotFoundError, ConflictError, etc.)
- Register global exception handler in main.py

#### Step 1.2: Create common/ module
- `common/schemas.py` - Generic Message schema
- `common/deps.py` - SessionDep, get_db dependency

#### Step 1.3: Create domains/ folder structure
- Create empty domain directories with __init__.py files

### Phase 2: Migrate Domains

#### Step 2.1: Users Domain
| Source | Destination |
|--------|-------------|
| `models.py` (User, UserBase) | `domains/users/models.py` |
| `models.py` (UserCreate, UserUpdate, etc.) | `domains/users/schemas.py` |
| `crud.py` (create_user, update_user, get_user_by_email) | `domains/users/service.py` |
| `api/routes/users.py` | `domains/users/routes.py` |
| `api/deps.py` (CurrentUser, get_current_user) | `domains/users/deps.py` |

#### Step 2.2: Items Domain
| Source | Destination |
|--------|-------------|
| `models.py` (Item, ItemBase) | `domains/items/models.py` |
| `models.py` (ItemCreate, ItemUpdate, ItemPublic) | `domains/items/schemas.py` |
| `crud.py` (create_item) | `domains/items/service.py` |
| `api/routes/items.py` | `domains/items/routes.py` |

#### Step 2.3: Auth Domain
| Source | Destination |
|--------|-------------|
| `models.py` (Token, TokenPayload, NewPassword) | `domains/auth/schemas.py` |
| `crud.py` (authenticate) | `domains/auth/service.py` |
| `api/routes/login.py` | `domains/auth/routes.py` |

### Phase 3: Update API Router

#### Step 3.1: Create api/router.py
- Aggregate all domain routers
- Replace api/main.py

#### Step 3.2: Update main.py
- Import new router from api/router.py
- Register exception handlers

### Phase 4: Migrate Tests

#### Step 4.1: Create test structure
```
tests/
├── conftest.py                # Shared fixtures
├── domains/
│   ├── users/
│   │   └── test_routes.py
│   ├── items/
│   │   └── test_routes.py
│   └── auth/
│       └── test_routes.py
└── factories/
    ├── user.py
    └── item.py
```

### Phase 5: Cleanup

#### Step 5.1: Remove deprecated files
- Delete `app/models.py`
- Delete `app/crud.py`
- Delete `app/api/deps.py`
- Delete `app/api/main.py`
- Delete `app/api/routes/` directory

#### Step 5.2: Update imports
- Search and replace old import paths

---

## File Mapping Reference

| Old Location | New Location |
|--------------|--------------|
| `app/models.py` (User) | `app/domains/users/models.py` |
| `app/models.py` (UserCreate, etc.) | `app/domains/users/schemas.py` |
| `app/models.py` (Item) | `app/domains/items/models.py` |
| `app/models.py` (ItemCreate, etc.) | `app/domains/items/schemas.py` |
| `app/models.py` (Token, etc.) | `app/domains/auth/schemas.py` |
| `app/models.py` (Message) | `app/common/schemas.py` |
| `app/crud.py` (user functions) | `app/domains/users/service.py` |
| `app/crud.py` (item functions) | `app/domains/items/service.py` |
| `app/crud.py` (authenticate) | `app/domains/auth/service.py` |
| `app/api/deps.py` (SessionDep, get_db) | `app/common/deps.py` |
| `app/api/deps.py` (CurrentUser, etc.) | `app/domains/users/deps.py` |
| `app/api/deps.py` (TokenDep, OAuth2) | `app/domains/auth/deps.py` |
| `app/api/routes/users.py` | `app/domains/users/routes.py` |
| `app/api/routes/items.py` | `app/domains/items/routes.py` |
| `app/api/routes/login.py` | `app/domains/auth/routes.py` |
| `app/api/routes/private.py` | `app/domains/admin/routes.py` |
| `app/api/routes/utils.py` | `app/domains/utils/routes.py` |
| `app/api/main.py` | `app/api/router.py` |

---

## Rollback Plan

If issues arise:
1. Git revert to pre-migration commit
2. All changes are in-place refactoring (no data migration needed)
3. Tests will catch breaking changes before deployment

---

## Success Criteria

- [ ] All existing tests pass
- [ ] API endpoints return same responses
- [ ] No import errors on startup
- [ ] OpenAPI documentation unchanged
- [ ] Alembic migrations still work

---

## Post-Migration Benefits

1. **Scalability** - Add new domains without touching existing code
2. **Team Collaboration** - Clear ownership boundaries
3. **Testability** - Domain services can be unit tested independently
4. **Maintainability** - Find all user-related code in one place
5. **Consistency** - Standardized domain structure for new features
