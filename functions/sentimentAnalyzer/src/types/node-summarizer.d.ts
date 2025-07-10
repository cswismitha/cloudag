declare module 'node-summarizer' {
    export class SummarizerManager {
        constructor(text: string, count: number);
        getSummaryByRank(): Promise<{ summary: string }>;
        getSummaryByFrequency(): string;
        // Add other methods/properties if used
    }
}