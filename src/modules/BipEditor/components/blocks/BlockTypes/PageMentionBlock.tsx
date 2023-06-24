import { Box, Overlay, Tooltip } from "@primer/react";
import { FileIcon } from "@primer/styled-octicons";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useRef, useState } from "react";
import { Editor } from "slate";
import { useSelected, useSlate } from "slate-react";
import Chip from "../../../../../components/Chip";
import { useCanvas } from "../../../../../context/canvasContext";
import { usePreviewEditor } from "../../../../../context/previewEditorContext";
import { useStudio } from "../../../../../context/studioContext";
import BipRouteUtils from "../../../../../core/routeUtils";
import useDeviceDimensions from "../../../../../hooks/useDeviceDimensions";

interface IMentionBlockProps {}

const PageMentionBlock: FC<IMentionBlockProps> = ({
  attributes,
  children,
  element,
}: any) => {
  const router = useRouter();
  const selected = useSelected();
  const editor = useSlate();
  const { currentStudio } = useStudio();
  const { setPreviewEditorData } = usePreviewEditor();
  const [currentNode] = Editor.nodes(editor, {
    at: [],
    match: (n, p) => n.uuid === element.uuid,
  });
  const { isTabletOrMobile } = useDeviceDimensions();
  const parentBlock = editor.children[currentNode[1][0]];
  // HOTFIX UPDATE - Array.isArray check is to be removed later once chirag has fixed default block sending mentions as an object issue.
  let mention =
    Array.isArray(parentBlock?.mentions) &&
    parentBlock.mentions?.find((mention) => mention.id === element.mention.id);

  if (!mention) {
    mention = element.mention;
  }
  const { isPublicView } = useCanvas();

  const getCanvasRoute = isPublicView
    ? BipRouteUtils.getPublicCanvasRoute
    : BipRouteUtils.getCanvasRoute;

  const repoPath = getCanvasRoute(
    currentStudio?.handle!,
    mention?.repoName,
    mention?.id
  );

  let renderedJSX = (
    <Box
      as="a"
      href={repoPath}
      contentEditable={false}
      {...attributes}
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        if (e.shiftKey) {
          e.preventDefault();
          setPreviewEditorData({
            repoName: mention?.repoName,
            repoId: mention?.repoID,
            branchId: mention?.id ?? element?.mention?.branchId,
            url: repoPath,
          });
        } else if (e.ctrlKey || e.metaKey) {
        } else {
          e.preventDefault();
          router.push({ pathname: repoPath });
        }
      }}
    >
      <Box as={"span"}>
        <Chip
          contentEditable={false}
          sx={{
            margin: "0px 1px",
            borderColor: selected ? "accent.fg" : "transparent",
            cursor: "pointer",
            userSelect: "none",
          }}
          text={mention?.repoName}
          icon={<FileIcon color={"chip.icon"} />}
        >
          {" "}
          {children}
        </Chip>
      </Box>
    </Box>
  );

  if (!isTabletOrMobile) {
    renderedJSX = (
      <Tooltip direction="n" aria-label={"shift + click for preview"}>
        {renderedJSX}
      </Tooltip>
    );
  }

  return renderedJSX;
};

export default PageMentionBlock;
