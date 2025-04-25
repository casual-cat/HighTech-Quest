const serverlessExpress = require('@vendia/serverless-express');
const app = require('./dist/index');     // compiled Express app
exports.handler = serverlessExpress({ app });
