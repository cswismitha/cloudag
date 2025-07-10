// 1. Import statement
import { SummarizerManager } from 'node-summarizer';

/**
 * Interface to describe the expected structure of the summary object returned by node-summarizer.
 * Based on the usage `summary.summary`.
 */
interface SummaryResult {
    summary: string;
    // Add other properties if the library returns them and you use them, e.g.:
    // originalText: string;
    // sentences: string[];
}

/**
 * Generates a summary of customer reviews using the node-summarizer library.
 *
 * @param customerReviews The string containing all customer reviews to be summarized.
 * @returns A promise that resolves to the summarized text (string) or an empty string if an error occurs.
 */
async function getReviewSummary(customerReviews: string): Promise<string> {
    try {
        // 2. Type instantiation for SummarizerManager
        // Assuming SummarizerManager's constructor takes a string and a number.
        const summarizer = new SummarizerManager(customerReviews, 2);

        // 3. Type assertion for the result of getSummaryByRank if needed,
        // or rely on inferred types if @types/node-summarizer is available.
        const summary: SummaryResult = await summarizer.getSummaryByRank();

        console.log('Summary retrieved', summary);

        // Ensure summary and summary.summary exist before accessing
        return summary && summary.summary ? summary.summary : '';
    } catch (error: any) { // Catching 'any' for errors, consider more specific error handling if possible.
        console.error('Error in getReviewSummary:', error); // Using console.error for errors
        return ''; // Return an empty string on error to indicate no summary was generated.
    }
}

// 4. Export statement
export {
    getReviewSummary
};