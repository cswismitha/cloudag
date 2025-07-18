//import { DynamoDBProvider } from "./aws/DynamoDBProvider";
//import { SQSProvider } from "./aws/SQSProvider";
//import { CosmosDBProvider } from "./azure/CosmosDBProvider";
//import { KeyVaultProvider } from "./azure/KeyVaultProvider";
//import { StorageQueueProvider } from "./azure/StorageQueueProvider";
import { IDatabaseProvider } from "./interfaces/IDatabaseProvider";
import { IQueueProvider } from "./interfaces/IQueueProvider";
import { ReviewService } from "./services/ReviewService";
import config from "./config/config";

/**
 * A simple Lambda function that processes an API Gateway proxy event.
 * It echoes the request body and adds a greeting.
 *
 * @param event The API Gateway proxy event.
 * @param context The Lambda context object.
 * @returns A Promise that resolves to an API Gateway proxy result.
 */
export const handler = async ( event: any, context: any ): Promise<any> => {
  const platform = process.env.PLATFORM || 'azure';
  let responseBody: any;
  let statusCode: number = 200;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // CORS for API Gateway
  };

  try {    
    let requestBody: any = null;
    let dbProvider: IDatabaseProvider | undefined; //= new DynamoDBProvider();
    let qProvider: IQueueProvider | undefined; //= new StorageQueueProvider();
    // Handling request based on platform
    if (platform === 'azure') {  
      const { CosmosDBProvider } = require('./azure/CosmosDBProvider');
      const { StorageQueueProvider } = require('./azure/StorageQueueProvider');
      const { KeyVaultProvider } = require('./azure/KeyVaultProvider');
      const secProvider = new KeyVaultProvider();
      //const connectionString = await secProvider.getSecret('dbconnstring');
      dbProvider = new CosmosDBProvider(config.cosmosdb.endpoint);
      qProvider = new StorageQueueProvider();
      try {
          requestBody = await event.json();
      } catch (error: any) {
          // Body might not be JSON, or empty
          context.log('Request body was not JSON or was empty:', error.message);
          // Fallback to text if needed, or handle as empty
          requestBody = await event.text(); // Or leave as null
      }
    } else if (platform === 'aws') {
      const { DynamoDBProvider } = require('./aws/DynamoDBProvider');
      const { SQSProvider } = require('./aws/SQSProvider');
      dbProvider = new DynamoDBProvider();
      qProvider = new SQSProvider();
      if (!event.body) {
        throw new Error('Request body is missing.');
      }
      requestBody = JSON.parse(event.body);
    } else {
      console.log("Platform not supported");
    }
    console.log("APP ID found: ", requestBody.appId);
    if (!requestBody.appId) throw new Error("App Id not in the request");
    
    const reviewService = new ReviewService(dbProvider as IDatabaseProvider, qProvider as IQueueProvider);
    requestBody = await reviewService.process(requestBody.appId);
    console.log('Processed');    
  } catch (error: any) {
    console.error('Error processing event:', error);
    statusCode = 400; // Bad Request
    responseBody = {
      message: 'Failed to process request.',
      error: error.message || 'An unknown error occurred.',
    };
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(responseBody),
  };
};