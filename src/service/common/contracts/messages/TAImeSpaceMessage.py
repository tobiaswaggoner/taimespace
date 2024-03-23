from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TAImeSpaceMessageHeader(BaseModel):
    """
    Represents the header of a TAImeSpaceMessage.
    """
    Sender: str
    Recipient: Optional[str] = None
    MessageType: str
    MessageId: str
    Timestamp: str
    CorrelationId: str


class TAImeSpaceMessage(BaseModel):
    """
    Represents a TAImeSpaceMessage.
    """
    Header: TAImeSpaceMessageHeader
    Payload: str

