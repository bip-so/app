import {
  COMMENT_THREAD_PREFIX,
  EMBEDS,
  INLINE_VOID_BLOCK_TYPES,
  REEL_THREAD_PREFIX,
} from "./constants";
import { v4 as uuidv4 } from "uuid";
import { diffWordsWithSpace, diffArrays } from "diff";
import _ from "lodash";
import {
  Editor,
  Element as SlateElement,
  Location,
  Path,
  Range,
  Text,
  Transforms,
} from "slate";
import castArray from "lodash/castArray";
import { stringReplaceAll, isStringEmpty } from "../../utils/Common";
import toStyle from "css-to-style";
import LoomIcon from "../../icons/LoomIcon";
import ReplitIcon from "../../icons/ReplitIcon";
import {
  CodeIcon,
  DashIcon,
  FileIcon,
  FileSymlinkFileIcon,
  ImageIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  MentionIcon,
  MilestoneIcon,
  QuoteIcon,
  TableIcon,
  TasklistIcon,
  TypographyIcon,
} from "@primer/styled-octicons";
import { Text as Span } from "@primer/react";
import ExcalidrawIcon from "../../icons/ExcalidrawIcon";
import FigmaIcon from "../../icons/FigmaIcon";
import YoutubeIcon from "../../icons/YoutubeIcon";
import CodeSandboxIcon from "../../icons/CodeSandboxIcon";
import GoogleDriveIcon from "../../icons/GoogleDriveIcon";
import GoogleSheetsIcon from "../../icons/GoogleSheetsIcon";
import TwitterIcon from "../../icons/TwitterIcon";
import MiroIcon from "../../icons/MiroIcon";
import {
  ReactEditor,
  useFocused,
  useSelected,
  useSlate,
  useSlateStatic,
} from "slate-react";
import { useEffect, useState } from "react";
import ContentsIcon from "../../icons/ContentsIcon";
import DrawioIcon from "../../icons/DrawioIcon";
import { POST_REACTIONS } from "../Posts/constants";
import WellDoneIcon from "../../icons/WellDoneIcon";
import JustLookingIcon from "../../icons/JustLookingIcon";
import ExceptionalIcon from "../../icons/ExceptionalIcon";
import CelebrateIcon from "../../icons/CelebrateIcon";

export const diff = (oldBlocks, newBlocks) => {
  const oldIdArr = oldBlocks.map((el) => el.uuid),
    newIdArr = newBlocks.map((el) => el.uuid);
  const resultBlocks = [];

  diffArrays(oldIdArr, newIdArr).reduce(
    (tempObj, curVal) => {
      if (curVal.added) {
        curVal.value.forEach((uuid) => {
          resultBlocks.push({
            conflictId: uuidv4().toLowerCase(),
            type: "diff",
            message: "Block Added",
            children: [
              {
                ...newBlocks.find((block) => block.uuid === uuid),
                bgColor: "diff.greenBg",
              },
            ],
          });
        });

        return { ...tempObj, added: [...tempObj.added, ...curVal.value] };
      } else if (curVal.removed) {
        curVal.value.forEach((uuid) => {
          resultBlocks.push({
            conflictId: uuidv4().toLowerCase(),
            type: "diff",
            message: "Block Removed",
            children: [
              {
                ...oldBlocks.find((block) => block.uuid === uuid),
                bgColor: "diff.redBg",
              },
            ],
          });
        });
        return { ...tempObj, removed: [...tempObj.removed, ...curVal.value] };
      } else {
        curVal.value.forEach((uuid) => {
          resultBlocks.push({
            oldBlock: oldBlocks.find((block) => block.uuid === uuid),
            newBlock: newBlocks.find((block) => block.uuid === uuid),
          });
        });
        return {
          ...tempObj,
          unchanged: [...tempObj.unchanged, ...curVal.value],
        };
      }
    },
    {
      added: [],
      removed: [],
      unchanged: [],
    }
  );

  for (let i = 0; i < resultBlocks.length; i++) {
    if (resultBlocks[i]?.type === "diff") {
      continue;
    }

    const { oldBlock, newBlock } = resultBlocks[i];
    const { isBlockChanged, changedTextPos } = compareBlocks(
      oldBlock,
      newBlock
    );
    if (isBlockChanged) {
      resultBlocks[i] = {
        conflictId: uuidv4().toLowerCase(),
        type: "diff",
        message: "Block Edited",
        children: [
          {
            ...oldBlock,
            diffPositions: changedTextPos.removed,
          },
          {
            ...newBlock,
            diffPositions: changedTextPos.added,
          },
        ],
      };
    } else {
      resultBlocks[i] = newBlock;
    }
  }

  const changedBlockIds = [];
  resultBlocks.forEach((block, i) => {
    if (block.type === "diff") {
      changedBlockIds.push({
        conflictId: block.conflictId,
        blockUUID: block.children[0]?.uuid,
      });
      if (block.children.length === 2) {
        resultBlocks[i] = {
          ...resultBlocks[i],
          children: [
            {
              ...block.children[0],
              diffPositions: block.children[0].diffPositions,
              bgColor: "diff.redBg",
            },
            {
              ...block.children[1],
              diffPositions: block.children[1].diffPositions,
              bgColor: "diff.greenBg",
            },
          ],
        };
      } else {
        resultBlocks[i] = {
          ...resultBlocks[i],
          children: [
            {
              ...block.children[0],
              bgColor: block.children[0].bgColor,
            },
          ],
        };
      }
    } else {
      resultBlocks[i] = block;
    }
  });

  return {
    resultValue: resultBlocks,
    changedBlockIds,
  };
};

function compareBlocks(oldBlock, newBlock) {
  let oldText, newText;

  oldText = oldBlock.children.reduce((prev, cur) => {
    return prev + (cur?.text ?? "");
  }, "");

  newText = newBlock.children.reduce((prev, cur) => {
    return prev + (cur?.text ?? "");
  }, "");

  let oldTextCount = 0;
  const oldTextProperties = oldBlock.children.reduce((prev, cur) => {
    const properties = [...prev];
    const startPos = oldTextCount;
    const endPos = oldTextCount + cur?.text?.length;
    if (cur.bold) {
      properties.push({
        type: "b",
        startPos,
        endPos,
      });
    }
    if (cur.italic) {
      properties.push({
        type: "i",
        startPos,
        endPos,
      });
    }
    if (cur.underline) {
      properties.push({
        type: "u",
        startPos,
        endPos,
      });
    }

    if (cur.strikethrough) {
      properties.push({
        type: "s",
        startPos,
        endPos,
      });
    }
    oldTextCount = endPos;
    return properties;
  }, []);

  let newTextCount = 0;
  const newTextProperties = newBlock.children.reduce((prev, cur) => {
    const properties = [...prev];
    const startPos = newTextCount;
    const endPos = newTextCount + cur?.text?.length;
    if (cur.bold) {
      properties.push({
        type: "b",
        startPos,
        endPos,
      });
    }
    if (cur.italic) {
      properties.push({
        type: "i",
        startPos,
        endPos,
      });
    }
    if (cur.underline) {
      properties.push({
        type: "u",
        startPos,
        endPos,
      });
    }

    if (cur.strikethrough) {
      properties.push({
        type: "s",
        startPos,
        endPos,
      });
    }

    newTextCount = endPos;

    return prev;
  }, []);

  let result = diffWordsWithSpace(oldText, newText);
  const iterable = { old: oldTextProperties, new: newTextProperties };
  const changes = {
    added: [],
    removed: [],
  };
  let oldResultCharCount = 0,
    newResultCharCount = 0;

  const neutralText = result.reduce((tempArr, el) => {
    if (el.added) {
      newResultCharCount += el.value.length;
    } else if (el.removed) {
      oldResultCharCount += el.value.length;
    } else {
      const neutralObj = {
        value: el.value,
        oldPos: {
          start: oldResultCharCount,
          end: oldResultCharCount + el.value.length,
        },
        newPos: {
          start: newResultCharCount,
          end: newResultCharCount + el.value.length,
        },
      };
      oldResultCharCount += el.value.length;
      newResultCharCount += el.value.length;
      return [...tempArr, neutralObj];
    }
    return tempArr;
  }, []);

  for (const el in iterable) {
    if (el === "old") {
      iterable[el].forEach((iterableEl) => {
        const index = neutralText.findIndex((e) => {
          return (
            iterableEl.startPos >= e.oldPos.start &&
            iterableEl.endPos <= e.oldPos.end
          );
        });
        if (index < 0) {
          let count = 0,
            removedCount = 0;
          for (let i = 0; i < result.length; i++) {
            const el = result[i];
            if (el.added) {
              return;
            }
            if (el.removed) {
              removedCount += el.value.length;
            }
            count += el.value.length;
            if (iterableEl.startPos < count && !el.removed) {
              changes.removed.push([count - el.value.length, count]);
              changes.added.push([
                count - el.value.length - removedCount,
                count - removedCount,
              ]);
            }
            if (iterableEl.end <= count) {
              break;
            }
          }
          return;
        }
        const accumulator =
          iterableEl.startPos - neutralText[index].oldPos.start;
        const from = neutralText[index].newPos.start + accumulator,
          to = from + iterableEl.endPos - iterableEl.startPos;
        const correspondingProperty = newTextProperties.find(
          (e) => from === e.startPos && to === e.endPos
        );

        const isRemoved = correspondingProperty
          ? correspondingProperty.type !== iterableEl.type ||
            correspondingProperty.link !== iterableEl.link
          : true;
        if (isRemoved) {
          changes.removed.push([iterableEl.startPos, iterableEl.endPos + 1]);
          changes.added.push([from, to + 1]);
        }
      });
    } else {
      iterable[el].forEach((iterableEl) => {
        const index = neutralText.findIndex((e) => {
          return (
            iterableEl.startPos >= e.newPos.start &&
            iterableEl.endPos <= e.newPos.end
          );
        });

        if (index < 0) {
          let count = 0,
            addedCount = 0;
          for (let i = 0; i < result.length; i++) {
            const el = result[i];
            if (el.removed) {
              return;
            }
            if (el.added) {
              addedCount += el.value.length;
            }
            count += el.value.length;
            if (iterableEl.startPos < count && !el.added) {
              changes.added.push([count - el.value.length, count]);
              changes.removed.push([
                count - el.value.length - addedCount,
                count - addedCount,
              ]);
            }
            if (iterableEl.end <= count) {
              break;
            }
          }
          return;
        }
        const accumulator =
          iterableEl.startPos - neutralText[index].newPos.start;
        const from = neutralText[index].oldPos.start + accumulator,
          to =
            neutralText[index].oldPos.start +
            accumulator +
            iterableEl.endPos -
            iterableEl.startPos;

        const correspondingProperty = oldTextProperties.find(
          (e) => from === e.startPos && to === e.endPos
        );

        const isAdded = correspondingProperty
          ? correspondingProperty.type !== iterableEl.type ||
            correspondingProperty.link !== iterableEl.link
          : true;
        if (isAdded) {
          changes.added.push([iterableEl.startPos, iterableEl.endPos + 1]);
          changes.removed.push([from, to + 1]);
        }
      });
    }
  }
  const textPos = {
    added: [],
    removed: [],
  };

  let countForAdded = 0,
    countForRemoved = 0;
  result.forEach((el) => {
    const valueLength = el.value.length;
    if (el.added) {
      textPos.added.push([countForAdded, countForAdded + valueLength]);
      countForAdded += valueLength;
    } else if (el.removed) {
      textPos.removed.push([countForRemoved, countForRemoved + valueLength]);
      countForRemoved += valueLength;
    } else {
      countForAdded += valueLength;
      countForRemoved += valueLength;
    }
  });

  const pickedOld = _.pick(oldBlock, ["type", "url", "attributes", "children"]);
  const pickedNew = _.pick(newBlock, ["type", "url", "attributes", "children"]);

  const isBlockChanged = !_.isEqual(pickedOld, pickedNew);

  const changedTextPos = {
    added: {
      text: textPos.added,
      properties: changes.added,
    },
    removed: {
      text: textPos.removed,
      properties: changes.removed,
    },
  };

  return {
    isBlockChanged,
    changedTextPos,
  };
}

export const filterAndBuildTransactions = (
  initialBlocks,
  finalBlocks,
  transactions,
  isNewRough
) => {
  const deletedBlocks = initialBlocks
    .filter(
      (block) =>
        transactions.some(
          (x) => x.scope === "delete" && x.uuid === block.uuid
        ) && !finalBlocks.some((x) => x.uuid === block.uuid)
    )
    .map((block) => {
      return {
        ...block,
        id: isNewRough ? 0 : block.id,
        scope: "delete",
      };
    });

  const createdBlocks = finalBlocks
    .filter(
      (block) =>
        transactions.some(
          (x) => x.scope === "create" && x.uuid === block.uuid
        ) && !initialBlocks.some((x) => x.uuid === block.uuid)
    )
    .map((block) => {
      return {
        ...block,
        id: isNewRough ? 0 : block.id,
        scope: "create",
      };
    });
  const editedBlocks = finalBlocks
    .filter(
      (block) =>
        transactions.some(
          (x) => x.scope === "update" && x.uuid === block.uuid
        ) && initialBlocks.some((x) => x.uuid === block.uuid)
    )
    .map((block) => {
      return {
        ...block,
        id: isNewRough ? 0 : block.id,
        scope: "update",
      };
    });
  return [...createdBlocks, ...editedBlocks, ...deletedBlocks];
};

export const IsImageOk = (domImg) => {
  // During the onload event, IE correctly identifies any images that
  // weren’t downloaded as not complete. Others should too. Gecko-based
  // browsers act like NS4 in that they report this incorrectly.
  if (!domImg.complete) {
    return false;
  }

  // However, they do have two very useful properties: naturalWidth and
  // naturalHeight. These give the true size of the image. If it failed
  // to load, either of these should be zero.
  if (domImg.naturalWidth === 0) {
    return false;
  }

  // No other way of checking: assume it’s ok.
  return true;
};

export const getEmbedLink = (url) => {
  const extractSrcfromIFrame = (text) => {
    const regex =
      /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/im;
    if (regex.test(text)) {
      return text.match(regex)[0];
    } else {
      return text;
    }
  };

  url = extractSrcfromIFrame(url).trim();

  if (url) {
    if (url.includes(" ")) return;

    for (let i = 0; i < EMBEDS.length; i++) {
      if (EMBEDS[i].regex.test(url)) {
        let embedURL = EMBEDS[i].getEmbedURL(url, EMBEDS[i].regex);
        return {
          type: EMBEDS[i].type,
          url: embedURL,
        };
      }
    }
  }
  return { type: "", url: "" };
};

export const getNodesById = (editor, UUID) => {
  const UUIDs = castArray(UUID);

  const nodes = Editor.nodes(editor, {
    mode: "all",
    match: (n) => {
      const nodeId = n.uuid;
      return !!nodeId && UUIDs.includes(nodeId);
    },
    at: [],
  });

  return [...nodes];
};

export const SLASH_COMMAND_OPTIONS = [
  {
    type: "heading1",
    alt: ["heading1", "h1", "#", "1"],
    title: "Heading 1",
    icon: <Span sx={{ color: "commandMenu.optionsText" }}>H1</Span>,
  },
  {
    type: "heading2",
    alt: ["heading2", "h2", "##", "2"],
    title: "Heading 2",
    icon: <Span sx={{ color: "commandMenu.optionsText" }}>H2</Span>,
  },
  {
    type: "heading3",
    alt: ["heading3", "h3", "###", "3"],
    title: "Heading 3",
    icon: <Span sx={{ color: "commandMenu.optionsText" }}>H3</Span>,
  },
  {
    type: "heading4",
    alt: ["heading4", "h4", "####", "4"],
    title: "Heading 4",
    icon: <Span sx={{ color: "commandMenu.optionsText" }}>H4</Span>,
  },
  {
    type: "heading5",
    alt: ["heading5", "h5", "#####", "5"],
    title: "Heading 5",
    icon: <Span sx={{ color: "commandMenu.optionsText" }}>H5</Span>,
  },
  {
    type: "text",
    alt: ["text", "normal", "plain"],
    title: "Text",
    icon: <TypographyIcon color="commandMenu.optionsText" />,
  },
  {
    type: "subtext",
    alt: ["sub-text", "small", "subtext", "caption", "hint", "text"],
    title: "Sub-text",
    icon: (
      <Span sx={{ color: "commandMenu.optionsText", fontSize: "12px" }}>
        Aa
      </Span>
    ),
  },
  {
    type: "quote",
    alt: ["quote", "blockquote"],
    title: "Quote",
    icon: <QuoteIcon color="commandMenu.optionsText" />,
  },
  {
    type: "callout",
    alt: ["callout"],
    title: "Callout",
    icon: <MilestoneIcon color="commandMenu.optionsText" />,
  },
  {
    type: "code",
    alt: ["code"],
    title: "Code",
    icon: <CodeIcon size={"small"} color="commandMenu.optionsText" />,
  },
  {
    type: "simple_table_v1",
    alt: ["table", "t"],
    title: "Table",
    icon: <TableIcon color="commandMenu.optionsText" />,
  },
  {
    type: "toc",
    alt: ["table of contents", "sub-canvases list", "toc"],
    title: "Table of contents",
    icon: (
      <Span sx={{ color: "commandMenu.optionsText" }}>
        <ContentsIcon />
      </Span>
    ),
  },
  {
    type: "youtube",
    alt: ["embed", "video", "youtube"],
    title: "Youtube",
    icon: <YoutubeIcon />,
  },
  {
    type: "loom",
    alt: ["embed", "video", "loom"],
    title: "Loom",
    icon: <LoomIcon height={16} width={16} />,
  },
  /*   {
    type: "embed",
    alt: ["embed", "video", "embed"],
    title: "Embed",
    icon: <span>E</span>,
  }, */
  {
    type: "figma",
    alt: ["embed", "video", "figma"],
    title: "Figma",
    icon: <FigmaIcon />,
  },
  {
    type: "replit",
    alt: ["embed", "video", "replit"],
    title: "Replit",
    icon: <ReplitIcon height={18} width={18} />,
  },
  {
    type: "codesandbox",
    alt: ["embed", "video", "codesandbox"],
    title: "CodeSandbox",
    icon: <CodeSandboxIcon />,
  },
  {
    type: "googledrive",
    alt: ["embed", "video", "googledrive"],
    title: "Google Drive",
    icon: <GoogleDriveIcon />,
  },
  {
    type: "googlesheet",
    alt: ["embed", "googlesheet", "sheets"],
    title: "Google Sheet",
    icon: <GoogleSheetsIcon />,
  },
  {
    type: "miro",
    alt: ["miro", "whiteboard", "sketch"],
    title: "Miro",
    icon: <MiroIcon />,
  },
  {
    type: "tweet",
    alt: ["tweet", "twitter"],
    title: "Tweet",
    icon: <TwitterIcon height={16} width={16} />,
  },
  {
    type: "image",
    alt: ["jpg", "picture", "image", "gif"],
    title: "Image",
    icon: <ImageIcon size={"small"} color="commandMenu.optionsText" />,
  },
  {
    type: "attachment",
    alt: ["file", "document", "attachment"],
    title: "Attachment",
    icon: <FileSymlinkFileIcon size="small" color="commandMenu.optionsText" />,
  },
  {
    type: "excalidraw",
    alt: ["draw", "whiteboard", "excalidraw"],
    title: "Excalidraw",
    icon: <ExcalidrawIcon height={18} width={18} />,
  },
  {
    type: "drawio",
    alt: ["draw", "whiteboard", "excalidraw"],
    title: "Draw IO",
    icon: <DrawioIcon height={18} width={18} />,
  },
  {
    type: "hr",
    alt: ["hr", "line", "divider"],
    title: "Divider",
    icon: <DashIcon size="small" color="commandMenu.optionsText" />,
  },
  {
    type: "ulist",
    alt: ["ulist", "list", "unordered", "bulleted", "points"],
    title: "Bulleted list",
    icon: <ListUnorderedIcon size={"small"} color="commandMenu.optionsText" />,
  },
  {
    type: "olist",
    alt: ["olist", "list", "ordered", "numbered", "points"],
    title: "Numbered List",
    icon: <ListOrderedIcon size={"small"} color="commandMenu.optionsText" />,
  },
  {
    type: "checklist",
    alt: ["checklist", "list", "check"],
    title: "Checklist",
    icon: <TasklistIcon size={"small"} color="commandMenu.optionsText" />,
  },

  {
    type: "userMention",
    alt: ["mention", "user", "user mention", "people"],
    title: "User Mention",
    icon: <MentionIcon size={"small"} color="commandMenu.optionsText" />,
  },
  {
    type: "pageMention",
    alt: ["page", "canvas", "mention"],
    title: "Page Mention",
    icon: <FileIcon size={"small"} color="commandMenu.optionsText" />,
  },
];

export const insertInlineVoid = (editor, type, at?, targetUrl = "") => {
  if (!at) {
    at = editor.selection;
  } else if (at.length === 1) {
    at = Editor.end(editor, at);
  }

  let embedObj;
  if (type === "drawio") {
    embedObj = {
      type: "drawio",
      url: "",
    };
  } else if (targetUrl) {
    embedObj = getEmbedLink(targetUrl);
  }

  const inlineVoidElement = embedObj?.url
    ? {
        uuid: uuidv4().toLowerCase(),
        type: embedObj.type,
        url: embedObj.url,
        children: [{ text: "" }],
      }
    : {
        uuid: uuidv4().toLowerCase(),
        type,
        url: "",
        children: [{ text: "" }],
      };
  Transforms.insertNodes(editor, inlineVoidElement, { at: at });
  editor.insertNode({ text: "" });

  //We need to take cursor to inside the text box in case of embed without a url defined already
  //When we move cursor to the Embed node, the text box is focussed automatically.
  //So we move selection by 1 in that case and 2 in all other cases to take the cursor
  //to the point after the embed node
  const distanceToMoveCursor =
    (type === "embed" || EMBEDS.map((x) => x.type).includes(type)) &&
    !embedObj?.url
      ? 1
      : 2;

  Transforms.move(editor, { distance: distanceToMoveCursor, unit: "offset" });
};

export const isBlockActive = (editor, newBlockType, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === newBlockType,
    })
  );

  return !!match;
};

export const getActiveBlockType = (editor, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return "";

  const collapsedSelection = {
    anchor: Editor.unhangRange(editor, selection).focus,
    focus: Editor.unhangRange(editor, selection).focus,
  };

  const [[node, _]] = Array.from(
    Editor.nodes(editor, {
      at: collapsedSelection,
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n),
    })
  );

  if (!node) {
    return "";
  } else {
    return node[blockType];
  }
};

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? !!marks[format] : false;
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export function getMarkForCommentThreadID(threadUUID) {
  return `${COMMENT_THREAD_PREFIX}${threadUUID}`;
}

export function getCommentThreadsOnTextNode(textNode, children) {
  return Array.from(
    new Set(
      // Because marks are just properties on nodes,
      // we can simply use Object.keys() here.
      Object.keys(textNode)
        .filter(isCommentThreadIDMark)
        .map(getCommentThreadUUIDFromMark)
    )
  );
}
// export function getReelThreadsOnTextNode(textNode, children) {
//   return Array.from(
//     new Set(
//       // Because marks are just properties on nodes,
//       // we can simply use Object.keys() here.
//       Object.keys(textNode)
//         .filter(isReelThreadIDMark)
//         .map(getReelThreadUUIDFromMark)
//     )
//   );
// }

export function getReelsOnBlock(block, reels) {
  const blockReels = reels?.filter((reel) =>
    reel.selectedBlocks.blockUUIDs.includes(block?.uuid)
  );

  return blockReels;
}

export function getCommentThreadUUIDFromMark(mark) {
  if (!isCommentThreadIDMark(mark)) {
    throw new Error("Expected mark to be of a comment thread");
  }
  return mark.replace(COMMENT_THREAD_PREFIX, "");
}
// export function getReelThreadUUIDFromMark(mark) {
//   if (!isReelThreadIDMark(mark)) {
//     throw new Error("Expected mark to be of a reel thread");
//   }
//   return mark.replace(REEL_THREAD_PREFIX, "");
// }

export function isCommentThreadIDMark(mayBeCommentThread) {
  return mayBeCommentThread.indexOf(COMMENT_THREAD_PREFIX) === 0;
}
// export function isReelThreadIDMark(mayBeReelThread) {
//   return mayBeReelThread.indexOf(REEL_THREAD_PREFIX) === 0;
// }

export const slateChildrenToText = (children) => {
  let text = "";
  children.forEach((x) => {
    if (x.type === "userMention" || x.type === "pageMention") {
      text += ` 📄 ${x.mention.item?.title ?? "Deleted Canvas"} `;
    } else {
      text += x.text;
    }
  });
  return text;
};

export const deserializeHTML = (el, isFirstLevel, lev, user) => {
  if (el.nodeType === 3) {
    return stringReplaceAll(el.textContent, "\n", " ");
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return "\n";
  }

  const { nodeName } = el;
  let data = [];
  let childLevel = lev;
  if (nodeName === "UL" || nodeName === "OL") {
    childLevel = lev + 1;
  }

  const children = Array.from(el.childNodes)
    .map((x) => {
      return deserializeHTML(x, false, childLevel, user);
    })
    .flat()
    .filter((x) => (x ? true : false));
  const textChildren = children
    .filter((x) => typeof x === "string" || typeof x.text === "string")
    .map((x) => (typeof x === "string" ? { text: x } : x));
  const blocksChildrens = children.filter((x) => typeof x.uuid === "string");
  //const litemChildrens = children.filter((x) => x.list)
  if (nodeName === "TABLE") {
    const rows = Array.from(el.childNodes)
      .map((x) => {
        return deserializeHTML(x, false, childLevel, user);
      })
      .flat()
      .filter((x) => (x ? true : false));
    const tableUUID = uuidv4();
    const table = {
      children: rows.map((row) => {
        const rowUUID = uuidv4();
        const cells = row.children;
        return {
          ...row,
          uuid: rowUUID,
          tableUUID,
          children: cells.map((cell) => {
            const cellUUID = uuidv4();
            const cellChildren = cell.children.map((child) => {
              return {
                ...child,
                cellUUID,
                rowUUID,
                tableUUID,
              };
            });
            return {
              ...cell,
              uuid: cellUUID,
              tableUUID,
              rowUUID,
              children: cellChildren,
            };
          }),
        };
      }),
      type: "simple_table_v1",
      uuid: tableUUID,
    };
    data.push(table);
  } else if (nodeName === "THEAD" || nodeName === "TBODY") {
    const children = Array.from(el.childNodes)
      .map((x) => {
        return deserializeHTML(x, false, childLevel, user);
      })
      .flat()
      .filter((x) => (x ? true : false));
    return children;
  } else if (nodeName === "TR") {
    const children = Array.from(el.childNodes)
      .map((x) => {
        return deserializeHTML(x, false, childLevel, user);
      })
      .flat()
      .filter((x) => (x ? true : false));
    const tableRow = {
      children,
      type: "table-row",
    };
    data.push(tableRow);
    return data;
  } else if (nodeName === "TH" || nodeName === "TD") {
    const children = Array.from(el.childNodes)
      .map((x) => {
        if (x.nodeType === 3 || x.nodeName === "BR") {
          return {
            text: deserializeHTML(x, false, childLevel, user),
          };
        }
        return deserializeHTML(x, false, childLevel, user);
      })
      .flat()
      .filter((x) => (x ? true : false));

    const tableCell = {
      children: children.length
        ? children.map((child) => {
            if (child?.text === "\n") {
              child.text = "";
            }
            return {
              type: "text",
              uuid: uuidv4(),
              children:
                typeof child === "string"
                  ? [{ text: child }]
                  : typeof child?.text === "string"
                  ? [{ text: child.text }]
                  : child.children,
            };
          })
        : [
            {
              type: "text",
              uuid: uuidv4(),
              children: [{ text: "" }],
            },
          ],
      type: "table-cell",
    };
    data.push(tableCell);
    return data;
  } else if (
    nodeName === "H1" ||
    nodeName === "H2" ||
    nodeName === "H3" ||
    nodeName === "H4" ||
    nodeName === "H5" ||
    nodeName === "H6"
  ) {
    data.push(...blocksChildrens);
    data.push({
      children: textChildren,
      uuid: uuidv4(),
      type: nodeName.replace("H", "heading"),
      contributors: [user.id],
    });
  } else if (
    nodeName === "P" &&
    el.getAttribute("style") &&
    el.getAttribute("style").includes("mso-list:")
  ) {
    // MS Word - lists
    const styleString = el.getAttribute("style");
    data.push(...blocksChildrens);
    data.push({
      children: textChildren,
      uuid: uuidv4(),
      type: styleString.includes("mso-list:l0") ? "ulist" : "olist",
      attributes: { level: 1 },
      contributors: [user.id],
    });
  } else if (nodeName === "P" && el.parentNode.nodeName !== "LI") {
    data.push(...blocksChildrens);
    data.push({
      children: textChildren,
      uuid: uuidv4(),
      type: "text",
      contributors: [user.id],
    });
  } else if (nodeName === "HR") {
    data.push({
      children: [
        {
          text: "",
        },
        {
          children: [{ text: "" }],
          uuid: uuidv4(),
          type: "hr",
        },
        {
          text: "",
        },
      ],
      uuid: uuidv4(),
      type: "text",
    });
  } else if (nodeName === "UL" || nodeName === "OL") {
    children.forEach((child, i) => {
      if (child.list) {
        // it is a litem children
        data.push({
          children: child.textChildren,
          uuid: uuidv4(),
          type: nodeName === "UL" ? "ulist" : "olist",
          attributes: { level: lev },
          contributors: [user.id],
        });
      } else if (typeof child.uuid === "string") {
        // it is a block child
        data.push(child);
      }
    });
  } else if (nodeName === "IMG") {
    if (
      el.getAttribute("src").startsWith("http") ||
      el.getAttribute("src").startsWith("data")
    ) {
      data.push(...blocksChildrens);
      data.push({
        children: [{ text: "" }],
        uuid: uuidv4(),
        type: "image",
        url: el.getAttribute("src"),
        contributors: [user.id],
      });
    }
  } else if (nodeName === "SPAN" && el.parentNode.nodeName === "B") {
    const styleString = el.parentNode.getAttribute("style");
    if (
      el.parentNode.nodeName === "B" &&
      styleString &&
      styleString.includes("font-weight:normal")
    ) {
      // used for google docs
      data.push(...blocksChildrens);
      data.push({
        children: textChildren,
        uuid: uuidv4(),
        type: "text",
        contributors: [user.id],
      });
    } else {
      data.push(...blocksChildrens);
      data.push(...textChildren);
    }
  } else if (nodeName === "STRONG" || nodeName === "B") {
    const gDocsStyle = el.getAttribute("style"); // used for google docs

    if (
      nodeName === "B" &&
      gDocsStyle &&
      gDocsStyle.includes("font-weight:normal")
    ) {
      data.push(...blocksChildrens);
      data.push(...children);
    } else {
      data.push(...blocksChildrens);
      data.push(
        ...children.map((x) => {
          if (typeof x === "string")
            return {
              text: x,
              bold: true,
              italic: false,
              underline: false,
              strikethrough: false,
            };
          else {
            return {
              text: x.text,
              bold: true,
              italic: false || x.italic,
              underline: false || x.underline,
              strikethrough: false || x.strikethrough,
            };
          }
        })
      );
    }
  } else if (nodeName === "EM" || nodeName === "I") {
    data.push(...blocksChildrens);
    data.push(
      ...children.map((x) => {
        if (typeof x === "string")
          return {
            text: x,
            textProperties: {
              bold: false,
              italic: true,
              underline: false,
              strikethrough: false,
            },
          };
        else {
          return {
            text: x.text,
            textProperties: {
              bold: false || x.bold,
              italic: true,
              underline: false || x.underline,
              strikethrough: false || x.strikethrough,
            },
          };
        }
      })
    );
  } else if (nodeName === "S" || nodeName === "DEL") {
    data.push(...blocksChildrens);
    data.push(
      ...children.map((x) => {
        if (typeof x === "string")
          return {
            text: x,
            textProperties: {
              bold: false,
              italic: false,
              underline: false,
              strikethrough: true,
            },
          };
        else {
          return {
            text: x.text,
            textProperties: {
              bold: false || x.bold,
              strikethrough: true,
              italic: false || x.italic,
              underline: false || x.underline,
            },
          };
        }
      })
    );
  } else if (nodeName === "U") {
    data.push(...blocksChildrens);
    data.push(
      ...children.map((x) => {
        if (typeof x === "string")
          return {
            text: x,
            bold: false,
            italic: false,
            underline: true,
            strikethrough: false,
          };
        else {
          return {
            text: x.text,
            bold: false || x.bold,
            underline: true,
            italic: false || x.italic,
            strikethrough: false || x.strikethrough,
          };
        }
      })
    );
  } else if (nodeName === "LI") {
    data.push({ textChildren: textChildren, list: true });
    data.push(...blocksChildrens);
  } else if (nodeName === "SPAN" && el.getAttribute("style")) {
    const styleString = el.getAttribute("style");
    if (styleString.includes("mso-bidi-font-family")) {
      let textProps = {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
      };
      // TODO: check what properties MS Word sends and configure below
      // if(msWordStyle.fontWeight === '600'){
      //     textProps.bold = true
      // }
      // if(msWordStyle.fontStyle === "italic"){
      //     textProps.italic = true
      // }
      // if(msWordStyle.borderBottom && msWordStyle.borderBottom !== 'none' ){
      //     textProps.underline = true
      // }
      // if(msWordStyle.textDecoration === 'line-through'){
      //     textProps.strikethrough = true
      // }
      data.push(...blocksChildrens);
      data.push(...children.map((x) => ({ text: x, ...textProps })));
    } else {
      const notionStyle = toStyle(el.getAttribute("style")); // used for notion
      let textProps = {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
      };
      if (notionStyle.fontWeight === "600") {
        textProps.bold = true;
      }
      if (notionStyle.fontStyle === "italic") {
        textProps.italic = true;
      }
      if (notionStyle.borderBottom && notionStyle.borderBottom !== "none") {
        textProps.underline = true;
      }
      if (notionStyle.textDecoration === "line-through") {
        textProps.strikethrough = true;
      }
      data.push(...blocksChildrens);
      data.push(...children.map((x) => ({ text: x, ...textProps })));
    }
  } else {
    data.push(...blocksChildrens);
    data.push(...children);
  }
  if (isFirstLevel) {
    let finalData = [];
    let currentBlock = null;
    for (let i = 0; i < data.length; i++) {
      let x = data[i];
      let pullTextObjectUp = (x) => {
        if (x.text && x.text.text) {
          return pullTextObjectUp(x.text);
        }
        return x;
      };
      if (x.text ? true : false) {
        x = pullTextObjectUp(x);
      }
      if (typeof x === "string" || (x.text ? true : false)) {
        if (currentBlock) {
          currentBlock.children.push(typeof x === "string" ? { text: x } : x);
        } else {
          currentBlock = {
            children: typeof x === "string" ? [{ text: x }] : [x],
            uuid: uuidv4(),
            type: "text",
            contributors: [user.id],
          };
        }
      } else {
        if (currentBlock) {
          finalData.push(currentBlock);
          currentBlock = null;
        }
        let finalDataIds = finalData.map((x) => x.uuid);
        if (!finalDataIds.includes(x.uuid)) finalData.push(x);
      }
    }
    if (currentBlock) {
      finalData.push(currentBlock);
    }
    finalData = finalData.filter((x) => x.children && x.children.length !== 0);
    finalData = finalData.filter(
      (x) =>
        !(
          (x.type === "text" || x.type.startsWith("heading")) &&
          isStringEmpty(slateChildrenToText(x.children))
        )
    );
    finalData = finalData.map((x) =>
      slateChildrenToText(x.children).match(/^(\n| )+$/)
        ? { ...x, children: [{ text: "" }] }
        : x
    );
    return finalData;
  }
  return data;
};

export const isSelectionFocusInBlock = (editor, block) => {
  const [[_, blockPath]] = Editor.nodes(editor, {
    at: [],
    match: (n, p) => n.uuid === block.uuid,
  });

  if (editor.selection?.focus.path[0] === blockPath[0]) {
    return true;
  } else {
    return false;
  }
};

export const insertBlock = (editor, type, at) => {
  let insertedNode = {
    type: type,
    children: [{ text: "" }],
  };
  Transforms.insertNodes(editor, insertedNode, { at: at });
  Transforms.setSelection(editor, {
    anchor: {
      path: at,
      offset: 0,
    },
    focus: {
      path: at,
      offset: 0,
    },
  });
};

export const isRangeAcrossBlocks = (range: Range) => {
  return range.anchor.path[0] !== range.focus.path[0];
};

export const useCustomSelected = (block) => {
  const selected = useSelected();
  const inFocus = useFocused();
  const editor = useSlateStatic();
  const [isFocusInBlock, setIsFocusInBlock] = useState(false);
  useEffect(() => {
    if (!editor.selection) {
      setIsFocusInBlock(false);
    } else {
      setIsFocusInBlock(
        selected &&
          inFocus &&
          isSelectionFocusInBlock(editor, block) &&
          Range.isCollapsed(editor.selection)
      );
    }
  }, [editor.selection, inFocus, selected, block.uuid]);

  return isFocusInBlock;
};

export const useMouseDown = () => {
  const [mouseDown, setMouseDown] = useState(false);
  useEffect(() => {
    const setMouseDownTrue = () => {
      setMouseDown(true);
    };
    const setMouseDownFalse = () => {
      setMouseDown(false);
    };
    window.addEventListener("mousedown", setMouseDownTrue);
    window.addEventListener("mouseup", setMouseDownFalse);
    return () => {
      window.removeEventListener("mousedown", setMouseDownTrue);
      window.removeEventListener("mouseup", setMouseDownFalse);
    };
  }, []);
  return mouseDown;
};

export const getLength = (token) => {
  if (typeof token === "string") {
    return token.length;
  } else if (typeof token.content === "string") {
    return token.content.length;
  } else {
    return token.content.reduce((l, t) => l + getLength(t), 0);
  }
};

export const getStringWithLineBreaks = (editor: Editor, at: Location) => {
  const range = Editor.range(editor, at);
  const [start, end] = Range.edges(range);
  let text = "";

  for (const [_, blockPath] of Editor.nodes(editor, {
    at: range,
    match: (n, p) => SlateElement.isElement(n) && !editor.isInline(n),
  })) {
    if (text) {
      text += "\n\n";
    }
    for (const [node, nodePath] of Editor.nodes(editor, {
      at: blockPath,
      match: Text.isText,
      voids: true,
    })) {
      let t = node.text;

      if (Path.equals(nodePath, end.path)) {
        t = t.slice(0, end.offset);
      }

      if (Path.equals(nodePath, start.path)) {
        t = t.slice(start.offset);
      }

      text += t;
    }
  }

  return text;
};

export const findTextNodeAndSelectEditor = (editor, uuid) => {
  const textNodesWithThread = Editor.nodes(editor, {
    at: [],
    mode: "lowest",
    match: (n) =>
      Text.isText(n) && getCommentThreadsOnTextNode(n).includes(uuid),
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
      Transforms.select(editor, {
        anchor,
        focus,
      });
    }
  }

  return allTextNodePaths;
};
// export const findTextNodeAndSelectEditorforReel = (editor, uuid) => {
//   const textNodesWithThread = Editor.nodes(editor, {
//     at: [],
//     mode: "lowest",
//     match: (n) => Text.isText(n) && getReelThreadsOnTextNode(n).includes(uuid),
//   });

//   let textNodeEntry = textNodesWithThread.next().value;
//   const allTextNodePaths = [];

//   while (textNodeEntry != null) {
//     allTextNodePaths.push(textNodeEntry[1]);
//     textNodeEntry = textNodesWithThread.next().value;
//   }

//   // sort the text nodes
//   allTextNodePaths.sort((p1, p2) => Path.compare(p1, p2));

//   // set the selection on the editor

//   if (allTextNodePaths) {
//     const anchor = Editor.point(editor, allTextNodePaths[0], {
//       edge: "start",
//     });
//     const focus = Editor.point(
//       editor,
//       allTextNodePaths[allTextNodePaths.length - 1],
//       { edge: "end" }
//     );
//     if (anchor && focus) {
//       Transforms.select(editor, {
//         anchor,
//         focus,
//       });
//     }
//   }

//   return allTextNodePaths;
// };

export const removeThreadMark = (editor, uuid) => {
  if (findTextNodeAndSelectEditor(editor, uuid)) {
    Editor.removeMark(editor, `${COMMENT_THREAD_PREFIX}${uuid}`);
  }
};

export const removeCommentMarksFromChild = (node) => {
  const keys = Object.keys(node);
  const newNode = new Object();
  keys.forEach((key) => {
    if (key === "children") {
      newNode.children = node.children.map((child) =>
        removeCommentMarksFromChild(child)
      );
    } else if (key && !key.startsWith(COMMENT_THREAD_PREFIX)) {
      newNode[key] = node[key];
    }
  });
  return newNode;
};

export const getReactionIcon = (emoji: string) => {
  switch (emoji) {
    case POST_REACTIONS.WELL_DONE:
      return <WellDoneIcon size={15} />;
    case POST_REACTIONS.JUST_LOOKING:
      return <JustLookingIcon size={15} />;
    case POST_REACTIONS.EXCEPTIONAL:
      return <ExceptionalIcon size={15} />;
    case POST_REACTIONS.CELEBRATE:
      return <CelebrateIcon size={15} />;
    default:
      return emoji;
  }
};

export const IS_IOS =
  typeof navigator !== "undefined" &&
  typeof window !== "undefined" &&
  /iPad|iPhone|iPod/.test(navigator.userAgent) &&
  !window.MSStream;
