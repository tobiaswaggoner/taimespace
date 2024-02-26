import client, { Connection, Channel, ConsumeMessage } from "amqplib";
import { RoutingKey } from "../../contract/RoutingKeys";

type HandlerCB = (self: any, msg: string) => any;

class RabbitMQConnection {
    connection!: Connection;
    channel!: Channel;
    private connected!: Boolean;

    async connect() {
        if (this.connected && this.channel) return;
        else this.connected = true;

        const rmqhost = process.env.RMQ_HOST || "localhost"
        const rmqUser = process.env.RMQ_USER || "myuser"
        const rmqPass = process.env.RMQ_PASS || "mypassword"
        const rmqPort = process.env.RMQ_PORT || "5672"

        try {
            console.log(`⌛️ Connecting to Rabbit-MQ Server`);
            this.connection = await client.connect(
                `amqp://${rmqUser}:${rmqPass}@${rmqhost}:${rmqPort}`
            );

            console.log(`✅ Rabbit MQ Connection is ready`);

            this.channel = await this.connection.createChannel();

            console.log(`🛸 Created RabbitMQ Channel successfully`);
        } catch (error) {
            console.error(error);
            console.error(`Not connected to MQ Server`);
        }
    }

    async sendToExchange(exchange: string, message: any, routingKey: RoutingKey) {
        try {
            if (!this.channel) {
                await this.connect();
            }
            await this.channel.assertExchange(exchange, 'topic');
            this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    async consume(self: any, handleIncomingNotification: HandlerCB, exchange: string, routingKeyPattern: string | RoutingKey, notificationQueue: string) {

        if (!this.channel) {
            await this.connect();
        }

        await this.channel.assertQueue(notificationQueue, {
            durable: true,
            messageTtl: 300000,
        });

        await this.channel.assertExchange(exchange, 'topic');
        await this.channel.bindQueue(notificationQueue, exchange, routingKeyPattern);

        this.channel.consume(
            notificationQueue,
            (msg) => {
                {
                    if (!msg) {
                        return console.error(`Invalid incoming message`);
                    }
                    handleIncomingNotification(self, msg?.content?.toString());
                    this.channel.ack(msg);
                }
            },
            {
                noAck: false,
            }
        );

    }
}


const mqConnection = new RabbitMQConnection();

export type { HandlerCB, RabbitMQConnection };
export default mqConnection;