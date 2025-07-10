"use strict";
exports.__esModule = true;
var functions_1 = require("@azure/functions");
var handler_1 = require("../handler");
functions_1.app.http('tssummary', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: handler_1.handler
});
