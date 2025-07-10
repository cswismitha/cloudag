import { IDatabaseProvider } from '../interfaces/IDatabaseProvider';
import config from "../config/config";

export class SummaryService {
    
    constructor(
        private dbProvider: IDatabaseProvider
    ) {}

    async process() {
        const appId = config.appId;
        const platform = process.env.PLATFORM || 'azure';
        let summary:string = '';
        const record = await this.dbProvider.getLatestItem({ S : "APP#" + appId }, config.cosmosdb.summcontainerId);
        if (platform === 'azure') {
            summary = record.summary;
        } else {
            summary = record.summary;
        }
        return summary;
    }
}
