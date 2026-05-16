from pydantic import BaseModel


class CourseCreate(BaseModel):
    title: str
    description: str | None = None
    duration_days: int = 14


class CourseRead(BaseModel):
    id: int
    title: str
    description: str | None
    duration_days: int

    class Config:
        from_attributes = True