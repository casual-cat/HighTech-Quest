import { Schema, model } from "mongoose";

interface User {
  username: string;
  points: number;
  friends: string[];
}

const schema = new Schema<User>({
  username: String,
  points: Number,
  friends: [String],
});

export const User = model<User>("User", schema, "users");
