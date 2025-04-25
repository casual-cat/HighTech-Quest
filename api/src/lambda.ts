/**
 * Thin wrapper so Express can run as AWS Lambda.
 * After tsc, dist/ contains index.js and lambda.js side-by-side.
 */
import { configure } from "@vendia/serverless-express";
import app from "./index";    // points at dist/index.js after build

export const handler = configure({ app });
