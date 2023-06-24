import {
  ActionList,
  Box,
  Button,
  Spinner,
  Text,
  Tooltip,
  useTheme,
} from "@primer/react";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  FileIcon,
  InfoIcon,
} from "@primer/styled-octicons";
import React, { FC, useRef, useState } from "react";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";
import { FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";
import NotionIcon from "../icons/NotionIcon";
import StudioService from "../modules/Studio/services";
import Colors from "../utils/Colors";

// const [importType, setImportType] = useState("");
// const [showDnd, setShowDnd] = useState(false);
interface UploadTypeBoxProps {
  importType: string;
  onClick: () => void;
}

// const fileTypes: UploadTypeBoxProps[] = [
//   {
//     importType: "file",
//     onClick: () => {
//       setImportType("file");
//       setShowDnd(true);
//     },
//   },
//   {
//     importType: "notion",
//     onClick: () => {
//       setImportType("notion");
//       setShowDnd(true);
//     },
//   },
// ];

function UploadTypeBox(props: UploadTypeBoxProps) {
  const { colorMode } = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "15px 10px 15px 15px",
        cursor: "pointer",
        borderRadius: "4px",
        ":hover": {
          bg: "notionImport.importTypeHover",
        },
      }}
      onClick={props.onClick}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {props.importType === "notion" ? (
          <NotionIcon
            color={colorMode === "night" ? Colors.gray["300"] : Colors.bunker}
          />
        ) : (
          <FileIcon size={24} />
        )}

        <Text
          as="p"
          sx={{
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "19px",
            margin: "0px 0px 0px 15px",
          }}
        >
          {props.importType === "notion" ? "Notion" : "Markdown (.md)"}
        </Text>
      </Box>

      <Box
        onClick={(e) => {
          e.stopPropagation();
          window.open(
            props.importType === "notion"
              ? "https://bip.so/bip.so/c/xuhof/19906/import-from-notion"
              : "https://bip.so/bip.so/c/xVcGx/19915/import-from-file"
          );
        }}
        title={
          props.importType === "notion"
            ? "Learn how to import from Notion"
            : "Learn how to import from file"
        }
      >
        <InfoIcon
          sx={{ width: "16px", height: "16px" }}
          color={"notionImport.infoIcon"}
        />
      </Box>
    </Box>
  );
}

interface ImportNotionsProps {
  onClose: () => void;
}

const ImportNotions: FC<ImportNotionsProps> = (props) => {
  const [showDnd, setShowDnd] = useState(false);
  const [isInvalidFormat, setIsInvalidFormat] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showFailureMessage, setShowFailureMessage] = useState(false);
  const [importType, setImportType] = useState("");
  const [uploading, setUploading] = useState(false);

  const inputFile = useRef(null);

  const resetData = () => {
    setShowDnd(false);
    setIsInvalidFormat(false);
    setShowSuccessMessage(false);
    setShowFailureMessage(false);
  };

  const openFiles = () => {
    if (inputFile?.current) {
      inputFile.current.value = null;
      inputFile.current.click();
    }
  };

  //   const getFileExtension = (file: File) => {
  //     if (
  //       file.type === "application/x-zip-compressed" ||
  //       file.type === "application/zip" ||
  //       file.name.endsWith(".zip")
  //     ) {
  //       return "zip";
  //     } else if (
  //       file.type ===
  //       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  //     ) {
  //       return "docx";
  //     } else if (file.name.endsWith(".md")) {
  //       return "md";
  //     }
  //     return "pdf";
  //   };

  const importNotion = (file: File) => {
    setUploading(true);
    const payload = new FormData();
    payload.append("file", file);
    StudioService.importNotion(payload)
      .then((r) => {
        setUploading(false);
        setShowSuccessMessage(true);
      })
      .catch((err) => {
        setUploading(false);
        setShowFailureMessage(true);
      });
  };

  const importFromFile = (file: File) => {
    setUploading(true);
    const payload = new FormData();
    payload.append("file", file);
    StudioService.importFromFile(payload)
      .then((r) => {
        setUploading(false);
        setShowSuccessMessage(true);
      })
      .catch((err) => {
        setUploading(false);
        setShowFailureMessage(true);
      });
  };

  // const uploadFile = async (file: File) => {
  //   if (importType === "notion") {
  //     importNotion(file);
  //   } else {
  //     //   importDoc(file);
  //   }
  // };

  const uploadFile = async (file: File) => {
    if (importType === "notion") {
      importNotion(file);
    } else {
      importFromFile(file);
      //   importDoc(file);
    }
  };

  const isValidFormat = (file: File) => {
    if (file) {
      if (importType === "notion") {
        return (
          file.type === "application/x-zip-compressed" ||
          file.type === "application/zip" ||
          file.name.endsWith(".zip")
        );
      }
      return file.name.endsWith(".md");
      // return (
      //   file.type === 'application/pdf' ||
      //   file.type ===
      //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      //   file.name.endsWith('.md')
      // )
    }
    return false;
  };

  const handleFileUpload = (e) => {
    const { files } = e.target;
    if (isValidFormat(files[0])) {
      uploadFile(files[0]);
    } else {
      setIsInvalidFormat(true);
    }
  };

  const handleFileDrop = (files = []) => {
    if (isValidFormat(files[0])) {
      uploadFile(files[0]);
    } else {
      setIsInvalidFormat(true);
    }
  };

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: NativeTypes.FILE,

      drop(item: any) {
        if (item.files) {
          handleFileDrop(item.files);
        }
      },
      canDrop(item) {
        return true;
      },
      collect: (monitor) => {
        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        };
      },
    }),
    [props, importType]
  );

  const isActive = canDrop && isOver;

  const renderSuccessMessage = () => (
    <>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <CheckCircleIcon color={"notionImport.checkIcon"} size={"medium"} />
        <Text
          as="p"
          sx={{
            margin: "0px 0px 0px 14px",
            fontWeight: 600,
            fontSize: "20px",
            lineHeight: "23px",
            color: "notionImport.heading",
          }}
        >
          Import in progress
        </Text>
      </Box>
      <ActionList.Divider />
      <Text
        as="p"
        sx={{
          margin: "15px 0px",
          fontSize: "14px",
          lineHeight: "20px",
          color: "notionImport.heading",
        }}
      >
        Your upload was successful and the files are being imported. You will be
        notified once they are ready!
      </Text>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="default"
          onClick={() => {
            resetData();
            props.onClose();
          }}
        >
          Done
        </Button>
      </Box>
    </>
  );

  const renderFailureMessage = () => (
    <>
      <Box
        sx={{
          display: "inline-flex",
          marginBottom: "10px",
        }}
      >
        <FaTimesCircle color="#f53b30" size={"24px"} />
        <Text
          as="p"
          sx={{
            ml: "10px",
            fontWeight: 600,
            fontSize: "20px",
            lineHeight: "23px",
            color: "notionImport.heading",
          }}
        >
          Upload Failed
        </Text>
      </Box>
      <ActionList.Divider />
      <Text
        as="p"
        sx={{
          margin: "15px 0px",
          fontSize: "14px",
          lineHeight: "16px",
          color: "notionImport.heading",
        }}
      >
        There was a problem uploading your file(s). Please try again!
      </Text>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="default"
          onClick={() => {
            resetData();
          }}
        >
          Back
        </Button>
      </Box>
    </>
  );

  const renderDragAndDrop = () => (
    <>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          cursor: "pointer",
          marginBottom: "20px",
        }}
        onClick={() => {
          setIsInvalidFormat(false);
          setShowDnd(false);
        }}
      >
        <ArrowLeftIcon />
        <Text
          as="p"
          sx={{
            margin: "0px 0px 0px 15px",
            fontWeight: 600,
            fontSize: "20px",
            lineHeight: "23px",
            color: "notionImport.heading",
          }}
        >
          {importType === "notion" ? "Import from Notion" : "Import from file"}
        </Text>
      </Box>
      <ActionList.Divider />
      <Box
        sx={{
          bg: isActive
            ? "notionImport.uploadBoxBg"
            : "notionImport.uploadDisabled",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          borderRadius: "10px",
          height: "200px",
          marginTop: "20px",
        }}
        ref={drop}
      >
        {isActive ? (
          <Text
            as="p"
            sx={{
              fontSize: "14px",
              lineHeight: "16px",
              opacity: 0.6,
              color: "notionImport.heading",
            }}
          >
            Drop to Upload
          </Text>
        ) : (
          <>
            <Text
              as="p"
              sx={{
                fontSize: "14px",
                lineHeight: "16px",
                opacity: 0.6,
                color: "notionImport.heading",
              }}
            >
              Drag &amp; Drop to Upload
            </Text>
            <Text
              as="p"
              sx={{
                margin: "12px 0px",
                fontSize: "8px",
                lineHeight: "9px",
                opacity: 0.6,
                color: "notionImport.heading",
              }}
            >
              OR
            </Text>
            <Button variant="primary" onClick={openFiles}>
              Browse Files
            </Button>
            <input
              ref={inputFile}
              type="file"
              // accept={
              //   importType === 'notion'
              //     ? 'application/x-zip-compressed, application/zip'
              //     : 'application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, .md'
              // }
              accept={
                importType === "notion"
                  ? "application/x-zip-compressed, application/zip"
                  : ".md"
              }
              onChange={handleFileUpload}
              style={{ display: "none" }}
              id="import-notions-file"
            />
            {isInvalidFormat ? (
              <Tooltip
                // aria-label={
                //   importType === 'notion'
                //     ? 'Please upload .zip file'
                //     : 'Please upload .pdf, .docx, .md file'
                // }
                aria-label={
                  importType === "notion"
                    ? "Please upload .zip file"
                    : "Please upload .md file"
                }
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "12px",
                  }}
                >
                  <FaExclamationTriangle color="#f53b30" size={"12px"} />

                  <Text
                    as="p"
                    sx={{
                      margin: "0px 0px 0px 4px",
                      fontSize: "11px",
                      lineHeight: "13px",
                      opacity: 0.8,
                      color: "notionImport.failedMsg",
                    }}
                  >
                    Invalid file format
                  </Text>
                </Box>
              </Tooltip>
            ) : null}
          </>
        )}
      </Box>
    </>
  );

  const renderUploadingStatus = () => (
    <>
      <Text
        as="p"
        sx={{
          mb: "20px",
          fontWeight: 600,
          fontSize: "20px",
          lineHeight: "23px",
          color: "notionImport.heading",
        }}
      >
        {importType === "notion" ? "Import from Notion" : "Import from file"}
      </Text>
      <ActionList.Divider />
      <Box
        sx={{
          my: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text as="p" sx={{ fontSize: "14px", lineHeight: "20px" }}>
          Your file is uploading. Please wait...
        </Text>
        <Spinner size="small" sx={{ ml: "20px" }} />
      </Box>
    </>
  );

  const renderImportTypes = () => (
    <>
      <Text
        as="p"
        sx={{
          margin: "0px 0px 8px 0px",
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "28px",
          color: "notionImport.heading",
        }}
      >
        Import
      </Text>
      <ActionList.Divider />
      <Box sx={{ mt: "15px" }} className="space-y-4">
        <UploadTypeBox
          importType="notion"
          onClick={() => {
            setImportType("notion");
            setShowDnd(true);
          }}
        />
        <UploadTypeBox
          importType="file"
          onClick={() => {
            setImportType("file");
            setShowDnd(true);
          }}
        />
      </Box>
    </>
  );

  return (
    <>
      {uploading
        ? renderUploadingStatus()
        : showSuccessMessage
        ? renderSuccessMessage()
        : showFailureMessage
        ? renderFailureMessage()
        : showDnd
        ? renderDragAndDrop()
        : renderImportTypes()}
    </>
  );
};

export default ImportNotions;
