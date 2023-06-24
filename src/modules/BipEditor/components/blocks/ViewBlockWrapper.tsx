import React, { FC, ReactNode, useState, useRef } from "react";
import { ActionList, ActionMenu, Box, IconButton } from "@primer/react";
import styled from "styled-components";

import DotsIcon from "../DotsIcon";

import { BlockType } from "../../types";
import { useSlate } from "slate-react";
import { LinkIcon } from "@primer/styled-octicons";
import useRefDimensions from "../../../../hooks/useRefDimensions";
import { EMBEDS, LIST_TYPES } from "../../constants";
import useDeviceDimensions from "../../../../hooks/useDeviceDimensions";

const Container = styled.div`
  position: relative;
  padding: 0px;
  .absolute-container {
    position: absolute;
  }
  .show-on-hover {
    display: none;
  }
  .show {
    display: flex;
  }
  .hide {
    display: none;
  }
  &:hover {
    .show-on-hover {
      display: flex;
    }
  }
`;

interface ViewBlockWrapperProps {
  children: ReactNode | undefined;
  block: BlockType;
  branchId: number;
  blocks: BlockType[];
}

const ViewBlockWrapper: FC<ViewBlockWrapperProps> = React.memo((props) => {
  const { children, block } = props;
  const editor = useSlate();
  const [blockOptionsOpen, setBlockOptionsOpen] = useState(false);
  const blockRef = useRef(null);
  const { isTabletOrMobile } = useDeviceDimensions();
  const { isXtraSmall } = useRefDimensions(editor.parentRef);

  const index = editor.children.findIndex((x) => x.uuid === block.uuid);
  const isNonFirstListBlock =
    LIST_TYPES.includes(block.type) &&
    index > 1 &&
    LIST_TYPES.includes(editor.children[index - 1].type);

  let blockMarginTopNumber =
    isNonFirstListBlock || block.type === "subtext"
      ? 0
      : !block.type.includes("heading")
      ? 2
      : Math.max(3, 8 - parseInt(block.type.replace("heading", "")));

  let menuIconTop = "5px";

  if (block.type === "subtext") {
    menuIconTop = "2px";
  } else if (block.type === "callout") {
    menuIconTop = "7px";
  } else if (block.type.includes("heading")) {
    switch (parseInt(block.type.replace("heading", ""))) {
      case 1: {
        menuIconTop = "16px";
        break;
      }
      case 2: {
        menuIconTop = "14px";
        break;
      }
      case 3: {
        menuIconTop = "10px";
        break;
      }
      case 4: {
        menuIconTop = "8px";
        break;
      }
      default:
        menuIconTop = "5px";
        break;
    }
  }

  //Embeds blocks with url already inpur and Excalidraw
  //have an additional margin top within the block.
  //This needs the menu icon to be moved further down.
  //Also, we reduce the marginTop at the container level to
  //keep the perceived marginTop balanced
  if (
    block.children.some(
      (child) =>
        (EMBEDS.map((x) => x.type).includes(child.type) &&
          child.url &&
          child.url !== "") ||
        child.type === "excalidraw"
    )
  ) {
    menuIconTop = "28px";
    blockMarginTopNumber = 2;
  }

  return (
    <Container
      ref={blockRef}
      className={`mt-${String(blockMarginTopNumber)}`}
      sx={{
        maxWidth: "97vw",
      }}
    >
      <Box
        className={`relative flex ${isTabletOrMobile ? "" : "mr-2"}`}
        sx={{
          borderTopWidth: 2,
          borderTopStyle: "solid",
          borderColor: "transparent",
          borderBottomWidth: 2,
          borderBottomStyle: "solid",
        }}
      >
        {false &&
          !isXtraSmall && ( //todo: commented out for the time being
            <div
              className={`flex items-center w-24 justify-end mr-2 shrink-0 h-4 select-none absolute hide-on-key-down ${
                blockOptionsOpen && "show"
              }`}
              style={{
                top: menuIconTop,
                left: "-104px",
                transition: "all 0.5s ease-out 0s",
              }}
              contentEditable={false}
            >
              {!isXtraSmall && (
                <ActionMenu
                  open={blockOptionsOpen}
                  onOpenChange={() => {
                    setBlockOptionsOpen(!blockOptionsOpen);
                  }}
                >
                  <ActionMenu.Anchor>
                    <div>
                      <IconButton
                        variant="invisible"
                        size="small"
                        id={`${block.uuid}_drag`}
                        icon={DotsIcon}
                        className={`show-on-hover ${
                          blockOptionsOpen ? "show" : ""
                        }`}
                        sx={{
                          padding: "3px",
                        }}
                      />
                    </div>
                  </ActionMenu.Anchor>
                  <ActionMenu.Overlay align="end" anchorSide="inside-bottom">
                    <ActionList>
                      <ActionList.Item>
                        <ActionList.LeadingVisual>
                          <LinkIcon color="text.subtle" />
                        </ActionList.LeadingVisual>
                        Copy link
                      </ActionList.Item>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              )}
            </div>
          )}
        {children}
      </Box>
    </Container>
  );
});

ViewBlockWrapper.displayName;
export default ViewBlockWrapper;
