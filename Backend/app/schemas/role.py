from pydantic import BaseModel


class RoleCreate(BaseModel):
    name: str


class RoleUpdate(BaseModel):
    name: str


class RoleRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UserRoleAssign(BaseModel):
    role_id: int
