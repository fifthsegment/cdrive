import { Request, Response } from "express";
import {
  CreateDatabaseFile,
  FileIdsObject,
  IRequest,
  RequestBodyFileIds,
  RequestQueryGetFiles,
} from "../types/server";

import express from "express";
import * as Minio from "minio";
import { v4 as uuidv4 } from "uuid";
import stream from "stream";
import { validateUser } from "../middleware/auth";
import { connectToDatabase } from "../db/db";
import { minioClient } from "../utils/minioClient";
import { File, Folder } from "../types/objects";
import { UploadedFile } from "express-fileupload";
import { ObjectId } from "mongodb";

const router = express.Router();

const createFileInServer = async (
  file: UploadedFile,
  fileKey: string,
  data: Buffer
) => {
  const passThrough = new stream.PassThrough();
  passThrough.end(data);

  const key = fileKey + "/" + file.name;
  await minioClient.putObject(process.env.MINIO_BUCKET, key, passThrough);
};

const createFileInDatabase = async (
  file: CreateDatabaseFile,
  parentId: string
) => {
  let db = await connectToDatabase();

  const { mimetype, name, size } = file;
  const { id } = file;

  await db.collection("files").insertOne({
    _id: id,
    name: name,
    parentFolder: parentId,
    type: "file",
    size: size,
    mimetype: mimetype,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: file.owner,
  });
};

const deleteFiles = async (items:FileIdsObject[], userId: string) => {
  const db = await connectToDatabase();

  const query = { _id: { $in: items.map((item) => item.id) }, owner: userId };

  const files = await db.collection("files").find<File>(query).toArray();

  if (files.length === 0) {
    throw new Error("Nothing found");
  }

  /**
   * Remove files from minio
   */
  const bucketName = process.env.MINIO_BUCKET;
  const keysToDelete = files.map((file) => file._id + "/" + file.name);
  console.log("[Cdrive] Attempting to delete objects from storage");
  await minioClient.removeObjects(bucketName, keysToDelete);
  console.log("[Cdrive] Attempting to delete objects from db");

  await db.collection("files").deleteMany(query);
};

router.put("/rename/:id", validateUser, async (incomingReq, res) => {
  const req = incomingReq as unknown as IRequest;
  const { id } = req.params;
  const { newName, type } = req.body;
  const db = await connectToDatabase();
  const collection = db.collection("files");
  const files = await collection
    .find<File>({ _id: id, owner: req.user?.id })
    .toArray();
  if (files.length === 0) {
    return res.status(404).json({ error: "Item not found." });
  }
  const file = files[0];
  try {
    const bucketName = process.env.MINIO_BUCKET;
    const oldFilename = id + "/" + file.name;
    const newFilename = id + "/" + newName;

    console.log("Old name = ", oldFilename);
    console.log("New Filename = ", newFilename)

    // Check if the source object exists
    const stat = await minioClient.statObject(bucketName, oldFilename);
    console.log("stat = ", stat)
    // Copy the object with the new filename
    const copyConditions = new Minio.CopyConditions();
    console.log("copy conditions", copyConditions)
    await minioClient.copyObject(
      bucketName,
      newFilename,
      `${bucketName}/${oldFilename}`,
      copyConditions
    );
    // Remove the old object
    await minioClient.removeObject(bucketName, oldFilename);

    const result = await collection.updateOne(
      { _id: id },
      { $set: { name: newName } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Item not found." });
    }

    return res
      .status(200)
      .json({ message: "Filename updated successfully.", id, name: newName });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message, bucket: process.env.MINIO_BUCKET });
  }
});

router.get("/download/:fileId", validateUser, async (incomingReq, res) => {
  const req = incomingReq as unknown as IRequest;
  const { fileId } = req.params;
  try {
    const db = await connectToDatabase();
    const files = await db
      .collection("files")
      .find<File>({ _id: fileId, owner: req.user?.id })
      .toArray();
    if (files.length > 0) {
      const file = files[0];
      const url = await minioClient.presignedGetObject(
        process.env.MINIO_BUCKET,
        file._id + "/" + file.name,
        60 * 60 * 24
      ); // Expires in 24 hours
      const updatedUrl = new URL(url);
      const path = "/proxy" + updatedUrl.pathname + updatedUrl.search;
      return res.json({ path });
    }
  } catch (error) {
    console.error("Error generating download URL:", error);
    return res.status(500).send("Error generating download URL");
  }
});

router.get(
  "/",
  validateUser,
  async (incomingReq, res: Response<(File | Folder)[]>) => {
    const req = incomingReq as IRequest;
    const {
      parentId,
      limit = "100",
      page = "1",
    } = req.query as RequestQueryGetFiles;
    try {
      let db = await connectToDatabase();

      const skipCount = (parseInt(page) - 1) * parseInt(limit);
      const limitCount = parseInt(limit);

      const files = await db
        .collection("files")
        .find<File>({ parentFolder: parentId, owner: req.user?.id })
        .limit(limitCount)
        .skip(skipCount)
        .toArray();

      const folders = await db
        .collection("folders")
        .find<Folder>({ parentFolder: parentId, owner: req.user?.id })
        .limit(limitCount)
        .skip(skipCount)
        .toArray();

      const contents = [...files, ...folders];
      return res.json(contents);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.post("/", validateUser, async (incomingReq, res) => {
  const req = incomingReq as IRequest;
  const parentId : string  = req.body.parentId;
  const files = Array.isArray(req.files?.files)
    ? req.files?.files
    : [req.files?.files];
  if (!parentId) {
    return res.sendStatus(400);
  }
  if (!files) {
    return res.sendStatus(400);
  }
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const fileId = uuidv4();
      if (file) {
        await createFileInServer(file, fileId, file?.data);
        await createFileInDatabase(
          {
            ...file,
            id: fileId,
            owner: req.user?.id,
          } as any,
          parentId
        );
      }
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
  return res.sendStatus(200);
});

router.delete("/", validateUser, async (incomingReq, res) => {
  const req = incomingReq as IRequest;
  const { fileIds: items = [] } = req.body as RequestBodyFileIds;
  if (!items || items.length === 0) {
    return res.sendStatus(400);
  }
  try {
    console.log("[Cdrive] Attempting to delete files");
    await deleteFiles(items, req.user?.id);
    console.log("[Cdrive] Sending status");
    return res.sendStatus(200);
  } catch (err) {
    console.log("[Cdrive] Error in deleting files");
    console.error(err);
    return res.sendStatus(500);
  }
});

export default router;
