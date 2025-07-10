export interface IQueueProvider {
    sendMessageToQueue(message: any): Promise<any>;
}
