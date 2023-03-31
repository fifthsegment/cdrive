import { MINIO_BUCKET } from "../config";
import { connectToDatabase } from "../db/db";
import { File } from "../types/objects";
import { IRequest } from "../types/server";
import express from "express";
import { minioClient } from "../utils/minioClient";

const router = express.Router();


router.get("/thumbnail/:fileId/:thumbName", async (incomingReq, res) => {
  const req = incomingReq as unknown as IRequest;
  const { fileId, thumbName } = req.params;
  try {
    const db = await connectToDatabase();
    const files = await db
      .collection("files")
      .find<File>({ _id: fileId })
      .toArray();
    if (files.length > 0) {
      const key = `${fileId}/${thumbName}`;
      const objectStat = await minioClient.statObject(MINIO_BUCKET, key);
      const contentType = objectStat.metaData["content-type"];

      // Get the file stream from Minio
      const fileStream = await minioClient.getObject(MINIO_BUCKET, key);

      // Set the content type and pipe the file stream to the response
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `inline; filename="${thumbName}"`);

      fileStream.pipe(res);
    } else {
      res.status(404).json({ error: "File not found." });
    }
  } catch (error) {
    console.error(`Error fetching the file from Minio: ${error.message}`);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the file." });
  }
});

export default router;
