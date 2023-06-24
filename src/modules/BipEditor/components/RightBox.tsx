import {
  createRef,
  FC,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  IRightRailItem,
  useRightRail,
} from "../../../context/rightRailContext";
import { ReelType } from "../types";
import BlockReel from "./BlockReel";
import Thread from "./Thread";
import CommentCard from "../../../components/CommentCard";
import Reactions from "../../../components/Reactions";
import { Box, Button } from "@primer/react";
import BlockReactions from "./BlockReactions";
import { useCanvas } from "../../../context/canvasContext";
import CreateReels from "./CreateReels";
import { Editor, Path, Text } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import { COMMENT_THREAD_PREFIX } from "../constants";
import {
  getCommentThreadsOnTextNode,
  getCommentThreadUUIDFromMark,
  isCommentThreadIDMark,
} from "../utils";

interface IRightRailItemProps {
  item: IRightRailItem;
}

const RightRailItem: FC<IRightRailItemProps> = ({
  item,
  ...props
}: IRightRailItemProps) => {
  const editor = useSlate();
  const showHighlightedTextForThread = (uuid) => {
    const [nodeEntry] = Editor.nodes(editor, {
      at: [],
      match: (n, p) =>
        Text.isText(n) &&
        Object.keys(n)
          .filter(isCommentThreadIDMark)
          .map(getCommentThreadUUIDFromMark)
          .includes(uuid),
    });

    return !nodeEntry;
  };

  return (
    <>
      {/* CBP: {currentBlock?.position!}
      BP: {item.block.position}*/}
      {/* GLOBAL: {item.globalIndex} */}
      {/*BI: {item.blockIndex} */}
      {/* TOP: {item.top} */}
      {/* BP: {currentBlock?.viewPortPosition?.top} */}
      {/* {item.blockIndex} - {item.globalIndex} - {item.block.commentCount} -{" "} */}
      {/* {RIGHT_RAIL_ITEM_HEIGHT * item.globalIndex} */}
      {item.type === "thread" ? (
        <Thread
          thread={item.thread!}
          handleCommentClick={props.handleCommentClick}
          showHighlightedText={showHighlightedTextForThread(item.thread?.uuid)}
          alwaysShowReplyOption={false}
        />
      ) : item.type === "reel" ? (
        <BlockReel
          reel={item.reel!}
          handleReelClick={props.handleReelClick}
          showHighlightedText={false}
          alwaysShowReplyOption={false}
        />
      ) : item.type === "add_comment" ? (
        <CommentCard addMark={props.addMark} />
      ) : item.type === "reactions" ? (
        <BlockReactions blockUUID={item.blockUUID} />
      ) : item.type === "add_reel" ? (
        <CreateReels />
      ) : null}
    </>
  );
};

interface RightBoxProps {}

const RightBox: FC<RightBoxProps> = (props) => {
  const {
    currentBlock,
    items,
    addingItem,
    itemRefs,
    setItems,
    setItemRefs,
    yTranslate,
    selectedObjectId,
    setYTranslate,
  } = useRightRail();
  const { threads } = useCanvas();
  const editor = useSlate();
  const idealTops = useRef<number[]>([]);
  const actualTops = useRef<number[]>([]);

  useEffect(() => {
    setItemRefs((itemRefs) =>
      Array(items.length)
        .fill(0)
        .map((_, i) => {
          return { ...(itemRefs[i] || createRef()), item: _ };
        })
    );
    idealTops.current = [];
    items.forEach((item, index) => {
      idealTops.current.push(findIdealTopPosition(item));
    });
  }, [items, editor?.parentRef?.current?.clientWidth]);

  useEffect(() => {
    const selectedItemIndex = items.findIndex(
      (x) => x.objectId === selectedObjectId
    );
    if (
      selectedItemIndex !== -1 &&
      idealTops.current[selectedItemIndex] !==
        findIdealTopPosition(items[selectedItemIndex])
    ) {
      idealTops.current = [];
      items.forEach((item, index) => {
        idealTops.current.push(findIdealTopPosition(item));
      });
    }
  }, [items, selectedObjectId]);

  const findIdealTopPosition = (item) => {
    if (item.type === "thread") {
      const textNodesWithThread = Editor.nodes(editor, {
        at: [],
        mode: "lowest",
        match: (n) =>
          Text.isText(n) &&
          getCommentThreadsOnTextNode(n).includes(item.thread.uuid),
      });

      let textNodeEntry = textNodesWithThread.next().value;
      const allTextNodePaths = [];

      while (textNodeEntry != null) {
        allTextNodePaths.push(textNodeEntry[1]);
        textNodeEntry = textNodesWithThread.next().value;
      }

      // sort the text nodes
      allTextNodePaths.sort((p1, p2) => Path.compare(p1, p2));

      // set the selection on the editor

      if (allTextNodePaths) {
        const anchor = Editor.point(editor, allTextNodePaths[0], {
          edge: "start",
        });
        const focus = Editor.point(
          editor,
          allTextNodePaths[allTextNodePaths.length - 1],
          { edge: "end" }
        );
        if (anchor && focus) {
          return (
            ReactEditor.toDOMRange(editor, {
              anchor,
              focus,
            }).getBoundingClientRect().top +
            document.getElementById("studio-layout-content")?.scrollTop! -
            20
          );
        }
      } else {
        const [blockEntry] = Editor.nodes(editor, {
          at: [],
          match: (n, p) =>
            p.length === 1 && n.uuid === item.thread?.startBlockUUID,
        });
        if (blockEntry) {
          return (
            ReactEditor.toDOMNode(editor, blockEntry[0]).getBoundingClientRect()
              .top +
            document.getElementById("studio-layout-content")?.scrollTop! -
            20
          );
        } else {
          return 0;
        }
      }
    } else if (item.type === "reel") {
      const [blockEntry] = Editor.nodes(editor, {
        at: [],
        match: (n, p) => p.length === 1 && n.uuid === item.reel?.startBlockUUID,
      });
      if (blockEntry) {
        return (
          ReactEditor.toDOMNode(editor, blockEntry[0]).getBoundingClientRect()
            .top +
          document.getElementById("studio-layout-content")?.scrollTop! -
          20
        );
      } else {
        return 0;
      }
    } else if (item.type === "reactions") {
      const [blockEntry] = Editor.nodes(editor, {
        at: [],
        match: (n, p) => p.length === 1 && n.uuid === item.blockUUID,
      });
      if (blockEntry) {
        return (
          ReactEditor.toDOMNode(editor, blockEntry[0]).getBoundingClientRect()
            .top +
          document.getElementById("studio-layout-content")?.scrollTop! -
          20
        );
      } else {
        return 0;
      }
    } else if (item.type === "add_comment") {
      return (
        ReactEditor.toDOMRange(editor, editor.selection).getBoundingClientRect()
          .top +
        document.getElementById("studio-layout-content")?.scrollTop! -
        20
      );
    } else if (item.type === "add_reel") {
      return (
        ReactEditor.toDOMRange(editor, editor.selection).getBoundingClientRect()
          .top +
        document.getElementById("studio-layout-content")?.scrollTop! -
        20
      );
    }
  };

  useEffect(() => {
    if (itemRefs.length && itemRefs.length === items.length) {
      let lastBottom: number = 0;
      actualTops.current = [];

      items.forEach((_, index) => {
        const itemRef = itemRefs[index];
        const idealTop = idealTops.current[index];
        if (idealTop >= lastBottom) {
          itemRef.current.style.top = `${idealTop}px`;
          actualTops.current.push(idealTop);
          lastBottom =
            idealTop + itemRef?.current.getBoundingClientRect().height + 8 || 0;
        } else {
          itemRef.current.style.top = `${lastBottom}px`;
          actualTops.current.push(lastBottom);
          lastBottom +=
            itemRef?.current.getBoundingClientRect().height + 8 || 0;
        }
      });

      if (selectedObjectId) {
        const itemIndex = items.findIndex(
          (item) => item.objectId === selectedObjectId
        );
        if (itemIndex !== -1 && typeof window !== "undefined") {
          let topDiff =
            idealTops.current[itemIndex] - actualTops.current[itemIndex];
          setYTranslate(topDiff);
        } else {
          setYTranslate(0);
        }
      }
    }
  }, [itemRefs, selectedObjectId]);

  return items?.length ? (
    <div
      style={{
        width: "280px",
        marginLeft: "35px",
        transition: "all 0.5s ease-out 0s",
        top:
          -1 *
          (document.getElementById("editor-container")?.getBoundingClientRect()
            .top! +
            document.getElementById("studio-layout-content")?.scrollTop!),
        // right: -376,
        transform: currentBlock ? `translateY(${yTranslate}px)` : "none",
      }}
      className="relative flex flex-col flex-shrink-0 h-full px-4 py-1 space-y-2"
      contentEditable={false}
    >
      {items.map((item, index) => (
        <Box
          ref={itemRefs[index]}
          key={index}
          className="absolute w-full"
          sx={{
            zIndex: item.type.includes("add") ? 10001 : 10000 - index, //note: hope this doesn't break any other UI stacking
            transition: "transform 0.5s ease-in-out",
            transform:
              currentBlock &&
              currentBlock?.uuid &&
              item?.objectId &&
              selectedObjectId === item.objectId
                ? "translateX(-32px)"
                : "none",
          }}
        >
          <RightRailItem
            item={item}
            addMark={props.addMark}
            handleCommentClick={props.handleCommentClick}
            handleReelClick={props.handleReelClick}
          />
        </Box>
      ))}
    </div>
  ) : (
    <div
      style={{
        width: "280px",
        marginLeft: "35px",
        top:
          -1 *
          (document.getElementById("editor-container")?.getBoundingClientRect()
            .top! +
            document.getElementById("studio-layout-content")?.scrollTop!),
      }}
      className="relative flex flex-col flex-shrink-0 h-full px-4 py-1 space-y-2"
      contentEditable={false}
    ></div>
  );
};

export default RightBox;
