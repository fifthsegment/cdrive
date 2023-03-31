import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { SERVER_BASE_URL } from "../contants";

export const FilePreview = ({ handleClose, isOpen, file }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        style: {
          width: "70%",
          height: "70%",
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
      </DialogContent>
    </Dialog>
  );
};
