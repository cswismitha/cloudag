
import { ISecretsProvider } from '../interfaces/ISecretsProvider';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import config from '../config/config';

export class KeyVaultProvider implements ISecretsProvider {
    private client: SecretClient;

    constructor() {
        const url = config.vault;
        const credential = new DefaultAzureCredential({
            managedIdentityClientId: config.clientID
        });
        this.client = new SecretClient(url, credential);
    }

    async getSecret(name: string): Promise<string> {
        const secret = await this.client.getSecret(name);
        return secret.value!;
    }
}
