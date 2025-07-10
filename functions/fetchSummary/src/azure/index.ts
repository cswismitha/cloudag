import { app} from "@azure/functions";
import { handler } from "../handler";

app.http('tssummary', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: handler
});
