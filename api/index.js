"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser");
const dbConnection_1 = require("./dbConnection");
const user_model_1 = require("./Models/user.model");
const app = (0, express_1.default)();
const corsOptions = {
    origin: process.env.CORS_ORIGIN,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, body_parser_1.json)());
app.get("/check-api", (_, res) => {
    res.status(200).send("Working!");
});
app.get("/check-db", async (_, res) => {
    try {
        const user = await user_model_1.User.findOne({ username: "test" });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
const PORT = process.env.PORT ?? 3000;
async function startServer() {
    try {
        await (0, dbConnection_1.connectToDB)();
        app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
    }
    catch (error) {
        console.error(error);
    }
}
startServer();
exports.default = app; // <-- required for serverless-express
