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
exports.DynamoDBProvider = void 0;
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
var config_1 = require("../config/config");
var DynamoDBProvider = /** @class */ (function () {
    function DynamoDBProvider() {
        // Configure AWS SDK v3
        this.client = new client_dynamodb_1.DynamoDBClient({
            region: config_1["default"].awsregion
        });
        /**
         * Helper function to handle errors
         * @param err The error object
         * @returns Throws the error
         */
        this.handleError = function (err) {
            console.error("Error:", err);
            throw err;
        };
    }
    /**
     * Creates (Puts) a new item into a DynamoDB table.
     * @param item The item to create. This should be a plain JavaScript object.
     * @param tableName The name of the DynamoDB table.
     * @returns The result of the PutItemCommand.
     */
    DynamoDBProvider.prototype.createItem = function (item, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var params, command, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            TableName: tableName,
                            Item: item
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command = new client_dynamodb_1.PutItemCommand(params);
                        return [4 /*yield*/, this.client.send(command)];
                    case 2:
                        result = _a.sent();
                        console.log("Item Created:", result);
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, this.handleError(error_1)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reads (Gets) an item from a DynamoDB table.
     * @param key The primary key of the item to retrieve.
     * @param tableName The name of the DynamoDB table.
     * @returns The unmarshalled item if found, otherwise null.
     */
    DynamoDBProvider.prototype.getItem = function (key, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var params, command, result, unmarshalledItem, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            TableName: tableName,
                            Key: (0, util_dynamodb_1.marshall)(key)
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command = new client_dynamodb_1.GetItemCommand(params);
                        return [4 /*yield*/, this.client.send(command)];
                    case 2:
                        result = _a.sent();
                        if (result.Item) {
                            unmarshalledItem = (0, util_dynamodb_1.unmarshall)(result.Item);
                            console.log("Item Retrieved:", unmarshalledItem);
                            return [2 /*return*/, unmarshalledItem];
                        }
                        else {
                            console.log("Item not found.");
                            return [2 /*return*/, null];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, this.handleError(error_2)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates an item in a DynamoDB table.
     * @param key The primary key of the item to update.
     * @param updateExpression The update expression.
     * @param expressionAttributeValues The values for the update expression.
     * @param returnValues Specifies what values to return. Defaults to "ALL_NEW".
     * @param tableName The name of the DynamoDB table.
     * @returns The unmarshalled updated item, or null if no attributes were returned.
     */
    DynamoDBProvider.prototype.updateItem = function (key, updateExpression, expressionAttributeValues, tableName, returnValues) {
        if (returnValues === void 0) { returnValues = "ALL_NEW"; }
        return __awaiter(this, void 0, void 0, function () {
            var params, command, result, updatedItem, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            TableName: tableName,
                            Key: (0, util_dynamodb_1.marshall)(key),
                            UpdateExpression: updateExpression,
                            ExpressionAttributeValues: (0, util_dynamodb_1.marshall)(expressionAttributeValues),
                            ReturnValues: returnValues
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command = new client_dynamodb_1.UpdateItemCommand(params);
                        return [4 /*yield*/, this.client.send(command)];
                    case 2:
                        result = _a.sent();
                        console.log("Item Updated:", result);
                        updatedItem = result.Attributes
                            ? (0, util_dynamodb_1.unmarshall)(result.Attributes)
                            : null;
                        return [2 /*return*/, updatedItem];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, this.handleError(error_3)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletes an item from a DynamoDB table.
     * @param key The primary key of the item to delete.
     * @param tableName The name of the DynamoDB table.
     * @returns The result of the DeleteItemCommand.
     */
    DynamoDBProvider.prototype.deleteItem = function (key, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var params, command, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            TableName: tableName,
                            Key: (0, util_dynamodb_1.marshall)(key)
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command = new client_dynamodb_1.DeleteItemCommand(params);
                        return [4 /*yield*/, this.client.send(command)];
                    case 2:
                        result = _a.sent();
                        console.log("Item Deleted:", result);
                        return [2 /*return*/, result];
                    case 3:
                        error_4 = _a.sent();
                        return [2 /*return*/, this.handleError(error_4)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Queries a DynamoDB table by its partition key.
     * @param partitionKeyValue The value of the partition key.
     * @param tableName The name of the DynamoDB table.
     * @param partitionKeyName The name of the partition key attribute. Defaults to "PK".
     * @returns An array of unmarshalled items matching the query, or null if an error occurs.
     */
    DynamoDBProvider.prototype.queryDynamoDBByPartitionKey = function (partitionKeyValue, // Use AttributeValue for values in DynamoDB expressions
    tableName, partitionKeyName) {
        if (partitionKeyName === void 0) { partitionKeyName = "PK"; }
        return __awaiter(this, void 0, void 0, function () {
            var params, command, result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            TableName: tableName,
                            KeyConditionExpression: "#PK = :pk_value",
                            ExpressionAttributeNames: {
                                "#PK": partitionKeyName
                            },
                            ExpressionAttributeValues: {
                                ":pk_value": partitionKeyValue
                            }
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        command = new client_dynamodb_1.ScanCommand(params);
                        return [4 /*yield*/, this.client.send(command)];
                    case 2:
                        result = _a.sent();
                        console.log("Query succeeded.");
                        console.log("Retrieved items:", result.Items);
                        return [2 /*return*/, result.Items ? result.Items.map(function (item) { return (0, util_dynamodb_1.unmarshall)(item); }) : []];
                    case 3:
                        err_1 = _a.sent();
                        console.error("Unable to query. Error JSON:", JSON.stringify(err_1, null, 2));
                        return [2 /*return*/, this.handleError(err_1)]; // Ensure errors are handled consistently
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBProvider.prototype.getLatestItem = function (key, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var params, command, result, latestItem, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params = {
                            TableName: tableName,
                            KeyConditionExpression: "PK = :pk_value",
                            ExpressionAttributeValues: {
                                ':pk_value': key
                            },
                            // Sort results in descending order by the sort key
                            ScanIndexForward: false,
                            Limit: 1
                        };
                        command = new client_dynamodb_1.QueryCommand(params);
                        return [4 /*yield*/, this.client.send(command)];
                    case 1:
                        result = _a.sent();
                        if (result.Items && result.Items.length > 0) {
                            latestItem = (0, util_dynamodb_1.unmarshall)(result.Items[0]);
                            console.log("Latest item found:", latestItem);
                            return [2 /*return*/, latestItem];
                        }
                        else {
                            console.log("No items found in table '".concat(tableName, "'."));
                            return [2 /*return*/, null];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Error retrieving latest item from DynamoDB table '".concat(tableName, "':"), error_5);
                        return [2 /*return*/, this.handleError(error_5)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DynamoDBProvider;
}());
exports.DynamoDBProvider = DynamoDBProvider;
