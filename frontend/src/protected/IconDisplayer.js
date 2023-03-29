import ArticleIcon from "@mui/icons-material/Article";
import FolderIcon from "@mui/icons-material/Folder";
import { ObjectIconWrapper } from "./elements";

function ObjectIconDisplayer({ object }) {
  const { type } = object;

  return (
    <ObjectIconWrapper>
      {type === "folder" && <FolderIcon />}
      {type !== "folder" && <ArticleIcon />}
    </ObjectIconWrapper>
  );
}

export default ObjectIconDisplayer;
