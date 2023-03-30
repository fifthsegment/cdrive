// export const SERVER_BASE_URL = "http://cdrive.ubwiservice.com";
const {PRODUCTION} = process.env;
export const SERVER_BASE_URL = PRODUCTION==="true" ? "/" : "http://localhost:3000";

export const ROOT_FOLDER = {
  name: "root",
  parentId: "root",
  path: "root",
  _id: "root",
  chain: [],
};

export const MINIMUM_OBJECTS_PER_PAGE = 100;
