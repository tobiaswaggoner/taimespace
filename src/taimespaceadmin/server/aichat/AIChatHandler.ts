import { randomUUID } from "crypto";
import { RabbitMQConnection } from "../rabbitmq/rabbitmqconnection";
import OpenAICompletion from "./OpenAICompletion";
import { RoutingKeys, RoutingKey, DefaultExchange } from "../../contract/RoutingKeys";
import IAIccountantMessage, {IAIccountantMessageHeader}  from "../../contract/Messages/IAIccountantMessage";
import IChatMessage from "../../contract/Messages/IChatMessage";

class AIChatHandler {

    private rmqConnection: RabbitMQConnection|null = null;
    private userName: string = 'AIChatBot';
    private chatCompletion: OpenAICompletion|null = null;
    private exchange: string = DefaultExchange;

    init(rmwConnection: RabbitMQConnection) {
        this.rmqConnection = rmwConnection;
        this.rmqConnection.consume(this, this.handleIncomingNotification, this.exchange, RoutingKeys.CHAT_MESSAGE_USER, 'CHATBOT_' + this.userName);
        this.chatCompletion = new OpenAICompletion();
    }

    async handleIncomingNotification(self: AIChatHandler, message: string) {
        console.log(`Chatbot: Incoming message: ${message}`);

        const msg = JSON.parse(message) as IAIccountantMessage
        // Check if the message is a AIccountantMessage
        if(!msg.Header || !msg.Payload) return;
        // Check if the message is for this user
        if(msg.Header.MessageType != RoutingKeys.CHAT_MESSAGE_USER) return;

        let aiResponse = "";

        const msgType = msg.Header.MessageType;

        if(msgType == RoutingKeys.CHAT_MESSAGE_USER)
        {
            aiResponse = await self.handleChatMessage(self, msg);
        }

        if (!aiResponse) return;

        const response = {} as IAIccountantMessage;
        response.Header = {} as IAIccountantMessageHeader;
        response.Header.Sender = self.userName;
        response.Header.MessageId = randomUUID();
        response.Header.CorrelationId = msg.Header.CorrelationId;
        response.Header.Timestamp = new Date().toISOString();
        response.Header.Recipient = msg.Header.Sender;
        response.Header.MessageType = RoutingKeys.CHAT_MESSAGE_AI;

        const responseMessage = {} as IChatMessage;
        responseMessage.Message = aiResponse;
        responseMessage.Sender = self.userName;
        responseMessage.Timestamp = new Date();

        response.Payload = JSON.stringify(responseMessage);
        self.rmqConnection?.sendToExchange(self.exchange, response, RoutingKeys.CHAT_MESSAGE_AI as RoutingKey);
    }

    async handleChatMessage(self: AIChatHandler, msg: IAIccountantMessage): Promise<string>
    {
        const payload = JSON.parse(msg.Payload) as IChatMessage;
        if(!payload.Message) return "";

        console.log("Chat Message!", payload.Message);

        const aiResponse = await self.chatCompletion?.complete(payload.Message);
        return aiResponse || "";
    }
}

const chatHandler = new AIChatHandler();
export default chatHandler;