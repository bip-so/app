import React, { useEffect, useState, useRef } from "react";
import { Transforms, Range, Editor } from "slate";
import { getEmbedLink, useCustomSelected } from "../../../utils";
import {
  ReactEditor,
  useFocused,
  useReadOnly,
  useSelected,
  useSlateStatic,
} from "slate-react";
import { TwitterTweetEmbed } from "react-twitter-embed";
import BipLoader from "../../../../../components/BipLoader";
import YoutubeIcon from "../../../../../icons/YoutubeIcon";
import LoomIcon from "../../../../../icons/LoomIcon";
import FigmaIcon from "../../../../../icons/FigmaIcon";
import ReplitIcon from "../../../../../icons/ReplitIcon";
import GoogleDriveIcon from "../../../../../icons/GoogleDriveIcon";
import GoogleSheetsIcon from "../../../../../icons/GoogleSheetsIcon";
import TwitterIcon from "../../../../../icons/TwitterIcon";
import {
  Box,
  Button,
  Link,
  Overlay,
  Text,
  TextInput,
  Truncate,
  useTheme,
} from "@primer/react";
import CodeSandboxIcon from "../../../../../icons/CodeSandboxIcon";
import MiroIcon from "../../../../../icons/MiroIcon";
import {
  CheckIcon,
  LinkExternalIcon,
  LinkIcon,
  ScreenFullIcon,
} from "@primer/styled-octicons";
import StyledTextInput from "../../../../../components/StyledTextInput";
import { EmptyIconContainer } from "../../../../../components/TableOfContents/styledComponents";
import Card from "../../../../../components/Card";
import Colors from "../../../../../utils/Colors";
import LinkWithoutPrefetch from "../../../../../components/LinkWithoutPrefetch";
import useDeviceDimensions from "../../../../../hooks/useDeviceDimensions";
import { v4 as uuidv4 } from "uuid";

const Embed = ({
  element,
  children,
  data,
  actions,
  attributes,
  isReadOnly = true,
}) => {
  const selected = useSelected();
  const focused = useFocused();
  const editor = useSlateStatic();
  const [embedURLInput, setEmbedURLInput] = useState("");
  const [showEmbedOptions, setShowEmbedOptions] = useState(false);
  const [showEmbedLinkOptions, setShowEmbedLinkOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [rerender, setRerender] = useState(0);
  const linkIconRef = useRef(null);
  const drawioImgRef = useRef(null);
  const { colorMode } = useTheme();
  const readOnly = useReadOnly();
  const { isTabletOrMobile } = useDeviceDimensions();

  useEffect(() => {
    if (
      editor.selection &&
      selected &&
      Range.isCollapsed(editor.selection) &&
      (!element.url || element.url === "")
    ) {
      document.getElementById(element.uuid + "_embedURLValue")?.focus();
    }
  }, [selected, element.url]);

  const copyLink = () => {
    navigator.clipboard.writeText(element.url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 5000);
  };
  const removeEmbed = () => {
    let [[_, path]] = Editor.nodes(editor, {
      at: [],
      match: (n, p) => p.length === 2 && n.uuid === element.uuid,
    });
    if (path) {
      Transforms.removeNodes(editor, { at: path });
      Transforms.select(editor, {
        anchor: { path: [path[0], 0], offset: 0 },
        focus: { path: [path[0], 0], offset: 0 },
      });
      Transforms.insertText(
        editor,
        element.type === "drawio" ? "" : element.url
      );
    }
  };

  const tryEmbedding = () => {
    const embedObj = getEmbedLink(embedURLInput);
    if (embedObj?.url) {
      Transforms.setNodes(
        editor,
        {
          url: embedObj.url,
          type: embedObj.type,
        },
        {
          match: (node, path) => node.uuid === element.uuid,
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
      setError(true);
    }
  };

  let placeholder;
  let icon = <></>;
  switch (element.type) {
    case "youtube":
      placeholder = "Paste Youtube URL";
      icon = <YoutubeIcon />;
      break;
    case "loom":
      placeholder = "Paste Loom URL";
      icon = <LoomIcon height={16} width={16} />;
      break;
    case "figma":
      placeholder = "Paste Figma URL";
      icon = <FigmaIcon />;
      break;
    case "miro":
      placeholder = "Paste Miro URL";
      icon = <MiroIcon />;
      break;
    case "replit":
      placeholder = "Paste Replit URL";
      icon = <ReplitIcon height={18} width={18} />;
      break;
    case "codesandbox":
      placeholder = "Paste CodeSandbox URL";
      icon = <CodeSandboxIcon />;
      break;
    case "googledrive":
      placeholder = "Paste Google Drive URL";
      icon = <GoogleDriveIcon />;
      break;
    case "googlesheet":
      placeholder = "Paste Google Sheet URL";
      icon = <GoogleSheetsIcon />;
      break;
    case "tweet":
      placeholder = "Paste Tweet URL";
      icon = <TwitterIcon height={16} width={16} />;
      break;
    default:
      placeholder = "Paste any URL to embed";
  }
  if (isReadOnly) {
    placeholder = "No URL available";
  }

  const iframeURL =
    element.url + (element.type === "codesandbox" ? "view=editor" : "");

  const DRAWIO_DUMMY_IMG = "/transparentDrawIO.png";

  const doubleClickHandler = function (evt) {
    var url =
      "https://embed.diagrams.net/?embed=1&ui=atlas&spin=1&modified=unsavedChanges&proto=json";
    var source = drawioImgRef.current;

    if (source.nodeName == "IMG" && source.className == "drawio") {
      if (source.drawIoWindow == null || source.drawIoWindow.closed) {
        // Implements protocol for loading and exporting with embedded XML
        var receive = function (evt) {
          if (evt.data.length > 0 && evt.source == source.drawIoWindow) {
            var msg = JSON.parse(evt.data);

            // Received if the editor is ready
            if (msg.event == "init") {
              // Sends the data URI with embedded XML to editor
              source.drawIoWindow.postMessage(
                JSON.stringify({
                  action: "load",
                  xmlpng: source.getAttribute("src"),
                }),
                "*"
              );
            }
            // Received if the user clicks save
            else if (msg.event == "save") {
              // Sends a request to export the diagram as XML with embedded PNG
              source.drawIoWindow.postMessage(
                JSON.stringify({
                  action: "export",
                  format: "xmlpng",
                  spinKey: "saving",
                }),
                "*"
              );
            }
            // Received if the export request was processed
            else if (msg.event == "export") {
              // Updates the data URI of the image
              source.setAttribute("src", msg.data);
              Transforms.setNodes(
                editor,
                {
                  url: msg.data,
                },
                {
                  match: (node, path) => node.uuid === element.uuid,
                }
              );
            }

            // Received if the user clicks exit or after export
            if (msg.event == "exit" || msg.event == "export") {
              // Closes the editor
              window.removeEventListener("message", receive);
              source.drawIoWindow.close();
              source.drawIoWindow = null;
            }
          }
        };

        // Opens the editor
        window.addEventListener("message", receive);
        source.drawIoWindow = window.open(url);
      } else {
        // Shows existing editor window
        source.drawIoWindow.focus();
      }
    }
  };

  const isDrawIoElement = element.type === "drawio";

  const drawIoHintTextStyles = element.url
    ? {
        fontSize: "12px",
        bottom: "8px",
        right: "8px",
        display: "none",
        color: "drawio.hintText",
      }
    : {
        fontSize: "18px",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "block",
        color: "drawio.emptyHintText",
      };

  const renderedJSX =
    (!element.url || element.url === "") && !isDrawIoElement ? (
      <Box contentEditable={false}>
        <StyledTextInput
          size={"small"}
          disabled={isReadOnly}
          id={element.uuid + "_embedURLValue"}
          onChange={(e) => {
            setError(false);
            setEmbedURLInput(e.target.value);
          }}
          onFocus={() => {
            setRerender((prev) => prev + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              tryEmbedding();
            }
            if (
              document.getElementById(element.uuid + "_embedURLValue")
                ?.value === ""
            ) {
              if (e.key === "ArrowLeft") {
                ReactEditor.focus(editor);
                Transforms.move(editor, {
                  distance: 1,
                  unit: "offset",
                  reverse: true,
                });
              } else if (e.key === "ArrowRight") {
                ReactEditor.focus(editor);
                Transforms.move(editor, {
                  distance: 1,
                  unit: "offset",
                });
                Transforms.move(editor, {
                  distance: 1,
                  unit: "offset",
                  reverse: true,
                });
              } else if (e.key === "Backspace") {
                ReactEditor.focus(editor);
              }
            }
          }}
          type="text"
          placeholder={placeholder}
          leadingVisual={
            <div
              style={{
                justifyContent: "center",
                width: 20,
                display: "inline-flex",
                verticalAlign: "middle",
              }}
            >
              {icon}
            </div>
          }
          trailingAction={
            <TextInput.Action
              onClick={() => {
                tryEmbedding();
              }}
              icon={embedURLInput !== "" ? CheckIcon : EmptyIconContainer}
              sx={{ color: "fg.subtle" }}
            />
          }
          showError={error}
          errorMessage={"Error: Unable to parse URL to embed"}
          sx={{ width: "100%", borderColor: selected ? "accent.fg" : "" }}
        />
      </Box>
    ) : element.type === "googlesheet" && data?.origin === "reel" ? (
      <Box contentEditable={false}>
        <LinkWithoutPrefetch href={element.url}>
          {element.url}
        </LinkWithoutPrefetch>
      </Box>
    ) : (
      <Card
        padding={"0px"}
        display="block"
        border={element.type !== "tweet"}
        sx={{
          marginTop: "24px",
          borderColor:
            element.type === "drawio" ? Colors.gray["200"] : "transparent",
          boxShadow:
            selected && focused
              ? `0px 0px 0px 6px ${
                  colorMode === "day" ? Colors.blue["200"] : Colors.blue["300"]
                }`
              : null,
          ":hover": {
            borderColor:
              colorMode === "day" ? Colors.gray["200"] : Colors.gray["700"],
          },
        }}
      >
        <div
          className="relative"
          // className={
          //   style.embedBlock +
          //   (data.isMergeRequest ? " " + style.thinVerticalMargins : "")
          // }
          onMouseEnter={
            data?.isMergeRequest
              ? () => {}
              : () => {
                  setShowEmbedOptions(true);
                }
          }
          onMouseLeave={() => {
            setShowEmbedOptions(false);
            showEmbedLinkOptions && setShowEmbedLinkOptions(false);
          }}
        >
          <div
            className="flex flex-row-reverse absolute right-0 h-8  w-full"
            style={{ top: "-32px" }}
          >
            {showEmbedOptions && (
              <>
                {!["figma", "loom", "youtube", "drawio"].includes(
                  element.type
                ) && (
                  <div
                    className={"cursor-pointer ml-2"}
                    onClick={() => {
                      document
                        ?.getElementById(element.uuid + "_iframe")
                        ?.requestFullscreen();
                    }}
                  >
                    <ScreenFullIcon size="small" color={"text.subtle"} />
                  </div>
                )}
                {element.url && (
                  <div
                    ref={linkIconRef}
                    className={"cursor-pointer ml-2"}
                    onMouseEnter={() => {
                      setShowEmbedLinkOptions(true);
                    }}
                  >
                    <LinkIcon size="small" color={"text.subtle"} />
                  </div>
                )}
                {showEmbedOptions && showEmbedLinkOptions && (
                  <Overlay
                    returnFocusRef={linkIconRef}
                    ignoreClickRefs={[]}
                    onEscape={() => setShowEmbedLinkOptions(false)}
                    onClickOutside={() => setShowEmbedLinkOptions(false)}
                    width="medium"
                    top={
                      linkIconRef?.current
                        ? linkIconRef?.current?.getBoundingClientRect()
                            ?.bottom + window.scrollY
                        : window.scrollY
                    }
                    left={
                      linkIconRef?.current
                        ? linkIconRef.current?.getBoundingClientRect().right -
                          160
                        : 0
                    }
                    onMouseLeave={() => setShowEmbedLinkOptions(false)}
                    sx={{ padding: "8px", width: "320px" }}
                  >
                    <Box className="flex ">
                      <Box
                        className="flex flex-1 bg-gray-100 border border-gray-200 items-center text-sm"
                        sx={{
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                          borderTopLeftRadius: 6,
                          borderBottomLeftRadius: 6,
                          cursor: "pointer",
                          color: "text.muted",
                        }}
                        onClick={copyLink}
                      >
                        <Box className="ml-2">
                          <Truncate title={element.url} maxWidth="192px">
                            {element.url}
                          </Truncate>
                        </Box>
                      </Box>
                      <Button
                        onClick={copyLink}
                        sx={{
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          flexShrink: 0,
                        }}
                      >
                        {copied ? "Copied!" : "Copy link"}
                      </Button>
                    </Box>
                    {!isReadOnly && (
                      <Box className="flex mt-2">
                        <Button
                          onClick={removeEmbed}
                          variant="invisible"
                          sx={{ color: "text.subtle" }}
                        >
                          Remove embed
                        </Button>
                      </Box>
                    )}
                  </Overlay>
                )}

                {!["loom", "youtube", "drawio"].includes(element.type) && (
                  <div
                    className={"cursor-pointer ml-2"}
                    onClick={() => {
                      window.open(element.url, "_blank");
                    }}
                  >
                    <LinkExternalIcon size="small" color={"text.subtle"} />
                  </div>
                )}
              </>
            )}
          </div>
          <div
            style={
              isDrawIoElement ? {} : { paddingBottom: "56.25%", height: 0 }
            }
            onDoubleClick={
              isDrawIoElement && !isReadOnly ? doubleClickHandler : () => {}
            }
          >
            {element.type === "tweet" ? (
              // {element.url.split("/"[5])};
              <TwitterTweetEmbed
                tweetId={element.url.split("/")[5].split("?")[0]}
                placeholder={<BipLoader />}
                options={{ theme: colorMode === "night" ? "dark" : "light" }}
              />
            ) : isDrawIoElement ? (
              <Box
                position={"relative"}
                className="group"
                sx={{ borderRadius: "12px" }}
              >
                <Box
                  sx={{
                    position: "relative",
                    maxHeight: "400px",
                    minHeight: element.url ? "250px" : "unset",
                    overflow: "scroll",
                    backgroundColor: element.url ? "drawio.imageBg" : null,
                    borderRadius: "8px",
                  }}
                >
                  <img
                    draggable={false}
                    style={{
                      userSelect: "none",
                      margin: "0 auto",
                      height: element.url ? "unset" : "200px",
                    }}
                    ref={drawioImgRef}
                    className="drawio"
                    src={element.url || DRAWIO_DUMMY_IMG}
                  />
                </Box>
                {!isReadOnly && (
                  <Text
                    sx={{
                      position: "absolute",
                      textAlign: "center",
                      userSelect: "none",
                      ...drawIoHintTextStyles,
                    }}
                    className={`${element.url ? "group-hover:block" : ""}`}
                  >
                    Double click to start editing!
                  </Text>
                )}
              </Box>
            ) : (
              <iframe
                id={element.uuid + "_iframe"}
                src={iframeURL}
                title={`Embedded ${element.type} link`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                frameBorder="0"
                allowFullScreen
                sandbox="allow-forms allow-modals allow-presentation allow-scripts allow-same-origin"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "100%",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              />
            )}
          </div>
        </div>
      </Card>
    );

  return (
    <div
      {...attributes}
      style={{
        display: "inline-block",
        width: "95%",
        margin: "0px 1px",
        cursor: "auto",
      }}
      contentEditable={false}
    >
      {renderedJSX}
      {children}
    </div>
  );
};

export default Embed;
