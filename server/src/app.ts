import express from "express";
import path from "node:path";
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
import staticRouter from "./routes/static";
import documentsRouter from "./routes/documents";
import searchRouter from "./routes/search";
import {
  MINIO_USE_SSL,
  MINIO_ENDPOINT,
  MINIO_PORT,
  KEYCLOAK_SERVER_URL,
  DOCUMENT_SERVER,
  DOCUMENT_SERVER_PORT,
} from "./config";
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

const documentProxyMiddleware = createProxyMiddleware({
  target: `http://${DOCUMENT_SERVER}:${DOCUMENT_SERVER_PORT}`,
  changeOrigin: true,
  ws: true,
  pathRewrite: { "^/documentproxy": "" },
});

const authServerProxyMiddleware = createProxyMiddleware({
  target: KEYCLOAK_SERVER_URL,
  changeOrigin: true,
  pathRewrite: { "^/auth": "" },
});

const targetUrl = "http://collabora:9980";

const proxyOptions = {
  target: targetUrl,
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying
  onProxyReqWs: (proxyReq, req, socket, options, head) => {
    console.log(`WebSocket connection: ${req.url}`);
  },
  onError: (err, req, res) => {
    console.error("Proxy error:", err);
    if ("status" in res)
      res.status(500).send("Proxy error");
  },
};

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

    app.use("/api/documents", documentsRouter);

    app.use("/api/info", infoRouter);

    app.use("/unprotected", staticRouter);

    app.use("/browser", createProxyMiddleware(proxyOptions));
    app.use("/hosting/discovery", createProxyMiddleware(proxyOptions));
    app.use("/hosting/capabilities", createProxyMiddleware(proxyOptions));
    app.use(/\/cool\/(.*)\/ws$/, createProxyMiddleware(proxyOptions));
    app.use(/\/(c|l)ool/, createProxyMiddleware(proxyOptions));
    app.use("/cool/adminws", createProxyMiddleware(proxyOptions));

    const basePath = path.normalize(__dirname + "/..");

    app.use(
      "/app/static",
      express.static(basePath + "/frontend/build/static", {
        fallthrough: false,
      })
    );

    app.use(/\/app\/(?!static).*/, function (req, res) {
      const filePath = basePath + "/frontend/build/index.html";
      res.sendFile(filePath, function (err) {
        if (err) {
          res.status(500).send(err);
        }
      });
    });

    app.get("/", (req, res) => {
      res.redirect("/app");
    });

    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`[Cdrive] - Server started on port ${port}`));
  } catch (error) {
    console.error("[CDrive] Server error");

    console.error(error);
  }
})();
