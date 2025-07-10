
import { IDatabaseProvider } from '../interfaces/IDatabaseProvider';
import { CosmosClient, Database, Container, ItemResponse, ItemDefinition } from "@azure/cosmos";
import config from '../config/config';

export class CosmosDBProvider implements IDatabaseProvider {
    private client;

    constructor(connectionString: string) {
        this.client = new CosmosClient(connectionString);
    }

    private cosmosConfig = config.cosmosdb as CosmosDBConfig; 
    private databaseId = this.cosmosConfig.databaseId;

    /**
     * Gets or creates the database and container.
     * @param containerId The ID of the container to get or create.
     * @returns A promise that resolves to an object containing the database and container.
     */
    async getDatabaseAndContainer( containerId: string ): Promise<{ database: Database; container: Container }> {
        const { database } = await this.client.databases.createIfNotExists({
            id: this.databaseId,
        });
        const { container } = await database.containers.createIfNotExists({
            id: containerId,
            partitionKey: { paths: ["/id"] }, // Partition key is IMPORTANT for scalability
        });
        return { database, container };
    }

    // CRUD Operations

    /**
     * Creates an item in the container.
     * @param container The Cosmos DB Container object.
     * @param item The item to create. Must include an 'id' property.
     * @returns A promise that resolves when the item is created.
     */
    async createItem<T extends { id: string }>( item: T, table: string): Promise<ItemResponse<T>> {
        try {
            const { container } = await this.getDatabaseAndContainer(table);
            const { resource } = await container.items.create(item);
            return { resource } as ItemResponse<T>; // Type assertion as create returns ResourceResponse
        } catch (error) {
            console.error("Error creating item:", error);
            throw error; // Re-throw the error for the caller to handle
        }
    }   

    /**
     * Updates an item in the container.
     * @param container The Cosmos DB Container object.
     * @param item The updated item. Must include the 'id' of the item to update.
     * @returns A promise that resolves when the item is updated.
     */
    async updateItem<T extends { id: string }>(
    container: Container,
    item: T
    ): Promise<ItemResponse<T>> {
    try {
        const { resource } = await container.item(item.id, item.id).replace(item); // Partition key must be included in the item
        console.log("Item updated:", resource);
        return { resource } as ItemResponse<T>; // Type assertion as replace returns ResourceResponse
    } catch (error) {
        console.error("Error updating item:", error);
        throw error; // Re-throw the error for the caller to handle
    }
    }

    /**
     * Deletes an item from the container by its id.
     * @param container The Cosmos DB Container object.
     * @param id The id of the item to delete.
     * @param partitionKey The partition key value for the item.
     * @returns A promise that resolves when the item is deleted.
     */
    async deleteItem(
    container: Container,
    id: string,
    partitionKey: string
    ): Promise<{ statusCode: number }> {
    try {
        const { statusCode } = await container.item(id, partitionKey).delete();
        console.log("Item deleted. Status code:", statusCode);
        return { statusCode };
    } catch (error) {
        console.error("Error deleting item:", error);
        throw error; // Re-throw the error for the caller to handle
    }
    }

    /**
     * Lists all items in the container. Use this cautiously in production with large datasets.
     * @param container The Cosmos DB Container object.
     * @returns A promise that resolves to an array of items.
     */
    async listItems<T extends ItemDefinition>(container: Container): Promise<T[]> {
    try {
        const { resources } = await container.items.readAll<T>().fetchAll();
        return resources;
    } catch (error) {
        console.error("Error listing items:", error);
        throw error; // Important: Re-throw the error so the caller knows.
    }
    }
}


interface CosmosDBConfig {
  endpoint: string;
  databaseId: string;
}
