import logging

from fastapi import Request

from hippobox.errors.admin import AdminErrorCode
from hippobox.errors.service import raise_exception_with_log
from hippobox.models.user import UserModel, Users

log = logging.getLogger("admin")


class AdminService:
    async def list_users(self) -> list[UserModel]:
        try:
            return await Users.get_list()
        except Exception as e:
            raise_exception_with_log(AdminErrorCode.LIST_USERS_FAILED, e)


def get_admin_service(request: Request) -> AdminService:
    return AdminService()
