//import { SecretsManagerProvider } from "./aws/SecretsManagerProvider";
//import { KeyVaultProvider } from "./azure/KeyVaultProvider";
import config from "./config/config";
import { ISecretsProvider } from "./interfaces/ISecretsProvider";
import { EmailService } from "./services/EmailService";

/**
 * A simple function that processes an SQS event or Queue trigger.
 * It sends the notification of summary.
 *
 * @param queueItem The SQS event/Queue Trigger.
 * @param context The Lambda context object.
 * @returns A Promise that resolves to an API Gateway proxy result.
 */
export const handler = async ( queueItem: any, context: any ): Promise<any> => {
  const platform = process.env.PLATFORM || 'azure';
  let responseBody: any;
  let statusCode: number = 200;
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // CORS for API Gateway
  };

  try {
    let secProvider: ISecretsProvider;
    let sgapikey: string = '';
    // Handling request based on platform
    if (platform === 'azure') {
      const { KeyVaultProvider } = require('./azure/KeyVaultProvider');
      secProvider = new KeyVaultProvider();
      sgapikey = await secProvider.getSecret('sendgridApikey');  //('sgKey');
      console.log('Secret processed work item:', sgapikey);
    } else if (platform === 'aws') {
      const { SecretsManagerProvider } = require('./aws/SecretsManagerProvider');
      secProvider = new SecretsManagerProvider();
      sgapikey = await secProvider.getSecret(config.sgapikey);   //('poc/sentiment');
      console.log('Secret processed work item:', sgapikey);
      console.log('Storage queue function processed work item:', sgapikey);
    } else {
      console.log("Platform not supported");
    }      
    const emailService = new EmailService(sgapikey);
    await emailService.send();
    console.log('Processed');
    responseBody = {
      message: 'Email sent successfully!'
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