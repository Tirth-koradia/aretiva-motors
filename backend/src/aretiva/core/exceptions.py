"""Errors that are safe to expose through the HTTP API."""

from fastapi import status


class AppError(Exception):
    """Base class for controlled application failures."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    code: str = "APPLICATION_ERROR"
    message: str = "The request could not be completed."


class EmailAlreadyRegisteredError(AppError):
    """Raised when an email address is already assigned to an account."""

    status_code = status.HTTP_409_CONFLICT
    code = "EMAIL_ALREADY_REGISTERED"
    message = "An account with this email already exists."
