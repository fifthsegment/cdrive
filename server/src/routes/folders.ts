import { Response } from "express";
import express from "express";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "../db/db";
import { validateUser } from "../middleware/auth";
import { isFolder } from "../utils/helpers";
import { minioClient } from "../utils/minioClient";
import { Folder, File } from "../types/objects";
import {
  IRequest,
  RequestBodyFileIds,
  ResponseError,
  ResponseFolderWithChain,
} from "../types/server";
import { ObjectId } from "mongodb";
import { deleteFiles } from "./files";

const router = express.Router();

// Function to delete a folder and its children
const getItemIdsToDelete = async (
  folderId: string | ObjectId,
  userId: string
) => {
  // Find all the files and subfolders in the given folder
  const db = await connectToDatabase();
  const files = (await db
    .collection("files")
    .find<File>({ parentFolder: folderId, owner: userId })
    .toArray()) as File[];
  const folders = (await db
    .collection("folders")
    .find<Folder>({ parentFolder: folderId, owner: userId })
    .toArray()) as Folder[];

  console.log("[Cdrive] Recursive find = ", [...folders, ...files]);
  // Recursively delete all the files and subfolders
  let output: { id: any; key: string; type: string }[] = [];
  for (let i = 0; i < folders.length; i++) {
    const filesToRemove = await getItemIdsToDelete(folders[i]._id, userId);
    output = [...output, ...filesToRemove];
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    output.push({
      id: file._id,
      key: file._id + "/" + file.name,
      type: "file",
    });
  }

  return [
    ...output,
    { id: folderId, key: folderId, type: "folder" } as {
      id: any;
      key: string;
      type: string;
    },
  ];
};

const getFullFolderPath = async (parentId: string, chain: Folder[] = []) => {
  const db = await connectToDatabase();
  const doc = await db.collection("folders").findOne<Folder>({ _id: parentId });
  if (doc) {
    chain.push(doc);
    return await getFullFolderPath(doc.parentFolder, chain);
  } else {
    return chain;
  }
};

router.get("/", validateUser, async (req, res) => {
  const { parentId } = req.query;
  try {
    const db = await connectToDatabase();
    const folders = (await db
      .collection("folders")
      .find<Folder>({ parentFolder: parentId })
      .toArray()) as Folder[];
    return res.json(folders);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get(
  "/:id",
  validateUser,
  async (
    incomingReq,
    res: Response<ResponseFolderWithChain[] | ResponseError>
  ) => {
    const req = incomingReq as unknown as IRequest;
    const { id } = req.params;
    try {
      const db = await connectToDatabase();
      const folders = (await db
        .collection("folders")
        .find<Folder>({ _id: id, owner: req.user?.id })
        .toArray()) as Folder[];
      if (folders.length === 0) {
        return res.status(404).json({ error: "Item not found." });
      }
      const folderFound = folders[0];
      const chain = await getFullFolderPath(folderFound.parentFolder);

      return res.json([{ ...folderFound, chain: [folderFound, ...chain] }]);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.put("/rename/:id", validateUser, async (incomingReq, res) => {
  const req = incomingReq as unknown as IRequest;
  const { id } = req.params;
  const { newName } = req.body;

  try {
    const db = await connectToDatabase();
    const folders = await db
      .collection("folders")
      .find<Folder>({ _id: id, owner: req.user?.id })
      .toArray();
    if (folders.length === 0) {
      return res.status(404).json({ error: "Item not found." });
    }
    /*const folder = folders[0];
    const parentFolder = folder.parentFolder + "/" + folder.name;
    const newParentFolder = folder.parentFolder + "/" + newName;
    const filter = { parentFolder: parentFolder, type: "file" };
    const update = {
      $set: { parentFolder: newParentFolder, updatedAt: new Date() },
    };
    await db.collection("files").updateMany(filter, update);
    */
    const parts = folders[0].path.split("/");
    parts[parts.length - 1] = newName;
    const newPath = parts.join("/");

    const folderUpdateResult = await db
      .collection("folders")
      .updateOne({ _id: id }, { $set: { name: newName, path: newPath } });
    return res.json(folderUpdateResult);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.post("/", validateUser, async (incomingReq, res) => {
  const req = incomingReq as unknown as IRequest;
  const { name, parentId, path } = req.body;
  if (!name || !parentId) {
    return res.sendStatus(400);
  }
  const folderId = uuidv4();
  try {
    const db = await connectToDatabase();

    await db.collection("folders").insertOne({
      _id: folderId,
      name: name,
      parentFolder: parentId,
      type: "folder",
      path: `${path}/${name}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: req.user?.id,
    });
    return res.sendStatus(200);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.delete("/", validateUser, async (incomingReq, res) => {
  const req = incomingReq as IRequest;
  console.log("[Cdrive] Req.body = ", req.body);
  const fileIds = req.body.fileIds;
  console.log("[Cdrive] fileIds = ", fileIds);

  if (!fileIds || fileIds.length === 0) {
    return res.sendStatus(400).send({ error: "No fileIds received" });
  }
  try {
    console.log(
      "[Cdrive] User id = ",
      req.user.id,
      "Folder id = ",
      fileIds[0].id
    );
    const itemIdsToDelete = await getItemIdsToDelete(
      fileIds[0].id,
      req.user?.id
    );
    const filesToDelete = itemIdsToDelete.filter((item) => !isFolder(item));
    const foldersToDelete = itemIdsToDelete.filter((item) => isFolder(item));
    console.log("[Cdrive] Items to delete = ", itemIdsToDelete);
    const bucketName = process.env.MINIO_BUCKET;


    const queryDeleteFolders = {
      _id: { $in: foldersToDelete.map((item) => item.id) },
    };
    const db = await connectToDatabase();
    console.log("[Cdrive] Database connection made");
    await deleteFiles(
      filesToDelete.map((item) => ({
        id: item.id
      })),
      req.user.id
    );
    await db.collection("folders").deleteMany(queryDeleteFolders);
    res.sendStatus(200);
  } catch (err) {
    console.log("[CDrive:Error] Error in delete endpoint");
    console.log(err);
    return res.sendStatus(500);
  }
});

export default router;
