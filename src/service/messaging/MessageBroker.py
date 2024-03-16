from typing import Callable
import aio_pika
from aio_pika import IncomingMessage
import logging

from messaging.configuration.MessageBrokerConfiguration import (
    MessageBrokerConfiguration,
)


class MessageBroker(object):

    def __init__(
        self,
        message_broker_configuration: MessageBrokerConfiguration,
        logger: logging.Logger,
        own_queue_name: str | None = None,
        routing_keys: list[str] | None = None,
        on_message_callback: Callable[[IncomingMessage], None] | None = None,
    ):
        self.host = message_broker_configuration.host
        self.port = message_broker_configuration.port
        self.username = message_broker_configuration.username
        self.password = message_broker_configuration.password
        self.exchange_name = message_broker_configuration.exchange_name
        self.logger = logger
        self.on_message_callback = on_message_callback
        self.own_queue_name = own_queue_name
        self.routing_keys = routing_keys

    async def __aenter__(self):
        self.connection = await aio_pika.connect_robust(
            host=self.host, port=self.port, login=self.username, password=self.password
        )
        self.channel = await self.connection.channel()
        self.exchange: aio_pika.exchange.AbstractExchange = (
            await self.channel.declare_exchange(
                name=self.exchange_name, type="topic", durable=True
            )
        )
        if self.own_queue_name != None:
            self.queue: aio_pika.queue.AbstractQueue = await self.channel.declare_queue(
                name=self.own_queue_name,
                auto_delete=True,
            )
            for routing_key in self.routing_keys:
                await self.queue.bind(self.exchange_name, routing_key=routing_key)
            await self.queue.consume(self.callback)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.logger.debug("Connection closed")
        await self.connection.close()

    async def send_message(self, message: str, routing_key: str):
        await self.exchange.publish(
            message=aio_pika.message.Message(body=message.encode()),
            routing_key=routing_key,
        )
        self.logger.debug(f"... [x] Sent {message}")

    async def callback(self, message: aio_pika.message.IncomingMessage):
        async with message.process():
            self.logger.debug(
                f"... Broker: {self.own_queue_name}/{message.routing_key} Received message: "
                + message.body.decode()
            )
            if self.on_message_callback:
                await self.on_message_callback(message)
