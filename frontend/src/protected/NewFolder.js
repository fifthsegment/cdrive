// NewFolder.js
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
  } from "@mui/material";
  import React, { useState } from "react";
  import { useNewFolder } from "./hooks";
  
  const NewFolder = ({ currentFolder, parentId, onCancel, onSave }) => {
    const [folderName, setFolderName] = useState("");
    const newFolder = useNewFolder();
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (folderName.trim() !== "") {
        newFolder({ folderName, parentId, path: currentFolder.path });
        setFolderName("");
        onCancel();
      }
    };
  
    return (
      <>
        <form onSubmit={handleSubmit}>
          <DialogTitle>New Folder</DialogTitle>
  
          <DialogContent>
            <TextField
              type="text"
              placeholder="New folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                onCancel();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogActions>
        </form>
      </>
    );
  };
  
  export default NewFolder;
  