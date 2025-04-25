"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    username: String,
    points: Number,
    friends: [String],
});
exports.User = (0, mongoose_1.model)("User", schema, "users");
