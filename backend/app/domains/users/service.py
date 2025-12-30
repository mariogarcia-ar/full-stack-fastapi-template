"""User domain service with business logic."""

from typing import Any

from sqlmodel import Session, select

from app.common.base_service import BaseService
from app.core.security import get_password_hash, verify_password
from app.domains.users.models import User
from app.domains.users.schemas import UserCreate, UserUpdate


class UserService(BaseService[User, UserCreate, UserUpdate]):
    """User service extending BaseService with domain-specific methods."""

    def __init__(self):
        super().__init__(User)

    def create_user(self, session: Session, *, user_create: UserCreate) -> User:
        """Create a new user with hashed password.

        Args:
            session: Database session.
            user_create: User creation data with plain password.

        Returns:
            Created user with hashed password.
        """
        return self.create(
            session,
            obj_in=user_create,
            hashed_password=get_password_hash(user_create.password),
        )

    def update_user(
        self, session: Session, *, db_user: User, user_in: UserUpdate
    ) -> Any:
        """Update an existing user, hashing password if provided.

        Args:
            session: Database session.
            db_user: Existing user model.
            user_in: Update data.

        Returns:
            Updated user.
        """
        user_data = user_in.model_dump(exclude_unset=True)
        extra_data = {}
        if "password" in user_data:
            password = user_data["password"]
            hashed_password = get_password_hash(password)
            extra_data["hashed_password"] = hashed_password
        db_user.sqlmodel_update(user_data, update=extra_data)
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return db_user

    def get_user_by_email(self, session: Session, *, email: str) -> User | None:
        """Get a user by email address.

        Args:
            session: Database session.
            email: Email to search for.

        Returns:
            User if found, None otherwise.
        """
        statement = select(User).where(User.email == email)
        return session.exec(statement).first()

    def authenticate(
        self, session: Session, *, email: str, password: str
    ) -> User | None:
        """Authenticate a user by email and password.

        Args:
            session: Database session.
            email: User's email.
            password: Plain text password.

        Returns:
            User if credentials valid, None otherwise.
        """
        db_user = self.get_user_by_email(session, email=email)
        if not db_user:
            return None
        if not verify_password(password, db_user.hashed_password):
            return None
        return db_user


# Singleton instance for use across the application
user_service = UserService()


# Backward compatibility aliases for existing code
def create_user(*, session: Session, user_create: UserCreate) -> User:
    """Create a new user with hashed password."""
    return user_service.create_user(session, user_create=user_create)


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    """Update an existing user."""
    return user_service.update_user(session, db_user=db_user, user_in=user_in)


def get_user_by_email(*, session: Session, email: str) -> User | None:
    """Get a user by email address."""
    return user_service.get_user_by_email(session, email=email)


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    """Authenticate a user by email and password."""
    return user_service.authenticate(session, email=email, password=password)
