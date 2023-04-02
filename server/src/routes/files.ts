import { Request, Response } from "express";
import {
  CreateDatabaseFile,
  FileIdsObject,
  RequestBodyFileIds,
  RequestQueryGetFiles,
} from "../types/server";
const { PassThrough } = require("stream");

import express from "express";
import * as Minio from "minio";
import { v4 as uuidv4 } from "uuid";
import stream from "stream";
import { validateUser } from "../middleware/auth";
import { connectToDatabase } from "../db/db";
import { minioClient } from "../utils/minioClient";
import { File, Folder, Preview, PreviewsObject, PreviewTypes } from "../types/objects";
import { UploadedFile } from "express-fileupload";
import {
  MINIO_BUCKET,
} from "../config";
import { createPreview } from "../utils/image";

const router = express.Router();

const createFileInServer = async (
  fileName: string,
  fileKey: string,
  data: Buffer
) => {
  const passThrough = new stream.PassThrough();
  passThrough.end(data);

  const key = fileKey + "/" + fileName;
  await minioClient.putObject(MINIO_BUCKET, key, passThrough);
};

const createPreviews = async (fileName: string, fileKey: string) : Promise<PreviewsObject> => {
  let previewTypes = ["small", "large"] as PreviewTypes[];
  let output = {};
  for (let i = 0; i < previewTypes.length; i++) {
    const previewType = previewTypes[i];
    const generatedPreview = await createPreview(fileName, fileKey, previewType);
    output[previewType]= generatedPreview;
  }
  return output;
}

const createFileInDatabase = async (
  file: CreateDatabaseFile,
  parentId: string
) => {
  let db = await connectToDatabase();

  const { mimetype, name, size } = file;
  const { id } = file;

  await db.collection<File>("files").insertOne({
    _id: id,
    name: name,
    parentFolder: parentId,
    type: "file",
    size: size,
    mimetype: mimetype,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: file.owner,
    previews: file.previews,
  });
};

export const deleteFiles = async (items: FileIdsObject[], userId: string) => {
  const db = await connectToDatabase();

  const query = { _id: { $in: items.map((item) => item.id) }, owner: userId };

  const files = await db.collection("files").find<File>(query).toArray();

  if (files.length === 0) {
    throw new Error("Nothing found");
  }

  /**
   * Remove files from minio
   */
  const keysToDelete = files.reduce((acc: string[], file) => {
    if (file && file.previews) {
      return [
        ...acc,
        file._id + "/" + file.name,
        ...Object.entries(file.previews).map(([,preview]) => file._id + "/" + preview.item),
      ];
    } else {
      return [...acc, file._id + "/" + file.name];
    }
  }, []);
  const bucketName = MINIO_BUCKET;
  console.log("[Cdrive] Attempting to delete objects from storage");
  await minioClient.removeObjects(bucketName, keysToDelete);
  console.log("[Cdrive] Attempting to delete objects from db");

  await db.collection("files").deleteMany(query);
};

router.put("/rename/:id", validateUser, async (req, res) => {
  const { id } = req.params;
  const { newName, type } = req.body;
  const db = await connectToDatabase();
  const collection = db.collection("files");
  const files = await collection
    .find<File>({ _id: id, owner: req.appUser?.id })
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
    console.log("New Filename = ", newFilename);

    // Check if the source object exists
    const stat = await minioClient.statObject(bucketName, oldFilename);
    console.log("stat = ", stat);
    // Copy the object with the new filename
    const copyConditions = new Minio.CopyConditions();
    console.log("copy conditions", copyConditions);
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

router.get("/download/:fileId", validateUser, async (req, res) => {
  const { fileId } = req.params;
  try {
    const db = await connectToDatabase();
    const files = await db
      .collection("files")
      .find<File>({ _id: fileId, owner: req.appUser?.id })
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
  async (req, res: Response<(File | Folder)[]>) => {
    const {
      parentId,
      limit = "100",
      page = "1",
    } = req.query as RequestQueryGetFiles;
    try {
      console.log("APP USER = ", req)
      let db = await connectToDatabase();

      const skipCount = (parseInt(page) - 1) * parseInt(limit);
      const limitCount = parseInt(limit);

      const files = await db
        .collection("files")
        .find<File>({ parentFolder: parentId, owner: req.appUser?.id })
        .limit(limitCount)
        .skip(skipCount)
        .toArray();

      const folders = await db
        .collection("folders")
        .find<Folder>({ parentFolder: parentId, owner: req.appUser?.id })
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

router.post("/", validateUser, async (req : any, res) => {
  const parentId: string = req.body.parentId;
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
        const isImage = /\.(jpe?g|png|gif|bmp)$/i.test(file.name);
        let previews: undefined | PreviewsObject = undefined;
        await createFileInServer(file.name, fileId, file?.data);
        if (isImage) {
          previews = await createPreviews(file.name, fileId);
          console.log("[Cdrive] Previews = ", previews);
        }

        await createFileInDatabase(
          {
            ...file,
            id: fileId,
            owner: req.user?.id,
            previews: previews,
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

router.delete("/", validateUser, async (req, res) => {
  const { fileIds: items = [] } = req.body as RequestBodyFileIds;
  if (!items || items.length === 0) {
    return res.sendStatus(400);
  }
  try {
    console.log("[Cdrive] Attempting to delete files");
    await deleteFiles(items, req.appUser?.id || "");
    console.log("[Cdrive] Sending status");
    return res.sendStatus(200);
  } catch (err) {
    console.log("[Cdrive] Error in deleting files");
    console.error(err);
    return res.sendStatus(500);
  }
});

export default router;
