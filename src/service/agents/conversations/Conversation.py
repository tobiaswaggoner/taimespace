from datetime import datetime

class Message:
    role: str = None                # The role of the sender of the message
    name: str = None                # The name of the sender of the message
    timestamp: datetime = None      # The time the message was sent
    content: str = None             # The content of the message

class Conversation:
    id: str = None                  # A unique identifier for the conversation
    start_time: datetime = None     # The time the conversation started
    end_time: datetime = None       # The time the conversation ended
    participants: list[str] = None  # The participants in the conversation
    messages: list[Message] = None  # The messages in the conversation
