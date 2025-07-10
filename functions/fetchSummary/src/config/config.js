"use strict";
// config.ts
exports.__esModule = true;
// Helper to enforce required environment variables
function requireEnv(name) {
    var value = process.env[name];
    if (!value) {
        throw new Error("Missing required environment variable: ".concat(name));
    }
    return value;
}
// Determine deployment platform
var platform = process.env.PLATFORM || 'aws';
var config = {
    platform: platform,
    appId: process.env.APPID || '',
    cosmosdb: {
        endpoint: platform === 'azure' ? requireEnv('DB_ENDPOINT') : '',
        key: platform === 'azure' ? requireEnv('DB_KEY') : '',
        databaseId: platform === 'azure' ? process.env.DB_ID || 'cosmicworks' : '',
        containerId: platform === 'azure' ? process.env.DB_CONTAINERID || 'customerreviews' : '',
        summcontainerId: platform === 'azure' ? process.env.DB_SUMMCONTAINERID || 'reviewsummary' : ''
    },
    awsregion: platform === 'aws' ? process.env.REGION || 'eu-north-1' : '',
    //sqsURL: platform === 'aws' ? requireEnv('SQSURL') : '',
    ddb: {
        reviewtable: platform === 'aws' ? process.env.DB_REVIEW_TABLE || 'customerreviews' : '',
        summarytable: platform === 'aws' ? process.env.DB_SUMM_TABLE || 'reviewsummary' : ''
    },
    //azqueue: {
    //    queuename: platform === 'azure' ? requireEnv('AZQUEUE_NAME') : '',
    //    queueurl: platform === 'azure' ? requireEnv('AZQUEUE_URL') : ''
    //},
    vault: platform === 'azure' ? requireEnv('KEY_VAULT_URL') : '',
    clientID: platform === 'azure' ? requireEnv('CLIENT_ID') : ''
};
exports["default"] = config;
