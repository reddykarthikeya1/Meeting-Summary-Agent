from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Base application exception."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, resource: str = "Resource", resource_id: str = ""):
        msg = f"{resource} not found" if not resource_id else f"{resource} with id '{resource_id}' not found"
        super().__init__(message=msg, status_code=404)


class UnauthorizedError(AppException):
    def __init__(self, message: str = "Not authenticated"):
        super().__init__(message=message, status_code=401)


class ForbiddenError(AppException):
    def __init__(self, message: str = "Access denied"):
        super().__init__(message=message, status_code=403)


class ValidationError(AppException):
    def __init__(self, message: str = "Validation error"):
        super().__init__(message=message, status_code=422)


def register_exception_handlers(app: FastAPI):
    """Register custom exception handlers on the FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": True, "message": exc.message},
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        return JSONResponse(
            status_code=500,
            content={"error": True, "message": "Internal server error"},
        )
