import "dotenv/config";
import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { connectToDB } from "./dbConnection";
import { User } from "./Models/user.model";

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
};

app.use(cors(corsOptions));
app.use(json());

app.get("/check-api", (_, res) => {
  res.status(200);
  res.send("Working!");
});

app.get("/check-db", async (_, res) => {
  try {
    const user = await User.findOne({ username: "test" });

    res.status(200);
    res.json(user);
  } catch (error) {
    res.status(500);
    res.json({ error: error });
  }
});

const PORT = process.env.PORT ?? 3000;

async function startServer() {
  try {
    await connectToDB();
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  } catch (error) {
    console.error(error);
  }
}

startServer();
