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
import styled from "styled-components";

function FileUpload({ parentId }) {
  const [showProgress, setShowProgress] = useState(false);
  const [uploadFiles, uploadProgress, uploadComplete, status="uploading"] =
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

  const totalFiles = Object.keys(uploadProgress).length;
  const totalFilesArray = Object.entries(uploadProgress);

  const totalProgress =
    totalFilesArray.reduce((acc, [, value]) => acc + value, 0) / totalFiles;

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
        <PaperWrapped elevation={4}>
          <div
            style={{ width: "100%", backgroundColor: lightGreen[500] }}
            onClick={() => {
              setShowProgress(!showProgress);
            }}
          >
            <Typography
              style={{ display: "inline-block", width: "100%" }}
              color="white"
            >
              <div style={{ width: "100%" }}>
                <IconButton style={{ color: "white" }}>
                  {!showProgress && <KeyboardDoubleArrowUpIcon />}
                  {showProgress && <KeyboardDoubleArrowDownIcon />}
                </IconButton>
                <TotalFilesContainer>{`Uploading ${totalFiles} files`}</TotalFilesContainer>
                <TotalProgressContainer>
                  {Math.floor(totalProgress)}%
                </TotalProgressContainer>
              </div>
            </Typography>
          </div>

          {showProgress && (
            <div style={{ height: 150, overflow: "scroll" }}>
              <MenuList>
                <GridContainer>
                  {totalFilesArray.map(([key, value]) => (
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
        </PaperWrapped>
      )}
    </>
  );
}

export const PaperWrapped = styled(Paper)`
  position: absolute;
  bottom: 0;
  left: calc(50% - 200px);
  width: 400px;
  overflow: scroll,
  borderBottomLeftRadius: 0;
  borderBottomRightRadius: 0;
  zIndex: 1;
`;

export const TotalProgressContainer = styled.div`
  font-weight: bold;
  position: absolute;
  right: 8px;
  top: 8px;
`;

export const TotalFilesContainer = styled.strong`
  position: relative;
  top: 2px;
`
export default FileUpload;
