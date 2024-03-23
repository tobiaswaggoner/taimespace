import { Server as SocketIOServer, Socket } from "socket.io";
import { RabbitMQConnection } from '@/server/rabbitmq/rabbitmqconnection';
import { randomUUID } from "crypto";
import ITAImeSpaceMessage, { ITAImeSpaceMessageHeader } from '../../contract/Messages/ITAImeSpaceMessage'
import { RoutingKeys, RoutingKey, DefaultExchange } from '../../contract/RoutingKeys'
import IChatMessage from "@/contract/Messages/IChatMessage";

class ChatHandler {

    private io: SocketIOServer | null = null;
    private rmqConnection: RabbitMQConnection | null = null;
    private sockets: Map<string, Socket> = new Map();
    private userNameaa: string = 'User';
    private exchange: string = DefaultExchange;
    private correlationId: string = randomUUID();

    public init(io: SocketIOServer, rmqConnection: RabbitMQConnection) {
        this.io = io;
        this.rmqConnection = rmqConnection;
        this.rmqConnection.consume(this, this.handleIncomingNotification,this.exchange, RoutingKeys.CHAT_MESSAGE_AI, 'USER_USER');

        this.io.on('connection', (socket) => {
            console.log('a user connected');
            this.sockets.set(socket.id, socket);

            socket.onAny(this.handleOnAny);
            socket.on(RoutingKeys.CHAT_MESSAGE_USER, msg => this.handleForwardMessage(socket, RoutingKeys.CHAT_MESSAGE_USER as RoutingKey, msg as IChatMessage));
            socket.on(RoutingKeys.FILE_ADDED, msg => this.handleForwardMessage(socket, RoutingKeys.FILE_ADDED as RoutingKey, msg));
        });

        this.io.on('disconnect', (socket) => {
            console.log('a user disconnected');
            this.sockets.delete(socket.id);
        });
    }

    private handleForwardMessage(socket: Socket, routingKey: RoutingKey, msg: IChatMessage) {
        const message = {} as ITAImeSpaceMessage;
        message.Header = {} as ITAImeSpaceMessageHeader
        message.Header.Sender = msg.Sender;
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

        const msg = JSON.parse(message) as ITAImeSpaceMessage;
        // Check if the message is a TAImeSpaceMessage
        if(!msg.Header || !msg.Payload) return;
        // Check if the message is a ChatMessage
        if(msg.Header.MessageType !== RoutingKeys.CHAT_MESSAGE_AI) return;

        self.io.emit(msg.Header.MessageType, msg);
    }

    private handleOnAny(event: string, args: any) {
        console.log(event, args);
    }
}

const chatHandler = new ChatHandler();
export default chatHandler;
