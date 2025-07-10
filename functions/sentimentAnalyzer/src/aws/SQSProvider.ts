
import { IQueueProvider } from '../interfaces/IQueueProvider';
import { SQSClient, SendMessageCommand, SendMessageCommandInput, SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import config from '../config/config';

export class SQSProvider implements IQueueProvider {

    private sqsClient: SQSClient = new SQSClient({ region: config.awsregion });
    private queueURL: string = config.sqsURL;
    
    async sendMessageToQueue(messageBody: string): Promise<any> {
        const params: SendMessageCommandInput = {
        DelaySeconds: 0, // Optional: The number of seconds to delay the delivery of the message (0-900). Default is 0.
        MessageBody: messageBody,
        QueueUrl: this.queueURL,
        MessageGroupId: 'SENTIMENT_ANALYSIS'
    };

    try {
        const command: SendMessageCommand = new SendMessageCommand(params);
        const data: SendMessageCommandOutput = await this.sqsClient.send(command);
        console.log('Success, message ID:', data.MessageId);
        return data.MessageId;
    } catch (err: any) { // Type 'any' is used here for broader error handling. Consider more specific error types if known.
        console.error('Error sending message:', err);
        // Optionally, rethrow the error or handle it more specifically
        return undefined;
    }
    }
}