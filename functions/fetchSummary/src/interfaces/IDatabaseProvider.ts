export interface IDatabaseProvider {
    getLatestItem(key: any, tableName: string): Promise<any>;
}
