from datetime import datetime
from pydantic import BaseModel


class ChatMessage(BaseModel):
    """
    Represents a chat message inside the payload of a TAImeSpaceMessage.

    Attributes:
        Message (str): The content of the message.
        Sender (str): The sender of the message.
        Timestamp (datetime): The timestamp when the message was sent.
    """
    Message: str
    Sender: str
    Timestamp: datetime
