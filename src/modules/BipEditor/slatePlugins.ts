// import EMBEDS from "./embedsList";
import {
  INLINE_VOID_BLOCK_TYPES,
  MEDIA_BLOCK_TYPES,
  LIST_TYPES,
  COMMENT_THREAD_PREFIX,
  EMBEDS,
} from "./constants";
import {
  Editor,
  Transforms,
  Range,
  Point,
  createEditor,
  Element as SlateElement,
  Descendant,
  Node,
  Path,
} from "slate";
import { v4 as uuidv4 } from "uuid";
import {
  deserializeHTML,
  filterAndBuildTransactions,
  insertInlineVoid,
  removeCommentMarksFromChild,
  slateChildrenToText,
} from "./utils";
import { HistoryEditor } from "slate-history";
import BlocksService from "./services";
import Colors from "../../utils/Colors";
import { I } from "@excalidraw/excalidraw/types/ga";
// import utils from "./utils";

const withTables = (editor) => {
  const {
    deleteBackward,
    deleteForward,
    insertBreak,
    deleteFragment,
    normalizeNode,
  } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (
      SlateElement.isElement(node) &&
      ((node.type.includes("table") && node.type !== "simple_table_v1") ||
        node.cellUUID)
    ) {
      const [table, tablePath] = Editor.node(editor, path.slice(0, 1));

      if (table.uuid !== node.tableUUID) {
        Transforms.setNodes(
          editor,
          {
            tableUUID: table.uuid,
          },
          {
            at: path,
          }
        );
        return;
      }
    }

    normalizeNode(entry);
  };

  editor.deleteFragment = () => {
    const { selection } = editor;

    const hasSameStartNode =
      selection.anchor.path[0] === selection.focus.path[0];

    if (hasSameStartNode) {
      const entry = Editor.node(editor, [selection.anchor.path[0]]);
      const [node, path] = entry;
      if (
        node.type === "simple_table_v1" &&
        !_.isEqual(
          selection.anchor.path.slice(0, 3),
          selection.focus.path.slice(0, 3)
        )
      ) {
        return;
      }
      // Transforms.setNodes(editor, {
      //   type: "text",
      //   attributes: {},
      // });
    }
    deleteFragment();
  };

  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "table-cell",
      });

      if (cell) {
        const [, cellPath] = cell;
        const start = Editor.start(editor, cellPath);

        if (Point.equals(selection.anchor, start)) {
          return;
        }
      }
    }

    const match = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
    });

    if (match) {
      const [block, path] = match;
      const start = Editor.start(editor, path);

      const prevBlock = editor.children[path[0] - 1];
      if (
        !Editor.isEditor(block) &&
        SlateElement.isElement(block) &&
        Point.equals(selection.anchor, start) &&
        prevBlock?.type === "simple_table_v1"
      ) {
        const isCurrentBlockStringEmpty = !Editor.string(editor, path, {
          voids: true,
        });

        if (isCurrentBlockStringEmpty) {
          Transforms.removeNodes(editor, { at: path });
        }
        Transforms.move(editor, {
          distance: 1,
          unit: "line",
          reverse: true,
        });
        return;
      }
    }

    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "table-cell",
      });

      if (cell) {
        const [, cellPath] = cell;
        const end = Editor.end(editor, cellPath);

        if (Point.equals(selection.anchor, end)) {
          return;
        }
      }
    }

    deleteForward(unit);
  };

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection) {
      const [table] = Editor.nodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === "table",
      });

      if (table) {
        return;
      }
    }

    insertBreak();
  };

  return editor;
};

const withCustomInlineVoid = (editor) => {
  const { isVoid, isInline, normalizeNode } = editor;
  editor.isVoid = (element) => {
    return INLINE_VOID_BLOCK_TYPES.includes(element.type)
      ? true
      : isVoid(element);
  };
  editor.isInline = (element) => {
    return INLINE_VOID_BLOCK_TYPES.includes(element.type)
      ? true
      : isInline(element);
  };
  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    if (path.length === 0) {
      for (
        var childIndex = 0;
        childIndex < node.children.length;
        childIndex++
      ) {
        if (MEDIA_BLOCK_TYPES.includes(node.children[childIndex].type)) {
          const uuid = uuidv4();
          let insertedNode = {
            type: "text",
            uuid,
            rank: 0,
            children: [
              { text: "" },
              {
                ...node.children[childIndex],
              },
              { text: "" },
            ],
          };
          Transforms.removeNodes(editor, { at: [childIndex] });
          Transforms.insertNodes(editor, insertedNode, { at: [childIndex] });
        }
      }
    }

    if (path.length === 1) {
      for (
        var childIndex = 0;
        childIndex < node.children.length;
        childIndex++
      ) {
        if (MEDIA_BLOCK_TYPES.includes(node.children[childIndex].type)) {
          const mediaChildPath = [path[0], childIndex];
          if (
            Editor.string(
              editor,
              {
                anchor: { path: [path[0], 0], offset: 0 },
                focus: { path: mediaChildPath, offset: 0 },
              },
              { voids: false }
            )
          ) {
            Transforms.splitNodes(editor, {
              at: mediaChildPath,
              voids: true,
            });
            return;
          } else if (Editor.string(editor, path, { voids: false })) {
            Transforms.splitNodes(editor, {
              at: Path.next(mediaChildPath),
              voids: true,
            });
            return;
          } else if (node.children.length > 3) {
            let i = childIndex + 1;
            while (i < node.children.length) {
              if (INLINE_VOID_BLOCK_TYPES.includes(node.children[i].type)) {
                Transforms.splitNodes(editor, {
                  at: Path.next(mediaChildPath),
                  voids: true,
                });
                return;
              }
              i++;
            }
            if (childIndex > 3) {
              Transforms.splitNodes(editor, {
                at: mediaChildPath,
                voids: true,
              });
              return;
            }
          } else if (node.type.includes("heading")) {
            Transforms.setNodes(editor, { type: "text" }, { at: path });
            return;
          }
        }
      }
    }

    if (editor.isVoid(node)) {
      let type = "";
      if (
        EMBEDS.map((x) => x.type)
          .concat(["image", "attachment", "embed"])
          .includes(node.type)
      ) {
        type = "media";
      } else if (node.type === "userMention") {
        type = node.mention.type === "role" ? "roleMention" : "userMention";
      } else {
        type = node.type;
      }

      switch (type) {
        case "media": {
          if (
            Editor.string(editor, path, { voids: true }) !==
            `[Media](${node.url})`
          ) {
            Transforms.insertText(editor, `[Media](${node.url})`, {
              at: path,
              voids: true,
            });
          }
          break;
        }
        case "pageMention": {
          if (
            node?.mention?.repoName &&
            Editor.string(editor, path, { voids: true }) !==
              `[Canvas](${node?.mention?.repoName})`
          ) {
            Transforms.insertText(
              editor,
              `[Canvas](${node?.mention?.repoName})`,
              { at: path, voids: true }
            );
          }
          break;
        }
        case "userMention": {
          if (
            node?.mention?.username &&
            Editor.string(editor, path, { voids: true }) !==
              `<@${node?.mention?.username}>`
          ) {
            Transforms.insertText(editor, `<@${node?.mention?.username}>`, {
              at: path,
              voids: true,
            });
          }
          break;
        }
        case "roleMention": {
          if (
            node?.mention?.name &&
            Editor.string(editor, path, { voids: true }) !==
              `<@${node?.mention?.name}>`
          ) {
            Transforms.insertText(editor, `<@${node?.mention?.name}>`, {
              at: path,
              voids: true,
            });
          }
          break;
        }
        default: {
          break;
        }
      }
    }
    normalizeNode(entry);
  };

  return editor;
};

const withCustomIsInline = (editor) => {
  const { isInline } = editor;
  editor.isInline = (element) => {
    return INLINE_VOID_BLOCK_TYPES.includes(element.type)
      ? true
      : isInline(element);
  };

  return editor;
};

const withCustomIsVoid = (editor) => {
  const { isVoid } = editor;
  editor.isVoid = (element) => {
    return INLINE_VOID_BLOCK_TYPES.includes(element.type)
      ? // EMBEDS.map((x) => x.type).includes(element.type)
        true
      : isVoid(element);
  };
  return editor;
};

const withCustomNormalizeNode = (editor) => {
  const { normalizeNode } = editor;
  editor.normalizeNode = (entry) => {
    try {
      const [node, path] = entry;
      if (
        editor.isVoid(node) &&
        path.length === 1 &&
        editor.children.length === path[0] + 1
      ) {
        let insertedNode = {
          type: "text",
        };
        Transforms.insertNodes(editor, insertedNode, { at: [path[0] + 1] });
      }
      if (path.length === 0 && editor.children.length === 1) {
        const uuid = uuidv4();
        let insertedNode = {
          type: "text",
          uuid,
          rank: 0,
          children: [{ text: "" }],
        };
        Transforms.insertNodes(editor, insertedNode, { at: [0] });
      }
    } catch (e) {}

    normalizeNode(entry);
  };

  return editor;
};

const withShortcuts = (editor) => {
  const SHORTCUTS = {
    "* ": "ulist",
    "- ": "ulist",
    "1. ": "olist",
    "[] ": "checklist",
    "# ": "heading1",
    "## ": "heading2",
    "### ": "heading3",
    "#### ": "heading4",
    "##### ": "heading5",
    "#+ ": "headingPrev+1",
    "#- ": "headingPrev-1",
    "#= ": "headingPrev",
    "> ": "quote",
    "```": "code",
    "---": "hr",
  };

  const endingChars = [" ", "`", "-"];

  const { insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    if (
      endingChars.includes(text) &&
      selection &&
      Range.isCollapsed(selection)
    ) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range) + text;
      let type = SHORTCUTS[beforeText];

      if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        const attributes = LIST_TYPES.includes(type)
          ? type === "checklist"
            ? { level: 1, checked: false }
            : { level: 1 }
          : null;

        if (type.includes("headingPrev")) {
          const prevHeadingNodes = Editor.nodes(editor, {
            at: [],
            match: (n, p) => {
              return (
                SlateElement.isElement(n) &&
                !editor.isInline(n) &&
                n.type.includes("heading")
              );
            },
          });
          const prevHeadingsArr = [...prevHeadingNodes];

          let closestHeading: any = [undefined, [Number.MAX_SAFE_INTEGER]];
          for (let index = 0; index < prevHeadingsArr.length; index++) {
            const node = prevHeadingsArr[index];
            if (node[1][0] < path[0]) {
              closestHeading = node;
            } else {
              break;
            }
          }

          if (!closestHeading[0]) {
            type = "heading1";
          } else {
            const [_, headingNumber] = closestHeading[0].type.split("heading");
            if (
              type === "headingPrev" ||
              (closestHeading[0].type === "heading1" &&
                type === "headingPrev-1") ||
              (closestHeading[0].type === "heading5" &&
                type === "headingPrev+1")
            ) {
              type = closestHeading[0].type;
            } else if (type === "headingPrev+1") {
              type = `heading${+headingNumber + 1}`;
            } else if (type === "headingPrev-1") {
              type = `heading${+headingNumber - 1}`;
            }
          }
        }

        const newProperties: Partial<SlateElement> = {
          type,
          attributes,
        };
        if (INLINE_VOID_BLOCK_TYPES.includes(type)) {
          insertInlineVoid(editor, type);
        } else {
          Transforms.setNodes<SlateElement>(editor, newProperties, {
            match: (n) => Editor.isBlock(editor, n),
          });
        }

        return;
      }
    }

    insertText(text);
  };

  return editor;
};

const withBackspaceEdgeCases = (editor) => {
  const { deleteBackward } = editor;
  editor.deleteBackward = (...args) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        const prevBlock = editor.children[path[0] - 1];
        const prevBlockContainsMediaNode = prevBlock
          ? prevBlock.children.find((x) => MEDIA_BLOCK_TYPES.includes(x.type))
          : false;

        if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          block.type !== "text" &&
          block.type !== "subtext" &&
          !block.type?.includes("heading") &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<SlateElement> = {
            type: "text",
          };
          Transforms.setNodes(editor, newProperties);
          return;
        } else if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          Point.equals(selection.anchor, start) &&
          prevBlock &&
          Node.string(prevBlock) === "" &&
          !prevBlock.children.some((x) =>
            INLINE_VOID_BLOCK_TYPES.includes(x.type)
          )
        ) {
          if (block.cellUUID) {
            deleteBackward(...args);
            return;
          }
          if (LIST_TYPES.includes(prevBlock.type)) {
            Transforms.setNodes(
              editor,
              { type: prevBlock.type, attributes: prevBlock.attributes },
              { at: path }
            );
          }

          Transforms.removeNodes(editor, { at: [path[0] - 1] });
          return;
        } else if (
          !Editor.isEditor(block) &&
          SlateElement.isElement(block) &&
          Point.equals(selection.anchor, start) &&
          prevBlockContainsMediaNode
        ) {
          const currentBlockContainsMediaNode = block.children.find((x) =>
            MEDIA_BLOCK_TYPES.includes(x.type)
          );
          const isCurrentBlockStringEmpty = !Editor.string(editor, path, {
            voids: true,
          });

          if (isCurrentBlockStringEmpty && !currentBlockContainsMediaNode) {
            Transforms.removeNodes(editor, { at: path });
          }
          const newSelection = Editor.end(editor, [path[0] - 1]);
          Transforms.select(editor, newSelection);
          return;
        }
      }

      deleteBackward(...args);
    }
  };
  return editor;
};

const withEnterEdgeCases = (editor, user) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const blockEntry = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const block = blockEntry ? blockEntry[0] : {};
      const path = blockEntry ? blockEntry[1] : [];
      const isEnd = Editor.isEnd(editor, anchor, path);
      const isStart = Editor.isStart(editor, anchor, path);

      const isListBlock = LIST_TYPES.includes(block?.type);
      const isCheckListBlock = block?.type === "checklist";

      if (isEnd) {
        if (isListBlock) {
          if (isStart) {
            if (block.attributes?.level > 1) {
              Transforms.setNodes(editor, {
                attributes: {
                  ...block.attributes,
                  level: block.attributes.level - 1,
                },
              });
            } else {
              Transforms.setNodes(editor, { type: "text" });
            }
          } else {
            const node = {
              type: block.type,
              children: [{ text: "" }],
              contributors: [user],
              attributes: isCheckListBlock
                ? {
                    level: block.attributes?.level ? block.attributes.level : 1,
                    checked: false,
                  }
                : {
                    level: block.attributes?.level ? block.attributes.level : 1,
                  },
            };
            if (block.cellUUID) {
              const { cellUUID, rowUUID } = block;
              node.cellUUID = cellUUID;
              node.rowUUID = rowUUID;
            }
            editor.insertNode(node);
          }
        } else if (block?.cellUUID) {
          const { cellUUID, rowUUID } = block;
          const node = {
            type: "text",
            children: [{ text: "" }],
            contributors: [user],
            attributes: {},
            cellUUID,
            rowUUID,
          };

          editor.insertNode(node);
        } else {
          const node = {
            type: "text",
            children: [{ text: "" }],
            contributors: [user],
            attributes: {},
          };
          editor.insertNode(node);
        }
      } else {
        insertBreak();
      }
    } else {
      insertBreak();
    }
  };

  editor.insertSoftBreak = () => {
    const { selection } = editor;

    if (selection) {
      Transforms.insertText(editor, "\n");
    }
  };

  return editor;
};

const withFormattedPaste = (editor, user, branchRef) => {
  const { insertData, setFragmentData } = editor;

  editor.insertData = (data: Pick<DataTransfer, "getData" | "setData">) => {
    if (editor.children[editor.selection.anchor.path[0]].type === "code") {
      const insertedText = data.getData("text/plain");
      Transforms.insertText(editor, insertedText);
      return;
    }
    const fragment = data.getData("application/x-bip-fragment-v2");
    if (fragment) {
      const decoded = decodeURIComponent(window.atob(fragment));
      let parsed = JSON.parse(decoded);

      parsed = parsed.map((x) => {
        const children = x.children.map((child) => {
          return removeCommentMarksFromChild(child);
        });
        const [curNode, curNodePath] = Array.from(
          Editor.node(editor, [editor.selection.anchor.path[0]])
        );
        if (curNode.type === "simple_table_v1") {
          let newTextNodes = [];
          const [cell, cellPath] = Array.from(
            Editor.node(editor, editor.selection.anchor.path.slice(0, 3))
          );
          const { uuid: cellUUID, rowUUID } = cell;
          if (children[0].type === "table-row") {
            const cellNode = children[0].children[0];

            newTextNodes = cellNode.children.map((node) => {
              return {
                ...node,
                attributes: {},
                cellUUID,
                rowUUID,
              };
            });
          } else {
            const ALLOWED_TYPES = ["ulist", "olist", "checklist", "text"];
            return {
              children: children,
              type: ALLOWED_TYPES.includes(x.type) ? x.type : "text",
              cellUUID,
              rowUUID,
              attributes: {},
            };
          }

          Transforms.insertFragment(editor, newTextNodes);
          return;
        }
        return {
          children: children,
          type: x.type,
          attributes: x.attributes,
          url: x.url,
          contributors: [user],
        };
      });

      Transforms.insertFragment(
        editor,
        parsed.filter((n) => n)
      );
      return;
    }
    const html = data.getData("text/html");

    if (html) {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      let data = deserializeHTML(parsed.body, true, 1, user);
      let filteredData = data.filter((x) => (x.uuid ? true : false));
      if (
        !Range.isCollapsed(editor.selection) ||
        (!editor.isVoid(
          editor.children[Range.start(editor.selection).path[0]]
        ) &&
          !editor.isVoid(filteredData[0]) &&
          !Editor.isEmpty(
            editor,
            editor.children[editor.selection.focus.path[0]]
          ) &&
          filteredData[0]?.type !== "simple_table_v1")
      ) {
        let stringToInsert = slateChildrenToText(filteredData[0].children);
        Transforms.insertText(editor, stringToInsert);
        if (filteredData.length > 1) {
          filteredData.splice(0, 1);
          Transforms.insertNodes(editor, filteredData);
        }
      } else {
        let isSiblingBlockTable = false;
        if (editor.children.length > editor.selection.focus.path[0] + 1) {
          const next = Editor.node(editor, [
            editor.selection.focus.path[0] + 1,
          ]);

          if (next) {
            const [nextBlock, path] = next;
            if (nextBlock.type === "simple_table_v1") {
              isSiblingBlockTable = true;
            }
          }
        } else if (editor.selection.focus.path[0] !== 0) {
          const prev = Editor.node(editor, [
            editor.selection.focus.path[0] - 1,
          ]);
          if (prev) {
            const [prevBlock, path] = prev;
            if (prevBlock.type === "simple_table_v1") {
              isSiblingBlockTable = true;
            }
          }
        }

        if (
          Editor.isEmpty(
            editor,
            editor.children[editor.selection.focus.path[0]]
          ) &&
          !isSiblingBlockTable
        ) {
          Transforms.removeNodes(editor, {
            at: [editor.selection.anchor.path[0]],
          });
        }
        Transforms.insertNodes(editor, filteredData);
      }
      return;
    }
    const files = data.items;
    if (files && files.length > 0 && files[0].kind === "file") {
      for (let i = 0; i < files.length; i++) {
        {
          const file = files[i].getAsFile();
          const element = editor.children[editor.selection?.anchor?.path[0]];
          const data = new FormData();
          data.append("file", file);
          data.append("model", "blocks");
          data.append("uuid", element?.uuid);

          data.append("repoID", branchRef.current.canvasRepositoryID);

          const imageTypes = ["image/png", "image/jpeg", "image/gif"];
          const fileTypes = [
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
            "application/pdf",
            "image/svg+xml",
          ];

          let type;

          if (imageTypes.includes(file.type)) {
            type = "image";
          } else if (fileTypes.includes(file.type)) {
            type = "attachment";
          } else {
            alert(`File type not supported: ${file.type}`);
            continue;
          }
          const isNotEmptyImgBlock = !editor?.children[
            editor.selection.focus.path[0]
          ]?.children.some((node) => node?.url === "" && type === "image");
          if (isNotEmptyImgBlock) {
            BlocksService.blockFileUpload(data).then((resp) => {
              const uuid = uuidv4();
              Transforms.insertNodes(editor, {
                type: type,
                url: resp.data.data,
                uuid,
                children: [{ text: "" }],
              });
            });
          }
        }
      }

      return;
    }
    insertData(data);
  };

  editor.setFragmentData = (
    data: Pick<DataTransfer, "getData" | "setData">
  ) => {
    setFragmentData(data);
    const slateFragment = data.getData("application/x-slate-fragment");
    data.setData("application/x-bip-fragment-v2", slateFragment);
  };

  return editor;
};

const withNodeIds = (editor) => {
  const { apply } = editor;

  editor.apply = (operation) => {
    if (
      operation.type === "insert_node" &&
      SlateElement.isElement(operation.node)
    ) {
      // clone to be able to write (read-only)
      const node = { ...operation.node };

      // the id in the new node is already being used in the editor, we need to replace it with a new id
      const [duplicate] = Editor.nodes(editor, {
        at: [],
        match: (n, p) => {
          return n.type && (n.uuid === node.uuid || (n.id === node.id && n.id));
        },
      });

      if (duplicate || !node.uuid) {
        const uuid = uuidv4();
        node.uuid = uuid;
        if (node.id) {
          delete node.id;
        }
      }

      return apply({
        ...operation,
        node,
      });
    }

    if (operation.type === "split_node") {
      const node = { ...operation.properties };

      // only for elements (node with a type)
      if (node.type && node.uuid && !operation.deletedBlockUUID) {
        if (node.id) {
          delete node.id;
        }
        return apply({
          ...operation,
          properties: {
            ...node,
            uuid: uuidv4(),
          },
        });
      }
    }

    return apply(operation);
  };

  return editor;
};

const withAttributionAndSaveScope = (editor, user) => {
  const { apply } = editor;

  editor.apply = (op) => {
    const attributionOperations = [];
    if (op.attributionOp) {
      return;
    }

    if (
      op.type === "set_node" ||
      op.type === "insert_text" ||
      op.type === "remove_text" ||
      op.type === "set_mark" ||
      op.type === "add_mark" ||
      op.type === "remove_mark" ||
      op.type === "set_value" ||
      ((op.type === "merge_node" ||
        op.type === "split_node" ||
        op.type === "insert_node" ||
        op.type === "remove_node") &&
        op.path.length === 2)
    ) {
      const oldContributors = editor?.children[op.path[0]]?.contributors ?? [];
      if (!op.editedBlockUUID) {
        attributionOperations.push({
          newProperties: {
            contributors: [...oldContributors, user],
            updatedByUser: user,
            updatedById: user.id,
            updatedAt: new Date().toISOString(),
          },
          path: [op.path[0]],
          properties: {
            contributors: oldContributors,
          },
          type: "set_node",
          attributionOp: true,
        });
        op.editedBlockUUID = editor.children[op.path[0]].uuid;
      }
    }

    if (op.type === "split_node" && op.path.length === 1) {
      if (op.deletedBlockUUID) {
        delete op["deletedBlockUUID"];
      } else if (op.createdBlockUUID) {
      } else {
        attributionOperations.push({
          newProperties: {
            contributors: [...editor.children[op.path[0]].contributors, user],
            updatedByUser: user,
            updatedById: user.id,
            updatedAt: new Date().toISOString(),
          },
          path: [op.path[0]],
          properties: {
            contributors: editor.children[op.path[0]].contributors,
          },
          type: "set_node",
          attributionOp: true,
        });
        attributionOperations.push({
          newProperties: {
            contributors: [user],
            reelCount: 0,
            commentCount: 0,
            reactions: null,
            createdByUser: user,
            createdById: user.id,
            createdAt: new Date().toISOString(),
            updatedByUser: user,
            updatedById: user.id,
            updatedAt: new Date().toISOString(),
          },
          path: [op.path[0] + 1],
          properties: {
            contributors: editor.children[op.path[0]].contributors,
            reelCount: 0,
            commentCount: 0,
            reactions: null,
            createdByUser: user,
            createdById: user.id,
            createdAt: new Date().toISOString(),
            updatedByUser: user,
            updatedById: user.id,
            updatedAt: new Date().toISOString(),
          },
          type: "set_node",
          attributionOp: true,
        });
        op.editedBlockUUID = op.properties.uuid;
        const newUUID = uuidv4();

        op.properties.uuid = newUUID;
      }
      op.createdBlockUUID = op.properties.uuid;
    }
    if (op.type === "merge_node" && op.path.length === 1) {
      if (op.createdBlockUUID) {
        delete op["createdBlockUUID"];
      } else {
        attributionOperations.push({
          newProperties: {
            contributors: [
              ...editor.children[op.path[0] - 1].contributors,
              user,
            ],
            updatedByUser: user,
            updatedById: user.id,
            updatedAt: new Date().toISOString(),
          },
          path: [op.path[0] - 1],
          properties: {
            contributors: editor.children[op.path[0] - 1].contributors,
          },
          type: "set_node",
          attributionOp: true,
        });
        op.editedBlockUUID = editor.children[op.path[0] - 1].uuid;
      }
      op.deletedBlockUUID = op.properties.uuid;
    }

    if (op.type === "insert_node" && op.path.length === 1) {
      if (op.deletedBlockUUID) {
        delete op["deletedBlockUUID"];
      } else if (op.createdBlockUUID) {
      } else {
        attributionOperations.push({
          newProperties: {
            contributors: [user],
            createdByUser: user,
            createdById: user.id,
            createdAt: new Date().toISOString(),
            updatedByUser: user,
            updatedById: user.id,
            updatedAt: new Date().toISOString(),
          },
          path: op.path,
          properties: {
            contributors: [user],
            createdByUser: user,
            createdById: user.id,
            createdAt: new Date().toISOString(),
            updatedByUser: user,
            updatedById: user.id,
            updatedAt: new Date().toISOString(),
          },
          type: "set_node",
          attributionOp: true,
        });
      }

      op.createdBlockUUID = op.node.uuid;
    }
    if (op.type === "remove_node" && op.path.length === 1) {
      if (op.createdBlockUUID) {
        delete op["createdBlockUUID"];
      }
      op.deletedBlockUUID = op.node.uuid;
    }

    if (
      (op.type === "insert_node" || op.type === "remove_node") &&
      (op?.node?.type === "table-cell" || op?.node?.cellUUID)
    ) {
      op.editedBlockUUID = op.node.tableUUID;
    }

    if (op.type === "merge_node") {
      const entry = Editor.node(editor, [op.path[0]]);
      if (entry) {
        const [node, path] = entry;
        if (node.type === "simple_table_v1") {
          op.editedBlockUUID = node.uuid;
        }
      }
    }

    apply(op);
    if (!op.rankOp) {
      HistoryEditor.withoutSaving(editor, () => {
        Editor.withoutNormalizing(editor, () => {
          attributionOperations.forEach((op) => {
            apply(op);
          });
        });
      });
    }
  };
  return editor;
};

const withNodeRankProp = (editor) => {
  const { apply } = editor;

  editor.apply = (op) => {
    const rankOperations = [];

    if (op.rankOp) {
      return;
    }

    apply(op);

    if (op.type === "split_node" && op.path.length === 1) {
      //Since this check is done after applying the original operation,
      //we need to check if a block exists at op.path[0] + 2;
      const doesNextBlockExist = !!editor.children[op.path[0] + 2];

      if (!doesNextBlockExist) {
        //After splitting, the block that was split is the previous block of the newly created block
        const prevBlockRank = editor.children[op.path[0]].rank;

        rankOperations.push({
          newProperties: {
            rank: prevBlockRank + 1000,
          },
          path: [op.path[0] + 1],
          properties: {
            rank: prevBlockRank,
          },
          type: "set_node",
          rankOp: true,
        });
      } else {
        const prevBlockRank = editor.children[op.path[0]].rank;
        const nextBlockRank = editor.children[op.path[0] + 2].rank;
        const targetRank = Math.floor((prevBlockRank + nextBlockRank) / 2);

        if (targetRank !== prevBlockRank) {
          rankOperations.push({
            newProperties: {
              rank: targetRank,
            },
            path: [op.path[0] + 1],
            properties: {
              rank: prevBlockRank,
            },
            type: "set_node",
            rankOp: true,
          });
        } else {
          editor.children.forEach((_, blockIndex) => {
            rankOperations.push({
              newProperties: {
                rank: blockIndex * 1000,
              },
              path: [blockIndex],
              properties: {
                rank: editor.children[blockIndex].rank,
              },
              type: "set_node",
              rankOp: true,
            });
          });
        }
      }
    }
    if (op.type === "insert_node" && op.path.length === 1) {
      const doesPrevBlockExist = op.path[0] !== 0;

      //Since we already inserted a block at position op.path[0], we need to check if a block exists after it
      const doesNextBlockExist = !!editor.children[op.path[0] + 1];

      if (!doesPrevBlockExist) {
        const nextBlockRank = doesNextBlockExist
          ? editor.children[op.path[0] + 1].rank
          : null;
        rankOperations.push({
          newProperties: {
            rank: doesNextBlockExist ? nextBlockRank - 1000 : 0,
          },
          path: [op.path[0]],
          properties: {
            rank: nextBlockRank - 1000,
          },
          type: "set_node",
          rankOp: true,
        });
      } else if (!doesNextBlockExist) {
        const prevBlockRank = editor.children[op.path[0] - 1].rank;
        rankOperations.push({
          newProperties: {
            rank: prevBlockRank + 1000,
          },
          path: [op.path[0]],
          properties: {
            rank: prevBlockRank + 1000,
          },
          type: "set_node",
          rankOp: true,
        });
      } else {
        const prevBlockRank = editor.children[op.path[0] - 1].rank;
        const nextBlockRank = editor.children[op.path[0] + 1].rank;
        const targetRank = Math.floor((prevBlockRank + nextBlockRank) / 2);

        if (targetRank !== prevBlockRank) {
          rankOperations.push({
            newProperties: {
              rank: targetRank,
            },
            path: [op.path[0]],
            properties: {
              rank: targetRank,
            },
            type: "set_node",
            rankOp: true,
          });
        } else {
          editor.children.forEach((_, blockIndex) => {
            rankOperations.push({
              newProperties: {
                rank: blockIndex * 1000,
              },
              path: [blockIndex],
              properties: {
                rank: editor.children[blockIndex].rank,
              },
              type: "set_node",
              rankOp: true,
            });
          });
        }
      }
    }
    if (op.type === "move_node") {
      const doesPrevBlockExist = op.newPath[0] !== 0;

      //Since we already inserted a block at position op.path[0], we need to check if a block exists after it
      const doesNextBlockExist = !!editor.children[op.newPath[0] + 1];

      if (!doesPrevBlockExist) {
        const nextBlockRank = editor.children[op.newPath[0] + 1].rank;
        rankOperations.push({
          newProperties: {
            rank: nextBlockRank - 1000,
          },
          path: [op.newPath[0]],
          properties: {
            rank: nextBlockRank - 1000,
          },
          type: "set_node",
          rankOp: true,
        });
      } else if (!doesNextBlockExist) {
        const prevBlockRank = editor.children[op.newPath[0] - 1].rank;
        rankOperations.push({
          newProperties: {
            rank: prevBlockRank + 1000,
          },
          path: [op.newPath[0]],
          properties: {
            rank: prevBlockRank + 1000,
          },
          type: "set_node",
          rankOp: true,
        });
      } else {
        const prevBlockRank = editor.children[op.newPath[0] - 1].rank;
        const nextBlockRank = editor.children[op.newPath[0] + 1].rank;
        const targetRank = Math.floor((prevBlockRank + nextBlockRank) / 2);

        if (targetRank !== prevBlockRank) {
          rankOperations.push({
            newProperties: {
              rank: targetRank,
            },
            path: [op.newPath[0]],
            properties: {
              rank: targetRank,
            },
            type: "set_node",
            rankOp: true,
          });
        } else {
          editor.children.forEach((_, blockIndex) => {
            rankOperations.push({
              newProperties: {
                rank: blockIndex * 1000,
              },
              path: [blockIndex],
              properties: {
                rank: editor.children[blockIndex].rank,
              },
              type: "set_node",
              rankOp: true,
            });
          });
        }
      }
    }

    HistoryEditor.withoutSaving(editor, () => {
      Editor.withoutNormalizing(editor, () => {
        rankOperations.forEach((op) => {
          apply(op);
        });
      });
    });
  };
  return editor;
};

const withSaveCommentMarks = (editor, branchRef) => {
  const { apply, onChange } = editor;

  editor.apply = (op) => {
    if (
      op.type === "set_node" &&
      ((Object.keys(op.newProperties).some((key) =>
        key.includes(COMMENT_THREAD_PREFIX)
      ) &&
        !Object.keys(op.properties).some((key) =>
          key.includes(COMMENT_THREAD_PREFIX)
        )) ||
        (!Object.keys(op.newProperties).some((key) =>
          key.includes(COMMENT_THREAD_PREFIX)
        ) &&
          Object.keys(op.properties).some((key) =>
            key.includes(COMMENT_THREAD_PREFIX)
          )))
    ) {
      op.commentOp = true;
    }

    apply(op);
  };

  editor.onChange = () => {
    const { operations } = editor;

    if (operations.some((operation) => operation.commentOp)) {
      const transactions = [];
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        if (operation.editedBlockUUID) {
          if (
            !transactions.some(
              (transaction) =>
                transaction.uuid === operation.editedBlockUUID &&
                transaction.scope === "update"
            )
          ) {
            transactions.push({
              scope: "update",
              uuid: operation.editedBlockUUID,
            });
          }
        }
      }
      const blocks = filterAndBuildTransactions(
        editor.children,
        editor.children,
        transactions,
        branchRef.current.isNewRough || false
      );
      BlocksService.saveBlockAssociations(branchRef?.current.id, {
        blocks: blocks,
        permissionContext: "block_thread",
      }); //todo: handle fail
    }

    onChange();
  };
  return editor;
};

const withParentRef = (editor, parentRef) => {
  editor.parentRef = parentRef;
  return editor;
};

export {
  withCustomIsInline,
  withCustomIsVoid,
  withCustomNormalizeNode,
  withShortcuts,
  withCustomInlineVoid,
  withEnterEdgeCases,
  withBackspaceEdgeCases,
  withFormattedPaste,
  withNodeIds,
  withAttributionAndSaveScope,
  withNodeRankProp,
  withSaveCommentMarks,
  withParentRef,
  withTables,
};
