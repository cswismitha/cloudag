//import { DynamoDBProvider } from "./aws/DynamoDBProvider";
//import { CosmosDBProvider } from "./azure/CosmosDBProvider";
import { IDatabaseProvider } from "./interfaces/IDatabaseProvider";
//import { KeyVaultProvider } from "./azure/KeyVaultProvider";
import { SummaryService } from "./services/SummaryService";

/**
 * A simple Lambda function that processes an API Gateway proxy event.
 * It echoes the request body and adds a greeting.
 *
 * @param event The API Gateway proxy event.
 * @param context The Lambda context object.
 * @returns A Promise that resolves to an API Gateway proxy result.
 */
export const handler = async ( event: any, context: any ): Promise<any> => {
  //const platform = process.env.PLATFORM || 'azure';
  const platform = process.env.PLATFORM;

  if (platform !== 'aws' && platform !== 'azure') {
  throw new Error(`Invalid or missing PLATFORM env variable: ${platform}`);
  }
  let responseBody: any;
  let statusCode: number = 200;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // CORS for API Gateway
  };

  try {    
    let requestBody: any = null;
    let dbProvider: IDatabaseProvider | undefined; // = new DynamoDBProvider();
    // Handling request based on platform
    if (platform === 'azure') {
      const { KeyVaultProvider } = require('./azure/KeyVaultProvider');
      const { CosmosDBProvider } = require('./azure/CosmosDBProvider');
      const secProvider = new KeyVaultProvider();
      const connectionString = await secProvider.getSecret('dbconnstring');
      dbProvider = new CosmosDBProvider(connectionString);

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
      dbProvider = new DynamoDBProvider();
      
      if (!event.body) {
        throw new Error('Request body is missing.');
      }
      requestBody = JSON.parse(event.body);
    } else {
      console.log("Platform not supported");
    }
    const summaryService = new SummaryService(dbProvider as IDatabaseProvider);
    const sentAnalysis = await summaryService.process();
    console.log('Processed');
    responseBody = {
        message: sentAnalysis,
        input: requestBody
      };
    
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