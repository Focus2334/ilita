from pydantic import BaseModel, field_validator


class CourseCreate(BaseModel):
    title: str
    description: str | None = None
    duration_days: int = 14


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    duration_days: int | None = None


class CourseRead(BaseModel):
    id: int
    title: str
    description: str | None
    duration_days: int

    class Config:
        from_attributes = True


class CoursePageCreate(BaseModel):
    title: str
    position: int | None = None

    @field_validator("position", mode="before")
    @classmethod
    def empty_position_as_none(cls, v):
        if v in (0, "0"):
            return None
        return v


class PageBlockCreate(BaseModel):
    type: str
    content: dict
    position: int | None = None

    @field_validator("position", mode="before")
    @classmethod
    def empty_position_as_none(cls, v):
        if v in (0, "0"):
            return None
        return v


class PageBlockRead(BaseModel):
    id: int
    page_id: int
    type: str
    position: int
    content: dict

    class Config:
        from_attributes = True


class CoursePageRead(BaseModel):
    id: int
    course_id: int
    title: str
    position: int
    blocks: list[PageBlockRead] = []

    class Config:
        from_attributes = True


class CourseDetailRead(CourseRead):
    pages: list[CoursePageRead] = []

    class Config:
        from_attributes = True
