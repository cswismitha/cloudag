export interface IDatabaseProvider {
    createItem(item: any, tableName: string): Promise<any>;
}
