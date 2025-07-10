"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.CosmosDBProvider = void 0;
var cosmos_1 = require("@azure/cosmos");
var config_1 = require("../config/config");
var CosmosDBProvider = /** @class */ (function () {
    function CosmosDBProvider(connectionString) {
        this.cosmosConfig = config_1["default"].cosmosdb;
        this.databaseId = this.cosmosConfig.databaseId;
        this.client = new cosmos_1.CosmosClient(connectionString);
    }
    /**
     * Gets or creates the database and container.
     * @param containerId The ID of the container to get or create.
     * @returns A promise that resolves to an object containing the database and container.
     */
    CosmosDBProvider.prototype.getDatabaseAndContainer = function (containerId) {
        return __awaiter(this, void 0, void 0, function () {
            var database, container;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.databases.createIfNotExists({
                            id: this.databaseId
                        })];
                    case 1:
                        database = (_a.sent()).database;
                        return [4 /*yield*/, database.containers.createIfNotExists({
                                id: containerId,
                                partitionKey: { paths: ["/id"] }
                            })];
                    case 2:
                        container = (_a.sent()).container;
                        return [2 /*return*/, { database: database, container: container }];
                }
            });
        });
    };
    // CRUD Operations
    /**
     * Creates an item in the container.
     * @param container The Cosmos DB Container object.
     * @param item The item to create. Must include an 'id' property.
     * @returns A promise that resolves when the item is created.
     */
    CosmosDBProvider.prototype.createItem = function (item, table) {
        return __awaiter(this, void 0, void 0, function () {
            var container, resource, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getDatabaseAndContainer(table)];
                    case 1:
                        container = (_a.sent()).container;
                        return [4 /*yield*/, container.items.create(item)];
                    case 2:
                        resource = (_a.sent()).resource;
                        return [2 /*return*/, { resource: resource }]; // Type assertion as create returns ResourceResponse
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error creating item:", error_1);
                        throw error_1; // Re-throw the error for the caller to handle
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates an item in the container.
     * @param container The Cosmos DB Container object.
     * @param item The updated item. Must include the 'id' of the item to update.
     * @returns A promise that resolves when the item is updated.
     */
    CosmosDBProvider.prototype.updateItem = function (container, item) {
        return __awaiter(this, void 0, void 0, function () {
            var resource, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, container.item(item.id, item.id).replace(item)];
                    case 1:
                        resource = (_a.sent()).resource;
                        console.log("Item updated:", resource);
                        return [2 /*return*/, { resource: resource }]; // Type assertion as replace returns ResourceResponse
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error updating item:", error_2);
                        throw error_2; // Re-throw the error for the caller to handle
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletes an item from the container by its id.
     * @param container The Cosmos DB Container object.
     * @param id The id of the item to delete.
     * @param partitionKey The partition key value for the item.
     * @returns A promise that resolves when the item is deleted.
     */
    CosmosDBProvider.prototype.deleteItem = function (container, id, partitionKey) {
        return __awaiter(this, void 0, void 0, function () {
            var statusCode, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, container.item(id, partitionKey)["delete"]()];
                    case 1:
                        statusCode = (_a.sent()).statusCode;
                        console.log("Item deleted. Status code:", statusCode);
                        return [2 /*return*/, { statusCode: statusCode }];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Error deleting item:", error_3);
                        throw error_3; // Re-throw the error for the caller to handle
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lists all items in the container. Use this cautiously in production with large datasets.
     * @param container The Cosmos DB Container object.
     * @returns A promise that resolves to an array of items.
     */
    CosmosDBProvider.prototype.listItems = function (container) {
        return __awaiter(this, void 0, void 0, function () {
            var resources, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, container.items.readAll().fetchAll()];
                    case 1:
                        resources = (_a.sent()).resources;
                        return [2 /*return*/, resources];
                    case 2:
                        error_4 = _a.sent();
                        console.error("Error listing items:", error_4);
                        throw error_4; // Important: Re-throw the error so the caller knows.
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
 * Retrieves the latest item from an Azure Cosmos DB container based on the system timestamp (_ts).
 *
 * @param container The Cosmos DB container object from which to retrieve the item.
 * @returns A Promise that resolves to the latest item found, or null if the container is empty.
 * @throws {Error} If an error occurs during the Cosmos DB query operation.
 */
    CosmosDBProvider.prototype.getLatestItem = function (key, table) {
        return __awaiter(this, void 0, void 0, function () {
            var container, querySpec, items, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getDatabaseAndContainer(table)];
                    case 1:
                        container = (_a.sent()).container;
                        querySpec = {
                            query: "SELECT TOP 1 * FROM c ORDER BY c._ts DESC"
                        };
                        return [4 /*yield*/, container.items
                                .query(querySpec)
                                .fetchAll()];
                    case 2:
                        items = (_a.sent()).resources;
                        if (items.length > 0) {
                            console.log("Latest item:", items[0]);
                            // Cast the item to type T
                            return [2 /*return*/, items[0]];
                        }
                        else {
                            console.log("Container is empty.");
                            return [2 /*return*/, null];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error("Error retrieving latest item:", error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return CosmosDBProvider;
}());
exports.CosmosDBProvider = CosmosDBProvider;
