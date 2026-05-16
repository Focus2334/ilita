# app/db/models/company.py

from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("departments.id"),
        nullable=True
    )

    parent = relationship(
        "Department",
        remote_side=[id]
    )

    teams = relationship(
        "Team",
        back_populates="department"
    )


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id")
    )

    department = relationship(
        "Department",
        back_populates="teams"
    )

    users = relationship(
        "User",
        back_populates="team"
    )