import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import BlocksService from "../../../services";
import { Transforms, Editor } from "slate";
import { useSelected, useSlateStatic, useReadOnly } from "slate-react";
import { FileIcon } from "@primer/octicons-react";
import { Box } from "@primer/react";
import { useCanvas } from "../../../../../context/canvasContext";
import { useToasts } from "react-toast-notifications";
import useDeviceDimensions from "../../../../../hooks/useDeviceDimensions";
import { v4 as uuidv4 } from "uuid";

function AttachmentBlock({
  element,
  children,
  data,
  actions,
  attributes,
  isReadOnly,
}) {
  const { repo } = useCanvas();
  const { addToast } = useToasts();
  // const [fileName, setFileName] = useState();
  const editor = useSlateStatic();
  const selected = useSelected();
  const readOnly = useReadOnly();
  const { isTabletOrMobile } = useDeviceDimensions();

  const [unsupportedFormat, setUnsupportedFormat] = useState<boolean>(false);

  const onDrop = async (acceptedFiles: any) => {
    const file = acceptedFiles[0];
    // setFileName(acceptedFiles[0].name);
    if (file) {
      if (unsupportedFormat) setUnsupportedFormat(false);
      const data = new FormData();
      data.append("file", file);
      data.append("model", "blocks");
      data.append("uuid", element.uuid);
      data.append("repoID", repo.id);

      const { data: fileResponse } = await BlocksService.blockFileUpload(data);

      Transforms.setNodes(
        editor,
        {
          children: [{ text: "" }],
          url: fileResponse.data,
        },
        {
          at: [],
          match: (node, _) => node.uuid === element.uuid,
        }
      );

      if (isTabletOrMobile) {
        const { selection } = editor;
        let current_path = selection.anchor.path[0];
        Transforms.insertNodes(
          editor,
          {
            type: "text",
            uuid: uuidv4(),
            children: [{ text: "" }],
          },
          { at: [current_path + 1] }
        );
      }
    } else {
      setUnsupportedFormat(true);
    }
  };

  const {
    getRootProps,
    getInputProps,
    isDragAccept,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "text/plain": [".txt"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "image/gif": [".gif"],
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
      "image/svg+xml": [".svg"],
      "video/mp4": [".mp4"],
    },
    validator: (file) => {
      const sizeInMB = +(file.size / (1024 * 1024)).toFixed(2);
      if (sizeInMB > 50) {
        addToast("File is too large. Max accepted size - 50MB", {
          appearance: "error",
          autoDismiss: true,
        });
        return {
          code: "file-too-large",
          message: `File is too large. Max accepted size - 50MB`,
        };
      }
      return null;
    },
  });

  return (
    <div
      {...attributes}
      contentEditable={false}
      className="inline-block w-11/12 p-2 cursor-auto"
    >
      {element.url && element.url !== "" ? (
        <div>
          {/* <p>{fileName}</p> */}
          <FileIcon />
          <a href={element.url} target="_blank">
            {"  "}
            {element?.attributes?.fileName ||
              element.url.split("/")[element.url.split("/").length - 1]}
          </a>
        </div>
      ) : isReadOnly ? (
        <Box
          className={
            "w-full h-40 focus:outline-none flex justify-center rounded-xl"
          }
          sx={{
            bg: "attachmentBlock.bg",
            border: "1px solid",
            borderColor: selected
              ? "attachmentBlock.selectedBorder"
              : "attachmentBlock.border",
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <p>No attachment available.</p>
          </div>
        </Box>
      ) : (
        <Box
          className={
            "w-full h-40 cursor-pointer focus:outline-none flex justify-center rounded-xl"
          }
          sx={{
            bg: isDragReject
              ? "attachmentBlock.rejectBg"
              : isDragAccept
              ? "attachmentBlock.acceptBg"
              : "attachmentBlock.bg",
            border: "1px solid",
            borderColor: selected
              ? "attachmentBlock.selectedBorder"
              : "attachmentBlock.border",
          }}
          {...getRootProps()}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center">
            {fileRejections.length ? (
              fileRejections[0]?.errors[0]?.message
            ) : isDragReject || unsupportedFormat ? (
              <p>File type not supported</p>
            ) : isDragAccept ? (
              <p>Drop to upload</p>
            ) : (
              <p>Drop file or click to upload</p>
            )}
          </div>
        </Box>
      )}
      {children}
    </div>
  );
}

export default AttachmentBlock;
