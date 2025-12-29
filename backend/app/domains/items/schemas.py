import uuid

from sqlmodel import Field, SQLModel


class ItemBase(SQLModel):
    """Base item properties shared across schemas."""

    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


class ItemCreate(ItemBase):
    """Properties to receive on item creation."""

    pass


class ItemUpdate(ItemBase):
    """Properties to receive on item update."""

    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


class ItemPublic(ItemBase):
    """Properties to return via API."""

    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    """Paginated list of items."""

    data: list[ItemPublic]
    count: int
