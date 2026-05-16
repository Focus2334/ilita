# app/db/models/user.py

from sqlalchemy import (
    String,
    ForeignKey,
    Table,
    Column
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from app.db.session import Base


user_roles = Table(
    "user_roles",
    Base.metadata,

    Column(
        "user_id",
        ForeignKey("users.id"),
        primary_key=True
    ),

    Column(
        "role_id",
        ForeignKey("roles.id"),
        primary_key=True
    )
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    first_name: Mapped[str] = mapped_column(
        String(100)
    )

    last_name: Mapped[str] = mapped_column(
        String(100)
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False
    )

    phone: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    position: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    responsibility_area: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    team_id: Mapped[int | None] = mapped_column(
        ForeignKey("teams.id"),
        nullable=True
    )

    manager_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )

    team = relationship(
        "Team",
        back_populates="users"
    )

    manager = relationship(
        "User",
        remote_side=[id]
    )

    roles = relationship(
        "Role",
        secondary=user_roles,
        back_populates="users"
    )

    assignments = relationship("UserCourseAssignment", back_populates="user")
    password_hash = Column(String(255), nullable=False)