from datetime import datetime
import json
import uuid
import aio_pika
from agents.BaseAgent import BaseAgent
from openai import OpenAI
from openai.types.chat import ChatCompletion
import logging
from agents.configuration.AgentConfiguration import AgentConfiguration
from common.contracts.RoutingKeys import RoutingKeys
from messaging.configuration.MessageBrokerConfiguration import (
    MessageBrokerConfiguration,
)
from agents.conversations.Conversation import Conversation
from common.contracts.messages.ChatMessage import ChatMessage
from common.contracts.messages.TAImeSpaceMessage import TAImeSpaceMessage, TAImeSpaceMessageHeader
from util.colors import color_green, color_red, color_normal, font_italic, font_normal

class SimpleAgent(BaseAgent):
    def __init__(
        self,
        message_broker_configuration: MessageBrokerConfiguration,
        agent_configuration: AgentConfiguration,
        logger: logging.Logger,
    ):
        self.client = OpenAI()
        self.agent_configuration = agent_configuration
        self.conversations: list[Conversation] = []
        self.messages = [
            {"role": "system", "content": self.agent_configuration.system_message}
        ]
        super().__init__(
            message_broker_configuration,
            self.agent_configuration.agent_name,
            self.on_message_callback,
            self.agent_configuration.routing_key_patterns,
            logger,
        )

    async def __aenter__(self):
        await super().__aenter__()

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await super().__aexit__(exc_type, exc_val, exc_tb)

    def get_conversation(self, conversation_id: str|None) -> Conversation:
        if conversation_id is None:
            conversation = Conversation()
            conversation.id = str(uuid.uuid4())
            conversation.start_time = datetime.now()
            self.conversations.append(conversation)
            return conversation
        else:
            for conversation in self.conversations:
                if conversation.id == conversation_id:
                    return conversation
            return None

    async def on_message_callback(self, message: aio_pika.message.IncomingMessage):
        body = message.body.decode()
        taimespace_message = TAImeSpaceMessage.model_validate_json(body)
        chat_message = ChatMessage.model_validate_json(taimespace_message.Payload)

        # let the AI complete the message
        completion = self.complete_message(chat_message.Message)

        response_message = self.create_response(completion, taimespace_message)

        self.logger.log(
            logging.INFO, f"AI {self.agent_name} sending message: {response_message}"
        )
        await self.send_message(response_message.model_dump_json(), RoutingKeys.CHAT_MESSAGE_AI)

    def complete_message(self, message):
        print(f"{color_green}User: {message}")
        self.messages.append(
            {
                "role": "user",
                "content": message,
            }
        )
        print(f"{color_normal}{font_italic} ... KI denkt nach ... {font_normal}")
        response: ChatCompletion = self.client.chat.completions.create(
            model=self.agent_configuration.model, messages=self.messages
        )

        self.messages.append(response.choices[0].message)

        print(f"{color_red}AI: {response.choices[0].message.content}")
        print(f"{color_normal}")

        return response.choices[0].message.content

    def create_response(self, text: str, original_message: TAImeSpaceMessage)-> TAImeSpaceMessage:
        response = ChatMessage(Message=text, Sender=self.agent_name, Timestamp=datetime.now())

        response_message = TAImeSpaceMessage(
            Header=TAImeSpaceMessageHeader(
                Sender = self.agent_name,
                Recipient = original_message.Header.Sender,
                MessageType = RoutingKeys.CHAT_MESSAGE_AI,
                MessageId = str(uuid.uuid4()),
                Timestamp = datetime.now().isoformat(),
                CorrelationId = original_message.Header.CorrelationId),
            Payload = response.model_dump_json(),
        )

        return response_message
