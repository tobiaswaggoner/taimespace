class RoutingKeys {
    static CHAT_MESSAGE_USER: string = "CHAT_MESSAGE_USER";
    static CHAT_MESSAGE_AI: string = "CHAT_MESSAGE_AI";
}

type RoutingKey = keyof typeof RoutingKeys;

export const DefaultExchange = "TAIMESPACE";
export { RoutingKeys };
export type { RoutingKey };