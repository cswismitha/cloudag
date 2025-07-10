
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

    /**
 * Retrieves the latest item from an Azure Cosmos DB container based on the system timestamp (_ts).
 *
 * @param container The Cosmos DB container object from which to retrieve the item.
 * @returns A Promise that resolves to the latest item found, or null if the container is empty.
 * @throws {Error} If an error occurs during the Cosmos DB query operation.
 */
async getLatestItem<T>(key: any, table: string): Promise<T | null> {
  try {
    const { container } = await this.getDatabaseAndContainer(table);
    // Construct a query to order by a timestamp field in descending order and limit to 1
    const querySpec = {
      query: "SELECT TOP 1 * FROM c ORDER BY c._ts DESC",
    };

    // The .query().fetchAll() method returns an object with a 'resources' property
    // that is an array of items. We type the array using a generic 'T' for the item type.
    const { resources: items } = await container.items
      .query(querySpec)
      .fetchAll();

    if (items.length > 0) {
      console.log("Latest item:", items[0]);
      // Cast the item to type T
      return items[0] as T;
    } else {
      console.log("Container is empty.");
      return null;
    }
  } catch (error: any) { // Explicitly type 'error' as 'any' or 'unknown' for catch block
    console.error("Error retrieving latest item:", error);
    throw error;
  }
}
}


interface CosmosDBConfig {
  endpoint: string;
  key: string;
  databaseId: string;
}
