import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import fileUpload from "express-fileupload";
import { createProxyMiddleware } from "http-proxy-middleware";

import { MongoClient } from "mongodb";
import passport from "passport";
import { configurePassport } from "./utils/auth";
import filesRouter from "./routes/files";
import foldersRouter from "./routes/folders";
import infoRouter from "./routes/info";
import searchRouter from "./routes/search";
import { MINIO_USE_SSL, MINIO_ENDPOINT, MINIO_PORT, KEYCLOAK_SERVER_URL } from "./config";
import { initKeycloak } from "./utils/keycloak";
import { initDb } from "./utils/initdb";

const app = express();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectToKeycloak = async () => {
  let connected = false;
  while (!connected) {
    try {
      await configurePassport();
      console.log("Connected to Keycloak");
      connected = true;
    } catch (err) {
      console.log("Error connecting to Keycloak, retrying in 5 seconds...");
      console.error(err);
      await delay(5000);
    }
  }
};


const targetFileServerServiceHost =
  MINIO_USE_SSL.toLowerCase() === "true"
    ? "https://"
    : "http://" + MINIO_ENDPOINT + ":" + MINIO_PORT;

const fileServerProxyMiddleware = createProxyMiddleware({
  target: targetFileServerServiceHost,
  changeOrigin: true,
  pathRewrite: { "^/proxy": "" },
});

const authServerProxyMiddleware = createProxyMiddleware({
  target: KEYCLOAK_SERVER_URL,
  changeOrigin: true,
  pathRewrite: { "^/auth": "" },
});

app.use(fileUpload());

app.use(morgan("dev"));
app.use(cors());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

(async () => {})();

(async () => {
  try {
    await connectToKeycloak();
    await initKeycloak();
    await initDb();
    // await connectToDb();
    app.use(passport.initialize());

    app.use("/proxy", fileServerProxyMiddleware);

    app.use("/auth", authServerProxyMiddleware);

    app.use("/api/files", filesRouter);

    app.use("/api/folders", foldersRouter);

    app.use("/api/search", searchRouter);

    app.use("/api/info", infoRouter);

    app.use('/static', express.static('frontend/build'));

    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server started on port ${port}`));
  } catch (error) {
    console.error(error);
  }
})();
