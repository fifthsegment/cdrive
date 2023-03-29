const Minio = require("minio");
const { MINIO_ENDPOINT, MINIO_PORT, MINIO_USE_SSL, MINIO_SECRET_KEY, MINIO_ACCESS_KEY } = require("../config");

const useSSL = (MINIO_USE_SSL).toLowerCase() === "true";

export const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT ,
  port: parseInt(MINIO_PORT),
  useSSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});



