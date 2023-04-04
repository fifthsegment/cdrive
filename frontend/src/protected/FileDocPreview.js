import {  useMemo, useState } from "react";
import { useWOPIDiscovery, useWOPIShortToken } from "./hooks";

function parseXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  return xmlDoc;
}

function getUrl(parsed) {
  try {
    return parsed
      .querySelector("[name=writer-global]")
      .querySelectorAll("[name=edit]")
      .item(0)
      .getAttribute("urlsrc");
  } catch (error) {
    console.error("Unable to get url from XML");
    return null;
  }
}

export const FileDocPreview = ({ file }) => {
  const { data, isFetched } = useWOPIDiscovery();
  const [wopiUrl, setWopiUrl] = useState(null);
  const { data: tokenData, isFetched: tokenFetched } = useWOPIShortToken(
    wopiUrl !== null
  );

  useMemo(() => {
    if (isFetched && file) {
      const url = getUrl(parseXML(data));
      if (url) {
        //setWopiUrl(`${url}`)
        setWopiUrl(
          `${url}WOPISrc=http://cdrive:3000/api/documents/wopi/files/${file._id}`
        );
      }
    }
  }, [isFetched, data, file]);

  return (
    <>
    <a href={`${wopiUrl}&access_token=${tokenData.short_token}`} target="_blank
    " >Edit</a>
      {tokenFetched && (
        <iframe
          src={`${wopiUrl}&access_token=${tokenData.short_token}`}
          title="editor"
          width="100%"
          height="100%"
        />
      )}
    </>
  );
};
