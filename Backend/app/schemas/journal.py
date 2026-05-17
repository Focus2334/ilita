from pydantic import BaseModel


class JournalCourseItem(BaseModel):
    assignment_id: int
    course_id: int
    course_title: str
    assignment_status: str
    progress_percent: int
    progress_status: str


class TraineeJournalRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    courses: list[JournalCourseItem]


class JournalCourseOption(BaseModel):
    id: int
    title: str


class JournalRead(BaseModel):
    trainees: list[TraineeJournalRead]
    courses: list[JournalCourseOption]
