# app/middleware/error_handler.py

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback
from typing import Union

logger = logging.getLogger(__name__)


class AppException(Exception):
    """Base exception for application errors"""
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_type: str = "server_error",
        details: dict = None
    ):
        self.message = message
        self.status_code = status_code
        self.error_type = error_type
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(AppException):
    """Validation error"""
    def __init__(self, message: str, details: dict = None):
        super().__init__(
            message=message,
            status_code=status.HTTP_400_BAD_REQUEST,
            error_type="validation_error",
            details=details
        )


class AuthenticationException(AppException):
    """Authentication error"""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            message=message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_type="auth_error"
        )


class AuthorizationException(AppException):
    """Authorization error"""
    def __init__(self, message: str = "Permission denied"):
        super().__init__(
            message=message,
            status_code=status.HTTP_403_FORBIDDEN,
            error_type="authorization_error"
        )


class NotFoundException(AppException):
    """Resource not found error"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(
            message=message,
            status_code=status.HTTP_404_NOT_FOUND,
            error_type="not_found"
        )


class DatabaseException(AppException):
    """Database error"""
    def __init__(self, message: str = "Database error occurred"):
        super().__init__(
            message=message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_type="database_error"
        )


class ExternalServiceException(AppException):
    """External service error"""
    def __init__(self, message: str = "External service error", service_name: str = None):
        details = {"service": service_name} if service_name else {}
        super().__init__(
            message=message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            error_type="external_service_error",
            details=details
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle custom application exceptions"""
    logger.error(
        f"Application error: {exc.error_type} - {exc.message}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "status_code": exc.status_code,
            "details": exc.details
        }
    )

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "message": exc.message,
                "type": exc.error_type,
                "details": exc.details
            }
        }
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle HTTP exceptions"""
    logger.warning(
        f"HTTP error: {exc.status_code} - {exc.detail}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "status_code": exc.status_code
        }
    )

    # Map status codes to error types
    error_type_map = {
        400: "bad_request",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
        405: "method_not_allowed",
        409: "conflict",
        422: "validation_error",
        429: "rate_limit_exceeded",
        500: "server_error",
        502: "bad_gateway",
        503: "service_unavailable",
        504: "gateway_timeout"
    }

    error_type = error_type_map.get(exc.status_code, "http_error")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "message": exc.detail,
                "type": error_type
            }
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle validation errors"""
    errors = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        errors[field] = error["msg"]

    logger.warning(
        f"Validation error: {errors}",
        extra={
            "path": request.url.path,
            "method": request.method
        }
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "message": "Validation failed",
                "type": "validation_error",
                "details": errors
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all other exceptions"""
    # Log full traceback
    logger.error(
        f"Unhandled exception: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "traceback": traceback.format_exc()
        }
    )

    # Don't expose internal errors in production
    import os
    is_production = os.getenv("DEBUG", "False").lower() != "true"

    if is_production:
        message = "An unexpected error occurred. Please try again later."
        details = {}
    else:
        message = str(exc)
        details = {
            "type": type(exc).__name__,
            "traceback": traceback.format_exc()
        }

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "message": message,
                "type": "server_error",
                **({} if is_production else {"details": details})
            }
        }
    )


def register_error_handlers(app):
    """Register all error handlers with the FastAPI app"""
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
