import { app} from "@azure/functions";
import { handler } from "../handler";

app.http('sentimentAnalyzer', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: handler
});
