from pydantic import BaseModel


class AssignCourseRequest(BaseModel):
    user_id: int


class AssignmentRead(BaseModel):
    id: int
    user_id: int
    course_id: int
    status: str

    class Config:
        from_attributes = True