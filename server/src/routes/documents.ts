import express from "express";
import { JWT_SECRET, MINIO_BUCKET, SHORT_TOKEN_DURATION } from "../config";
import { connectToDatabase } from "../db/db";
import { validateUser } from "../middleware/auth";
import { shortTokenValidator } from "../middleware/shorttoken";
import { File } from "../types/objects";
import { IRequest } from "../types/server";
import { minioClient } from "../utils/minioClient";
const jwt = require("jsonwebtoken");

const bodyParser = require("body-parser");

const router = express.Router();

async function generateSignedUrl(bucket, key) {
  const expires = 60 * 60; // URL valid for 1 hour

  const fileType = key.split(".").pop();

  return new Promise((resolve, reject) => {
    minioClient.presignedGetObject(
      bucket,
      key,
      expires,
      (err, presignedUrl) => {
        if (err) {
          reject(err);
        } else {
          resolve({ fileType, presignedUrl });
        }
      }
    );
  });
}

function wopiHeaders(req, res, next) {
  res.setHeader("X-WOPI-HostEndpoint", req.get("Host"));
  res.setHeader("X-WOPI-MaxExpectedSize", "2147483648");
  next();
}

router.use(bodyParser.raw({ limit: "2gb", type: "*/*" }));
router.use(wopiHeaders);

// CheckFileInfo endpoint
router.get("/wopi/files/:fileId", shortTokenValidator, async (incomingReq, res) => {
  const req = incomingReq as unknown as IRequest;
  const fileId = req.params.fileId;

  try {
    const db = await connectToDatabase();
    const file = await db.collection("files").findOne<File>({ _id: fileId });
    if (!file) {
      return res.status(404).json({ error: "Item not found." });
    }
    const fileKey = `${fileId}/${file.name}`;
    const metaData = await minioClient.statObject(MINIO_BUCKET, fileKey);
    res.json({
      BaseFileName: file.name,
      OwnerId: req.user.id,
      Size: metaData.size,
      UserId: req.user.id,
      Version: metaData.etag,
      UserFriendlyName: req.user.id,
      UserCanWrite: true,
      UserCanNotWriteRelative: true,
      SupportsUpdate: true,
      SupportsLocks: false,
    });
  } catch (err) {
    res.status(500).send("Error retrieving file information");
  }
});

// GetFile endpoint
router.get(
  "/wopi/files/:fileId/contents",
  shortTokenValidator,
  async (incomingReq, res) => {
    const req = incomingReq as unknown as IRequest;

    const fileId = req.params.fileId;

    try {
      const db = await connectToDatabase();
      
      const file = await db.collection("files").findOne<File>({ _id: fileId, owner: req.user.id });
      if (!file) {
        return res.status(404).json({ error: "Item not found." });
      }
      const fileKey = `${fileId}/${file.name}`;
      const stream = await minioClient.getObject(MINIO_BUCKET, fileKey);
      stream.pipe(res);
    } catch (err) {
      res.status(500).send("Error retrieving file contents");
    }
  }
);

// PutFile endpoint
router.post(
  "/wopi/files/:fileId/contents",
  shortTokenValidator,
  async (incomingReq, res) => {
    const req = incomingReq as unknown as IRequest;
    const fileId = req.params.fileId;

    try {
      const db = await connectToDatabase();
      const file = await db.collection("files").findOne<File>({ _id: fileId, owner: req.user.id });
      if (!file) {
        return res.status(404).json({ error: "Item not found." });
      }
      const fileKey = `${fileId}/${file.name}`;

      await minioClient.putObject(MINIO_BUCKET, fileKey, req.body);
      const metaData = await minioClient.statObject(MINIO_BUCKET, fileKey);

      res.setHeader("X-WOPI-ItemVersion", metaData.etag);
      res.status(200).send("OK");
    } catch (err) {
      res.status(500).send("Error saving file contents");
    }
  }
);

router.get("/validateToken", shortTokenValidator, async (incomingReq, res) => {
  const req = incomingReq as unknown as IRequest;
  
  res.send(`Hello, user with ID: ${req.user.id}`);
});

router.post("/token", validateUser, (incomingReq, res) => {
  const req = incomingReq as unknown as IRequest;

  const shortToken = jwt.sign({ user: req.user.id }, JWT_SECRET, {
    expiresIn: SHORT_TOKEN_DURATION,
  });

  res.json({ short_token: shortToken });
});

export default router;
