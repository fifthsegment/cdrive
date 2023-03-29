import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { useKeycloak } from "@react-keycloak/web";
import { ROOT_FOLDER, SERVER_BASE_URL } from "../contants";
import { useState } from "react";

const baseUrl = SERVER_BASE_URL + "/api";

export const useSearchObjects = (searchTerm) => {
  const { keycloak } = useKeycloak();
  const fetchResults = async () => {
    if (!searchTerm) return [];

    const config = {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(
      baseUrl + "/search",
      { search: searchTerm },
      config
    );
    return response.data.data.map((item) => ({ ...item, label: item.name }));
    //return [{label: "a", value: "a"}]
  };

  return useQuery(["searchResults", searchTerm], fetchResults, {
    staleTime: 5000,
    enabled: searchTerm.length > 0,
  });
};

export const useDeleteFolders = () => {
  const { keycloak } = useKeycloak();
  const queryClient = useQueryClient();

  const deleteFolders = async (fileIds) => {
    try {
      const response = await axios.delete(`${baseUrl}/folders`, {
        data: { fileIds },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      queryClient.invalidateQueries(["files"]);
      queryClient.invalidateQueries(["searchResults"]);
      return response.data;
    } catch (error) {
      throw new Error("Failed to delete folders");
    }
  };

  const { mutate, isLoading, error } = useMutation(deleteFolders);

  return {
    deleteFolders: mutate,
    isLoading,
    error,
  };
};

export const useDeleteFiles = () => {
  const { keycloak } = useKeycloak();
  const queryClient = useQueryClient();

  const deleteFiles = async (fileIds) => {
    try {
      const response = await axios.delete(`${baseUrl}/files`, {
        data: { fileIds },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      queryClient.invalidateQueries(["files"]);
      queryClient.invalidateQueries(["searchResults"]);

      return response.data;
    } catch (error) {
      throw new Error("Failed to delete files");
    }
  };

  const { mutate, isLoading, error } = useMutation(deleteFiles);

  return {
    deleteFiles: mutate,
    isLoading,
    error,
  };
};

export const useUploadFilesV3 = () => {
  const [progress, setProgress] = useState({});
  const [uploadComplete, setUploadComplete] = useState(false);
  const [status, setStatus] = useState("");

  const { keycloak } = useKeycloak();
  const queryClient = useQueryClient();


  const uploadFiles = async (files, parentId) => {
    const expired = await keycloak.updateToken(300);
    console.log("Expired = ", expired);

    setStatus("uploading");
    const uploaders = files.map((file) => {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("parentId", parentId);

      const config = {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
          "content-type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          const { loaded, total } = event;
          const percent = Math.floor((loaded / total) * 100);
          setProgress((prevProgress) => {
            return { ...prevProgress, [file.name]: percent }; // check if progress is not undefined before updating
          });
        },
      };

      return axios.post(baseUrl + "/files", formData, config);
    });

    try {
      await Promise.all(uploaders);
      queryClient.invalidateQueries(["files"]);
      queryClient.invalidateQueries(["searchResults"]);

      setUploadComplete(true);
      setStatus("");
      setProgress({});
    } catch (err) {
      setStatus("error");
      console.error(err);
    }
  };

  return [uploadFiles, progress, uploadComplete, status];
};

export const useUploadFilesV2 = () => {
  const [progress, setProgress] = useState({});
  const [uploadComplete, setUploadComplete] = useState(false);
  const { keycloak } = useKeycloak();
  const queryClient = useQueryClient();

  const uploadFiles = async (files, parentId) => {
    const config = {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (event) => {
        const { loaded, total } = event;
        const percent = Math.floor((loaded / total) * 100);
        setProgress(percent);
      },
    };

    const formData = new FormData();
    const data = Array.from(files);
    for (let i = 0; i < data.length; i++) {
      const file = data[i];
      formData.append("files", file);
    }

    formData.append("parentId", parentId);

    try {
      const response = await axios.post(baseUrl + "/files", formData, config);
      setUploadComplete(true);
      console.log("Invalidating query for files");
      queryClient.invalidateQueries(["files"]);
      return response.data;
    } catch (error) {
      console.error(error);
      setUploadComplete(false);
      return null;
    }
  };

  return [uploadFiles, progress, uploadComplete];
};

export function useUploadFile() {
  const queryClient = useQueryClient();
  const { keycloak } = useKeycloak();

  const uploadFile = async ({ file, parentId }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("parentId", parentId);
      const { data } = await axios.post(baseUrl + "/files", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${keycloak.token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          queryClient.setQueryData(["uploadProgress"], percentCompleted);
        },
      });
      return data;
    } catch (error) {
      throw new Error("Upload failed");
    }
  };

  const { mutate } = useMutation(uploadFile, {
    onSuccess: () => {
      queryClient.invalidateQueries("files");
      queryClient.invalidateQueries(["searchResults"]);
    },
  });

  return mutate;
}

export const useFolder = (id) => {
  const { keycloak } = useKeycloak();
  return useQuery(["folders", id ], async () => {
    if (id === "root") {
      return [ROOT_FOLDER];
    }
    const folders = await fetch(`${baseUrl}/folders/${id}`, {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    });

    if (!folders.ok) {
      throw new Error("Files: Network response was not ok");
    }

    return folders.json();
  }, {
    enabled: id !== undefined
  });
};

export const useFiles = (parentId, limit = 100, page = 1) => {
  const { keycloak } = useKeycloak();

  return useQuery(["files", parentId, page, limit], async () => {
    const files = await fetch(`${baseUrl}/files?parentId=${parentId}&limit=${limit}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
      },
    });

    if (!files.ok) {
      throw new Error("Files: Network response was not ok");
    }

    return files.json();
  });
};

export function useNewFolder() {
  const queryClient = useQueryClient();
  const { keycloak } = useKeycloak();

  const createFolder = async ({ folderName, parentId, path }) => {
    const response = await axios.post(
      `${baseUrl}/folders`,
      { name: folderName, parentId, path },
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${keycloak.token}`,
        },
      }
    );
    return response.data;
  };
  const { mutate } = useMutation(createFolder, {
    onSuccess: () => {
      queryClient.invalidateQueries(["files"]);
      queryClient.invalidateQueries(["searchResults"]);
    },
  });

  return mutate;
}

export const useRenameObject = () => {
  const queryClient = useQueryClient();
  const { keycloak } = useKeycloak();

  const { mutate } = useMutation(
    async (payload) => {
      const { id, name } = payload;
      const endpoint = payload.type === "folder" ? "folders" : "files";
      const response = await axios.put(
        `${baseUrl}/${endpoint}/rename/${id}`,
        { newName: name, type: payload.type },
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["files"]);
        queryClient.invalidateQueries(["searchResults"]);
      },
    }
  );

  return mutate;
};
