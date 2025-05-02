import { Schema, model } from "mongoose";

interface User {
  username: string;
  password: string;
  email: string;
  highScore: number;
}

const schema = new Schema<User>({
  username: String,
  password: String,
  email: String,
  highScore: Number,
});

export const User = model<User>("User", schema, "users");
