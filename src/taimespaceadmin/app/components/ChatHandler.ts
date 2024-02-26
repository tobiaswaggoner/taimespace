import { Server as SocketIOServer, Socket } from "socket.io";
import { RabbitMQConnection } from '@/server/rabbitmq/rabbitmqconnection';
import { randomUUID } from "crypto";
import IAIccountantMessage, { IAIccountantMessageHeader } from '../../contract/Messages/IAIccountantMessage'
import { RoutingKeys, RoutingKey, DefaultExchange } from '../../contract/RoutingKeys'

class ChatHandler {

    private io: SocketIOServer | null = null;
    private rmqConnection: RabbitMQConnection | null = null;
    private sockets: Map<string, Socket> = new Map();
    private userName: string = 'User';
    private exchange: string = DefaultExchange;
    private correlationId: string = randomUUID();

    public init(io: SocketIOServer, rmqConnection: RabbitMQConnection) {
        this.io = io;
        this.rmqConnection = rmqConnection;
        this.rmqConnection.consume(this, this.handleIncomingNotification,this.exchange, RoutingKeys.CHAT_MESSAGE_AI, 'USER_' + this.userName);

        this.io.on('connection', (socket) => {
            console.log('a user connected');
            this.sockets.set(socket.id, socket);

            socket.onAny(this.handleOnAny);
            socket.on(RoutingKeys.CHAT_MESSAGE_USER, msg => this.handleForwardMessage(socket, RoutingKeys.CHAT_MESSAGE_USER as RoutingKey, msg));
            socket.on(RoutingKeys.FILE_ADDED, msg => this.handleForwardMessage(socket, RoutingKeys.FILE_ADDED as RoutingKey, msg));
        });

        this.io.on('disconnect', (socket) => {
            console.log('a user disconnected');
            this.sockets.delete(socket.id);
        });
    }

    private handleForwardMessage(socket: Socket, routingKey: RoutingKey, msg: any) {
        const message = {} as IAIccountantMessage;
        message.Header = {} as IAIccountantMessageHeader
        message.Header.Sender = this.userName;
        message.Header.MessageType = routingKey;
        message.Header.MessageId = randomUUID();
        message.Header.Timestamp = new Date().toISOString();
        message.Header.CorrelationId = this.correlationId;

        message.Payload = JSON.stringify(msg)

        this.rmqConnection?.sendToExchange(this.exchange, message, routingKey);
    }

    handleIncomingNotification( self:ChatHandler, message: string) {
        console.log(`User: Incoming message: ${message}`);
        if(!self.io) return;

        const msg = JSON.parse(message) as IAIccountantMessage;
        // Check if the message is a AIccountantMessage
        if(!msg.Header || !msg.Payload) return;
        // Check if the message is a ChatMessage
        if(msg.Header.MessageType !== RoutingKeys.CHAT_MESSAGE_AI) return;
        // Check if the message is for this user
        if(msg.Header.Recipient && msg.Header.Recipient !== self.userName) return;

        self.io.emit(msg.Header.MessageType, msg);
    }

    private handleOnAny(event: string, args: any) {
        console.log(event, args);
    }
}

const chatHandler = new ChatHandler();
export default chatHandler;
