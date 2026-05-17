from pydantic import BaseModel


class DashboardTask(BaseModel):
    id: str
    title: str
    type: str
    done: bool


class DashboardStage(BaseModel):
    id: str
    title: str
    progress: int
    status: str
    tasks: list[DashboardTask] | None = None


class DashboardCourse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    mandatory: bool
    duration: str
    xp: int
    totalStages: int
    currentStage: int
    progress: int
    status: str
    locked: bool
    unlockRequirement: str | None = None
    tags: list[str]
    stages: list[DashboardStage] = []
    completedDate: str | None = None


class DashboardUser(BaseModel):
    name: str
    initials: str
    email: str
    level: int
    xp: int
    xpToNext: int
    adaptationDay: int
    adaptationTotal: int
    streak: int
    achievements: int
    startDate: str


class DashboardSurvey(BaseModel):
    id: str
    title: str
    weekRange: str | None = None
    description: str | None = None
    duration: str | None = None
    xp: int | None = None
    questions: int | None = None
    active: bool
    completedDate: str | None = None
    rating: float | None = None


class DashboardEvent(BaseModel):
    id: str
    title: str
    category: str
    dateLabel: str
    urgent: bool


class DashboardRead(BaseModel):
    user: DashboardUser
    courses: list[DashboardCourse]
    surveys: list[DashboardSurvey]
    events: list[DashboardEvent]
