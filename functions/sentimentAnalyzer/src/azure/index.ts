import { app} from "@azure/functions";
import { handler } from "../handler";

app.http('tsdemo', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: handler
});
