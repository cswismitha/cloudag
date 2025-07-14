// config.ts

interface CosmosDBConfig {
    endpoint: string;
    key: string;
    databaseId: string;
    containerId: string;
    summcontainerId: string;
}

interface DynamoDBConfig {
    reviewtable: string;
    summarytable: string;
}

interface AppConfig {
    platform: string;
    appId: string;
    cosmosdb: CosmosDBConfig;
    awsregion: string;
    ddb: DynamoDBConfig;
    vault: string;
    clientID: string;
}

// Helper to enforce required environment variables
function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

// Determine deployment platform
const platform = process.env.PLATFORM || 'aws';

const config: AppConfig = {
    platform,
    appId: process.env.APPID || '',
    cosmosdb: {
        endpoint: platform === 'azure' ? requireEnv('DB_ENDPOINT') : '',
        key: platform === 'azure' ? requireEnv('DB_KEY') : '',
        databaseId: platform === 'azure' ? process.env.DB_ID || 'cosmicworks' : '',
        containerId: platform === 'azure' ? process.env.DB_CONTAINERID || 'customerreviews' : '',
        summcontainerId: platform === 'azure' ? process.env.DB_SUMMCONTAINERID || 'reviewsummary' : process.env.DB_SUMM_TABLE || 'reviewsummary'
    },
    awsregion: platform === 'aws' ? process.env.REGION || 'eu-north-1' : '',
    ddb: {
        reviewtable: platform === 'aws' ? process.env.DB_REVIEW_TABLE || 'customerreviews' : '',
        summarytable: platform === 'aws' ? process.env.DB_SUMM_TABLE || 'reviewsummary' : ''
    },
    vault: platform === 'azure' ? requireEnv('KEY_VAULT_URL') : '',
    clientID: platform === 'azure' ? requireEnv('CLIENT_ID') : ''
};

export default config;

