import { MongoClient, Db } from "mongodb";
import { MONGO_DB, MONGO_HOST, MONGO_PASS, MONGO_PORT, MONGO_URI, MONGO_USER } from "../config";


export const connectToDatabase = async (): Promise<Db> => {
  const uri = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}:${MONGO_PORT}`;

  try {
    const client = new MongoClient(uri);

    await client.connect();

    console.log("Connected to MongoDB");
    return client.db(MONGO_DB);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

