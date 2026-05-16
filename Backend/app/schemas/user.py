from pydantic import BaseModel, field_validator


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    team_id: int | None = None

    @field_validator("team_id", mode="before")
    @classmethod
    def empty_team_id_as_none(cls, v):
        if v in (0, "0"):
            return None
        return v

class UserRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True