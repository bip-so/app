import { useRef, useEffect, useState, useCallback } from "react";
import { Editor, Range, Transforms } from "slate";
import {
  AnchoredOverlay,
  Box,
  IconButton,
  TextInput,
  Tooltip,
  useTheme,
} from "@primer/react";
import { useSlate, useFocused, ReactEditor } from "slate-react";
import {
  BoldIcon,
  CheckIcon,
  CodeIcon,
  ItalicIcon,
  LinkIcon,
  RssIcon,
  StrikethroughIcon,
  TriangleDownIcon,
} from "@primer/styled-octicons";
import UnderlineIcon from "../../../icons/UnderlineIcon";
import BlockTypeSelector from "./BlockTypeSelector";
import {
  isMarkActive,
  isRangeAcrossBlocks,
  toggleMark,
  useMouseDown,
  IS_IOS,
} from "../utils";
import { getHttpLink, isValidEmail, isValidLink } from "../../../utils/Common";
import StyledTextInput from "../../../components/StyledTextInput";
import AddCommentIcon from "./AddCommentIcon";
import AddReelIcon from "./AddReelIcon";
import SmileyIcon from "../../../icons/SmileyIcon";
import VerticalDivider from "../../../components/VerticalDivider";
import { CanvasPermissionEnum } from "../../Permissions/enums";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../hooks/useHasPermission";
import { useCanvas } from "../../../context/canvasContext";
import { useRightRail } from "../../../context/rightRailContext";
import Reactions from "../../../components/Reactions";
import BlocksService from "../services";
import { BlockType, CreateReactionType } from "../types";
import { useToasts } from "react-toast-notifications";
import { getUpdatedReactions } from "../../../utils/reactions";
import useRefDimensions from "../../../hooks/useRefDimensions";
import Colors from "../../../utils/Colors";
import { BranchAccessEnum } from "../../Canvas/enums";
import { useUser } from "../../../context/userContext";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import { invalidateCanvasBlocks } from "../../Canvas/utils";

const Toolbar = ({ setShowFakeSelection, showFakeSelection, zenMode }) => {
  const ref = useRef<HTMLDivElement | null>();
  const editor = useSlate();
  const inFocus = useFocused();
  const [showToolbar, setShowToolbar] = useState(false);
  const [isCurBlockATable, setIsCurBlockATable] = useState(false);

  const [blockTypeSelectorOpen, setBlockTypeSelectorOpen] = useState(false);
  const [openLinkTextBox, setOpenLinkTextBox] = useState(false);
  const isMouseDown = useMouseDown();
  const { isTabletOrMobile } = useDeviceDimensions();
  const { isLoggedIn } = useUser();
  var isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const {
    blocks,
    branch,
    setBlocks,
    setShowAddComment,
    setShowPostToReel,
    updateBlock,
    getBlock,
    pendingSave,
  } = useCanvas();
  const { addComment, setCurrentBlock, addReel, setSelectedObjectId } =
    useRightRail();
  const { addToast } = useToasts();
  const { isXtraSmall, isLarge, isXtraLarge } = useRefDimensions(
    editor.parentRef
  );
  const { colorMode } = useTheme();

  const hasCreateReelsPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_CREATE_REEL,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;

  const canCreateReels =
    isLoggedIn && hasCreateReelsPerm && !branch?.isRoughBranch;

  const hasAddReactionPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_ADD_REACTION,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;

  const canAddReaction = isLoggedIn && hasAddReactionPerm;

  const hasAddCommentPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_ADD_COMMENT,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;

  const canAddComment = isLoggedIn && hasAddCommentPerm;

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    if (isMouseDown) {
      return;
    }
    conditionallyToggleToolbar();
  }, [isMouseDown]);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    conditionallyToggleToolbar();
  }, [editor.selection]);

  const conditionallyToggleToolbar = () => {
    const el = ref.current;
    const { selection } = editor;
    if (
      !blockTypeSelectorOpen &&
      !openLinkTextBox &&
      !showFakeSelection &&
      (!selection ||
        !inFocus ||
        Range.isCollapsed(selection) ||
        Editor.string(editor, selection, { voids: true }) === "" ||
        isMouseDown)
    ) {
      el.removeAttribute("style");
      setOpenLinkTextBox(false);
      setShowFakeSelection(false);
      setShowToolbar(false);
      return;
    }

    setShowToolbar(true);
  };

  useEffect(() => {
    if (showToolbar && !zenMode && editor.selection != null) {
      let { selection } = editor;
      const el = ref.current;
      const isBackward = Range.isBackward(selection);
      const domRange = ReactEditor.toDOMRange(editor, selection);
      const rect = domRange?.getBoundingClientRect();
      const parentRect = document
        .getElementById("editor-container")
        ?.getBoundingClientRect();
      el.style.opacity = "1";
      let height = 32;
      if (isTabletOrMobile) {
        // if android => show toolbar below
        // if IOS => show toolbar above
        // if IOS and selection is backward => show toolbar below
        if ((IS_IOS && isBackward) || !IS_IOS) {
          height += 75;
        }
      }
      el.style.top =
        rect.top < 60
          ? `${document.getElementById("studio-layout-content")?.scrollTop}px`
          : `${
              rect.top -
              (parentRect ? parentRect.y : 0) -
              el.offsetHeight +
              height
            }px`;
      el.style.left = isXtraSmall
        ? "8px"
        : `${rect.left - (parentRect ? parentRect.x : 0)}px`;
      const entry = Editor.node(editor, [editor.selection.anchor.path[0]]);
      const [node, path] = entry;
      setIsCurBlockATable(node.type === "simple_table_v1");
    }
  }, [showToolbar, zenMode, editor.selection]);

  const handleAddItem = (type) => {
    if (editor.selection) {
      const [[slateBlock, _]] = Editor.nodes(editor, {
        at: { anchor: editor.selection.focus, focus: editor.selection.focus },
        match: (_, path) => path.length === 1,
      });
      setCurrentBlock({
        ...slateBlock,
      });
      if (type === "comment") {
        setShowAddComment(true);
      } else {
        setShowPostToReel(true);
      }
      // if (type === "comment") {
      //   setSelectedObjectId("add-comment");
      //   addComment(slateBlock, editor.selection);
      // } else {
      //   setSelectedObjectId("add-reel");
      //   addReel(slateBlock, editor.selection);
      // }
    }
  };

  const addOrRemoveReaction = useCallback(
    (emoji: string) => {
      const [[slateBlock, _]] = Editor.nodes(editor, {
        at: { anchor: editor.selection.focus, focus: editor.selection.focus },
        match: (_, path) => path.length === 1,
      });
      const block = getBlock(slateBlock.uuid);
      const data: CreateReactionType = {
        blockUUID: block.uuid,
        blockThreadID: 0,
        canvasBranchID: branch?.id!,
        scope: "block",
        emoji: emoji,
        reelCommentID: 0,
        blockCommentID: 0,
        reelID: 0,
      };
      if (
        block?.reactions?.find(
          (reaction) => reaction.emoji === emoji && reaction.reacted
        )
      ) {
        BlocksService.removeReaction(data)
          .then((r) => {
            const reactions = getUpdatedReactions(
              block?.reactions,
              emoji,
              "remove"
            );
            const updatedBlock = {
              ...slateBlock,
              reactions: reactions,
            };
            updateBlock(updatedBlock);
            setCurrentBlock(updatedBlock);
          })
          .catch((err) => {
            addToast("Something went wrong. Please try again", {
              appearance: "error",
              autoDismiss: true,
            });
          });
      } else {
        BlocksService.createReaction(data)
          .then((r) => {
            const reactions = getUpdatedReactions(block?.reactions, emoji);
            const updatedBlock = {
              ...slateBlock,
              reactions: reactions,
            };
            updateBlock(updatedBlock);
            setCurrentBlock(updatedBlock);

            invalidateCanvasBlocks(branch?.id);
          })
          .catch((err) => {
            addToast("Something went wrong. Please try again", {
              appearance: "error",
              autoDismiss: true,
            });
          });
      }
    },
    [blocks]
  );

  return showToolbar && !zenMode ? (
    <Box
      sx={{
        padding: "4px",
        position: "absolute",
        zIndex: 10,
        whiteSpace: "nowrap",
        top: "-10000px",
        left: "-10000px",
        marginTop: -6,
        bg: "toolbar.bg",
        borderRadius: 12,
        boxShadow:
          "0px 8px 24px rgba(66, 74, 83, 0.12), 0px 1px 3px rgba(27, 31, 36, 0.12);",
        display: "flex",
        alignItems: "center",
      }}
      ref={ref}
      onMouseDown={(e) => {
        // prevent toolbar from taking focus away from editor
        e.preventDefault();
      }}
    >
      <MarkButton
        format="bold"
        icon={BoldIcon}
        shouldShowToolTip={!isTabletOrMobile}
        tooltipText={`${isMac ? "cmd" : "ctrl"} + b`}
      />

      <MarkButton
        format="italic"
        icon={ItalicIcon}
        shouldShowToolTip={!isTabletOrMobile}
        tooltipText={`${isMac ? "cmd" : "ctrl"} + i`}
      />

      <MarkButton
        format="underline"
        icon={UnderlineIcon}
        shouldShowToolTip={!isTabletOrMobile}
        tooltipText={`${isMac ? "cmd" : "ctrl"} + u`}
      />

      <MarkButton
        format="strikethrough"
        icon={StrikethroughIcon}
        shouldShowToolTip={!isTabletOrMobile}
        tooltipText={`${isMac ? "cmd" : "ctrl"} + shift + x`}
      />
      <MarkButton
        format="inlineCode"
        icon={CodeIcon}
        shouldShowToolTip={!isTabletOrMobile}
        tooltipText={`${isMac ? "cmd" : "ctrl"} + e`}
      />
      {editor.selection && !isRangeAcrossBlocks(editor.selection) && (
        <LinkButton
          open={openLinkTextBox}
          setOpen={setOpenLinkTextBox}
          setShowFakeSelection={setShowFakeSelection}
        />
      )}
      {!isCurBlockATable && (
        <>
          <VerticalDivider
            height={"16px"}
            marginRight={"0px"}
            marginLeft={"8px"}
          />
          <BlockTypeSelector
            anchor={null}
            trailingIcon={TriangleDownIcon}
            at={editor.selection}
            open={blockTypeSelectorOpen}
            setOpen={setBlockTypeSelectorOpen}
            setShowFakeSelection={setShowFakeSelection}
          />
        </>
      )}
      {canAddComment || canAddReaction || canCreateReels ? (
        <VerticalDivider
          height={"16px"}
          marginRight={"8px"}
          marginLeft={"0px"}
        />
      ) : null}
      {canAddComment && (
        <IconButton
          sx={{
            display: "flex",
          }}
          id={"comment-toolbar-start-btn"}
          variant={"invisible"}
          onMouseDown={
            isLarge || isXtraLarge
              ? () => {
                  setShowFakeSelection(true);
                  handleAddItem("comment");
                }
              : () => {
                  if (editor.selection) {
                    const [[slateBlock, _]] = Editor.nodes(editor, {
                      at: {
                        anchor: editor.selection.focus,
                        focus: editor.selection.focus,
                      },
                      match: (_, path) => path.length === 1,
                    });
                    setCurrentBlock({
                      ...slateBlock,
                    });
                  }
                  setShowFakeSelection(true);
                  setShowAddComment(true);
                }
          }
          icon={(props) => (
            <AddCommentIcon
              {...props}
              color={
                colorMode === "day" ? Colors.gray["700"] : Colors.gray["300"]
              }
            />
          )}
          size="small"
        />
      )}
      {editor.selection &&
        !isRangeAcrossBlocks(editor.selection) &&
        canAddReaction &&
        !isTabletOrMobile && (
          <Reactions
            addReaction={addOrRemoveReaction}
            removeReaction={() => {}}
            emoji={""}
            count={0}
            reacted={false}
            color={
              colorMode === "day" ? Colors.gray["700"] : Colors.gray["300"]
            }
            onOpen={() => {
              setShowFakeSelection(true);
            }}
            onClose={() => {
              setShowFakeSelection(false);
            }}
            disabled={pendingSave}
          />
        )}
      {canCreateReels && (
        <IconButton
          sx={{
            display: "flex",
          }}
          variant={"invisible"}
          onMouseDown={() => {
            if (isLarge || isXtraLarge) {
              handleAddItem("reel");
            } else {
              if (editor.selection) {
                const [[slateBlock, _]] = Editor.nodes(editor, {
                  at: {
                    anchor: editor.selection.focus,
                    focus: editor.selection.focus,
                  },
                  match: (_, path) => path.length === 1,
                });
                setCurrentBlock({
                  ...slateBlock,
                });
              }
              setShowPostToReel(true);
            }

            const startBlockIndex = Range.start(editor.selection).path[0];
            const endBlockIndex = Range.end(editor.selection).path[0];
            Transforms.select(editor, {
              anchor: Editor.start(editor, [startBlockIndex]),
              focus: Editor.end(editor, [endBlockIndex]),
            });

            //timeout to ensure the editor onchange triggered from the above line does not set the state back to false again
            setTimeout(() => {
              setShowFakeSelection(true);
            }, 100);
          }}
          icon={(props) => (
            <RssIcon
              sx={{
                color:
                  colorMode === "day" ? Colors.gray["700"] : Colors.gray["300"],
              }}
            />
            // <AddReelIcon
            //   {...props}
            //   color={
            // colorMode === "day" ? Colors.gray["700"] : Colors.gray["300"]
            //   }
            // />
          )}
          size="small"
        />
      )}
    </Box>
  ) : (
    <Box
      sx={{
        opacity: 0,
      }}
      ref={ref}
    ></Box>
  );
};

const MarkButton = ({ format, icon, shouldShowToolTip, tooltipText }) => {
  const editor = useSlate();

  let renderedJSX = (
    <IconButton
      variant={"invisible"}
      sx={{
        color: isMarkActive(editor, format)
          ? "toolbar.activeIcon"
          : "toolbar.normalIcon",
      }}
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      icon={icon}
      size="small"
    />
  );

  if (shouldShowToolTip) {
    renderedJSX = (
      <Tooltip direction="n" aria-label={tooltipText}>
        {renderedJSX}
      </Tooltip>
    );
  }
  return renderedJSX;
};

const LinkButton = ({ open, setOpen, setShowFakeSelection }) => {
  const editor = useSlate();
  const anchorRef = useRef();
  const [linkBoxText, setLinkBoxText] = useState("");
  const [linkParseError, setLinkParseError] = useState("");

  const insertLink = () => {
    let linkToInsert;
    if (isValidLink(linkBoxText)) {
      linkToInsert = linkBoxText;
    } else if (isValidEmail(linkBoxText)) {
      linkToInsert = "mailto:" + linkBoxText;
    } else {
      setLinkParseError("Enter valid URL");
      return;
    }
    ReactEditor.focus(editor);
    Editor.addMark(editor, "link", getHttpLink(linkToInsert));
    setLinkBoxText("");
    setOpen(false);
    setShowFakeSelection(false);
  };

  useEffect(() => {
    return () => {
      setOpen(false);
    };
  }, []);

  return (
    <>
      <div ref={anchorRef} className="inline-block">
        <IconButton
          variant={"invisible"}
          sx={{
            color: isMarkActive(editor, "link")
              ? "toolbar.activeIcon"
              : "toolbar.normalIcon",
          }}
          active={isMarkActive(editor, "link")}
          onClick={(event) => {
            event.preventDefault();
            setShowFakeSelection(true);
            if (isMarkActive(editor, "link")) {
              toggleMark(editor, "link");
            } else {
              setOpen(true);
              setLinkBoxText("");
            }
          }}
          icon={LinkIcon}
          size="small"
        />
      </div>
      <AnchoredOverlay
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={anchorRef}
        returnFocusRef={anchorRef}
        overlayProps={{
          top: open
            ? ReactEditor.toDOMRange(
                editor,
                editor.selection
              ).getBoundingClientRect().bottom +
              window.pageYOffset +
              8
            : 0,
        }}
      >
        <Box display="flex" flexDirection="column" p={2}>
          <StyledTextInput
            size="small"
            onChange={(e) => {
              linkParseError && setLinkParseError(false);
              setLinkBoxText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                insertLink();
                e.preventDefault();
              }
            }}
            leadingVisual={<LinkIcon />}
            trailingAction={
              <TextInput.Action
                onClick={() => {
                  insertLink();
                }}
                icon={CheckIcon}
                aria-label={""}
                sx={{ color: "fg.subtle" }}
              />
            }
            errorMessage={linkParseError}
            showError={!!linkParseError}
          />
        </Box>
      </AnchoredOverlay>
    </>
  );
};

export default Toolbar;
