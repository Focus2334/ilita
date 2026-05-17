from pydantic import BaseModel


class MentorStudentAssign(BaseModel):
    student_id: int
