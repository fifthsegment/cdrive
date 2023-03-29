import { useEffect, useState } from "react";
import { useUploadFilesV2, useUploadFilesV3 } from "./hooks";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import {
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  MenuList,
  Typography,
} from "@mui/material";
import {
  GridContainer,
  GridItem,
  GridItemGrow,
  GridRow,
  TotalProgress,
} from "./elements";
import { lightGreen, red } from "@mui/material/colors";

function FileUpload({ parentId }) {
  const [showProgress, setShowProgress] = useState(false);
  const [uploadFiles, uploadProgress, uploadComplete, status] =
    useUploadFilesV3();
  const [, setFiles] = useState([]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const files = event.target.files;
    await uploadFiles(Array.from(files), parentId);
    setFiles(Array.from(files));
    //document.querySelector("#upload-file").value = "";
  };

  useEffect(() => {
    if (uploadComplete === true) {
      setFiles([]);
    }
  }, [uploadComplete]);

  const totalProgress =
    Object.entries(uploadProgress).reduce((acc, [, value]) => {
      return acc + value;
    }, 0) / Object.keys(uploadProgress).length;
  return (
    <>
      <form>
        <input
          multiple
          type="file"
          style={{ display: "none" }}
          name="fileInput"
          id="upload-file"
          onChange={handleSubmit}
        />
      </form>
      {status === "uploading" && (
        <Paper
          style={{
            position: "absolute",
            bottom: 0,
            left: "calc(50% - 150px)",
            width: 300,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <div
            style={{ width: "100%", backgroundColor: lightGreen[500] }}
            onClick={() => {
              setShowProgress(!showProgress);
            }}
          >
            <IconButton>
              {!showProgress && <KeyboardDoubleArrowUpIcon />}
              {showProgress && <KeyboardDoubleArrowDownIcon />}
            </IconButton>
            <Typography style={{ display: "inline-block" }}>
              <TotalProgress
              color="secondary"
                size={20}
                value={totalProgress}
                variant="determinate"
              />

              {`Uploading ${Object.keys(uploadProgress).length} files`}
            </Typography>
          </div>

          {showProgress && (
            <div>
              <MenuList>
                <GridContainer>
                  {Object.entries(uploadProgress).map(([key, value]) => (
                    <GridRow key={key}>
                      <GridItem>
                        <div style={{ width: "100%" }}>
                          <LinearProgress
                            variant="determinate"
                            value={value}
                            valueBuffer={value + 3}
                          />
                        </div>
                      </GridItem>
                      <GridItemGrow>
                        <Typography>{key}</Typography>
                      </GridItemGrow>
                    </GridRow>
                  ))}
                </GridContainer>
              </MenuList>
            </div>
          )}
        </Paper>
      )}
    </>
  );
}

export default FileUpload;
