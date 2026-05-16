# app/db/models/course.py

from sqlalchemy import (
    String,
    ForeignKey,
    Integer,
    JSON
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.db.session import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        nullable=True
    )

    duration_days: Mapped[int] = mapped_column(
        Integer,
        default=14
    )

    pages = relationship(
        "CoursePage",
        back_populates="course",
        cascade="all, delete-orphan"
    )

class CoursePage(Base):
    __tablename__ = "course_pages"

    id: Mapped[int] = mapped_column(primary_key=True)

    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id")
    )

    title: Mapped[str] = mapped_column(
        String(255)
    )

    position: Mapped[int] = mapped_column()

    course = relationship(
        "Course",
        back_populates="pages"
    )

    blocks = relationship(
        "PageBlock",
        back_populates="page",
        cascade="all, delete-orphan"
    )

class PageBlock(Base):
    __tablename__ = "page_blocks"

    id: Mapped[int] = mapped_column(primary_key=True)

    page_id: Mapped[int] = mapped_column(
        ForeignKey("course_pages.id")
    )

    type: Mapped[str] = mapped_column(
        String(50)
    )

    position: Mapped[int] = mapped_column()

    content: Mapped[dict] = mapped_column(
        JSON
    )

    page = relationship(
        "CoursePage",
        back_populates="blocks"
    )