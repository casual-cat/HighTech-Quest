"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
/**
 * Thin wrapper so Express can run as AWS Lambda.
 * After tsc, dist/ contains index.js and lambda.js side-by-side.
 */
const serverless_express_1 = require("@vendia/serverless-express");
const index_1 = __importDefault(require("./index")); // points at dist/index.js after build
exports.handler = (0, serverless_express_1.configure)({ app: index_1.default });
