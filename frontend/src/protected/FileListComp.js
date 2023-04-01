import { useKeycloak } from "@react-keycloak/web";
import {
  Box,
  CircularProgress,
  Fab,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import prettyBytes from "pretty-bytes";
import React, { useEffect, useState } from "react";
import FileUploadV2 from "./FileUploadV2";
import {
  MINIMUM_OBJECTS_PER_PAGE,
  ROOT_FOLDER,
  SERVER_BASE_URL,
} from "../contants";
import { useDeleteFiles, useDeleteFolders, useFiles, useFolder } from "./hooks";
import NewFolder from "./NewFolder";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import ArticleIcon from "@mui/icons-material/Article";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BackIcon from "@mui/icons-material/ArrowBack";
import Dialog from "@mui/material/Dialog";
import { formatDistanceToNow } from "date-fns";

import { Stack } from "@mui/system";
import { downloadFile } from "../utils/file";
import RenameObject from "./RenameObject";
import Search from "./Search";
import {
  ObjectIconWrapper,
  TiltedButton,
  TiltedButtonContainer,
} from "./elements";
import ObjectIconDisplayer from "./IconDisplayer";
import Portal from "../Portal";
import { lightGreen } from "@mui/material/colors";
import { isFolder } from "../utils";
import { FilePreview } from "./FilePreview";

function FileListComp() {
  const { keycloak } = useKeycloak();
  const [selectedFolder, setSelectedFolder] = useState(ROOT_FOLDER);
  const [pathHistory, setPathHistory] = useState([ROOT_FOLDER]);

  const [fabMenuAnchorEl, setFabMenuAnchorEl] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [searchSelectedId, setSearchSelectedId] = useState(undefined);

  const pageSize = MINIMUM_OBJECTS_PER_PAGE;

  const { isLoading, isError, isFetched, data, error } = useFiles(
    selectedFolder._id,
    pageSize,
    currentPage
  );

  const { data: searchSelectedFolder } = useFolder(searchSelectedId);

  const [dialogMode, setDialogMode] = useState(null);

  const { deleteFiles } = useDeleteFiles();
  const { deleteFolders } = useDeleteFolders();

  useEffect(() => {
    if (searchSelectedFolder !== undefined) {
      setSelectedFolder(searchSelectedFolder[0]);
      setPathHistory([ROOT_FOLDER, ...searchSelectedFolder[0].chain.reverse()]);
      setSearchSelectedId(undefined);
    }
  }, [searchSelectedFolder]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography color="error">Error: {error.message}</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>No files found.</Typography>
      </Box>
    );
  }

  const onRowClick = (params, _event, _details) => {
    const { row } = params;
    if (row.type === "folder") {
    }
  };

  const handleDelete = (file) => {
    //onDelete(file);
    if (file.type === "folder") {
      deleteFolders([{ id: file._id }]);
    } else {
      deleteFiles([{ id: file._id }]);
    }
  };

  const handleEditClick = (file) => {
    setSelectedFile(file);
    setDialogMode("rename");
  };

  const handleCreateFolder = () => {
    setDialogMode("createFolder");
  };

  const onCreateNewFolder = () => {
    setDialogMode(null);
    setSelectedFile(null);
  };

  const onBack = () => {
    const temp = [...pathHistory];
    temp.pop();
    setPathHistory([...temp]);
    setSelectedFolder(temp[temp.length - 1]);
    // setParentId(pathHistory[pathHistory.lengdth -1]._id);
  };

  const onRenameFile = setSelectedFile;

  const handleCellDoubleClick = ({row:file}) => {
    setSelectedFile(file);
    setIsPreviewOpen(true);
  };

  const onFolderClick = (item) => {
    if (selectedFolder !== undefined && item._id === selectedFolder._id) {
      return;
    }

    if (item._id === "root") {
      setPathHistory([item]);
    }

    //setParentId(item._id);
    setSelectedFolder(item);
    if (!pathHistory.find((pathItem) => item.id === pathItem.id)) {
      setPathHistory([...pathHistory, item]);
    }

    setSearchSelectedId(undefined);
  };

  const onSelectSearchedItem = (item) => {
    if (item.type === "folder") {
      setSearchSelectedId(item._id);
    } else {
      if (item.parentFolder === selectedFolder._id) {
      } else {
        setSearchSelectedId(item.parentFolder);
      }
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  }

  const showFooter = (data || []).length > pageSize ? true : false;

  const columns = [
    {
      field: "name",
      headerName: "Name",
      minWidth: 400,
      flex: 2,
      renderCell: ({ row: item, value }) => {
        return (
          <>
            {item.type === "file" ? (
              <span>
                {item.previews ? (
                  <>
                    <img
                      alt="thumbnail"
                      style={{ width: 30, height: 40 }}
                      src={`${SERVER_BASE_URL}/unprotected/thumbnail/${item._id}/${item.previews["small"].item}`}
                    />
                  </>
                ) : (
                  <>
                    <ObjectIconDisplayer object={item} />
                  </>
                )}
                &nbsp; {value}
              </span>
            ) : (
              <span onClick={() => onFolderClick(item)}>
                <ObjectIconDisplayer object={item} />
                &nbsp; {value}
              </span>
            )}
          </>
        );
      },
    },
    {
      field: "size",
      headerName: "Size",
      minWidth: 100,
      flex: 1,
      renderCell: ({ row: file }) => {
        return !isNaN(file.size) && prettyBytes(Number(file.size));
      },
    },
    {
      field: "createdAt",
      headerName: "Created at",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row: file }) => {
        return formatDistanceToNow(new Date(file.createdAt), {
          addSuffix: true,
        });
      },
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: ({ row: object }) => {
        return (
          <>
            <IconButton onClick={() => handleEditClick(object)} size="small">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(object)} size="small">
              <DeleteIcon />
            </IconButton>
            {!isFolder(object) && (
              <IconButton
                onClick={() => downloadFile(keycloak.token, object.id)}
              >
                <CloudDownloadIcon />
              </IconButton>
            )}
          </>
        );
      },
    },
  ];

  const sortedItems = data
    .map((item) => ({ ...item, id: item._id }))
    .sort((a, b) => {
      if (a.type === "folder" && b.type !== "folder") {
        return -1;
      }
      if (a.type !== "folder" && b.type === "folder") {
        return 1;
      }
      return 0;
    });

  return (
    <div>
      <Portal targetId="search-container">
        <Search onSelectSearchedItem={onSelectSearchedItem} />
      </Portal>
      <div style={{ height: "100vh - 60px", width: "100%", marginTop: 10 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Go back">
              <IconButton
                disabled={pathHistory.length === 1}
                onClick={() => onBack()}
              >
                <BackIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Go Home">
              <IconButton
                onClick={() => {
                  onFolderClick(ROOT_FOLDER);
                  // Handle the first action
                }}
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <FileUploadV2 parentId={selectedFolder._id} />
          <Typography variant="body1">
            {pathHistory.map((item, index) => (
              <span key={item._id}>
                <Button className="button" onClick={() => onFolderClick(item)}>
                  {item.name}
                </Button>
                {index < pathHistory.length - 1 && (
                  <Typography variant="span" sx={{ mx: 1 }}>
                    &gt;
                  </Typography>
                )}
              </span>
            ))}
          </Typography>
        </Box>
        <FilePreview isOpen={isPreviewOpen} file={selectedFile} handleClose={handleClosePreview}/>
        <DataGrid
          onCellDoubleClick={handleCellDoubleClick}
          pageSize={pageSize}
          onPageChange={(params) => setCurrentPage(params.page)}
          hideFooter={!showFooter}
          onRowClick={onRowClick}
          rows={sortedItems}
          columns={columns}
          autoHeight
          initialState={{
            pagination: {
              paginationModel: { pageSize: 100, page: 0 },
            },
          }}
          localeText={{
            noRowsLabel: "Nothing found",
          }}
          componentsProps={{
            pagination: {
              labelRowsPerPage: "Files per page",
            },
          }}
          /*componentsProps={{
            footer: {
              rowCountText: (count) => `${count.toLocaleString()} file${count === 1 ? '' : 's'}`,
              selectedRowCountText: (count) => `${count.toLocaleString()} file${count === 1 ? '' : 's'} selected`,
            },
          }}*/
        />

        <Fab
          color="primary"
          aria-label="add"
          onClick={(event) => setFabMenuAnchorEl(event.currentTarget)}
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
          }}
        >
          <AddIcon />
        </Fab>
        <Menu
          anchorEl={fabMenuAnchorEl}
          open={Boolean(fabMenuAnchorEl)}
          onClose={() => setFabMenuAnchorEl(null)}
        >
          <MenuItem
            onClick={() => handleCreateFolder()}
            sx={{
              display: "flex",
              alignItems: "left",
              width: 150,
            }}
          >
            <IconButton component="span">
              <FolderIcon />
            </IconButton>
            New Folder
          </MenuItem>
          <MenuItem
            sx={{
              display: "flex",
              alignItems: "left",
              width: 150,
            }}
          >
            <label htmlFor="upload-file">
              <IconButton component="span">
                <AddIcon />
              </IconButton>
              Upload File
            </label>
          </MenuItem>
        </Menu>

        <Dialog
          open={Boolean(dialogMode)}
          onClose={() => {
            setDialogMode(null);
            setSelectedFile(null);
          }}
        >
          {dialogMode === "createFolder" && (
            <NewFolder
              currentFolder={selectedFolder}
              parentId={selectedFolder._id}
              onCancel={() => setDialogMode(null)}
              onSave={onCreateNewFolder}
            />
          )}
          {dialogMode === "rename" && (
            <RenameObject
              parentId={selectedFolder._id}
              file={selectedFile}
              onCancel={() => setDialogMode(null)}
              onSave={onRenameFile}
            />
          )}
        </Dialog>
      </div>
    </div>
  );
}

export default FileListComp;
