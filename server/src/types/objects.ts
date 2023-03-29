import { ObjectId } from "mongodb";

export type File = {
  _id: ObjectId;
  name: string;
  parentFolder: string;
  type: "file";
  size: number;
  mimetype: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
};

export type Folder = {
  _id: string | ObjectId;
  name: string;
  parentFolder: string;
  type: "folder";
  path: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
};
