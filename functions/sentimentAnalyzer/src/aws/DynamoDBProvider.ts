
import { IDatabaseProvider } from '../interfaces/IDatabaseProvider';
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
  AttributeValue, // Import AttributeValue for DynamoDB item structure
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import config from '../config/config';


export class DynamoDBProvider implements IDatabaseProvider {        

    // Configure AWS SDK v3
    private client = new DynamoDBClient({
        region: config.awsregion,
    });
    /**
     * Helper function to handle errors
     * @param err The error object
     * @returns Throws the error
     */
    private handleError = (err: unknown): never => {
        console.error("Error:", err);
        throw err;
    };
    
    /**
     * Creates (Puts) a new item into a DynamoDB table.
     * @param item The item to create. This should be a plain JavaScript object.
     * @param tableName The name of the DynamoDB table.
     * @returns The result of the PutItemCommand.
     */
    async createItem(item: Record<string, any>, tableName: string): Promise<any> {
        const params = {
            TableName: tableName,
            Item: item,
        };

        try {
            const command = new PutItemCommand(params);
            const result = await this.client.send(command);
            console.log("Item Created:", result);
            return result;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Reads (Gets) an item from a DynamoDB table.
     * @param key The primary key of the item to retrieve.
     * @param tableName The name of the DynamoDB table.
     * @returns The unmarshalled item if found, otherwise null.
     */
    async getItem<T>(key: Record<string, any>, tableName: string): Promise<T | null> {
        const params = {
            TableName: tableName,
            Key: marshall(key),
        };

        try {
            const command = new GetItemCommand(params);
            const result = await this.client.send(command);

            if (result.Item) {
            const unmarshalledItem: T = unmarshall(result.Item) as T;
            console.log("Item Retrieved:", unmarshalledItem);
            return unmarshalledItem;
            } else {
            console.log("Item not found.");
            return null;
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Updates an item in a DynamoDB table.
     * @param key The primary key of the item to update.
     * @param updateExpression The update expression.
     * @param expressionAttributeValues The values for the update expression.
     * @param returnValues Specifies what values to return. Defaults to "ALL_NEW".
     * @param tableName The name of the DynamoDB table.
     * @returns The unmarshalled updated item, or null if no attributes were returned.
     */
    async updateItem<T>(
        key: Record<string, any>,
        updateExpression: string,
        expressionAttributeValues: Record<string, any>,
        tableName: string,
        returnValues:
            | "NONE"
            | "ALL_OLD"
            | "UPDATED_OLD"
            | "ALL_NEW"
            | "UPDATED_NEW" = "ALL_NEW"
        ): Promise<T | null> {
        const params = {
            TableName: tableName,
            Key: marshall(key),
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: marshall(expressionAttributeValues),
            ReturnValues: returnValues,
        };

        try {
            const command = new UpdateItemCommand(params);
            const result = await this.client.send(command);
            console.log("Item Updated:", result);
            const updatedItem: T | null = result.Attributes
            ? (unmarshall(result.Attributes) as T)
            : null;
            return updatedItem;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Deletes an item from a DynamoDB table.
     * @param key The primary key of the item to delete.
     * @param tableName The name of the DynamoDB table.
     * @returns The result of the DeleteItemCommand.
     */
    async deleteItem(key: Record<string, any>, tableName: string): Promise<any> {
        const params = {
            TableName: tableName,
            Key: marshall(key),
        };

        try {
            const command = new DeleteItemCommand(params);
            const result = await this.client.send(command);
            console.log("Item Deleted:", result);
            return result;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Queries a DynamoDB table by its partition key.
     * @param partitionKeyValue The value of the partition key.
     * @param tableName The name of the DynamoDB table.
     * @param partitionKeyName The name of the partition key attribute. Defaults to "PK".
     * @returns An array of unmarshalled items matching the query, or null if an error occurs.
     */
    async queryDynamoDBByPartitionKey<T>(
        partitionKeyValue: AttributeValue, // Use AttributeValue for values in DynamoDB expressions
        tableName: string,
        partitionKeyName: string = "PK"
        ): Promise<T[] | null> {
        const params = {
            TableName: tableName,
            KeyConditionExpression: `#PK = :pk_value`,
            ExpressionAttributeNames: {
            "#PK": partitionKeyName,
            },
            ExpressionAttributeValues: {
            ":pk_value": partitionKeyValue,
            },
        };

        try {
            const command = new QueryCommand(params);
            const result = await this.client.send(command);
            console.log("Query succeeded.");
            console.log("Retrieved items:", result.Items);
            return result.Items ? (result.Items.map((item) => unmarshall(item)) as T[]) : [];
        } catch (err) {
            console.error("Unable to query. Error JSON:", JSON.stringify(err, null, 2));
            return this.handleError(err); // Ensure errors are handled consistently
        }
    }
}



