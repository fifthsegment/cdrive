import { ObjectId } from "mongodb";

export type Preview = {
  type: PreviewTypes
  item: string
}

export type PreviewTypes = "small" | "large"

export type PreviewsObject = {[key: string]: Preview};

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
  previews?: PreviewsObject;
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
