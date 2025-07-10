interface AppConfig {
    platform: string;
    appId: string;
    cosmosdb: {
        endpoint: string;
        databaseId: string;
        containerId: string;
        summContainerId: string;
    };
    awsregion: string;
    sqsURL: string;
    ddb: {
        reviewtable: string;
        summarytable: string;
    };
    azqueue: {
        queuename: string;
        queueurl: string;
    };
    vault: string;
    clientID: string;
    geminiApiKey: string;
    openrouterApiKey: string;
}

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

const platform = process.env.PLATFORM || 'aws'; // or 'azure'

const config: AppConfig = {
    platform,
    appId: process.env.APPID || '',
    cosmosdb: {
        endpoint: platform === 'azure' ? requireEnv('DB_ENDPOINT') : '',
        databaseId: process.env.DB_ID || 'cosmicworks',
        containerId: process.env.DB_CONTAINERID || 'customerreviews',
        summContainerId: process.env.DB_SUMMCONTAINERID || 'reviewsummary',
    },
    awsregion: process.env.REGION || 'eu-north-1',
    sqsURL: platform === 'aws' ? requireEnv('SQSURL') : '',
    ddb: {
        reviewtable: process.env.DB_REVIEW_TABLE || 'customerreviews',
        summarytable: process.env.DB_SUMM_TABLE || 'reviewsummary',
    },
    azqueue: {
        queuename: process.env.AZQUEUE_NAME || 'js-queue-items',
        queueurl: platform === 'azure' ? requireEnv('AZQUEUE_URL') : '',
    },
    vault: platform === 'azure' ? requireEnv('KEY_VAULT_URL') : '',
    clientID: platform === 'azure' ? requireEnv('CLIENT_ID') : '',
    geminiApiKey: process.env.GEMINI_KEY || '',
    openrouterApiKey: process.env.OPENROUTER_API_KEY || ''
};
export default config;