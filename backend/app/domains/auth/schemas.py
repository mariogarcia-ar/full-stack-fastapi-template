from sqlmodel import Field, SQLModel


class Token(SQLModel):
    """JSON payload containing access token."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    """Contents of JWT token."""

    sub: str | None = None


class NewPassword(SQLModel):
    """Properties to receive for password reset."""

    token: str
    new_password: str = Field(min_length=8, max_length=128)
