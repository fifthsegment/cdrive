import { MongoClient } from "mongodb";
import {
  MONGO_ADMIN_DB,
  MONGO_ADMIN_PASS,
  MONGO_ADMIN_USER,
  MONGO_DB,
  MONGO_HOST,
  MONGO_PASS,
  MONGO_PORT,
  MONGO_USER,
} from "../config";

export const initializeDb = async () => {
  try {
    const uri = `mongodb://${MONGO_ADMIN_USER}:${MONGO_ADMIN_PASS}@${MONGO_HOST}:${MONGO_PORT}`;
    console.log("Initializing database = " + uri);

    const client = new MongoClient(uri);
    await client.connect();

    const adminDb = client.db(MONGO_ADMIN_DB);
    const payload = {
        createUser: MONGO_USER,
        pwd: MONGO_PASS,
        roles: [{ role: "readWrite", db: MONGO_DB }],
      };
    console.log("Creating user command = ", payload)
    const resp = await adminDb.command(payload);
    console.log("Response = ", resp)

    adminDb.createCollection("files");
    adminDb.createCollection("folders");
  } catch (error) {
    console.error("Unable to create user + db");
    console.error(error);
  }
};

export const initDb = async () => {
  setTimeout(async () => {
    await initializeDb();
  }, 1000 * 5);
};
