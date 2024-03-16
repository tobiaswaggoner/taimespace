from datetime import datetime
import json
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

    async def on_message_callback(self, message: aio_pika.message.IncomingMessage):
        bodyString = message.body.decode()
        body = json.loads(bodyString)
        payloadString = body["Payload"]
        payload = json.loads(payloadString)
        payload_message = payload["Message"]
        response = self.complete_message(payload_message)
        payload["Message"] = response
        payload["Sender"] = self.agent_name
        payload["Timestamp"] = datetime.now().isoformat()
        body["Header"]["Sender"] = self.agent_name
        body["Header"]["Recipient"] = "User"
        body["Header"]["MessageType"] = RoutingKeys.CHAT_MESSAGE_AI
        body["Payload"] = json.dumps(payload)
        self.logger.log(
            logging.INFO, f"AI {self.agent_name} sending message: {payload}"
        )
        await self.send_message(json.dumps(body), RoutingKeys.CHAT_MESSAGE_AI)

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
