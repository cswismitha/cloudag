# cloudag

# Sentiment Analysis Service

A TypeScript-based serverless application that fetches app reviews from iTunes RSS Feed API, performs sentiment analysis, and stores results in cloud databases. The service supports both AWS Lambda and Azure Functions deployment with corresponding cloud services.

## 🏗️ Architecture

This application follows a multi-cloud architecture pattern with:

- **Cloud Providers**: AWS Lambda / Azure Functions
- **Databases**: DynamoDB (AWS) / Cosmos DB (Azure)
- **Queues**: SQS (AWS) / Storage Queue (Azure)
- **Secrets Management**: AWS Secrets Manager / Azure Key Vault
- **Language**: TypeScript with Node.js runtime

## 🚀 Features

- **Multi-Cloud Support**: Deploy to either AWS or Azure with platform-specific configurations
- **iTunes Integration**: Fetches app reviews from iTunes RSS Feed API
- **Sentiment Analysis**: Analyzes review sentiment using the `sentiment` library
- **Text Summarization**: Generates summaries using `node-summarizer`
- **Cloud Storage**: Stores reviews and summaries in cloud databases
- **Queue Notifications**: Sends completion notifications via cloud queues
- **TypeScript**: Fully typed codebase with interfaces and type safety

## 📁 Project Structure

```
src/
├── aws/                    # AWS-specific implementations
│   ├── DynamoDBProvider.ts
│   ├── SecretsManagerProvider.ts
│   └── SQSProvider.ts
├── azure/                  # Azure-specific implementations
│   ├── CosmosDBProvider.ts
│   ├── KeyVaultProvider.ts
│   ├── StorageQueueProvider.ts
│   ├── function.json
│   └── index.ts
├── common/                 # Shared business logic
│   ├── itunes.ts          # iTunes API integration
│   ├── openrouterclient.ts   # Open router LLM API integration
│   ├── summarize.ts       # Text summarization
│   └── types.ts
├── config/                 # Configuration management
│   └── config.ts
├── interfaces/             # TypeScript interfaces
│   ├── IDatabaseProvider.ts
│   ├── IQueueProvider.ts
│   └── ISecretsProvider.ts
├── services/               # Business services
│   └── ReviewService.ts
├── types/                  # Type definitions
│   └── node-summarizer.d.ts
├── utils/                  # Utility functions
│   └── index.ts
└── handler.ts             # Main entry point
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

#### Common
- `PLATFORM`: Target platform (`aws` or `azure`, default: `azure`)
- `APPID`: iTunes App ID to fetch reviews for (default: `389801252`)

#### AWS Configuration
- `REGION`: AWS region (default: `eu-north-1`)
- `SQSURL`: Amazon SQS queue URL
- `DB_REVIEW_TABLE`: DynamoDB table for storing reviews (default: `customerreviews`)
- `DB_SUMM_TABLE`: DynamoDB table for storing summaries (default: `reviewsummary`)

#### Azure Configuration
- `DB_ENDPOINT`: Cosmos DB endpoint URL
- `DB_KEY`: Cosmos DB access key
- `DB_ID`: Cosmos DB database ID (default: `cosmicworks`)
- `DB_CONTAINERID`: Cosmos DB container for reviews (default: `customerreviews`)
- `DB_SUMMCONTAINERID`: Cosmos DB container for summaries (default: `reviewsummary`)
- `AZQUEUE_NAME`: Azure Storage Queue name (default: `js-queue-items`)
- `AZQUEUE_URL`: Azure Storage Queue URL
- `KEY_VAULT_URL`: Azure Key Vault URL
- `CLIENT_ID`: Managed Identity Client ID
- `OPENROUTER_API_KEY`: Open Router API Key

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- TypeScript
- AWS CLI (for AWS deployment) or Azure CLI (for Azure deployment)

### Install Dependencies
```bash
npm install
```

### Build the Project
```bash
npm run build
```

## 📦 Dependencies

### Runtime Dependencies
- `@aws-sdk/client-dynamodb`: AWS DynamoDB client
- `@aws-sdk/client-sqs`: AWS SQS client
- `@azure/cosmos`: Azure Cosmos DB client
- `@azure/functions`: Azure Functions runtime
- `@azure/storage-queue`: Azure Storage Queue client
- `axios`: HTTP client for iTunes API
- `node-summarizer`: Text summarization library
- `sentiment`: Sentiment analysis library

### Development Dependencies
- `typescript`: TypeScript compiler
- `@types/*`: Type definitions for various libraries

## 🚀 Deployment

### AWS Lambda Deployment

1. Set the platform environment variable:
   ```bash
   export PLATFORM=aws
   ```

2. Configure AWS credentials and deploy using your preferred method:
   - AWS SAM
   - Serverless Framework
   - AWS CDK
   - Manual ZIP upload

### Azure Functions Deployment

1. Set the platform environment variable:
   ```bash
   export PLATFORM=azure
   ```

2. Deploy using Azure Functions Core Tools:
   ```bash
   func azure functionapp publish <your-function-app-name>
   ```

## 🔄 Workflow

1. **Trigger**: HTTP request triggers the function
2. **Fetch Reviews**: Retrieves app reviews from iTunes RSS Feed API
3. **Store Reviews**: Saves individual reviews to cloud database
4. **Analyze Sentiment**: Processes reviews for sentiment analysis
5. **Generate Summary**: Creates a summary of all reviews
6. **Store Summary**: Saves the summary to cloud database
7. **Queue Notification**: Sends completion message to cloud queue
8. **Response**: Returns the sentiment analysis summary

## 📊 Data Models

### Review Entry
```typescript
interface AppReviewEntry {
    content: {
        label: string;
        attributes: {
            type: string;
        };
    };
}
```

### AWS DynamoDB Schema
```
Reviews Table:
- PK: "APP#{appId}"
- SK: "CR#{timestamp}"
- id, title, content, updated

Summary Table:
- PK: "APP#{appId}"
- SK: "SUMM#{timestamp}"
- summary, updated
```

### Azure Cosmos DB Schema
```
Reviews Container:
- id, title, appId, content, updated

Summary Container:
- id, appId, summary, updated
```

### Azure Key Vault
- `dbconnstring` - DB Connection string

## 🔐 Security & Permissions

### AWS IAM Permissions
- `AWSLambdaBasicExecutionRole`
- `AmazonDynamoDBFullAccess`
- `AmazonSQSFullAccess`

### Azure Permissions
- Cosmos DB read/write access
- Storage Queue access
- Key Vault access (if using secrets)

## 📝 API

### HTTP Trigger

**Endpoint**: Configured based on deployment
**Method**: POST
**Content-Type**: application/json

**Request**:
```json
{
    "appId":"389801252" // AppID to fetch reviews
}

**Response**:
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": {
    "message": "sentiment analysis summary",
    "input": "request body"
  }
}
```

## 🔍 Monitoring & Logging

### AWS
- **CloudWatch Logs**: Function execution logs
- **CloudWatch Metrics**: Performance metrics
- **X-Ray**: Distributed tracing (if enabled)

### Azure
- **Application Insights**: Comprehensive monitoring
- **Azure Monitor**: Metrics and alerts
- **Function App Logs**: Execution logs

## 🧪 Testing

```bash
npm test
```

*Note: Test implementation is pending. Consider adding unit tests for services and integration tests for cloud providers.*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

ISC License

## 🔗 Related Documentation

- [iTunes RSS Feed API](https://rss.applemarketingtools.com/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
