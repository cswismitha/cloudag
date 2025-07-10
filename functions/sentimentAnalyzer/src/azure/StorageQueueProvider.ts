
import { IQueueProvider } from '../interfaces/IQueueProvider';
import { QueueServiceClient } from "@azure/storage-queue";
import config from '../config/config';

export class StorageQueueProvider implements IQueueProvider {
    
    async sendMessageToQueue(message: string): Promise<SendMessageResponse> {
        let response: SendMessageResponse;
        console.log('HTTP trigger function processed a request.');

        const queueName: string = config.azqueue.queuename;
        const connectionString: string | undefined = config.azqueue.queueurl;

        if (!connectionString) {
            response = {
                status: 500,
                body: "Azure Storage connection string is missing. Ensure the 'AzureWebJobsStorage' application setting is configured."
            };
            return response; // Return the response here
        }

        try {
            const queueServiceClient: QueueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
            const queueClient = queueServiceClient.getQueueClient(queueName); // Type inferred by TypeScript

            if (message) {
                const enqueueResult = await queueClient.sendMessage(message);
                console.log(`Enqueued message ID: ${enqueueResult.messageId}`);

                response = {
                    status: 200,
                    body: `Message "${message}" enqueued successfully with ID: ${enqueueResult.messageId}`
                };
            } else {
                response = {
                    status: 400,
                    body: "Please pass a 'message' in the request body or query string."
                };
            }
        } catch (error: any) { // Catching 'any' is common for errors, but you could be more specific if you know the error types
            console.log("Error sending message to queue:", error);
            response = {
                status: 500,
                body: `Error sending message to queue: ${(error as Error).message || String(error)}`
            };
        }
        return response;
    }
}

interface SendMessageResponse {
    status: number;
    body: string;
}