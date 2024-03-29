import asyncio
import os
import signal
from dotenv import load_dotenv
from agents.SimpleAgent.SimpleAgent import SimpleAgent
from agents.configuration.AgentConfiguration import AgentConfiguration
from common.contracts.RoutingKeys import RoutingKeys
from messaging.configuration.MessageBrokerConfiguration import (
    MessageBrokerConfiguration,
)
from util.get_logger import get_logger

shutdown_signal = asyncio.Event()

async def start_app():
    logger = get_logger()
    logger.info("Starting the application")

    agent = SimpleAgent(
        message_broker_configuration=get_rabbit_mq_configuration(),
        agent_configuration=get_agent_configuration(),
        logger=logger,
    )
    await agent.__aenter__()
    await shutdown_signal.wait()
    await agent.__aexit__(None, None, None)
    print("Done!")

def handle_sigterm(*args):
    shutdown_signal.set()

def get_rabbit_mq_configuration() -> MessageBrokerConfiguration:
    load_dotenv("rabbitmq.env")
    user = os.getenv("RMQ_USER")
    password = os.getenv("RMQ_PASS")
    exchange_name = os.getenv("RMQ_EXCHANGE_NAME")
    host = os.getenv("RMQ_HOST")
    port = int(os.getenv("RMQ_PORT"))

    message_broker_configuration = MessageBrokerConfiguration(
        host, port, user, password, exchange_name
    )

    return message_broker_configuration


def get_agent_configuration() -> AgentConfiguration:
    agent_configuration = AgentConfiguration(
        "A Simple Agent",
        [RoutingKeys.CHAT_MESSAGE_USER],
        "Du bist ein KI Assistent. Du sprichst mit Schülern der neunten Klasse in Breitungen. Du bist meistens zynisch und schlecht gelaunt.",
        "gpt-3.5-turbo",
    )
    return agent_configuration


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, handle_sigterm)
    signal.signal(signal.SIGINT, handle_sigterm)
    asyncio.run(start_app())
