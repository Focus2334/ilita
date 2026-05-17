from datetime import datetime

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    content: str = Field(min_length=1, max_length=10000)


class MessageRead(BaseModel):
    id: int
    sender_id: int
    recipient_id: int
    content: str
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True


class ConversationPartner(BaseModel):
    id: int
    first_name: str
    last_name: str


class ConversationPreview(BaseModel):
    partner: ConversationPartner
    last_message: MessageRead | None
    unread_count: int
