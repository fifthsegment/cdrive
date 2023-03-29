import axios from "axios";
import { SERVER_BASE_URL } from "../contants";

export const downloadFile = async (token, fileId) => {
  try {
    const response = await axios({
      method: "get",
      url: `${SERVER_BASE_URL}/api/files/download/${fileId}`,
      responseType: "json",
      headers: {
        Authorization: `Bearer ${token}`, // pass token in header
      },
    });

    const link = document.createElement("a");
    link.href = SERVER_BASE_URL + response.data.path;
    link.setAttribute("download", `${fileId}`);
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error(error);
  }
};
