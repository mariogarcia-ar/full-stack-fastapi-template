from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail: str = "An unexpected error occurred"

    def __init__(self, detail: str | None = None):
        super().__init__(
            status_code=self.status_code, detail=detail or self.__class__.detail
        )


class NotFoundError(AppException):
    """Resource not found exception."""

    status_code = status.HTTP_404_NOT_FOUND
    detail = "Resource not found"


class ConflictError(AppException):
    """Resource conflict exception (e.g., duplicate)."""

    status_code = status.HTTP_409_CONFLICT
    detail = "Resource already exists"


class ForbiddenError(AppException):
    """Insufficient permissions exception."""

    status_code = status.HTTP_403_FORBIDDEN
    detail = "Not enough permissions"


class UnauthorizedError(AppException):
    """Authentication required exception."""

    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Not authenticated"


class BadRequestError(AppException):
    """Invalid request exception."""

    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Invalid request"
