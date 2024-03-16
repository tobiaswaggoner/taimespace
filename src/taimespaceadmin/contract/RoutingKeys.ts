class RoutingKeys {
    static CHAT_MESSAGE_USER: string = "CHAT_MESSAGE_USER";
    static CHAT_MESSAGE_AI: string = "CHAT_MESSAGE_AI";
    static FILE_ADDED: string = "FILE_ADDED";
    static FILE_CREATED: string = "FILE_CREATED";
}

type RoutingKey = keyof typeof RoutingKeys;

export const DefaultExchange = "TAIMESPACE_DEV";
export { RoutingKeys };
export type { RoutingKey };