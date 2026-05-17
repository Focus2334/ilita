from app.db.chat_session import ChatBase, chat_engine
from app.db.models.message import Message  # noqa: F401

ChatBase.metadata.create_all(bind=chat_engine)
