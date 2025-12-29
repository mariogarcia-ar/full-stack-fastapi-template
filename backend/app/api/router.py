from fastapi import APIRouter

from app.core.config import settings
from app.domains.admin import routes as admin_routes
from app.domains.auth import routes as auth_routes
from app.domains.items import routes as items_routes
from app.domains.users import routes as users_routes
from app.domains.utils import routes as utils_routes

api_router = APIRouter()

# Core domain routes
api_router.include_router(auth_routes.router)
api_router.include_router(users_routes.router)
api_router.include_router(items_routes.router)
api_router.include_router(utils_routes.router)

# Private/debug routes (local environment only)
if settings.ENVIRONMENT == "local":
    api_router.include_router(admin_routes.router)
