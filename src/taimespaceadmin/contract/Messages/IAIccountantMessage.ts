interface IAIccountantMessageHeader{
    Sender: string;
    Recipient: string | null;
    MessageType: string;
    MessageId: string;
    Timestamp: string;
    CorrelationId: string;
}

interface IAIccountantMessage{
    Header: IAIccountantMessageHeader;
    Payload: string;
}

export type { IAIccountantMessageHeader}
export default IAIccountantMessage;