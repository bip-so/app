import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { ResizableBox } from "react-resizable";
import { IsImageOk } from "../../../utils";
import BlocksService from "../../../services";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { v4 as uuidv4 } from "uuid";

import { Transforms, Editor } from "slate";
import {
  useFocused,
  useReadOnly,
  useSelected,
  useSlateStatic,
} from "slate-react";
import { Box, Text, Tooltip, useTheme } from "@primer/react";
import { useCanvas } from "../../../../../context/canvasContext";
import useDeviceDimensions from "../../../../../hooks/useDeviceDimensions";
import Modal from "../../../../../components/Modal";
import Colors from "../../../../../utils/Colors";
import { getImageSize } from "image-file-size";
import useDebounce from "../../../../../hooks/useDebounce";
import ReactTextareaAutosize from "react-textarea-autosize";
import { NoteIcon } from "@primer/octicons-react";

function ImageBlock({
  element,
  children,
  data,
  actions,
  attributes,
  isReadOnly,
}) {
  const [size, setSize] = useState(null);
  const [maxSize, setMaxSize] = useState(null);
  const { isTabletOrMobile } = useDeviceDimensions();
  const [minSize, setMinSize] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const editor = useSlateStatic();
  const selected = useSelected();
  const focused = useFocused();
  const readOnly = useReadOnly();
  const [showHandle, setShowHandle] = useState(false);
  const { repo } = useCanvas();
  const imgRef = useRef(null);
  const [showLargeImgPopup, setShowLargeImgPopup] = useState(false);
  const { colorMode } = useTheme();
  const [isTableImage, setIsTableImage] = useState(false);
  const captionsInputRef = useRef(null);
  const [captionInputText, setCaptionInputText] = useState(
    element?.attributes?.caption ?? ""
  );
  const [showCaptionsInput, setShowCaptionsInput] = useState(() => {
    return element?.attributes?.caption ? true : false;
  });

  const saveCaption = (newCaption) => {
    Transforms.setNodes(
      editor,
      {
        attributes: {
          ...element.attributes,
          caption: newCaption ?? captionInputText,
        },
      },
      {
        at: [],
        match: (node, _) => node.uuid === element.uuid,
      }
    );
  };

  const checkForTableImage = () => {
    const [[node, path]] = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) => n.uuid === element.uuid,
      })
    );
    if (path.length >= 5) {
      const [block, blockPath] = Array.from(
        Editor.node(
          editor,
          path.length === 5 ? path.slice(0, 1) : path.slice(0, 2)
        )
      );
      if (block.type === "simple_table_v1") setIsTableImage(true);
    }
  };

  const getImageSizes = (
    imageNaturalHeight: number,
    imageNaturalWidth: number
  ) => {
    const editorWidth =
      editor?.parentRef?.current?.offsetWidth ?? window.innerWidth - 16;

    const maxWidth = Math.min(550, (11 / 12) * editorWidth);
    const imageAspectRatio = imageNaturalWidth / imageNaturalHeight;
    let imageAspectWidth = maxWidth;
    let imageAspectHeight = imageAspectWidth / imageAspectRatio;
    if (imageAspectHeight > 536) {
      imageAspectHeight = 536;
      imageAspectWidth = imageAspectRatio * imageAspectHeight;
    }
    if (
      imageAspectHeight > imageNaturalHeight ||
      imageAspectWidth > imageNaturalWidth
    ) {
      imageAspectWidth = imageNaturalWidth;
      imageAspectHeight = imageNaturalHeight;
    }
    let maxSizeWidth = imageAspectWidth;
    let maxSizeHeight = imageAspectHeight;

    if (element.attributes && element.attributes.size) {
      imageAspectWidth = maxSizeWidth * element.attributes.size;
      imageAspectHeight = maxSizeHeight * element.attributes.size;
    }

    let minSizeWidth = maxSizeWidth * 0.1;
    let minSizeHeight = minSizeWidth / imageAspectRatio;
    return {
      imageAspectHeight,
      imageAspectWidth,
      minSizeHeight,
      minSizeWidth,
      maxSizeHeight,
      maxSizeWidth,
    };
  };

  const init = () => {
    if (size === null && imgRef && imgRef.current) {
      checkForTableImage();
      const editorWidth =
        editor?.parentRef?.current?.offsetWidth ?? window.innerWidth - 16;

      const maxWidth = Math.min(550, (11 / 12) * editorWidth);
      const imageNaturalHeight = imgRef.current.naturalHeight;
      const imageNaturalWidth = imgRef.current.naturalWidth;
      const isImageOK = IsImageOk(imgRef.current);
      if (isImageOK) {
        const {
          imageAspectHeight,
          imageAspectWidth,
          minSizeHeight,
          minSizeWidth,
          maxSizeHeight,
          maxSizeWidth,
        } = getImageSizes(imageNaturalHeight, imageNaturalWidth);

        setSize({ width: imageAspectWidth, height: imageAspectHeight });
        setMaxSize({ width: maxSizeWidth, height: maxSizeHeight });
        setMinSize({
          width: minSizeWidth,
          height: minSizeHeight,
        });
      }
    }
  };

  useEffect(init);

  const onDrop = async (acceptedFiles: any) => {
    const image = acceptedFiles[0];
    const data = new FormData();
    data.append("file", image);
    data.append("model", "blocks");
    data.append("uuid", element.uuid);
    data.append("repoID", repo.id);

    const { height: actualHeight, width: actualWidth } = await getImageSize(
      image
    );
    const { data: imageResponse } = await BlocksService.blockFileUpload(data);

    Transforms.setNodes(
      editor,
      {
        children: [{ text: "" }],
        url: imageResponse.data,
        attributes: {
          actualHeight,
          actualWidth,
          size: 1,
        },
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
  };

  const { getRootProps, getInputProps, isDragAccept, isDragReject } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: {
        "image/png": [".png"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/gif": [".gif"],
      },
    });

  const onResize = (e, data) => {
    setSize(data.size);
    setShowHandle(false);
  };

  const onResizeStart = () => {
    setIsResizing(true);
  };

  const onResizeStop = () => {
    setIsResizing(false);
    const newSize = size.width / maxSize.width;
    if (element.attributes?.size !== newSize) {
      let attributes = { ...element.attributes, size: newSize };
      Transforms.setNodes(
        editor,
        {
          attributes: attributes,
        },
        {
          at: [],
          match: (node, _) => node.uuid === element.uuid,
        }
      );
    }
  };

  let onMouseEnter = () => {
    setShowHandle(true);
  };

  let onMouseLeave = (e) => {
    setShowHandle(false);
  };

  const toggleImageModal = () => {
    setShowLargeImgPopup((prev) => !prev);
  };

  let {
    actualHeight,
    actualWidth,
    size: imageSize,
  } = element?.attributes ?? {};
  if (!imageSize) {
    imageSize = 1;
  }
  const { imageAspectHeight: aspectHeight } = useMemo(() => {
    return getImageSizes(actualHeight, actualWidth);
  }, [element.attributes]);

  return (
    <Box
      {...attributes}
      contentEditable={false}
      sx={{
        display: "inline-block",
        width: element.url && element.url !== "" ? "unset" : "90%",
        cursor: "auto",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "transparent",
        boxShadow:
          selected && focused
            ? `0px 0px 0px 6px ${
                colorMode === "day" ? Colors.blue["200"] : Colors.blue["300"]
              }`
            : null,
        ":hover":
          element.url && element.url !== ""
            ? {
                borderColor:
                  colorMode === "day" ? Colors.gray["200"] : Colors.gray["700"],
              }
            : {},
      }}
    >
      {element.url && element.url !== "" ? (
        <TransformWrapper
          initialScale={1}
          wheel={{
            disabled: true,
          }}
          doubleClick={{
            disabled: true,
          }}
          panning={{
            disabled: isTabletOrMobile,
          }}
        >
          {isTabletOrMobile || isTableImage ? (
            <Box
              sx={{
                width: "fit-content",
              }}
            >
              <TransformComponent>
                <div
                  onDoubleClick={toggleImageModal}
                  style={{
                    cursor: "pointer",
                    height: isTableImage
                      ? "unset"
                      : aspectHeight
                      ? aspectHeight
                      : "unset",
                  }}
                >
                  <img
                    style={{
                      height: "100px!important",
                      width: "100px!important",
                    }}
                    src={element.url}
                    ref={imgRef}
                    onLoad={init}
                    alt=""
                  />
                </div>
              </TransformComponent>
              {element?.attributes?.caption && (
                <Text
                  as="p"
                  contentEditable={false}
                  sx={{
                    wordBreak: "break-word",
                    textAlign: "center",
                    color: "image.caption",
                    maxWidth: "500px",
                  }}
                >
                  {element?.attributes?.caption}
                </Text>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                width: "fit-content",
              }}
            >
              <Box
                sx={{
                  height:
                    aspectHeight && data?.origin !== "reel"
                      ? aspectHeight
                      : "unset",
                }}
              >
                <ResizableBox
                  lockAspectRatio={true}
                  minConstraints={[
                    minSize ? minSize.width : 100,
                    minSize ? minSize.height : 100,
                  ]}
                  maxConstraints={[
                    maxSize ? maxSize.width : 100,
                    maxSize ? maxSize.height : 100,
                  ]}
                  width={
                    data?.origin === "reel"
                      ? "350px"
                      : size !== null
                      ? size.width
                      : 0
                  }
                  height={
                    data?.origin === "reel"
                      ? "200px"
                      : size !== null
                      ? size.height
                      : 0
                  }
                  style={{ position: "relative", margin: "auto" }}
                  onResize={onResize}
                  onResizeStart={onResizeStart}
                  onResizeStop={onResizeStop}
                  onMouseEnter={() => {
                    !readOnly && onMouseEnter();
                  }}
                  onMouseLeave={onMouseLeave}
                  handle={
                    (showHandle || isResizing) && data?.origin !== "reel" ? (
                      <Text
                        className="absolute cursor-nwse-resize right-2 bottom-2 px-1 rounded"
                        sx={{
                          bg: "imageBlock.resizeBg",
                          color: "imageBlock.resize",
                          userSelect: "none",
                        }}
                      >
                        Resize
                      </Text>
                    ) : null
                  }
                >
                  {showHandle &&
                    !element?.attributes?.caption &&
                    !showCaptionsInput &&
                    data?.origin !== "reel" && (
                      <Box
                        className="absolute cursor-pointer right-2 top-2 px-1 rounded z-50"
                        contentEditable={false}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowCaptionsInput(true);
                        }}
                      >
                        <Tooltip
                          direction="w"
                          sx={{
                            "::after": {
                              bg: "#fff",
                              color: "#24292F",
                              fontWeight: 600,
                            },
                            "::before": {
                              borderLeftColor: "#fff !important",
                              color: "#fff",
                            },
                          }}
                          text="Add Caption"
                        >
                          <Box
                            sx={{
                              bg: "imageBlock.resizeBg",
                              color: "imageBlock.resize",
                              userSelect: "none",
                              borderRadius: "5px",
                              padding: "5px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <NoteIcon />
                          </Box>
                        </Tooltip>
                      </Box>
                    )}
                  <TransformComponent>
                    <div
                      onClick={toggleImageModal}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <img
                        style={{
                          height: "100px!important",
                          width: "100px!important",
                        }}
                        src={element.url}
                        ref={imgRef}
                        onLoad={init}
                        alt=""
                      />
                    </div>
                  </TransformComponent>
                </ResizableBox>
              </Box>
              <Box
                contentEditable={false}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                {showCaptionsInput || element?.attributes?.caption ? (
                  isReadOnly ? (
                    <Text
                      as="p"
                      contentEditable={false}
                      sx={{
                        wordBreak: "break-word",
                        textAlign: "center",
                        color: "image.caption",
                        maxWidth: "500px",
                      }}
                    >
                      {element?.attributes?.caption}
                    </Text>
                  ) : (
                    <ReactTextareaAutosize
                      placeholder="Enter your caption here"
                      style={{
                        outline: 0,
                        border: "none",
                        width: "100%",
                        textAlign: "center",
                        background: "transparent",
                        resize: "none",
                      }}
                      className={` ${
                        colorMode === "night"
                          ? "text-gray-600 placeholder-gray-700"
                          : "text-gray-500"
                      }`}
                      ref={captionsInputRef}
                      autoFocus={
                        showCaptionsInput && !element?.attributes?.caption
                      }
                      value={captionInputText}
                      onBlur={() => {
                        if (captionInputText !== element?.attributes?.caption) {
                          saveCaption();
                        }
                        setShowCaptionsInput(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          saveCaption();
                          setShowCaptionsInput(false);
                          captionsInputRef.current.blur();
                          return;
                        }
                      }}
                      onChange={(e) => {
                        saveCaption(e.target.value);
                        setCaptionInputText(e.target.value);
                      }}
                    />
                  )
                ) : null}
              </Box>
            </Box>
          )}
        </TransformWrapper>
      ) : isReadOnly ? (
        <Box
          className={"w-full h-40 rounded-xl flex justify-center"}
          sx={{
            bg: "imageBlock.bg",
            border: "1px solid",
            borderColor: selected
              ? "imageBlock.selectedBorder"
              : "imageBlock.border",
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <p>No image available</p>
          </div>
        </Box>
      ) : (
        <Box
          className={
            "w-full h-40  cursor-pointer rounded-xl flex justify-center"
          }
          sx={{
            bg:
              isDragReject === true
                ? "imageBlock.rejectBg"
                : isDragAccept === true
                ? "imageBlock.acceptBg"
                : "imageBlock.bg",
            border: "1px solid",
            borderColor: selected
              ? "imageBlock.selectedBorder"
              : "imageBlock.border",
          }}
          {...getRootProps()}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center">
            {isDragReject ? (
              <p>Please try again!</p>
            ) : (
              <p>Drop image or click to upload</p>
            )}
          </div>
        </Box>
      )}
      {children}
      {showLargeImgPopup && (
        <Modal
          closeHandler={toggleImageModal}
          hideCloseButton
          handleOutsideClick
          sx={{
            width: isTabletOrMobile ? "90%" : "fit-content",
            height: isTabletOrMobile ? "fit-content" : "90%",
            padding: 0,
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "0px",
          }}
        >
          <TransformWrapper
            initialScale={1}
            doubleClick={{
              disabled: true,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
              }}
            >
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <img
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                    userSelect: "none",
                  }}
                  src={element.url}
                  alt=""
                />
              </TransformComponent>
            </Box>
          </TransformWrapper>
        </Modal>
      )}
    </Box>
  );
}

export default ImageBlock;
