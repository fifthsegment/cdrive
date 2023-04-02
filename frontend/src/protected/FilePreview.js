import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { SERVER_BASE_URL } from "../contants";
import { FileDocPreview } from "./FileDocPreview";

export const FilePreview = ({ handleClose, isOpen, file }) => {
  const ext = file?.name.split(".")[1]
  console.log("Includes = ", ["doc", "docx", "odt", "xls", "xlsx", "ods", "ppt", "pptx", "odp"].includes(ext))
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        style: {
          width: "85%",
          height: "85%",
          maxHeight: "none",
          maxWidth: "none",
        },
      }}
    >
      <DialogTitle>{file?.name}</DialogTitle>
      
      <DialogContent>
        {file && file.previews && (
          <div style={{textAlign: "center"}}>
            <img
              style={{ maxWidth: "100%", maxHeight: "100%" }}
              alt="thumbnail"
              src={`${SERVER_BASE_URL}/unprotected/thumbnail/${file._id}/${file.previews["large"].item}`}
            />
          </div>
        )}
        {file && ["doc", "docx", "odt", "xls", "xlsx", "ods", "ppt", "pptx", "odp", "pdf", "txt"].includes(ext) && <FileDocPreview file={file} />}
      </DialogContent>
    </Dialog>
  );
};
