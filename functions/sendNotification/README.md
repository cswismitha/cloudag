# Send Notification Service

A TypeScript-based serverless application that sends email notification when summary review is completed. The service supports both AWS Lambda and Azure Functions deployment with corresponding cloud services.

## 🏗️ Architecture

This application follows a multi-cloud architecture pattern with:

- **Cloud Providers**: AWS Lambda / Azure Functions
- **Databases**: DynamoDB (AWS) / Cosmos DB (Azure)
- **Queues**: SQS (AWS) / Storage Queue (Azure)
- **Secrets Management**: AWS Secrets Manager / Azure Key Vault
- **Language**: TypeScript with Node.js runtime

## 🚀 Features

- **Multi-Cloud Support**: Deploy to either AWS or Azure with platform-specific configurations
- **SendGrid Integration**: Sends email notifications via send grid API
- **Cloud Storage**: Stores reviews and summaries in cloud databases
- **Queue Notifications**: Sends completion notifications via cloud queues
- **TypeScript**: Fully typed codebase with interfaces and type safety

## 📁 Project Structure

```
src/
├── aws/                    # AWS-specific implementations
├── azure/                  # Azure-specific implementations (Queue Trigger)
│   ├── function.json
│   └── index.ts
├── config/                 # Configuration management
│   └── config.ts
├── interfaces/             # TypeScript interfaces
│   ├── IQueueProvider.ts
├── services/               # Business services
│   └── EmailService.ts
└── handler.ts             # Main entry point
```

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

#### Common
- `PLATFORM`: Target platform (`aws` or `azure`, default: `azure`)

#### AWS Configuration
- `REGION`: AWS region (default: `eu-north-1`)
- `SQSURL`: Amazon SQS queue URL

#### Azure Configuration
- `SENDGRID_API_KEY`: Send Grid API Key
- `TO_EMAIL`: To Email address
- `FROM_EMAIL`: From email address
- `AZQUEUE_NAME`: Azure Storage Queue name (default: `js-queue-items`)
- `AZQUEUE_URL`: Azure Storage Queue URL

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 22+ 
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
- `@azure/functions`: Azure Functions runtime
- `@sendgrid/mail`: Send Grid Mail client

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

1. **Trigger**: Queue triggers the function
2. **Sends mail**: Sends mail to user configured
8. **Response**: Returns the response

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
- id (appId), summary, updated
```

### Azure Key vault
- `sgKey` - stores send grid key

### AWS Secret Manager
- `poc\sentiment` - Secret Name
- `sgKey` - stores send grid key

## 🔐 Security & Permissions

### AWS IAM Permissions
- `AWSLambdaBasicExecutionRole`
- `AmazonDynamoDBFullAccess`
- `AmazonSQSFullAccess`
- `SecretsManagerReadWrite`

### Azure Permissions
- Cosmos DB read/write access
- Storage Queue access
- Key Vault access (if using secrets)

## 📝 API

### HTTP Trigger

**Endpoint**: Configured based on deployment
**Method**: POST
**Content-Type**: application/json

**Response**:
```json
{
  "statusCode": 200,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": {
    "message": "Email successfully sent"
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
