import mongoose from "mongoose";

export async function connectToDB() {
  if (!process.env.CONN_STRING) {
    throw new Error("Must provide a connection string");
  }

  await mongoose.connect(process.env.CONN_STRING);
}
