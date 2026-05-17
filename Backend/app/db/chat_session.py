from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

MESSAGES_DATABASE_URL = os.getenv("MESSAGES_DATABASE_URL") or os.getenv("DATABASE_URL")

chat_engine = create_engine(MESSAGES_DATABASE_URL, echo=True)

ChatSessionLocal = sessionmaker(
    bind=chat_engine,
    autoflush=False,
    autocommit=False,
)


class ChatBase(DeclarativeBase):
    pass


def get_chat_db():
    db = ChatSessionLocal()
    try:
        yield db
    finally:
        db.close()
