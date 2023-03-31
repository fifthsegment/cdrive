import axios from "axios";
import { IMAGEPROC_SERVER, IMAGEPROC_SERVER_PORT, MINIO_BUCKET } from "../config";
import { v4 as uuidv4 } from "uuid";
import { minioClient } from "./minioClient";
import { Preview, PreviewTypes } from "../types/objects";
const { PassThrough } = require("stream");

export const createPreview = (fileName: string, fileKey: string, type:PreviewTypes) => {
    let url = "";
    if (type === "large") {
        url = `http://${IMAGEPROC_SERVER}:${IMAGEPROC_SERVER_PORT}/unsafe/filters:proportion(50)/${fileKey}/${fileName}`;
    } else if (type === "small") {
        const dimensions = "200x200";

        url = `http://${IMAGEPROC_SERVER}:${IMAGEPROC_SERVER_PORT}/unsafe/${dimensions}/top/${fileKey}/${fileName}`;
    }
    return new Promise<Preview | undefined>(async (resolve, reject) => {
      try {
        console.log("[Cdrive] Image preview type = ", type)

        console.log("[Cdrive] Image preview url = ", url)
        const response = await axios.get(url, {
          responseType: "stream",
          headers: {
            Accept: "image/*",
          },
        });
        if (response.headers["content-type"].startsWith("image/")) {
          const contentType = response.headers["content-type"];
          const thumbId = uuidv4();
  
          // // Save the image response to Minio
          const thumbName = `preview-${type}-${thumbId}-${fileName}`;
          // Save the image response to Minio
          const passThroughStream = new PassThrough();
          response.data.pipe(passThroughStream);
          const key = fileKey + "/" + thumbName;
  
          minioClient.putObject(
            MINIO_BUCKET,
            key,
            passThroughStream,
            contentType,
            (err) => {
              if (err) {
                console.error(`Error saving the image to Minio: ${err.message}`);
                reject(err);
              } else {
                console.log("[Cdrive] ThumbImage saved to Minio successfully.");
                resolve({item: thumbName, type});
              }
            }
          );
        } else {
          console.log("[Cdrive] The response is not an image.");
          resolve(undefined);
        }
      } catch (error) {
        console.error(`[Cdrive] Error downloading the image: ${error.message}`);
        resolve(undefined);
      }
    });
  };