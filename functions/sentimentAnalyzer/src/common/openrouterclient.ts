
import config from '../config/config'; // Assuming config.ts exports an object

const OPENROUTER_API_KEY = config.openrouterApiKey;
const OPENROUTER_API_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface Review {
    id: string;
    text: string;
}

interface SentimentAnalysisResult {
    reviewId: string;
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence?: number; // Optional, if the model provides it
}

export async function analyzeSentiment(reviews: Review[]): Promise<{ sentimentResults: SentimentAnalysisResult[] }> {
    const sentimentResults: SentimentAnalysisResult[] = [];
    
    for (const review of reviews) {
        try {
            // --- Sentiment Analysis ---
            const sentimentPrompt = `Analyze the sentiment of the following customer review and classify it as positive, negative, neutral, or mixed. Provide only the sentiment word.\n\nReview: "${review.text}"\nSentiment:`;
            const sentimentResponse = await fetch(OPENROUTER_API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'YOUR_APP_NAME_OR_URL', // Replace with your app's name/URL
                    'X-Title': 'Sentiment Analysis and Summarization', // Replace with a descriptive title
                },
                body: JSON.stringify({
                    model: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO', // Or another suitable model
                    messages: [
                        { role: 'user', content: sentimentPrompt }
                    ],
                    temperature: 0.2,
                    max_tokens: 10, // Keep this low for just the sentiment word
                }),
            });

            if (!sentimentResponse.ok) {
                const errorData = await sentimentResponse.json();
                console.error(`Error analyzing sentiment for review ${review.id}:`, errorData);
                throw new Error(`HTTP error! status: ${sentimentResponse.status}`);
            }

            const sentimentData: any = await sentimentResponse.json();
            const sentimentContent = sentimentData.choices[0]?.message?.content?.trim().toLowerCase();
            let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral';

            if (sentimentContent.includes('positive')) {
                sentiment = 'positive';
            } else if (sentimentContent.includes('negative')) {
                sentiment = 'negative';
            } else if (sentimentContent.includes('mixed')) {
                sentiment = 'mixed';
            } else if (sentimentContent.includes('neutral')) {
                sentiment = 'neutral';
            }
            sentimentResults.push({ reviewId: review.id, sentiment });

        } catch (error) {
            console.error(`Failed to process review ${review.id}:`, error);
            // Optionally, push a default/error state for this review
            sentimentResults.push({ reviewId: review.id, sentiment: 'neutral' }); // Or 'error'
        }
    }
    return { sentimentResults};
}

export async function summarize(comment:string): Promise<string> {
    let summary: string = '';
            // --- Summarization ---
            const summaryPrompt = `Summarize the following customer review concisely in one or two sentences.\n\nReview: "${comment}"\nSummary:`;
            const summaryResponse = await fetch(OPENROUTER_API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'YOUR_APP_NAME_OR_URL',
                    'X-Title': 'Sentiment Analysis and Summarization',
                },
                body: JSON.stringify({
                    model: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO', // Or another suitable model
                    messages: [
                        { role: 'user', content: summaryPrompt }
                    ],
                    temperature: 0.7, // Higher temperature for more creative summaries
                    max_tokens: 100, // Adjust based on desired summary length
                }),
            });

            if (!summaryResponse.ok) {
                const errorData = await summaryResponse.json();
                console.error(`Error summarizing review:`, errorData);
                throw new Error(`HTTP error! status: ${summaryResponse.status}`);
            }

            const summaryData: any = await summaryResponse.json();
            const summaryContent = summaryData.choices[0]?.message?.content?.trim();
            summary = summaryContent;

    return summary;
}
