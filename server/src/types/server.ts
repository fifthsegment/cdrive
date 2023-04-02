import { ObjectId } from "mongodb";
import { File, Folder } from "./objects";
import { User } from "./user";

export type RequestQueryGetFiles = {
  parentId: string;
  limit?: string;
  page?: string;
};

export interface ResponseFolderWithChain extends Folder {
  chain: Folder[];
}

export type ResponseError = {
  error: string;
};

export type FileIdsObject = { id: string };

export type RequestBodyFileIds = {
  fileIds: FileIdsObject[];
};

export interface CreateDatabaseFile extends File {
  id: ObjectId;
  owner: string;
}
