// NewFolder.js
import {
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
  } from "@mui/material";
  import React, { useState } from "react";
  import { isFolder } from "../utils";
  import { useRenameObject } from "./hooks";
  
  const RenameObject = ({ parentId, file, onCancel }) => {
    const [objectName, setObjectName] = useState(file.name);
    const renameFile = useRenameObject();
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (objectName.trim() !== "") {
        renameFile({ ...file, name: objectName, id: file._id });
        setObjectName("");
        onCancel();
      }
    };
  
    return (
      <>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Rename {isFolder(file) ? "Folder" : "File"}</DialogTitle>
          <DialogContent>
            <TextField
              type="text"
              placeholder="New name"
              value={objectName}
              onChange={(e) => setObjectName(e.target.value)}
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
            <Button type="submit">Save</Button>
          </DialogActions>
        </form>
      </>
    );
  };
  
  export default RenameObject;
  