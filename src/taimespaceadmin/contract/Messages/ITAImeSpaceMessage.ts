interface ITAImeSpaceMessageHeader{
    Sender: string;
    Recipient: string | null;
    MessageType: string;
    MessageId: string;
    Timestamp: string;
    CorrelationId: string;
}

interface ITAImeSpaceMessage{
    Header: ITAImeSpaceMessageHeader;
    Payload: string;
}

export type { ITAImeSpaceMessageHeader as ITAImeSpaceMessageHeader}
export default ITAImeSpaceMessage;