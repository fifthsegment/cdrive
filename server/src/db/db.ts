import { MongoClient, Db } from "mongodb";
import { MONGO_DB, MONGO_URI } from "../config";

const client = new MongoClient(MONGO_URI);

export const connectToDatabase = async (): Promise<Db> => {
  try {
    console.log("URi = ", MONGO_URI)
    await client.connect();

    console.log("Connected to MongoDB");
    return client.db(MONGO_DB);
  } catch (error) {
    console.log("Connecting to URI = ", MONGO_URI, "db = ", MONGO_DB);
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

