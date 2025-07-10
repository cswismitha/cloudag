import { app} from "@azure/functions";
import { handler } from "../handler";
import config from '../config/config';

app.storageQueue('tsnotify', {
    queueName: config.azqueue.queuename,
    connection: config.azqueue.queueurl,
    handler: handler
});
