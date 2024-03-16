from datetime import datetime
from typing import Callable
from aio_pika import IncomingMessage
from messaging.MessageBroker import MessageBroker
import logging

from messaging.configuration.MessageBrokerConfiguration import (
    MessageBrokerConfiguration,
)


class BaseAgent:
    def __init__(
        self,
        message_broker_configuration: MessageBrokerConfiguration,
        agent_name: str,
        on_message_callback: Callable[[IncomingMessage], None],
        routing_key_patterns: list[str],
        logger: logging.Logger,
    ):
        self.message_broker_configuration = message_broker_configuration
        self.on_message_callback = on_message_callback
        self.agent_name = agent_name
        self.queue_name = (
            f"CHATBOT_PY_{agent_name}_{datetime.now().strftime('%Y-%m-%d-%H-%M-%S')}"
        )
        self.routing_key_pattern = routing_key_patterns
        self.logger = logger

    async def __aenter__(self):
        self.message_broker = MessageBroker(
            self.message_broker_configuration,
            self.logger,
            self.queue_name,
            self.routing_key_pattern,
            self.on_message_callback,
        )
        await self.message_broker.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.message_broker.__aexit__(exc_type, exc_val, exc_tb)

    async def send_message(self, message: str, routingKey: str):
        await self.message_broker.send_message(message, routingKey)
