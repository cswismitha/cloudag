interface AppConfig {
    //sgapikey: string;
    tomailid: string;
    frommailid: string;
    awsregion: string;
    sqsURL: string;
    azqueue: {
        queuename: string;
        queueurl: string;
    };
    vault: string;
    clientID: string;
    platform: string;
    sgapikey: string;
}

// Enforce required env vars
function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

// Determine platform
const platform = process.env.PLATFORM || 'aws';

const config: AppConfig = {
    platform,
    sgapikey: platform === 'aws' ? requireEnv('SENDGRID_SECRET_NAME') : '',
    tomailid: requireEnv('TO_EMAIL'),
    frommailid: requireEnv('FROM_EMAIL'),
    awsregion: process.env.REGION || 'eu-north-1',
    sqsURL: platform === 'aws' ? requireEnv('SQSURL') : '',
    azqueue: {
        queuename: platform === 'azure' ? requireEnv('AZQUEUE_NAME') : '',
        queueurl: platform === 'azure' ? requireEnv('AZQUEUE_URL') : ''
    },
    vault: platform === 'azure' ? requireEnv('KEY_VAULT_URL') : '',
    clientID: platform === 'azure' ? requireEnv('CLIENT_ID') : ''
};

export default config;
