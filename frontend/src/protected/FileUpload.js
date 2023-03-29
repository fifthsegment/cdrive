import { useUploadFile } from "./hooks";

function FileUpload({ parentId }) {
  const uploadFile = useUploadFile();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    await uploadFile({ file, parentId });
    document.querySelector("#upload-file").value = "";
  };

  return (
    <form>
      <input
        type="file"
        style={{ display: "none" }}
        name="fileInput"
        id="upload-file"
        onChange={handleSubmit}
      />
    </form>
  );
}

export default FileUpload;
