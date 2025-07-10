
import { ISecretsProvider } from '../interfaces/ISecretsProvider';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  GetSecretValueCommandOutput,
} from '@aws-sdk/client-secrets-manager';
import config from '../config/config';

export class SecretsManagerProvider implements ISecretsProvider {

    async getSecret(secretName: string): Promise<string> {
        const client = new SecretsManagerClient({ region: config.awsregion });

        try {
            const command = new GetSecretValueCommand({
            SecretId: secretName,
            });

            const response: GetSecretValueCommandOutput = await client.send(command);

            if (response.SecretString) {
                return response.SecretString;
            } else if (response.SecretBinary) {
                // SecretBinary is a Uint8Array, you might need to decode it
                // depending on its content (e.g., base64 encoded string, raw binary)
                return Buffer.from(response.SecretBinary).toString("utf8");
            } else {
                console.warn(`Secret '${secretName}' found, but contains no SecretString or SecretBinary.`);
                return "";
            }
        } catch (error) {
            console.error(`Error retrieving secret '${secretName}':`, error);
            // You might want to throw the error or handle it more gracefully based on your application's needs
            throw error;
        }
    }
}
