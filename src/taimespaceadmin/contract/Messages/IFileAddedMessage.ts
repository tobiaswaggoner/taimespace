export default interface IFileAddedMessage {
    FileName: string;  
    Type: string;
    Size: number;
    LastModified: Date;
    Data: string;
}