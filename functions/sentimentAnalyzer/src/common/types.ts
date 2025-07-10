// common-types.ts
export interface NormalizedRequest {
    method: string;
    path: string;
    headers: Record<string, string>;
    queryParams: Record<string, string>;
    pathParams: Record<string, string>;
    body: any; // Can be any parsed JSON, or string if raw
    log: (...args: any[]) => void; // A normalized logger
    // Add other common properties as needed
}

export interface NormalizedResponse {
    statusCode: number;
    headers?: Record<string, string>;
    body?: any; // Will be stringified for API Gateway, sent as is for Azure
    // Add other common properties as needed
}
