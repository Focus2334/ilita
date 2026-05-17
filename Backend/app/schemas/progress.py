from datetime import datetime

from pydantic import BaseModel


class PageProgressItem(BaseModel):
    page_id: int
    title: str
    position: int
    viewed: bool


class CourseProgressRead(BaseModel):
    course_id: int
    course_title: str
    status: str
    progress_percent: int
    started_at: datetime | None
    completed_at: datetime | None
    pages: list[PageProgressItem]


class MyCourseProgressRead(BaseModel):
    course_id: int
    course_title: str
    status: str
    progress_percent: int
    started_at: datetime | None
    completed_at: datetime | None
