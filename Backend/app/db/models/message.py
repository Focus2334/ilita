from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.chat_session import ChatBase


class Message(ChatBase):
    """Личное сообщение. sender_id / recipient_id — User.id из основной БД LMS."""

    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    sender_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    recipient_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
