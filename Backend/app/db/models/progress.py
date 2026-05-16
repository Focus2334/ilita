# app/db/models/progress.py

from datetime import datetime

from sqlalchemy import (
    ForeignKey,
    String,
    Boolean,
    DateTime
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.db.session import Base


class UserCourseProgress(Base):
    __tablename__ = "user_course_progress"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id")
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="not_started"
    )

    progress_percent: Mapped[int] = mapped_column(
        default=0
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    user = relationship("User")

    course = relationship("Course")


class UserPageProgress(Base):
    __tablename__ = "user_page_progress"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    page_id: Mapped[int] = mapped_column(
        ForeignKey("course_pages.id")
    )

    viewed: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    user = relationship("User")

    page = relationship("CoursePage")