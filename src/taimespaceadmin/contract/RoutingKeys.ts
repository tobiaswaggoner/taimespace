class RoutingKeys {
    static CHAT_MESSAGE_USER: string = "CHAT_MESSAGE_USER";
    static CHAT_MESSAGE_AI: string = "CHAT_MESSAGE_AI";
    static FILE_ADDED: string = "FILE_ADDED";
    static FILE_CREATED: string = "FILE_CREATED";
    static VOUCHER_CREATED: string = "VOUCHER_CREATED";
}

type RoutingKey = keyof typeof RoutingKeys;

export const DefaultExchange = "AICCOUNTANT";
export { RoutingKeys };
export type { RoutingKey };