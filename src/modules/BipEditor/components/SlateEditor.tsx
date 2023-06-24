import {
  ALLOWED_LANGUAGES,
  BRACKETS,
  COMMENT_THREAD_PREFIX,
  INLINE_VOID_BLOCK_TYPES,
  LIST_TYPES,
  MEDIA_BLOCK_TYPES,
} from "../constants";
import { useEffect, useCallback, useState, useRef } from "react";
import isHotkey from "is-hotkey";
import { useToasts } from "react-toast-notifications";
import { Editable, withReact, Slate, ReactEditor } from "slate-react";
import _ from "lodash";
import {
  Editor,
  Transforms,
  createEditor,
  Element as SlateElement,
  Range,
  Text,
  Node,
} from "slate";
import { withHistory } from "slate-history";
import Element from "./blocks/Element";
import Leaf from "./blocks/Leaf";
import { useUser } from "../../../context/userContext";
import {
  withShortcuts,
  withCustomInlineVoid,
  withEnterEdgeCases,
  withBackspaceEdgeCases,
  withFormattedPaste,
  withNodeIds,
  withAttributionAndSaveScope,
  withNodeRankProp,
  withSaveCommentMarks,
  withTables,
  withParentRef,
} from "../slatePlugins";
import {
  filterAndBuildTransactions,
  findTextNodeAndSelectEditor,
  getCommentThreadsOnTextNode,
  getEmbedLink,
  getLength,
  insertInlineVoid,
  isBlockActive,
  isRangeAcrossBlocks,
  removeThreadMark,
  SLASH_COMMAND_OPTIONS,
  removeCommentMarksFromChild,
  toggleMark,
  IS_IOS,
} from "../utils";
import { PermissionGroup } from "../../Permissions/types";
import BlocksService from "../services";
import Toolbar from "./Toolbar";
import CommandMenu, { COMMAND_TYPE } from "./CommandMenu";
import { useCanvas } from "../../../context/canvasContext";
import CanvasBranchService from "../../Canvas/services/canvasBranch";
import { usePages } from "../../../context/pagesContext";
import { useRouter } from "next/router";
import { useStudio } from "../../../context/studioContext";
import { useRightRail } from "../../../context/rightRailContext";
import { usePermissions } from "../../../context/permissionContext";
import { Box, Overlay } from "@primer/react";
import TableOfContents from "../../../components/TableOfContents";
import CanvasTitle from "../../../components/CanvasTitle";

import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-java";
import "prismjs/components/prism-markdown";
import StudioService from "../../../../src/modules/Studio/services";
import { v4 as uuidv4 } from "uuid";
import RightBox from "./RightBox";
import BipRouteUtils from "../../../core/routeUtils";
import useRefDimensions from "../../../hooks/useRefDimensions";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import UserService from "../../User/services";
import CreateReels from "./CreateReels";
import CommentCard from "../../../components/CommentCard";
import { getHttpLink } from "../../../utils/Common";
import {
  FIND_INLINE_CODE_REGEX,
  FIND_MULTIPLE_EMAIL_REGEX,
  FIND_MULTIPLE_LINK_REGEX,
} from "../../../utils/Constants";
import { ReelType, ThreadType } from "../types";
import { ICanvasBranch } from "../../Canvas/interfaces";
import CollectionService from "../../Collections/services";
import Colors from "../../../utils/Colors";
import segmentEvents from "../../../insights/segment";
import { setLocalCanvasBlocks } from "../../Canvas/utils";
import { CALLOUT_TYPES } from "./blocks/BlockTypes/Callout";
// import 'prismj s/components/prism-javascript';

// prism token
Prism.languages.markdown=Prism.languages.extend("markup",{}),
Prism.languages.insertBefore("markdown","prolog",{
  blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},
  code:[{pattern:/^(?: {4}|\t).+/m,alias:"keyword"},{pattern:/``.+?``|`[^`\n]+`/,alias:"keyword"}],
  hr:{pattern:/(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},
  "url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,
  inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},
  string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,
  punctuation:/^[\[\]!:]|[<>]/},alias:"url"},
  bold:{pattern:/(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^\*\*|^__|\*\*$|__$/}},
  italic:{pattern:/(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^[*_]|[*_]$/}},
  url:{pattern:/!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,
  inside:{variable:{pattern:/(!?\[)[^\]]+(?=\]$)/,lookbehind:!0},
  string:{pattern:/"(?:\\.|[^"\\])*"(?=\)$)/}}}}),
  Prism.languages.markdown.bold.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.italic.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.bold.inside.italic=Prism.util.clone(Prism.languages.markdown.italic),Prism.languages.markdown.italic.inside.bold=Prism.util.clone(Prism.languages.markdown.bold); // prettier-ignore

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+shift+x": "strikethrough",
  "mod+e": "inlineCode",
};

const KEYBOARD_SHORTCUTS = {
  "mod+shift+up": "move-up",
  "mod+shift+down": "move-down",
};

const SlateEditor = (props: any) => {
  const { addReel, initialBlocks, parentRef, ...remProps } = props;
  const router = useRouter();

  const {
    threadUUID,
    reactionBlockUUID,
    mentionBlockUUID,
    reelUUID,
    blockUUID,
    isNew,
  } = router.query;
  const { user } = useUser();
  const { schema } = usePermissions();
  const {
    blocks,
    branch,
    setBranch,
    repo,
    branches,
    isSaving,
    setBranches,
    setIsSaving,
    setPendingSave,
    lastSaved,
    setLastSaved,
    setBlocks,
    showAddComment,
    showPostToReel,
    setShowAddComment,
    setShowPostToReel,
    getBlock,
    reels,
  } = useCanvas();
  const { setCurrentBlock, selectedObjectId, setSelectedObjectId } =
    useRightRail();
  const { currentStudio } = useStudio();
  const { pages, updatePages, drafts, setDrafts } = usePages();
  const [isCreatingNewRough, setIsCreatingNewRough] = useState(false);
  const branchRef = useRef<ICanvasBranch>();
  const [editor] = useState(
    withTables(
      withParentRef(
        withSaveCommentMarks(
          withNodeRankProp(
            withNodeIds(
              withAttributionAndSaveScope(
                withFormattedPaste(
                  withBackspaceEdgeCases(
                    withEnterEdgeCases(
                      withShortcuts(
                        withCustomInlineVoid(
                          withHistory(withReact(createEditor()))
                        )
                      ),
                      user
                    )
                  ),
                  user,
                  branchRef
                ),
                user
              )
            )
          ),
          branchRef
        ),
        parentRef
      )
    )
  );
  const [tempSelection, setTempSelection] = useState(null);

  useEffect(() => {
    if (
      (showAddComment || showPostToReel) &&
      editor.selection === null &&
      tempSelection
    ) {
      Transforms.select(editor, tempSelection);
    } else if ((showAddComment || showPostToReel) && editor.selection) {
      setTempSelection(editor.selection);
    } else {
      setTempSelection(null);
    }
  }, [showAddComment, editor.selection, showPostToReel]);

  const [isSearchingCmd, setIsSearchingCmd] = useState(false);
  const { addToast } = useToasts();
  const [target, setTarget] = useState<Range | undefined>();
  const [index, setIndex] = useState(0);
  const [showFakeSelection, setShowFakeSelection] = useState(false);
  const [recentBlockType, setRecentBlockType] = useState("ulist");
  const transactions = useRef([]);
  const saveTimeoutRef = useRef(null);
  const [commandType, setCommandType] = useState<COMMAND_TYPE>();
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const studioMembers = useRef([]);
  const searchedMembers = useRef([]);
  const studioRoles = useRef([]);
  const studioMembersNext = useRef(0);
  const switchedToExistingRough = useRef(false);
  const [forceRerenderer, setForceRerenderer] = useState(0);

  const { isXtraSmall, isSmall, isMedium, isLarge, isXtraLarge, dimensions } =
    useRefDimensions(parentRef);

  const { isLargeDevice, isTabletOrMobile } = useDeviceDimensions();
  const { removedThreadUUID, setRemovedThreadUUID } = useCanvas();
  const [zenMode, setZenMode] = useState(false);
  const [makeEditable, setMakeEditable] = useState(false);

  useEffect(() => {
    if (zenMode) {
      for (let el of document.getElementsByClassName("hide-on-key-down")) {
        el.style.opacity = "0";
      }
      document.body.style.cursor = "none";
    } else {
      for (let el of document.getElementsByClassName("hide-on-key-down")) {
        el.style.opacity = "1";
      }
      document.body.style.cursor = "unset";
    }
  }, [zenMode]);

  const forceRerender = () => {
    setForceRerenderer((prev) => prev + 1);
  };

  useEffect(() => {
    if (removedThreadUUID) {
      removeThreadMark(editor, removedThreadUUID);
      setRemovedThreadUUID("");
    }
  }, [removedThreadUUID]);

  //branchRef is used in a Slate Plugin as we need the branch info there but we initialize editor only once
  useEffect(() => {
    if (branch) {
      branchRef.current = branch;
    }
  }, [branch]);

  useEffect(() => {
    if (!editor.selection) {
      return;
    }
    const { selection } = editor;

    const { focus } = selection;
    if (ReactEditor.isFocused(editor) && Range.isCollapsed(selection)) {
      const [textNode] = Editor.nodes(editor, {
        at: {
          anchor: focus,
          focus,
        },
        match: (node) => Text.isText(node),
      });

      if (!textNode) {
        return;
      }

      const threads = getCommentThreadsOnTextNode(textNode[0]);
      /** Start:  For Comments */
      const newSelectedObjectId = threads[0];

      if (newSelectedObjectId) {
        setCurrentBlock({
          ...editor.children[selection.focus.path[0]],
        });
      }

      if (
        !reelUUID &&
        !threadUUID &&
        !reactionBlockUUID &&
        !mentionBlockUUID &&
        !blockUUID
      ) {
        setSelectedObjectId(`thread-${newSelectedObjectId}`);
      }
      /** End:  For Comments */
    }
  }, [editor?.selection]);

  // useWarnIfUnsavedChanges(transactions.current.length > 0, () => {
  //   return confirm("Warning! You have unsaved changes.");
  // });

  useEffect(() => {
    if (!router.isReady || !blockUUID) return;
    if (blockUUID) {
      const [[slateBlock, blockIndex]] = Editor.nodes(editor, {
        at: [],
        match: (n, p) => p.length === 1 && n.uuid === blockUUID,
      });
      if (slateBlock) {
        setCurrentBlock({
          ...slateBlock,
        });
        Transforms.select(editor, {
          anchor: Editor.start(editor, blockIndex),
          focus: Editor.end(editor, blockIndex),
        });
      }
    }
  }, [editor.children.length, blockUUID]);

  useEffect(() => {
    editor.children = initialBlocks;
    if (false) {
      //todo: check whether page title is empty and focus it) {
    } else {
      //selectAndFocusEditor();
      //setCurrentBlock({ ...editor.children[0] });
    }

    return () => deselectEditor();
  }, [initialBlocks]);

  useEffect(() => {
    window.addEventListener("mousemove", showHiddenElements);

    return () => {
      window.removeEventListener("mousemove", showHiddenElements);
    };
  }, []);

  useEffect(() => {
    if (threadUUID) {
      setTimeout(() => {
        handleCommentClick({
          uuid: threadUUID,
        });
      }, 500);
    } else if (reactionBlockUUID) {
      setSelectedObjectId(`reactions-${reactionBlockUUID}`);
      setTimeout(() => {
        scrollToBlock(reactionBlockUUID as string);
      }, 500);
    } else if (mentionBlockUUID) {
      setSelectedObjectId(`mentions-${mentionBlockUUID}`);
      setTimeout(() => {
        scrollToBlock(mentionBlockUUID as string);
      }, 500);
    } else if (reelUUID) {
      setSelectedObjectId(`reel-${reelUUID}`);
      // setTimeout(() => {
      //   handleReelClick({ id: reelUUID });
      // }, 500);
    }
  }, [threadUUID, reactionBlockUUID, mentionBlockUUID, reelUUID]);

  const showHiddenElements = (e) => {
    if (e.movementX !== 0 || e.movementY !== 0) {
      setZenMode(false);
    }
  };

  const fetchMoreStudioMembers = async () => {
    let membersResult = await StudioService.getMembers(
      studioMembersNext.current
    );
    studioMembers.current = [
      ...studioMembers.current,
      ...membersResult.data.data
        .filter((member) => !member.isRemoved)
        .map((member) => {
          return { ...member.user, type: "user" };
        }),
    ];
    studioMembersNext.current = parseInt(membersResult.data.next);
    setFilteredItems([...studioRoles.current, ...studioMembers.current]);
  };

  const getSearchedMembers = async (search: string) => {
    try {
      const r = await StudioService.searchStudioMembers(search);
      const newMembers = r?.data?.data || [];
      searchedMembers.current = newMembers
        .filter((member) => !member.isRemoved)
        .map((member) => {
          return { ...member.user, type: "user" };
        });
    } catch (err) {}
  };

  const fetchStudioRoles = async () => {
    let rolesResult = await StudioService.getStudioRoles();
    studioRoles.current = rolesResult.data.data.map((role) => {
      return { ...role, type: "role" };
    });
  };

  const startSearch = async (commandType, searchText) => {
    setIsSearchingCmd(true);
    switch (commandType) {
      case COMMAND_TYPE.SLASH_COMMANDS:
        {
          let search = searchText.split("/")[1];
          const entry = Editor.node(editor, [editor.selection.anchor.path[0]]);
          const ALLOWED_BLOCK_TYPES = ["olist", "ulist", "checklist", "image"];
          const [node, path] = entry;
          if (node.type === "simple_table_v1") {
            const filterItems = SLASH_COMMAND_OPTIONS.filter(
              (c) =>
                c.alt.some((el) => el.startsWith(search.toLowerCase())) &&
                ALLOWED_BLOCK_TYPES.includes(c.type)
            );
            setFilteredItems(filterItems);
          } else {
            const filterItems = SLASH_COMMAND_OPTIONS.filter((c) =>
              c.alt.some((el) => el.startsWith(search.toLowerCase()))
            );
            setFilteredItems(filterItems);
          }
        }
        break;
      case COMMAND_TYPE.USER_MENTION:
        {
          let search = searchText.split("@")[1];
          if (search?.length > 0) {
            await getSearchedMembers(search);
            if (studioRoles.current.length === 0) {
              await fetchStudioRoles();
            }
            let filteredRoles = studioRoles.current.filter((role) =>
              role.name.includes(search)
            );
            setFilteredItems([...filteredRoles, ...searchedMembers.current]);
          } else {
            if (
              studioRoles.current.length === 0 &&
              studioMembers.current.length === 0
            ) {
              Promise.all([fetchStudioRoles(), fetchMoreStudioMembers()])
                .then((r) => {
                  setFilteredItems([
                    ...studioRoles.current,
                    ...studioMembers.current,
                  ]);
                })
                .catch((err) => {});
            } else {
              if (studioRoles.current.length === 0) {
                await fetchStudioRoles();
              }

              if (studioMembers.current.length === 0) {
                await fetchMoreStudioMembers();
              }
              setFilteredItems([
                ...studioRoles.current,
                ...studioMembers.current,
              ]);
            }
          }
        }
        break;
      case COMMAND_TYPE.PAGE_MENTION:
        {
          let search = searchText.split("[")[1];

          const canvasSearchResponse =
            await CanvasBranchService.searchBranchNavData({ query: search });
          // let res = await ExploreService.getSearch(search);
          // const { data: result } = res;
          const resultPages = canvasSearchResponse.data.repos.filter((page) =>
            page.name.toLowerCase().includes(search.toLowerCase())
          );
          const newPageItem = {
            name: search || "Untitled",
            id: -1,
            type: "canvas",
          };
          setFilteredItems([newPageItem, ...resultPages]);
        }

        break;
      case COMMAND_TYPE.BIP_MARKS: {
        if (editor.selection) {
          const entry = Editor.node(editor, [editor.selection.anchor.path[0]]);
          const [node, path] = entry;
          if (node.type === "simple_table_v1") {
            closeSlashCommands();
            setIsSearchingCmd(false);
          }
        }
        setFilteredItems([]);
        let searchTxt = searchText.split("//")[1];
        const bipMarksResp = await UserService.getBipMarks();
        setFilteredItems(
          bipMarksResp.data.data.map((bipMark) => {
            return {
              ...bipMark,
              type: "bipMark",
            };
          })
        );
      }
    }
    setIsSearchingCmd(false);
  };

  const handleListTab = (event: any) => {
    const editorBlocks = editor.children;
    const selection = editor.selection;
    const curBlockIndex = selection?.anchor?.path[0];
    if (editorBlocks?.length && curBlockIndex >= 0) {
      const editorBlock = editorBlocks[curBlockIndex];

      const attributes = editorBlock?.attributes;
      if (editorBlock.type === "simple_table_v1") {
        event.preventDefault();
        if (event.shiftKey) {
          Transforms.move(editor, {
            distance: 1,
            unit: "line",
            reverse: true,
          });
          return;
        }
        Transforms.move(editor, {
          distance: 1,
          unit: "line",
        });

        return;
      }
      event.preventDefault();
      const [match] = Editor.nodes(editor, {
        match: (n) => LIST_TYPES.includes(n?.type),
      });
      const level = match && match[0]?.attributes?.level;
      if (event.shiftKey) {
        const properties =
          level > 1
            ? {
                attributes: {
                  ...attributes,
                  level: level - 1,
                },
              }
            : {
                type: "text",
                attributes: {},
              };
        Transforms.setNodes<SlateElement>(
          editor,
          properties as Partial<SlateElement>,
          {
            match: (n) =>
              Editor.isBlock(editor, n) && LIST_TYPES.includes(n?.type),
          }
        );
      } else {
        const properties =
          level >= 1
            ? {
                attributes: {
                  ...attributes,
                  level: level < 5 ? level + 1 : level,
                },
              }
            : {
                type: recentBlockType,
                attributes: {
                  level: 1,
                },
              };

        Transforms.setNodes<SlateElement>(
          editor,
          properties as Partial<SlateElement>,
          {
            match: (n) =>
              Editor.isBlock(editor, n) &&
              !["heading1", "callout", "code"].includes(n.type),
          }
        );
      }
    }
  };

  const onKeyDown = useCallback(
    (event) => {
      setZenMode(true);
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event as any)) {
          event.preventDefault();
          const mark = HOTKEYS[hotkey];
          toggleMark(editor, mark);
        }
      }

      for (const shortcut in KEYBOARD_SHORTCUTS) {
        if (
          isHotkey(shortcut, event as any) &&
          editor.selection &&
          Range.isCollapsed(editor.selection)
        ) {
          switch (KEYBOARD_SHORTCUTS[shortcut]) {
            case "move-up":
              event.preventDefault();
              Transforms.moveNodes(editor, {
                at: [editor.selection.anchor.path[0]],
                to: [editor.selection.anchor.path[0] - 1],
              });
              break;
            case "move-down":
              event.preventDefault();
              Transforms.moveNodes(editor, {
                at: [editor.selection.anchor.path[0]],
                to: [editor.selection.anchor.path[0] + 1],
              });

              break;
            default:
            // code block
          }
        }
      }

      if (target) {
        //This is when command menu is opened
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            const prevIndex =
              index >= filteredItems.length - 1 ? index : index + 1;
            setIndex(prevIndex);
            break;
          case "ArrowUp":
            event.preventDefault();
            const nextIndex = index <= 0 ? index : index - 1;
            setIndex(nextIndex);
            break;
          case "Enter":
            event.preventDefault();
            handleCommand({
              newBlockType: filteredItems[index].type,
              data: filteredItems[index],
            });
            break;
          case "Escape":
            event.preventDefault();
            setTarget(null);
            setFilteredItems([]);
            break;
          case "Space":
            event.preventDefault();
            setTarget(null);
            setFilteredItems([]);
            break;
        }
      } else {
        switch (event.key) {
          case "Tab":
            handleListTab(event);
            break;
          default:
            break;
        }
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        addToast("bip auto-saves your work!", {
          appearance: "info",
          autoDismiss: true,
        });
      }

      if (
        BRACKETS.some((x) => x.opening === event.key) &&
        editor.selection &&
        !Range.isCollapsed(editor.selection) &&
        !target
      ) {
        event.preventDefault();
        Transforms.insertText(editor, event.key, {
          at: Range.start(editor.selection),
        });
        Transforms.insertText(
          editor,
          BRACKETS.find((x) => x.opening === event.key)?.closing,
          { at: Range.end(editor.selection) }
        );
        Transforms.move(editor, {
          distance: 1,
          unit: "character",
          reverse: true,
          edge: "end",
        });
      }

      if (
        event.shiftKey &&
        event.key === "Enter" &&
        !editor.isVoid(editor.children[editor.selection.anchor.path[0]]) &&
        !target
      ) {
        event.preventDefault();
        Transforms.insertText(editor, "\n", {
          at: editor.selection.anchor,
        });
      }
      if (
        event.key === "Backspace" &&
        editor.selection.anchor.path.length === 5
      ) {
        const [[node, path]] = Array.from(
          Editor.nodes(editor, {
            at: editor.selection.anchor.path.slice(0, 4),
            match: (n, p) => n.cellUUID,
          })
        );

        if (Node.string(node) === "" && node.type.includes("list")) {
          Transforms.setNodes(
            editor,
            {
              type: "text",
              attributes: {},
            },
            {
              at: editor.selection.anchor.path.slice(0, 4),
            }
          );
          event.preventDefault();
        }
      }
    },
    [index, target, filteredItems]
  );

  const initialValue = initialBlocks[0].scope === "create" ? [] : initialBlocks;

  const closeSlashCommands = () => {
    setIndex(0);
    setFilteredItems([]);
    setTarget(null);
  };

  const onDocumentChanged = (newValue) => {
    const operations = editor.operations;
    const isAstChange = operations.some((op) => "set_selection" !== op.type);
    const isCommentOp = operations.some((op) => op.commentOp);
    const { selection } = editor;

    const isFocused = operations.some((op) => op.type === "set_selection");

    let commandHandled = false;
    if (isFocused) {
      forceRerender();
    }
    if (showFakeSelection) {
      setShowFakeSelection(false);
    }

    if (isAstChange && !isCommentOp) {
      if (branch?.mergeRequest?.status === "OPEN") {
        alert("Please cancel your merge request before editing again.");
        return;
      }
      const existingRoughBranch = branches.find(
        (br) => br.isRoughBranch && br.roughFromBranchID === branch.id
      );
      if (existingRoughBranch) {
        if (!switchedToExistingRough.current) {
          router.push(
            BipRouteUtils.getCanvasRoute(
              currentStudio?.handle!,
              repo?.name!,
              existingRoughBranch.id
            )
          );

          switchedToExistingRough.current = true;
          addToast("Switched to existing rough branch", {
            appearance: "success",
            autoDismiss: true,
          });
          deselectEditor();
        }
        return;
      }

      setPendingSave(true);

      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        if (operation.attributionOp) {
          continue;
        }

        if (operation.type === "set_selection") {
          if (!commandHandled) {
            closeSlashCommands();
          }
        }

        if (operation.type !== "set_selection") {
          if (operation.createdBlockUUID) {
            if (
              !transactions.current.some(
                (transaction) =>
                  transaction.uuid === operation.createdBlockUUID &&
                  transaction.scope === "create"
              )
            ) {
              transactions.current.push({
                scope: "create",
                uuid: operation.createdBlockUUID,
              });
            }
          }
          if (operation.editedBlockUUID) {
            if (
              !transactions.current.some(
                (transaction) =>
                  transaction.uuid === operation.editedBlockUUID &&
                  transaction.scope === "update"
              )
            ) {
              transactions.current.push({
                scope: "update",
                uuid: operation.editedBlockUUID,
              });
            }
          }
          if (operation.deletedBlockUUID) {
            if (
              !transactions.current.some(
                (transaction) =>
                  transaction.uuid === operation.deletedBlockUUID &&
                  transaction.scope === "delete"
              )
            ) {
              transactions.current.push({
                scope: "delete",
                uuid: operation.deletedBlockUUID,
              });
            }
          }
        }

        if (
          (operation.type === "insert_text" ||
            operation.type === "insert_node") &&
          operation.path.length < 3 // note: done to ignore alt text inserted in media nodes
        ) {
          let insertedText: string;
          if (operation.type === "insert_text") {
            insertedText = operation.text;
          } else {
            insertedText = operation.node.text
              ? operation.node.text
              : operation.node.children?.length > 0
              ? operation.node.children[0].text
              : "";
          }
          if (insertedText && insertedText.length > 10) {
            //Arbitrary check to avoid processing on each keystroke and other smaller words which will definitely not match a url
            const embedObj = getEmbedLink(insertedText);

            if (embedObj?.url) {
              setCommandType(COMMAND_TYPE.AUTO_EMBED);
              const selectionStart = Editor.before(editor, editor.selection, {
                unit: "character",
                distance: insertedText.length,
              });
              setTarget(
                Editor.range(editor, selectionStart, editor.selection.anchor)
              );
              setFilteredItems([
                { type: "embed", text: "Embed" },
                { type: "cancel", text: "Cancel" },
              ]);
              commandHandled = true;
            }
          }
        }
      }

      if (isCreatingNewRough) {
        return;
      }

      saveBlocks();
    }

    if (
      selection &&
      Range.isCollapsed(selection) &&
      editor?.children[0]?.type !== "loading" &&
      !commandHandled
    ) {
      const [start] = Range.edges(selection);

      const charBeforePoint = Editor.before(editor, start, {
        unit: "word",
      });
      let charBefore = charBeforePoint
        ? Editor.string(editor, {
            anchor: charBeforePoint,
            focus: start,
          })
        : "";

      if (charBefore.includes(" ")) {
        charBefore = charBefore.split(" ")[1];
      }

      const wordBeforePoint = Editor.before(editor, start, { unit: "word" });
      const before = wordBeforePoint && Editor.before(editor, wordBeforePoint);

      let beforeRange = ["/", "@", "[", "//"].includes(charBefore)
        ? Editor.range(editor, charBeforePoint, start)
        : before
        ? Editor.range(editor, before, start)
        : null;

      const isAcrossBlocks = beforeRange && isRangeAcrossBlocks(beforeRange);

      const beforeText =
        beforeRange && !isAcrossBlocks && Editor.string(editor, beforeRange);
      let beforeMatch;
      let mType;
      const slashCommandRegex = /\/\w*$/;
      const userMentionRegex = /@\w*$/;
      const pageMentionRegex = /\[\w*$/;
      const bipMarksRegex = /\/\/\w*$/;
      if (beforeText) {
        if (bipMarksRegex.test(beforeText)) {
          mType = COMMAND_TYPE.BIP_MARKS;
          beforeMatch = true;
        } else if (userMentionRegex.test(beforeText)) {
          mType = COMMAND_TYPE.USER_MENTION;
          beforeMatch = true;
        } else if (pageMentionRegex.test(beforeText)) {
          mType = COMMAND_TYPE.PAGE_MENTION;
          beforeMatch = true;
        } else if (slashCommandRegex.test(beforeText)) {
          mType = COMMAND_TYPE.SLASH_COMMANDS;
          beforeMatch = true;
        }
      }
      setCommandType(mType);
      if (beforeMatch && beforeText) {
        if (beforeRange?.anchor.path[0] !== beforeRange?.focus?.path[0]) {
          beforeRange = {
            ...beforeRange,
            anchor: {
              path: [beforeRange?.focus?.path[0]],
              offset: 0,
            },
          };
        }
        setTarget(beforeRange);
        startSearch(mType, beforeText);
        setIndex(0);
        return;
      } else {
        setTarget(null);
      }
    }
  };

  const deselectEditor = () => {
    Transforms.deselect(editor);
  };

  const selectAndFocusEditor = () => {
    if (isNew) {
      return;
    }
    if (!editor.selection) {
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    }
    ReactEditor.focus(editor);
  };

  const saveBlocks = async () => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (process.browser) {
      window.onbeforeunload = () => {
        window.onbeforeunload = null;
        return "You have unsaved changes! Do you want to leave?";
      };
    }

    let tmpBranch: any = branch;
    if (!isCreatingNewRough) {
      const existingRoughBranch = branches.find(
        (br) => br.isRoughBranch && br.roughFromBranchID === branch.id
      );

      let isNewRough;
      if (!branch?.isRoughBranch && !existingRoughBranch && repo?.isPublished) {
        try {
          setIsCreatingNewRough(true);
          segmentEvents.canvasEdited(
            currentStudio?.handle,
            repo.key,
            repo.name,
            "",
            branch?.contributorsList?.length!
          );
          const { data: roughBranchResp } =
            await CanvasBranchService.createRoughBranch(branch?.id!, {
              canvasRepoId: repo?.id!,
              collectionId: repo?.collectionID!,
              parentCanvasRepoId: repo.parentCanvasRepositoryID ?? 0,
            });
          tmpBranch = {
            ...roughBranchResp.data,
            permissionGroup: schema?.canvas.permissionGroups.find(
              (permissionGroup: PermissionGroup) =>
                permissionGroup.systemName === roughBranchResp.data.permission
            ),
            isNewRough: true,
          };

          const tempPages = [
            ...pages,
            {
              ...tmpBranch,
              parent: tmpBranch?.canvasRepositoryId,
            },
          ];
          updatePages(tempPages);

          // Drafts
          setDrafts([{ ...tmpBranch, parent: 1 }, ...drafts]);

          setBranches([...branches, tmpBranch]);
          setBranch(tmpBranch);
          setIsCreatingNewRough(false);

          window.onbeforeunload = null;
          branchRef.current = tmpBranch;
          router.push(
            {
              pathname: BipRouteUtils.getCanvasRoute(
                currentStudio?.handle!,
                repo?.name,
                branch?.id!
              ),
              query: {
                // ...router.query,
                isRough: true,
                roughBranchId: tmpBranch.id,
              },
            },
            undefined,
            { shallow: true }
          );

          addToast("Created Rough Branch successfully", {
            appearance: "success",
            autoDismiss: true,
          });
        } catch (error) {
          addToast("Failed to create rough branch", {
            appearance: "error",
            autoDismiss: true,
          });
          setIsSaving(false);
          setPendingSave(false);
          window.onbeforeunload = null;
          return;
        }
      }
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      const curTransactions = [...transactions.current];

      transactions.current = [];
      if (editor.children.length === 0) {
        return;
      }
      try {
        const resp = await BlocksService.saveBlocks(tmpBranch?.id!, {
          blocks: filterAndBuildTransactions(
            blocks,
            editor.children,
            curTransactions,
            tmpBranch.isNewRough
          ),
        });

        const newBlocks = resp?.data?.data?.map((block) => {
          const transactionIndex = curTransactions.findIndex(
            (transaction) => transaction.uuid === block.uuid
          );
          if (transactionIndex !== -1) {
            const blockInEditor = editor.children.find(
              (editorBlock) => editorBlock?.uuid === block?.uuid
            );
            if (!blockInEditor) {
              return block;
            }
            const { children, type, rank, attributes } = blockInEditor;
            return {
              ...block,
              children,
              type,
              rank,
              attributes,
            };
          } else {
            return block;
          }
        });
        setBlocks(newBlocks);
        setLocalCanvasBlocks(branch?.id, {
          blocks: newBlocks,
          cachedForUserId: user?.id,
          lastUpdated: branch?.updatedAt,
          branchId: branch?.id,
        });
        setIsSaving(false);
        setPendingSave(false);
        window.onbeforeunload = null;
        setLastSaved(Date.now());
      } catch (error) {
        addToast("Save failed try again later, refreshing...", {
          appearance: "error",
          autoDismiss: true,
        });
        setIsSaving(false);
        setPendingSave(false);
        window.onbeforeunload = null;
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    }, 2000);
  };

  const createMention = async (item) => {
    try {
      if (item?.type === "canvas" && item?.id === -1) {
        const siblingsCount = pages.filter(
          (page) => page.parent === repo?.id
        ).length;
        const resp = await CollectionService.createSubCanvas({
          name: item.name,
          collectionID: repo?.collectionID,
          parentCanvasRepositoryID: repo?.id,
          position: siblingsCount,
        });
        item = resp.data.data;
        const tempPages = [...pages];
        tempPages.push(item);
        updatePages(tempPages);
      }

      const payload =
        item.type === "user"
          ? {
              objectUUID: editor.children[editor.selection.anchor.path[0]].uuid,
              scope: "block",
              users: [item?.id],
              canvasBranchId: branch?.id,
            }
          : item.type === "role"
          ? {
              objectUUID: editor.children[editor.selection.anchor.path[0]].uuid,
              scope: "block",
              roles: [item?.id],
              canvasBranchId: branch?.id,
            }
          : {
              objectUUID: editor.children[editor.selection.anchor.path[0]].uuid,
              scope: "block",
              branches: [item?.defaultBranchID],
              canvasBranchId: branch?.id,
            };
      segmentEvents.mentionAdded(
        item.type,
        "block",
        user?.username!,
        item?.username,
        "",
        currentStudio?.handle!,
        repo?.key!,
        0
      );
      const mentionResponse = await BlocksService.mentionUsers(payload);
      return mentionResponse.data;
    } catch (error) {}
  };

  const addMention = async (item) => {
    if (!item) {
      item = filteredItems[index];
    }
    const createdMention = await createMention(item);
    editor.insertNode({
      children: [{ text: "" }],
      type:
        item.type === "user" || item.type === "role"
          ? "userMention"
          : "pageMention",
      mention: { ...createdMention[0], branchId: item.defaultBranchID },
      uuid: uuidv4(),
    });
    editor.insertNode({ text: "" });
    Transforms.move(editor, { distance: 1, unit: "offset" });
    ReactEditor.focus(editor);
  };

  const addBipMark = (discordMessage: any) => {
    segmentEvents.bipMarkUsed(
      "discord",
      repo?.key!,
      currentStudio?.handle!,
      user?.username!
    );
    let blockFormat = [];
    let currentBlockType =
      editor.children[editor.selection.anchor.path[0]].type;
    if (discordMessage?.text) {
      let fakeTextBlock = {
        children: [
          {
            text: discordMessage?.text,
          },
        ],
        uuid: uuidv4().toLowerCase(),
        attributes: {
          messageId: discordMessage?.uuid,
          author: discordMessage?.author,
        },
        reactions: [],
        reelCount: 0,
        type: "bipmark",
      };
      blockFormat.push(fakeTextBlock);
    }

    if (discordMessage?.attachments?.length) {
      discordMessage?.attachments.forEach((attachment) => {
        const isImg = ["jpg", "jpeg", "png", "gif"].includes(
          attachment.split(".")[attachment.split(".").length - 1]
        );
        let inlineImageBlock = {
          children: [
            {
              text: "",
            },
            {
              children: [{ text: "" }],
              uuid: uuidv4().toLowerCase(),
              type: isImg ? "image" : "attachment",
              url: attachment,
            },
            {
              text: "",
            },
          ],
          uuid: uuidv4().toLowerCase(),
          attributes: {
            messageId: discordMessage?.uuid,
            author: discordMessage.author,
          },
          type: "bipmark",
        };

        blockFormat.push(inlineImageBlock);
      });
    }

    blockFormat.forEach((block, i) => {
      if (
        Range.isCollapsed(editor.selection) &&
        Editor.string(editor, [editor.selection.anchor.path[0]]) === "" &&
        !editor.children[editor.selection.anchor.path[0]].children.some(
          (child) => child?.type?.includes("Mention")
        )
      ) {
        Transforms.removeNodes(editor);
        Transforms.insertNodes(editor, block);
      } else {
        Transforms.insertNodes(editor, block);
      }
    });
    // if (
    //   blockFormat.length &&
    //   blockFormat[blockFormat.length - 1].type === "image"
    // ) {
    //   Transforms.insertNodes(editor, {
    //     type: "text",
    //     uuid: uuidv4(),
    //     children: [{ text: "" }],
    //   });
    // }
  };

  const handleCommand = (options) => {
    const { newBlockType = "", data } = options;

    const isInlineVoid = INLINE_VOID_BLOCK_TYPES.includes(newBlockType);
    const isMediaBlockType = MEDIA_BLOCK_TYPES.includes(newBlockType);
    let wordToDelete;
    if (target && newBlockType !== "cancel") {
      wordToDelete = Editor.string(editor, target) ?? "";
      if (wordToDelete.includes(" ")) {
        wordToDelete = wordToDelete.split(" ")[1];
      }
      Transforms.delete(editor, {
        distance: wordToDelete.length,
        unit: "character",
        reverse: true,
      });
      setTarget(null);
      setFilteredItems([]);
    }

    switch (commandType) {
      case COMMAND_TYPE.SLASH_COMMANDS: {
        if (newBlockType === "simple_table_v1") {
          const tableUUID = uuidv4();
          const table = {
            type: "simple_table_v1",
            uuid: tableUUID,
            attributes: {},
            reactions: [],
            reelCount: 0,
            children: [...Array(2)].map(() => {
              const rowUUID = uuidv4();
              return {
                type: "table-row",
                uuid: rowUUID,
                children: [...Array(2)].map(() => {
                  const cellUUID = uuidv4();
                  return {
                    type: "table-cell",
                    children: [
                      {
                        type: "text",
                        children: [{ text: "" }],
                        uuid: uuidv4(),
                        attributes: {},
                        cellUUID,
                        rowUUID,
                        tableUUID,
                      },
                    ],
                    tableUUID,
                    uuid: cellUUID,
                    rowUUID,
                  };
                }),

                tableUUID,
              };
            }),
          };
          Transforms.insertNodes(editor, table);
          const firstCellPath = [
            ...editor.selection.anchor.path.slice(0, 1),
            0,
            0,
            0,
            0,
          ];
          Transforms.setSelection(editor, {
            anchor: {
              path: firstCellPath,
              offset: 0,
            },
            focus: {
              path: firstCellPath,
              offset: 0,
            },
          });

          Transforms.insertNodes(
            editor,
            {
              type: "text",
              children: [{ text: "" }],
              uuid: uuidv4(),
              attributes: {},
            },
            {
              at: [firstCellPath[0] + 1],
            }
          );
          return;
        } else if (isMediaBlockType) {
          insertInlineVoid(editor, newBlockType);
          return;
        } else if (isInlineVoid) {
          let textToInsert = "";
          switch (newBlockType) {
            case "userMention":
              textToInsert = "@";
              break;
            case "pageMention":
              textToInsert = "[";
              break;
            default:
              break;
          }
          Transforms.insertText(editor, textToInsert);
          return;
        } else {
          const isActive = isBlockActive(editor, newBlockType);
          const isList = LIST_TYPES.includes(newBlockType);
          const isCheckList = newBlockType === "checklist";
          let newProperties: Partial<SlateElement>;

          newProperties = {
            type: isActive && !target ? "text" : newBlockType,
          };
          if (newBlockType === "callout") {
            newProperties.attributes = {
              calloutType: CALLOUT_TYPES[0].type,
            };
          }
          if (newBlockType === "code") {
            newProperties.attributes = { codeLanguage: "js" };
          }
          if (isCheckList) {
            newProperties.attributes = { level: 1, checked: false };
          } else if (isList) {
            newProperties.attributes = { level: 1 };
          }

          if (isList) {
            setRecentBlockType(newBlockType);
          }
          Transforms.setNodes<SlateElement>(editor, newProperties);
        }
        break;
      }
      case COMMAND_TYPE.USER_MENTION: {
        addMention(data);
        break;
      }
      case COMMAND_TYPE.PAGE_MENTION: {
        addMention(data);
        break;
      }
      case COMMAND_TYPE.AUTO_EMBED: {
        if (newBlockType === "cancel") {
          closeSlashCommands();
        } else if (newBlockType === "embed") {
          insertInlineVoid(editor, newBlockType, null, wordToDelete);
        }
        break;
      }
      case COMMAND_TYPE.BIP_MARKS:
        {
          addBipMark(data);
        }
        break;
      default:
    }
  };

  const decorate = useCallback(
    ([node, path]) => {
      const ranges = [];
      if (node.type == "code") {
        let text: string = "";
        node.children.forEach((child) => {
          text += child.text;
        });

        const tokens = Prism.tokenize(
          text,
          Prism.languages[
            node.attributes?.codeLanguage
              ? ALLOWED_LANGUAGES.includes(node.attributes?.codeLanguage)
                ? node.attributes?.codeLanguage
                : "markdown"
              : "js"
          ]
        );
        let start = 0;
        for (const token of tokens) {
          const length = getLength(token);
          const end = start + length;

          if (typeof token !== "string") {
            ranges.push({
              [token.type]: true,
              anchor: { path, offset: start },
              focus: { path, offset: end },
            });
          }

          start = end;
        }
      }
      // Markdown-preview for blocks only
      if (Text.isText(node) && !node?.inlineCode) {
        const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
        let start = 0;
        for (const token of tokens) {
          const length = getLength(token);
          const end = start + length;

          if (typeof token !== "string" && token?.type !== "code") {
            ranges.push({
              [token.type]: true,
              anchor: { path, offset: start },
              focus: { path, offset: end },
            });
          }
          start = end;
        }
      }

      if (!props.isReadOnly && path.length === 1) {
        if (editor.selection != null) {
          if (
            !Editor.isEditor(node) &&
            Editor.string(editor, [path[0]]) === "" &&
            editor.children[path[0]].type === "text" &&
            !editor.children[path[0]].children.some((child) =>
              INLINE_VOID_BLOCK_TYPES.includes(child.type)
            ) &&
            Range.includes(editor.selection, path) &&
            Range.isCollapsed(editor.selection)
          ) {
            return [
              {
                ...editor.selection,
                placeholder: "Type '/' for options",
              },
            ];
          }
        } else {
          if (
            !Editor.isEditor(node) &&
            Editor.string(editor, [path[0]]) === "" &&
            editor.children[path[0]].type === "text" &&
            !editor.children[path[0]].children.some((child) =>
              INLINE_VOID_BLOCK_TYPES.includes(child.type)
            ) &&
            editor.children.length === 1
          ) {
            return [
              {
                anchor: { path: [0, 0], offset: 0 },
                focus: { path: [0, 0], offset: 0 },
                placeholder: "Tap here to start",
              },
            ];
          }
        }
      }
      if (path.length === 0 && showFakeSelection) {
        ranges.push({ ...editor.selection, selection: true });
      }
      if (path.length === 2) {
        const matches = node.text?.matchAll(FIND_MULTIPLE_LINK_REGEX) ?? [];
        let i = 0;
        for (const link of matches) {
          let start = link.index;
          let end = start + link[0].length;
          ranges.push({
            anchor: { path, offset: start },
            focus: { path, offset: end },
            link: getHttpLink(link[0]),
          });
          i++;
        }

        const emailMatches =
          node.text?.matchAll(FIND_MULTIPLE_EMAIL_REGEX) ?? [];
        i = 0;
        for (const link of emailMatches) {
          let start = link.index;
          let end = start + link[0].length;
          ranges.push({
            anchor: { path, offset: start },
            focus: { path, offset: end },
            link: getHttpLink("mailto: " + link[0]),
          });
          i++;
        }
      }
      return ranges;
    },
    [showFakeSelection]
  );

  const renderElement = useCallback(
    (props: any) => (
      <Element
        {...remProps}
        {...props}
        actions={{
          insertInlineVoid,
          addMark,
          handleCommentClick,
        }}
        addReel={addReel}
        isReadOnly={remProps.isReadOnly}
      />
    ),
    [remProps.isReadOnly]
  );

  const renderLeaf = useCallback(
    (props: any) => {
      return (
        <Leaf
          {...props}
          showHighlights={true}
          selectedObjectId={selectedObjectId}
        />
      );
    },
    [selectedObjectId]
  );

  const addMark = (commentThreadUUID?: string) => {
    const { focus } = editor.selection;

    if (Range.isCollapsed(editor.selection)) {
      const currentBlockIndex = focus.path[0];
      Transforms.select(editor, {
        anchor: Editor.start(editor, [currentBlockIndex]),
        focus: Editor.end(editor, [currentBlockIndex]),
      });
    }

    Editor.addMark(
      editor,
      `${COMMENT_THREAD_PREFIX}${commentThreadUUID}`,
      true
    );
  };

  const scrollToBlock = useCallback(
    (blockUUID: string) => {
      if (findTextNodeAndSelectEditor(editor, blockUUID).length > 0) {
        if (editor.selection) {
          setCurrentBlock({
            ...editor.children[editor.selection.focus.path[0]],
          });

          let rect = ReactEditor.toDOMRange(
            editor,
            editor.selection
          ).getBoundingClientRect();

          document.getElementById("studio-layout-content")?.scrollTo({
            top:
              rect.top +
              document.getElementById("studio-layout-content")?.scrollTop! -
              300,
            behavior: "smooth",
          });
        }
      } else {
        const slateBlock = getBlock(blockUUID);

        if (slateBlock) {
          setCurrentBlock({ ...slateBlock });

          let rect = ReactEditor.toDOMNode(
            editor,
            slateBlock
          ).getBoundingClientRect();

          document.getElementById("studio-layout-content")?.scrollTo({
            top:
              rect.top +
              document.getElementById("studio-layout-content")?.scrollTop! -
              300,
            behavior: "smooth",
          });
        }
      }
    },
    [editor]
  );

  const handleCommentClick = useCallback(
    (thread: ThreadType) => {
      const uuid = thread.uuid;
      setSelectedObjectId(`thread-${uuid}`);
      // if (findTextNodeAndSelectEditor(editor, uuid).length > 0) {
      //   if (editor.selection) {
      //     setCurrentBlock({
      //       ...editor.children[editor.selection.focus.path[0]],
      //     });

      //     let rect = ReactEditor.toDOMRange(
      //       editor,
      //       editor.selection
      //     ).getBoundingClientRect();

      //     document.getElementById("studio-layout-content")?.scrollTo({
      //       top:
      //         rect.top +
      //         document.getElementById("studio-layout-content")?.scrollTop! -
      //         300,
      //       behavior: "smooth",
      //     });
      //   }
      // } else {
      //   const slateBlock = getBlock(thread.startBlockUUID);

      //   if (slateBlock) {
      //     setCurrentBlock({ ...slateBlock });

      //     let rect = ReactEditor.toDOMNode(
      //       editor,
      //       slateBlock
      //     ).getBoundingClientRect();

      //     document.getElementById("studio-layout-content")?.scrollTo({
      //       top:
      //         rect.top +
      //         document.getElementById("studio-layout-content")?.scrollTop! -
      //         300,
      //       behavior: "smooth",
      //     });
      //   }
      // }
    },
    [editor, setSelectedObjectId]
  );

  // Reels Click
  useEffect(() => {
    if (
      selectedObjectId &&
      reels?.length &&
      blocks?.length &&
      reelUUID &&
      selectedObjectId === `reel-${reelUUID}`
    ) {
      const selectedReel = reels.find(
        (reel: ReelType) => reel.uuid === reelUUID
      );
      if (selectedReel) {
        scrollToBlock(selectedReel.startBlockUUID as string);
      }
    }
  }, [selectedObjectId, reels, blocks, reelUUID]);

  const handleReelClick = useCallback(
    (reel) => {
      const uuid = reel.uuid;
      setSelectedObjectId(`reel-${uuid}`);

      const slateBlock = getBlock(reel.startBlockUUID);

      if (slateBlock) {
        setCurrentBlock({ ...slateBlock });

        let rect = ReactEditor.toDOMNode(
          editor,
          slateBlock
        ).getBoundingClientRect();

        document.getElementById("studio-layout-content")?.scrollTo({
          top:
            rect.top +
            document.getElementById("studio-layout-content")?.scrollTop! -
            300,
          behavior: "smooth",
        });
      }
    },
    [editor, setSelectedObjectId, reels]
  );

  return (
    <div
      className="flex"
      style={{
        paddingLeft: isXtraSmall ? "16px" : isSmall ? "32px" : "96px",
        paddingRight: isXtraSmall ? "16px" : isSmall ? "32px" : "96px",
      }}
    >
      <Box
        className="relative flex-1 mx-auto mb-80"
        id={"editor-container"}
        sx={{
          position: "relative",
          left: isLarge || isXtraLarge ? "64px" : "0px",
        }}
      >
        <Slate
          editor={editor}
          value={initialValue}
          onChange={onDocumentChanged}
        >
          <Box display={"flex"} className="justify-center flex-1">
            <Box
              id={"anywhere-on-editor-btn"}
              sx={{
                maxWidth: isXtraLarge ? "800px" : "600px",
              }}
              className="flex-1"
            >
              <div
                contentEditable={false}
                onKeyDown={(e) => {
                  if (
                    (e.key === "Tab" || e.key === "Enter") &&
                    !props.isReadOnly
                  ) {
                    e.preventDefault();
                    !makeEditable && setMakeEditable(true);
                    selectAndFocusEditor();
                  }
                }}
              >
                <CanvasTitle />
              </div>
              <Toolbar
                setShowFakeSelection={setShowFakeSelection}
                showFakeSelection={showFakeSelection}
                zenMode={zenMode}
              />
              {target && (
                <CommandMenu
                  isSearching={isSearchingCmd}
                  index={index}
                  target={target}
                  filteredItems={filteredItems}
                  handleCommand={handleCommand}
                  commandType={commandType}
                  studioRoles={studioRoles}
                  studioMembers={studioMembers}
                  fetchMoreStudioMembers={fetchMoreStudioMembers}
                  studioMembersNext={studioMembersNext}
                  setFilteredItems={setFilteredItems}
                />
              )}
              <Editable
                style={
                  !props.isReadOnly && !makeEditable ? { cursor: "text" } : {}
                }
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                decorate={decorate}
                readOnly={
                  isTabletOrMobile
                    ? props.isReadOnly
                    : props.isReadOnly || !makeEditable
                }
                onKeyDown={onKeyDown}
                onMouseDown={() => {
                  if (!props.isReadOnly && !makeEditable) {
                    setMakeEditable(true);
                  }
                }}
                scrollSelectionIntoView={() => {}} //Slate has weird default scroll behavior to keep the selection centered in screen. This is needed to disable the default
                onDrop={(e) => {
                  e.preventDefault();
                }}
                onPaste={(e) => {
                  if (IS_IOS) {
                    e.preventDefault();
                    ReactEditor.insertData(editor, e.clipboardData);
                  }
                }} //Removed the prevent default of onDrop here to handle file drop. Need  to watch out for potential issues!
              />
            </Box>
            {/* {isLarge || isXtraLarge ? (
              <RightBox
                addMark={addMark}
                handleCommentClick={handleCommentClick}
                handleReelClick={handleReelClick}
              />
            ) : null} */}
            {isLarge || isXtraLarge ? (
              <div
                style={{
                  width: "280px",
                  marginLeft: "35px",
                }}
                className="relative flex flex-col flex-shrink-0 h-full px-4 py-1 space-y-2"
                contentEditable={false}
              ></div>
            ) : null}
            {/* {!isXtraLarge && !isLarge && showAddComment && (
              <Overlay
                returnFocusRef={parentRef}
                ignoreClickRefs={[]}
                onEscape={() => setShowAddComment(false)}
                onClickOutside={() => setShowAddComment(false)}
                width="medium"
                top={100}
                left={window.innerWidth / 2 - 160}
                sx={{
                  position: "fixed",
                  maxHeight: window.innerHeight - 124,
                  overflowY: "scroll",
                }}
              >
                <CommentCard
                  showContainerBox={false}
                  addMark={addMark}
                  onPost={() => {
                    setShowAddComment(false);
                  }}
                  cancelHandler={() => {
                    setShowAddComment(false);
                  }}
                  tempSelection={tempSelection}
                />
              </Overlay>
            )}
            {!isXtraLarge && !isLarge && showPostToReel && (
              <Overlay
                returnFocusRef={parentRef}
                ignoreClickRefs={[]}
                onEscape={() => setShowPostToReel(false)}
                onClickOutside={() => setShowPostToReel(false)}
                width="medium"
                top={100}
                left={window.innerWidth / 2 - 160}
                sx={{
                  position: "fixed",
                  maxHeight: window.innerHeight - 124,
                  overflowY: "scroll",
                }}
              >
                <CreateReels
                  showContainerBox={false}
                  closeHandler={() => {
                    setShowPostToReel(false);
                  }}
                />
              </Overlay>
            )} */}
          </Box>
        </Slate>
        {isLargeDevice ? (
          <TableOfContents blocks={blocks} editor={editor} />
        ) : null}
      </Box>
    </div>
  );
};

export default SlateEditor;
