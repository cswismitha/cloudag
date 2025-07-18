import { IDatabaseProvider } from '../interfaces/IDatabaseProvider';
import config from "../config/config";

export class SummaryService {
    
    constructor(
        private dbProvider: IDatabaseProvider
    ) {}

    async process() {
        const appId = config.appId;
        const platform = process.env.PLATFORM || 'azure';
        let summary:any = {};
        const record = await this.dbProvider.getLatestItem({ S : "APP#" + appId }, config.cosmosdb.summcontainerId);
        if (platform === 'azure') {
            summary = { summary: record.summary, sentiment: record.sentiment };
        } else {
            summary = { summary: record.summary, sentiment: record.sentiment };
        }
        return summary;
    }
}
