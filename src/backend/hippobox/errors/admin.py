from enum import Enum

from fastapi import status

from hippobox.errors.service import ServiceErrorCode, ServiceException


class AdminErrorCode(Enum):
    LIST_USERS_FAILED = ServiceErrorCode(
        "LIST_USERS_FAILED",
        "Failed to retrieve user list",
        status.HTTP_500_INTERNAL_SERVER_ERROR,
    )

    @property
    def code(self) -> ServiceErrorCode:
        return self.value


class AdminException(ServiceException):
    def __init__(self, code: AdminErrorCode, message: str | None = None):
        super().__init__(code=code.code, message=message or code.code.default_message)
