from datetime import datetime
from pydantic import BaseModel

class ConversationMessage(BaseModel):
    role: str = None                # The role of the sender of the message
    name: str = None                # The name of the sender of the message
    timestamp: datetime = None      # The time the message was sent
    content: str = None             # The content of the message

class Conversation(BaseModel):
    id: str = None                  # A unique identifier for the conversation
    start_time: datetime = None     # The time the conversation started
    end_time: datetime = None       # The time the conversation ended
    participants: set[str] = set()  # The participants in the conversation
    messages: list[ConversationMessage] = []  # The messages in the conversation

    def add_message(self, role:str, name: str, content: str):
        message = ConversationMessage(role=role, name=name, timestamp=datetime.now(), content=content)
        self.participants.add(message.name)
        # set end time to time of message if it is not set or if the message is newer
        if self.end_time is None or message.timestamp > self.end_time:
            self.end_time = message.timestamp
        if self.start_time is None or message.timestamp < self.start_time:
            self.start_time = message.timestamp

        self.messages.append(message)

        # remove oldest message if there are more than 1000 messages
        if len(self.messages) > 1000:
            self.messages.pop(0)