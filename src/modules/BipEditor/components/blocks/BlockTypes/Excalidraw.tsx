import React, { useState, useRef, useEffect, useMemo } from "react";
import { Transforms, Range, Editor } from "slate";
import {
  ReactEditor,
  useFocused,
  useReadOnly,
  useSelected,
  useSlateStatic,
} from "slate-react";
import { DiffAddedIcon, ScreenFullIcon } from "@primer/styled-octicons";
import { Box, Text, useTheme } from "@primer/react";
import Colors from "../../../../../utils/Colors";

function ExcalidrawBlock({
  element,
  children,
  data,
  actions,
  attributes,
  isReadOnly = true,
}: any) {
  const [Excalidraw, setExcalidraw] = useState(null);

  const sceneVersion = useRef(-1);
  useEffect(() => {
    import("@excalidraw/excalidraw").then((pkg) => {
      setExcalidraw(pkg);
      sceneVersion.current = pkg.getSceneVersion(
        element.attributes?.excalidrawData?.elements ?? []
      );
    });
  }, []);
  const selected = useSelected();
  const focused = useFocused();
  const editor = useSlateStatic();
  const [showEmbedOptions, setShowEmbedOptions] = useState(false);

  const excalidrawRef = useRef(null);

  const [gridModeEnabled, setGridModeEnabled] = useState(false);
  const { colorMode } = useTheme();

  const saveElements = (elements, state) => {
    let newSceneVersion = Excalidraw.getSceneVersion(elements);
    if (
      sceneVersion.current !== newSceneVersion &&
      !(
        state?.draggingElement ||
        state?.editingElement ||
        state?.editingLinearElement ||
        state?.editingGroupId
      )
    ) {
      let attributes = {
        ...element.attributes,
        excalidrawData: {
          elements: elements,
          appState: {
            theme: state.theme,
            collaborators: [],
            viewBackgroundColor: state.viewBackgroundColor,
          },
        },
      };
      Object.freeze(attributes);
      Transforms.setNodes(
        editor,
        { attributes: attributes },
        { at: [], match: (node, _) => node.uuid === element.uuid }
      );
      sceneVersion.current = newSceneVersion;
    }
  };

  const renderedJSX = (
    <Box
      className="relative"
      sx={{
        boxShadow:
          selected && focused
            ? `0px 0px 0px 6px ${
                colorMode === "day" ? Colors.blue["200"] : Colors.blue["300"]
              }`
            : null,
      }}
      onMouseEnter={
        data?.isMergeRequest
          ? () => {}
          : () => {
              setShowEmbedOptions(true);
            }
      }
      onMouseLeave={() => {
        setShowEmbedOptions(false);
      }}
    >
      <div
        className="flex flex-row-reverse absolute right-0 h-8  w-full"
        style={{ top: "-24px" }}
      >
        {showEmbedOptions && (
          <div
            className={"cursor-pointer"}
            onClick={() => {
              if (typeof window !== undefined) {
                document
                  .getElementById(element.uuid + "_excalidraw")
                  ?.requestFullscreen();
              }
            }}
          >
            <ScreenFullIcon size="small" color={"text.subtle"} />
          </div>
        )}
      </div>
      <div id={element.uuid + "_excalidraw"} style={{ height: 500 }}>
        {Excalidraw && (
          <Excalidraw.Excalidraw
            ref={excalidrawRef}
            initialData={
              element.attributes?.excalidrawData
                ? {
                    ...element.attributes.excalidrawData,
                    scrollToContent: false,
                    libraryItems: [],
                  }
                : {
                    elements: [],
                    appState: {
                      viewBackgroundColor: "#f9f9f9",
                      zoom: 1,
                      collaborators: [],
                    },
                    scrollToContent: false,
                    libraryItems: [],
                  }
            }
            onChange={saveElements}
            viewModeEnabled={isReadOnly}
            zenModeEnabled={false}
            gridModeEnabled={gridModeEnabled}
            UIOptions={{
              canvasActions: {
                export: false,
                saveAsImage: false,
                saveToActiveFile: false,
                theme: false,
                loadScene: false,
                clearCanvas: false,
              },
            }}
            renderFooter={() => {
              return (
                <div
                  onClick={() => setGridModeEnabled((prev) => !prev)}
                  className={""}
                >
                  <DiffAddedIcon size="small" />
                  {gridModeEnabled ? "Hide" : "Show"} grid lines
                </div>
              );
            }}
          />
        )}
      </div>
      {false && ( //todo: define this condition of mobile
        <Text as="small" sx={{ color: "excalidraw.hintText" }}>
          Please use two fingers to pan and zoom
        </Text>
      )}
    </Box>
  );

  return (
    <div
      {...attributes}
      contentEditable="false"
      style={{ width: "95%", cursor: "auto" }}
    >
      {renderedJSX}
      {children}
      {editor.selection &&
        selected &&
        Range.isCollapsed(editor.selection) &&
        ReactEditor.isFocused(editor) &&
        !isReadOnly && (
          <div contentEditable={false} className="noselect">
            <Text
              sx={{
                float: "right",
                fontSize: 10,
                color: "excalidraw.hintText",
              }}
            >
              ⏎ Press Enter for new block
            </Text>
          </div>
        )}
    </div>
  );
}
export default ExcalidrawBlock;
