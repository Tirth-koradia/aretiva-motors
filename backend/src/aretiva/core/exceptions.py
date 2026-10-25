"""Errors that are safe to expose through the HTTP API."""

from collections.abc import Mapping

from fastapi import status


class AppError(Exception):
    """Base class for controlled application failures."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    code: str = "APPLICATION_ERROR"
    message: str = "The request could not be completed."
    headers: Mapping[str, str] | None = None


class EmailAlreadyRegisteredError(AppError):
    """Raised when an email address is already assigned to an account."""

    status_code = status.HTTP_409_CONFLICT
    code = "EMAIL_ALREADY_REGISTERED"
    message = "An account with this email already exists."


class InvalidCredentialsError(AppError):
    """Raised when supplied credentials cannot authenticate a user."""

    status_code = status.HTTP_401_UNAUTHORIZED
    code = "INVALID_CREDENTIALS"
    message = "Email or password is incorrect."


class UnauthenticatedError(AppError):
    """Raised when a request has no valid bearer token."""

    status_code = status.HTTP_401_UNAUTHORIZED
    code = "UNAUTHENTICATED"
    message = "A valid access token is required."
    headers = {"WWW-Authenticate": "Bearer"}


class ForbiddenError(AppError):
    """Raised when an authenticated user lacks permission for an operation."""

    status_code = status.HTTP_403_FORBIDDEN
    code = "FORBIDDEN"
    message = "You do not have permission to perform this action."


class VehicleNotFoundError(AppError):
    """Raised when an active vehicle cannot be found by its public ID."""

    status_code = status.HTTP_404_NOT_FOUND
    code = "VEHICLE_NOT_FOUND"
    message = "The requested vehicle could not be found."


class VehicleOutOfStockError(AppError):
    """Raised when a purchase cannot reserve the final available unit."""

    status_code = status.HTTP_409_CONFLICT
    code = "VEHICLE_OUT_OF_STOCK"
    message = "This vehicle is no longer available for purchase."


class DeliveryNotFoundError(AppError):
    """Raised when a delivery transaction cannot be found."""

    status_code = status.HTTP_404_NOT_FOUND
    code = "DELIVERY_NOT_FOUND"
    message = "The requested delivery order could not be found."
