import { MongoAPIError, MongoClient, MongoError } from "mongodb";
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
import { sleep } from "./helpers";

export const initializeDb = async () => {
  try {
    const uri = `mongodb://${MONGO_ADMIN_USER}:${MONGO_ADMIN_PASS}@${MONGO_HOST}:${MONGO_PORT}`;

    const client = new MongoClient(uri);
    await client.connect();

    const adminDb = client.db(MONGO_ADMIN_DB);
    const payload = {
        createUser: MONGO_USER,
        pwd: MONGO_PASS,
        roles: [{ role: "readWrite", db: MONGO_DB }],
      };
    console.log("Creating user command")
    const resp = await adminDb.command(payload);
    console.log("Response = ", resp)

    adminDb.createCollection("files");
    adminDb.createCollection("folders");
    return true;
  } catch (error) {
  
    console.error("Unable to create user + db");
    return false;
  }
};


export const initDb = async () => {

  try {
    const ALLOWED_RETRIES = 10;
    const RETRY_INTERVAL = 1000 * 5;
    let retries = 0;
    let createdDb = false;

    while (!createdDb && retries < ALLOWED_RETRIES) {
      console.log("Trying to create db attempt =", retries);

      const response = await initializeDb();
      if (response) {
        createdDb = true;
        retries = 0;
      }
      if (!createdDb && retries < ALLOWED_RETRIES) {
        retries++;
        await sleep(RETRY_INTERVAL);
      }
    }
  } catch (error) {
    console.log("[Cdrive] Error initializing database")
  }

};
