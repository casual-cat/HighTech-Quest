/**
 * Thin wrapper so Express can run as an AWS Lambda handler.
 * This file itself will compile into dist/lambda.js
 */
import { configure } from "@vendia/serverless-express";
import app from "./dist/index";   // compiled Express app (outDir=dist)

export const handler = configure({ app });
