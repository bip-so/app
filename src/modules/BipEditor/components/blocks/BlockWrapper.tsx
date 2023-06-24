import React, {
  FC,
  ReactNode,
  useCallback,
  useState,
  useRef,
  useEffect,
  useMemo,
  MutableRefObject,
} from "react";
import {
  ActionList,
  ActionMenu,
  Text,
  IconButton,
  Button,
  Overlay,
  AvatarStack,
  Box,
  Truncate,
  useTheme,
  useOnOutsideClick,
} from "@primer/react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { getEmptyImage } from "react-dnd-html5-backend";
import AddCommentIcon from "../AddCommentIcon";
import AddReelIcon from "../AddReelIcon";

import { Editor, Transforms } from "slate";
import DotsIcon from "../DotsIcon";
import {
  BlockType,
  CreateReactionType,
  ReactionType,
  ReelType,
} from "../../types";
import Reactions from "../../../../components/Reactions";
import BlocksService from "../../services";
import { getUpdatedReactions } from "../../../../utils/reactions";
import { useToasts } from "react-toast-notifications";
import { useCanvas } from "../../../../context/canvasContext";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../../hooks/useHasPermission";
import {
  findTextNodeAndSelectEditor,
  getCommentThreadUUIDFromMark,
  getNodesById,
  getReactionIcon,
  getReelsOnBlock,
  insertBlock,
  isCommentThreadIDMark,
  SLASH_COMMAND_OPTIONS,
  useCustomSelected,
} from "../../utils";
import { CanvasPermissionEnum } from "../../../Permissions/enums";
import {
  IRightRailItem,
  useRightRail,
} from "../../../../context/rightRailContext";
import { useDrag, useDrop } from "react-dnd";
import { ReactEditor, useSlateStatic } from "slate-react";
import {
  CommentIcon,
  FoldDownIcon,
  FoldUpIcon,
  LinkIcon,
  RssIcon,
  TrashIcon,
  TriangleRightIcon,
} from "@primer/styled-octicons";
import BlockTypeSelector from "../BlockTypeSelector";
import TimeAgo from "react-timeago";
import {
  formatDateAndTime,
  shortTimeAgoFormatter,
} from "../../../../utils/Common";
import BlockThreads from "../BlockThreads";
import BlockReels from "../BlockReels";
import useRefDimensions from "../../../../hooks/useRefDimensions";
import { EMBEDS, LIST_TYPES, NON_TEXT_BLOCKS } from "../../constants";
import AvatarWithPlaceholder from "../../../../components/AvatarWithPlaceholder";
import { BranchAccessEnum } from "../../../Canvas/enums";
import { useUser } from "../../../../context/userContext";
import { useRouter } from "next/router";
import Colors from "../../../../utils/Colors";
import segmentEvents from "../../../../insights/segment";
import { useStudio } from "../../../../context/studioContext";
import { invalidateCanvasBlocks } from "../../../Canvas/utils";
import useDeviceDimensions from "../../../../hooks/useDeviceDimensions";
import Thread from "../Thread";
import CommentCard from "../../../../components/CommentCard";
import BlockReel from "../BlockReel";
import CreateReels from "../CreateReels";
import BlockReactions from "../BlockReactions";
import { BetterSystemStyleObject } from "@primer/react/lib/sx";

interface RightRailContainerProps {
  sx?: BetterSystemStyleObject;
  isLarge: boolean;
  isXtraLarge: boolean;
  children: any;
}

const RightRailContainer = React.forwardRef(
  (
    props: RightRailContainerProps,
    ref: React.ForwardedRef<HTMLInputElement> | undefined
  ) => {
    const { sx } = props;
    return (
      <Box
        id={"right-rail-container"}
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "60vh",
          overflow: "auto",
          overscrollBehavior: "auto",
          width: "288px",
          position: "absolute",
          top: "-30px",
          zIndex: 10,
          // pr: "8px",
          p: "4px",
          // border: "1px solid",
          // borderColor: "newRightRail.border",
          bg: "newRightRail.bg",
          borderRadius: "12px",
          ...(sx ? sx : {}),
          ...(props.isLarge || props.isXtraLarge
            ? { left: "0px" }
            : { right: "0px" }),
        }}
        ref={ref}
        contentEditable={false}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {props.children}
      </Box>
    );
  }
);

RightRailContainer.displayName = "RightRailContainer";

interface RightRailIconsProps {
  threadItems: IRightRailItem[];
  commentAnchorRef: MutableRefObject<null>;
  setShowComments: React.Dispatch<React.SetStateAction<boolean>>;
  reelItems: IRightRailItem[];
  reelAnchorRef: MutableRefObject<null>;
  setShowReels: React.Dispatch<React.SetStateAction<boolean>>;
  reactionsCount: number;
  topThreeReactedIcons: JSX.Element | null;
  reactionsAnchorRef: MutableRefObject<null>;
  openedEmojiPicker: boolean;
  setShowReactions: React.Dispatch<React.SetStateAction<boolean>>;
  commentsContainerRef: MutableRefObject<null>;
  isLarge: boolean;
  isXtraLarge: boolean;
  setOpenedEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
  showComments: boolean;
  handleCommentClick: () => void;
  showAddComment: boolean;
  isSameBlock: boolean;
  setShowAddComment: (value: boolean) => void;
  addMark: () => void;
  showReels: boolean;
  hideHighlightText: boolean;
  showPostToReel: boolean;
  setShowPostToReel: (value: boolean) => void;
  showReactions: boolean;
  blockUUID: string;
}

const RightRailIcons = React.forwardRef(
  (
    props: RightRailIconsProps,
    ref: React.ForwardedRef<HTMLInputElement> | undefined
  ) => {
    const {
      threadItems,
      commentAnchorRef,
      setShowComments,
      reelItems,
      reelAnchorRef,
      setShowReels,
      reactionsCount,
      topThreeReactedIcons,
      reactionsAnchorRef,
      openedEmojiPicker,
      setShowReactions,
      commentsContainerRef,
      isLarge,
      isXtraLarge,
      setOpenedEmojiPicker,
      showComments,
      handleCommentClick,
      showAddComment,
      isSameBlock,
      setShowAddComment,
      addMark,
      showReels,
      hideHighlightText,
      showPostToReel,
      setShowPostToReel,
      showReactions,
      blockUUID,
    } = props;
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          userSelect: "none",
          height: "fit-content",
          gap: "4px",
          position: "relative",
        }}
        ref={ref}
        contentEditable={false}
      >
        {threadItems?.length > 0 ? (
          <>
            <Button
              ref={commentAnchorRef}
              sx={{
                color: "blockWrapper.icon",
                paddingLeft: "4px",
                paddingRight: "4px",
              }}
              variant="invisible"
              onClick={() => {
                setShowComments((prev) => !prev);
              }}
            >
              <CommentIcon />
              <Text sx={{ marginLeft: "4px" }}>{threadItems.length}</Text>
            </Button>
          </>
        ) : null}
        {reelItems.length > 0 ? (
          <Button
            ref={reelAnchorRef}
            sx={{
              color: "blockWrapper.icon",
              paddingLeft: "4px",
              paddingRight: "4px",
            }}
            variant="invisible"
            onClick={() => {
              setShowReels((prev) => !prev);
            }}
            size="small"
          >
            <RssIcon />
            <Text sx={{ marginLeft: "4px" }}>{reelItems.length}</Text>
          </Button>
        ) : null}
        {reactionsCount > 0 ? (
          <Button
            ref={reactionsAnchorRef}
            sx={{
              color: "blockWrapper.icon",
              paddingLeft: "4px",
              paddingRight: "4px",
              ".hover-reactions": {
                display: openedEmojiPicker ? "block" : "none",
              },
              "@media (hover: hover)": {
                ":hover": {
                  ".hover-reactions": {
                    display: "block",
                  },
                },
              },
            }}
            variant="invisible"
            onClick={() => {
              setShowReactions((prev) => !prev);
            }}
            size="small"
          >
            <Box display={"flex"} alignItems="center">
              {topThreeReactedIcons}
              <Text sx={{ marginLeft: "2px", color: "blockWrapper.icon" }}>
                {reactionsCount}
              </Text>
            </Box>
            <Box className="hover-reactions" contentEditable={false}>
              <RightRailContainer
                ref={commentsContainerRef}
                isLarge={isLarge}
                isXtraLarge={isXtraLarge}
                sx={{
                  width: "max-content",
                  maxWidth: "288px",
                }}
              >
                <BlockReactions
                  blockUUID={blockUUID}
                  onOpen={() => {
                    setOpenedEmojiPicker(true);
                  }}
                  onClose={() => {
                    setOpenedEmojiPicker(false);
                  }}
                />
              </RightRailContainer>
            </Box>
          </Button>
        ) : null}

        {showComments && threadItems?.length > 0 ? (
          <RightRailContainer
            ref={commentsContainerRef}
            isLarge={isLarge}
            isXtraLarge={isXtraLarge}
          >
            {threadItems.map((item) => (
              <Thread
                key={item.thread?.id}
                thread={item.thread!}
                alwaysShowReplyOption={true}
                showHighlightedText={hideHighlightText ? false : true}
                handleCommentClick={handleCommentClick}
              />
            ))}
          </RightRailContainer>
        ) : null}

        {showAddComment && isSameBlock ? (
          <RightRailContainer
            ref={commentsContainerRef}
            isLarge={isLarge}
            isXtraLarge={isXtraLarge}
          >
            <CommentCard
              onPost={() => {
                setShowAddComment(false);
                setShowComments(true);
              }}
              cancelHandler={() => {
                setShowAddComment(false);
              }}
              addMark={addMark}
            />
          </RightRailContainer>
        ) : null}

        {showReels && reelItems?.length > 0 ? (
          <RightRailContainer
            ref={commentsContainerRef}
            isLarge={isLarge}
            isXtraLarge={isXtraLarge}
          >
            {reelItems.map((item) => (
              <BlockReel
                reel={item.reel!}
                alwaysShowReplyOption={true}
                showHighlightedText={hideHighlightText ? false : true}
                key={item.reel?.id}
              />
            ))}
          </RightRailContainer>
        ) : null}

        {showPostToReel && isSameBlock ? (
          <RightRailContainer
            ref={commentsContainerRef}
            isLarge={isLarge}
            isXtraLarge={isXtraLarge}
          >
            <CreateReels
              closeHandler={() => {
                setShowPostToReel(false);
              }}
              onPostReelSuccess={() => {
                setShowPostToReel(false);
                setShowReels(true);
              }}
            />
          </RightRailContainer>
        ) : null}
        {showReactions ? (
          <RightRailContainer
            ref={commentsContainerRef}
            isLarge={isLarge}
            isXtraLarge={isXtraLarge}
            sx={{
              width: "max-content",
              maxWidth: "288px",
            }}
          >
            <BlockReactions blockUUID={blockUUID} />
          </RightRailContainer>
        ) : null}
      </Box>
    );
  }
);

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

const BlockDetailsContainer = styled.div`
  padding-bottom: 4px;
`;

interface BlockWrapperProps {
  children: ReactNode | undefined;
  block: BlockType;
  branchId: number;
  showBlockReels: boolean;
  addReel: (reel: ReelType) => void;
  blocks: BlockType[];
  setBlocks: Function;
}

const BlockWrapper: FC<BlockWrapperProps> = React.memo((props) => {
  const router = useRouter();
  const {
    threadUUID,
    reactionBlockUUID,
    mentionBlockUUID,
    reelUUID,
    blockUUID,
  } = router.query;
  const {
    setSelectedObjectId,
    addComment,
    addingItem,
    setCurrentBlock,
    currentBlock,
    selectedObjectId,
    addReel,
  } = useRightRail();
  const { children, block, showBlockReels } = props;
  const [showComments, setShowComments] = useState(false);
  const [showReels, setShowReels] = useState(false);
  const editor = useSlateStatic();
  const [openedEmojiPicker, setOpenedEmojiPicker] = useState(false);
  const { addToast } = useToasts();
  const { isTabletOrMobile } = useDeviceDimensions();
  const {
    blocks,
    setBlocks,
    branch,
    setShowAddComment,
    setShowPostToReel,
    showAddComment,
    showPostToReel,
    getBlock,
    reels,
    updateBlock,
    pendingSave,
    repo,
  } = useCanvas();
  const { currentStudio } = useStudio();
  const [hovered, setHovered] = useState(false);
  const [blockOptionsOpen, setBlockOptionsOpen] = useState(false);
  const [blockTypeSelectorOpen, setBlockTypeSelectorOpen] = useState(false);
  const blockRef = useRef(null);
  const blockFromContext = blocks?.find(
    (blck) => blck.id === block.id || blck.uuid === block.uuid
  ); //@GM note - Discuss with RP/NR later
  const selected = useCustomSelected(block);
  const commentAnchorRef = useRef(null);
  const reelAnchorRef = useRef(null);
  const reactionsAnchorRef = useRef(null);
  const { isXtraSmall, isSmall, isLarge, isXtraLarge } = useRefDimensions(
    editor.parentRef
  );
  const [showBlockContributorsList, setShowBlockContributorsList] =
    useState<boolean>(false);
  const blockContributorsRef = useRef<HTMLDivElement>();
  const [hoverTimeOutFn, setHoverTimeOutFn] = useState<any>(null);
  const { isLoggedIn, user } = useUser();
  const { colorMode } = useTheme();
  const blockReels = getReelsOnBlock(block, reels);
  const { items } = useRightRail();
  const createdByUser =
    block.type === "bipmark" ? block?.attributes?.author : block?.createdByUser;

  // const isSelected =
  //   blockReels
  //     ?.map((reel) => reel.uuid)
  //     ?.includes(selectedObjectId?.replace("reel-", "")) ||
  //   selectedObjectId?.replace("reactions-", "") === block.uuid ||
  //   selectedObjectId?.replace("mentions-", "") === block.uuid;
  const isSelected = false;

  const dotsIconRef = useRef(null);
  const rightRailIconsContainerRef = useRef(null);
  const commentsContainerRef = useRef(null);
  const [showReactions, setShowReactions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrolledForReel, setIsScrolledForReel] = useState(false);
  const onMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);
  const onMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

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

  const hasEditPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_EDIT,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) || branch?.publicAccess === BranchAccessEnum.EDIT;

  const canEdit = isLoggedIn && hasEditPerm;

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "block",
    item: { element: block },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: canEdit ? true : false,
  }));

  let dragProps = {
    ref: drag,
  };

  const openCloseBlockContributorsListWithDelay = (
    show: boolean,
    delay: number
  ) => {
    if (hoverTimeOutFn != null) {
      clearTimeout(hoverTimeOutFn);
      setHoverTimeOutFn(null);
    }

    setHoverTimeOutFn(
      setTimeout(() => {
        setShowBlockContributorsList(show);
      }, delay)
    );
  };

  const blockContributorsParentRect =
    blockContributorsRef.current?.getBoundingClientRect();

  const top = blockContributorsParentRect?.bottom + 8;
  const left =
    blockContributorsParentRect?.right - 190 < 0
      ? blockContributorsParentRect?.left
      : blockContributorsParentRect?.right - 190;

  const otherEditors = block?.contributors?.filter(
    (x, i) =>
      x.id !== createdByUser?.id &&
      x.id !== block.updatedByUser?.id &&
      block?.contributors.findIndex((y) => y.id === x.id) === i
  );

  const onBlockMoved = (movedBlock, movedAboveBlock) => {
    let nodes = getNodesById(editor, [movedBlock.uuid, movedAboveBlock.uuid]);

    if (nodes.length < 2) {
      return;
    }

    let movedBlockPath, movedAboveBlockPath;
    if (nodes[0][0].uuid === nodes[1][0].uuid) {
      return;
    } else if (nodes[0][0].uuid === movedBlock.uuid) {
      movedBlockPath = nodes[0][1];
      movedAboveBlockPath = nodes[1][1];
    } else {
      movedBlockPath = nodes[1][1];
      movedAboveBlockPath = nodes[0][1];
    }

    Transforms.moveNodes(editor, {
      at: movedBlockPath,
      to: movedAboveBlockPath,
    });
  };

  const [{ isOver, direction, ...rest }, drop] = useDrop({
    accept: ["block"],
    drop: (item, _) => {
      onBlockMoved(item.element, block);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      direction: !monitor.getInitialSourceClientOffset()
        ? ""
        : monitor?.getInitialSourceClientOffset()?.y <
          monitor?.getClientOffset()?.y
        ? "down"
        : "up",
    }),
  });

  if (isDragging) {
    Transforms.deselect(editor);
  }

  preview(getEmptyImage());
  drop(blockRef);

  const deleteBlock = () => {
    Transforms.removeNodes(editor, {
      at: [],
      match: (node, _) => node.uuid === block.uuid,
    });
  };

  const handleAddItem = (type) => {
    if (type === "comment") {
      addComment(block, editor.selection);
    } else {
      addReel(block, editor.selection);
    }
  };

  const addOrRemoveReaction = useCallback(
    (emoji: string) => {
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
        blockFromContext?.reactions?.find(
          (reaction) => reaction.emoji === emoji && reaction.reacted
        )
      ) {
        segmentEvents.reactionDeleted(
          currentStudio?.handle!,
          repo?.key!,
          user?.id!,
          "block"
        );
        BlocksService.removeReaction(data)
          .then((r) => {
            const reactions = getUpdatedReactions(
              blockFromContext?.reactions,
              emoji,
              "remove"
            );
            const updatedBlock = {
              ...blockFromContext,
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
        segmentEvents.reactionAdded(
          currentStudio?.handle!,
          repo?.key!,
          user?.id,
          "block"
        );
        BlocksService.createReaction(data)
          .then((r) => {
            const reactions = getUpdatedReactions(
              blockFromContext?.reactions,
              emoji
            );
            const updatedBlock = {
              ...blockFromContext,
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
    [blockFromContext, blocks]
  );

  const reactionsCount: number = useMemo(() => {
    return blockFromContext?.reactions?.length
      ? blockFromContext.reactions.reduce(
          (total: number, reac: ReactionType) => total + reac.count,
          0
        )
      : 0;
  }, [blockFromContext?.reactions]);

  const sortedReactions: ReactionType[] = useMemo(() => {
    if (blockFromContext?.reactions?.length) {
      let reactions = [...blockFromContext.reactions];
      return reactions?.sort(
        (r1: ReactionType, r2: ReactionType) => r2.count - r1.count
      );
    }
    return [];
  }, [blockFromContext?.reactions]);

  const isReactionsClickable: boolean = useMemo(() => {
    if (sortedReactions.length > 1) {
      if (sortedReactions.length > 3) {
        return true;
      }
      if (sortedReactions.length === reactionsCount) {
        return false;
      }
      return true;
    }
    return false;
  }, [sortedReactions]);

  const topThreeReactedIcons = useMemo(() => {
    if (sortedReactions?.length) {
      return (
        <Box display={"flex"} alignItems={"center"}>
          {sortedReactions.map((reaction, index) =>
            index >= 3 ? null : (
              <Box
                key={reaction.emoji}
                sx={{
                  fontSize: "14px",
                  lineHeight: "20px",
                  marginLeft: "-2px",
                }}
              >
                {getReactionIcon(reaction.emoji)}
              </Box>
            )
          )}
          {/* {canAddReaction && !isReactionsClickable ? (
            <Reactions
              addReaction={addOrRemoveReaction}
              removeReaction={() => {}}
              emoji={""}
              count={0}
              reacted={false}
              color={Colors.gray["500"]}
              withText={false}
              disabled={pendingSave}
            />
          ) : null} */}
        </Box>
      );
    }
    return null;
  }, [sortedReactions, isReactionsClickable]);

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
        const slateBlock = block;

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

  const scrollThread = (thread) => {
    const element = document.getElementById(`thread-${thread.id}`);
    const container = document.getElementById(`right-rail-container`);
    if (element && container) {
      container?.scrollTo({
        top: element.offsetTop - 50,
        behavior: "smooth",
      });
    }
  };

  const threadItems = useMemo(() => {
    return items.filter(
      (item) => item.type === "thread" && item.blockUUID === block.uuid
    );
  }, [items]);

  const reelItems = useMemo(() => {
    return items.filter(
      (item) => item.type === "reel" && item.blockUUID === block.uuid
    );
  }, [items]);

  useEffect(() => {
    if (blockUUID === block.uuid) {
      //Added set timeout to get smooth behaviour
      setTimeout(() => {
        scrollToBlock(blockUUID);
      }, 200);
    }
  }, [blockUUID]);

  useEffect(() => {
    if (threadUUID && threadItems?.length && !isScrolled) {
      const threadItem = threadItems.find(
        (item) => item.thread?.uuid === threadUUID
      );
      if (threadItem) {
        setShowComments(true);
        scrollToBlock(threadItem.blockUUID);
        setTimeout(() => {
          scrollThread(threadItem.thread);
        }, 200);
        setIsScrolled(true);
      }
    }
  }, [threadUUID, threadItems]);

  const scrollReel = (reel) => {
    const element = document.getElementById(`reel-${reel.id}`);
    const container = document.getElementById(`right-rail-container`);
    if (element && container) {
      container?.scrollTo({
        top: element.offsetTop - 50,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    if (reelUUID && reelItems?.length && !isScrolledForReel) {
      const reelItem = reelItems.find((item) => item.reel?.uuid === reelUUID);
      if (reelItem) {
        setShowReels(true);
        scrollToBlock(reelItem.blockUUID);
        setTimeout(() => {
          scrollReel(reelItem.reel);
        }, 200);
        setIsScrolledForReel(true);
      }
    }
  }, [reelUUID, reelItems]);

  useEffect(() => {
    if (reactionBlockUUID && reactionBlockUUID === block.uuid) {
      scrollToBlock(reactionBlockUUID);
      setShowReactions(true);
    }
  }, [reactionBlockUUID]);

  useEffect(() => {
    if (mentionBlockUUID && mentionBlockUUID === block.uuid) {
      setTimeout(() => {
        scrollToBlock(mentionBlockUUID);
      }, 100);
    }
  }, [mentionBlockUUID]);

  const ignoredRefs = useMemo(() => {
    if (showComments) {
      return [commentAnchorRef];
    }
    if (showReels) {
      return [reelAnchorRef];
    }
    if (showReactions) {
      return [reactionsAnchorRef];
    }
    return [];
  }, [showComments, showReels, showReactions]);

  useOnOutsideClick({
    onClickOutside: () => {
      if (showComments) {
        setShowComments(false);
      }
      if (showAddComment) {
        setShowAddComment(false);
      }
      if (showReels) {
        setShowReels(false);
      }
      if (showPostToReel) {
        setShowPostToReel(false);
      }
      if (showReactions) {
        setShowReactions(false);
      }
    },
    ignoreClickRefs: ignoredRefs,
    containerRef: commentsContainerRef,
  });

  const index = editor.children.findIndex((x) => x.uuid === block.uuid);
  const isNonFirstListBlock =
    LIST_TYPES.includes(block.type) &&
    index > 0 &&
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

  const copyBlockLink = () => {
    const link = `${window.location.href.split("?")[0]}?blockUUID=${
      block.uuid
    }`;
    navigator.clipboard.writeText(link);
  };

  const addColumns = () => {
    block.children.forEach((row, i) => {
      const rowUUID = row.uuid;
      const tableUUID = block.uuid;
      const tableIndex = editor.children.findIndex(
        (el) => el.uuid === block.uuid
      );

      const newCells = [...Array(5)].map(() => {
        const cellUUID = uuidv4();

        return {
          type: "table-cell",
          children: [
            {
              type: "text",
              children: [{ text: "" }],
              cellUUID,
              uuid: uuidv4(),
              rowUUID,
              attributes: {},
              tableUUID,
            },
          ],
          tableUUID,
          uuid: cellUUID,
          rowUUID,
        };
      });

      Transforms.insertNodes(editor, newCells, {
        at: [tableIndex, i, row.children.length],
      });
    });
  };

  const addRows = () => {
    const columnSize = block.children[0].children.length;

    const tableUUID = block.uuid;
    const tableIndex = editor.children.findIndex(
      (el) => el.uuid === block.uuid
    );

    const newRows = [...Array(5)].map(() => {
      const rowUUID = uuidv4();
      return {
        type: "table-row",
        uuid: rowUUID,
        children: [...Array(columnSize)].map(() => {
          const cellUUID = uuidv4();
          return {
            type: "table-cell",
            children: [
              {
                type: "text",
                children: [{ text: "" }],
                cellUUID,
                tableUUID,
                uuid: uuidv4(),
                rowUUID,
                attributes: {},
              },
            ],
            tableUUID,
            uuid: uuidv4(),
            rowUUID,
          };
        }),
        tableUUID,
      };
    });
    Transforms.insertNodes(editor, newRows, {
      at: [tableIndex, block.children.length],
    });
  };

  const cleanTable = () => {
    const tableIndex = editor.children.findIndex(
      (el) => el.uuid === block.uuid
    );

    Transforms.removeNodes(editor, {
      at: [tableIndex],
      match: (n, p) => p.length === 4,
    });

    const nodes = Array.from(
      Editor.nodes(editor, {
        at: [tableIndex],
        match: (n, p) => n.type === "table-cell",
      })
    );

    nodes.forEach((cellNode) => {
      const [cell, path] = cellNode;
      const { uuid: cellUUID, rowUUID, tableUUID } = cell;

      Transforms.insertNodes(
        editor,
        {
          type: "text",
          children: [{ text: "" }],
          cellUUID,
          uuid: uuidv4(),
          tableUUID,
          rowUUID,
          attributes: {},
        },
        {
          at: [...path, 0],
        }
      );
    });
  };

  const isImageBlock = useMemo(() => {
    return block.children.findIndex((item) => item?.type === "image") !== -1;
  }, [block]);

  const isTableBlock = useMemo(() => {
    return block.type === "simple_table_v1";
  }, [block]);

  const isCalloutBlock = useMemo(() => {
    return block.type === "callout";
  }, [block]);

  const isEmbedBlock = useMemo(() => {
    const element = block.children.find((item) => Boolean(item?.type));
    if (element) {
      return EMBEDS.map((x) => x.type).includes(element?.type);
    }
    return false;
  }, [block]);

  const hideHighlightText = useMemo(() => {
    return isImageBlock || isTableBlock || isEmbedBlock;
  }, [isImageBlock, isTableBlock, isEmbedBlock]);

  const isNonTextBlock = useMemo(() => {
    const element = block.children.find((item) => Boolean(item?.type));
    if (element) {
      return NON_TEXT_BLOCKS.includes(element?.type);
    }
    return NON_TEXT_BLOCKS.includes(block?.type);
  }, [block]);

  const showIconsToRight = useMemo(() => {
    if (isLarge || isXtraLarge) {
      return true;
    }
    if (isNonTextBlock) {
      return false;
    }
    return true;
  }, [isNonTextBlock, isLarge, isXtraLarge]);

  const highlightBlock = useMemo(() => {
    let highlightBlockUUID =
      blockUUID || reactionBlockUUID || mentionBlockUUID || "";
    if (reelUUID && reelItems?.length) {
      const reelItem = reelItems.find((item) => item.reel?.uuid === reelUUID);
      if (reelItem) {
        highlightBlockUUID = reelItem.blockUUID;
      }
    }
    return highlightBlockUUID === block.uuid;
  }, [blockUUID, reactionBlockUUID, mentionBlockUUID, block, reelItems]);

  return (
    <Container
      ref={blockRef}
      style={{ marginTop: `${4 * blockMarginTopNumber}px`, maxWidth: "97vw" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Box
        className={`relative flex ${isTabletOrMobile ? "" : "mr-2"}`}
        sx={{
          opacity: isDragging ? 0.3 : 1,
          borderTopWidth: 2,
          borderTopStyle: "solid",
          borderTopColor:
            isOver && direction === "up" ? "accent.fg" : "transparent",
          borderBottomWidth: 2,
          borderBottomStyle: "solid",
          borderBottomColor:
            isOver && direction === "down" ? "accent.fg" : "transparent",
          bg: highlightBlock
            ? "blockWrapper.highlight"
            : isSelected
            ? "element.bg"
            : "",
        }}
      >
        {!isXtraSmall && (
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
            {!isXtraSmall && !isSmall && selected && (
              <>
                <div
                  className="flex items-center mr-2"
                  ref={blockContributorsRef}
                  onMouseEnter={() => {
                    openCloseBlockContributorsListWithDelay(true, 350);
                  }}
                  onMouseLeave={() => {
                    openCloseBlockContributorsListWithDelay(false, 150);
                  }}
                >
                  <p className="mr-2 text-xs">
                    <TimeAgo
                      title={formatDateAndTime(block.updatedAt)}
                      minPeriod={60}
                      date={block.updatedAt}
                      formatter={shortTimeAgoFormatter}
                    />
                  </p>
                  <AvatarStack alignRight>
                    <AvatarWithPlaceholder
                      src={
                        block?.updatedByUser && block?.updatedByUser?.avatarUrl
                      }
                      alt={"user"}
                      draggable={false}
                    />
                    {block?.updatedByUser?.id !== createdByUser?.id && (
                      <AvatarWithPlaceholder
                        src={createdByUser && createdByUser?.avatarUrl}
                        alt={"user"}
                        draggable={false}
                      />
                    )}
                  </AvatarStack>
                </div>
                {showBlockContributorsList && (
                  <Overlay
                    returnFocusRef={blockContributorsRef}
                    ignoreClickRefs={[blockContributorsRef]}
                    onMouseEnter={() =>
                      openCloseBlockContributorsListWithDelay(true, 0)
                    }
                    onMouseLeave={() =>
                      openCloseBlockContributorsListWithDelay(false, 150)
                    }
                    onClickOutside={() =>
                      openCloseBlockContributorsListWithDelay(false, 0)
                    }
                    onEscape={() =>
                      openCloseBlockContributorsListWithDelay(false, 0)
                    }
                    top={top}
                    left={left}
                  >
                    <Box className="p-3 space-y-2">
                      <Box>
                        <Box className="text-sm font-medium">Creator:</Box>
                        <Box
                          className="rounded-md"
                          sx={{
                            padding: "8px",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            ":hover": {
                              bg: "blockWrapper.hoverBg",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                width: "22px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <AvatarWithPlaceholder
                                src={createdByUser?.avatarUrl}
                              />
                            </Box>
                            <Box
                              sx={{
                                margin: "0 5px",
                                flex: 1,
                              }}
                            >
                              <Text
                                sx={{
                                  fontSize: "14px",
                                  flex: 1,
                                  color: "blockWrapper.username",
                                }}
                              >
                                <Truncate
                                  title={`@${createdByUser?.username}`}
                                  inline={true}
                                  sx={{
                                    overflow: "hidden",
                                    width: "120px",
                                  }}
                                >
                                  @{createdByUser?.username}
                                </Truncate>
                              </Text>
                            </Box>
                          </Box>
                          <Text
                            sx={{
                              color: "blockWrapper.time",
                              fontSize: "14px",
                            }}
                          >
                            <TimeAgo
                              title={formatDateAndTime(block.createdAt)}
                              minPeriod={60}
                              date={
                                block.createdAt
                                //   formatDate(
                                //   BIP_TIME_FORMAT
                                // )
                              }
                              formatter={shortTimeAgoFormatter}
                            />
                          </Text>
                        </Box>
                      </Box>
                      <Box>
                        <Box className="text-sm font-medium">Last Editor:</Box>
                        <Box
                          className="rounded-md"
                          sx={{
                            padding: "8px",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            ":hover": {
                              bg: "blockWrapper.hoverBg",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                width: "22px",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <AvatarWithPlaceholder
                                src={block?.updatedByUser?.avatarUrl}
                              />
                            </Box>
                            <Box
                              sx={{
                                margin: "0 5px",
                                flex: 1,
                              }}
                            >
                              <Text
                                sx={{
                                  fontSize: "14px",
                                  flex: 1,
                                  color: "blockWrapper.username",
                                }}
                              >
                                <Truncate
                                  title={` @${block?.updatedByUser?.username}`}
                                  inline={true}
                                  sx={{
                                    overflow: "hidden",
                                    width: "120px",
                                  }}
                                >
                                  @{block?.updatedByUser?.username}
                                </Truncate>
                              </Text>
                            </Box>
                          </Box>
                          <Text
                            sx={{
                              color: "blockWrapper.time",
                              fontSize: "14px",
                            }}
                          >
                            <TimeAgo
                              title={formatDateAndTime(block.updatedAt)}
                              minPeriod={60}
                              date={
                                block.updatedAt
                                //   formatDate(
                                //   BIP_TIME_FORMAT
                                // )
                              }
                              formatter={shortTimeAgoFormatter}
                            />
                          </Text>
                        </Box>
                      </Box>
                      {otherEditors.length > 0 && (
                        <Box>
                          <Box className="text-sm font-medium">
                            Other editors:
                          </Box>
                          <Box
                            sx={{
                              padding: "8px",
                              display: "flex",
                              width: "100%",
                              position: "relative",
                              alignItems: "center",
                            }}
                          >
                            <AvatarStack>
                              {otherEditors.map((editor) => (
                                <AvatarWithPlaceholder src={editor.avatarUrl} />
                              ))}
                            </AvatarStack>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Overlay>
                )}
              </>
            )}
            {!isXtraSmall && (selected || hovered || blockOptionsOpen) && (
              <>
                <div
                  ref={drag}
                  onClick={() => {
                    setBlockOptionsOpen(!blockOptionsOpen);
                  }}
                >
                  <span ref={dotsIconRef}>
                    <IconButton
                      variant="invisible"
                      size="small"
                      {...dragProps}
                      id={`${block.uuid}_drag`}
                      icon={DotsIcon}
                      className={`show-on-hover ${
                        blockOptionsOpen || selected ? "show" : ""
                      }`}
                      sx={{
                        padding: "3px",
                      }}
                    />
                  </span>
                </div>

                {blockOptionsOpen && (
                  <ActionMenu
                    open={blockOptionsOpen}
                    onOpenChange={setBlockOptionsOpen}
                    anchorRef={dotsIconRef}
                  >
                    <ActionMenu.Overlay align="end" anchorSide="inside-bottom">
                      <ActionList>
                        <ActionList.Item onSelect={copyBlockLink}>
                          <ActionList.LeadingVisual>
                            <LinkIcon color="blockWrapper.icon" />
                          </ActionList.LeadingVisual>
                          Copy link
                        </ActionList.Item>
                        {canEdit && block.type !== "simple_table_v1" ? (
                          <BlockTypeSelector
                            anchor={
                              <ActionList.Item onClick={() => {}}>
                                <ActionList.LeadingVisual>
                                  {
                                    SLASH_COMMAND_OPTIONS.find(
                                      (option) => option.type === block.type
                                    )?.icon
                                  }
                                </ActionList.LeadingVisual>
                                {
                                  SLASH_COMMAND_OPTIONS.find(
                                    (option) => option.type === block.type
                                  )?.title
                                }
                                <ActionList.TrailingVisual>
                                  <TriangleRightIcon />
                                </ActionList.TrailingVisual>
                              </ActionList.Item>
                            }
                            trailingIcon={null}
                            at={[
                              editor.children.findIndex(
                                (blo) => blo.uuid === block.uuid
                              ),
                            ]}
                            open={blockTypeSelectorOpen}
                            setOpen={setBlockTypeSelectorOpen}
                            selectedBlockType={block.type}
                          />
                        ) : null}
                        {canEdit && block.type === "simple_table_v1" && (
                          <>
                            <ActionList.Item onSelect={cleanTable}>
                              Clear table
                            </ActionList.Item>
                            <ActionList.Item onSelect={addRows}>
                              Add 5 Rows
                            </ActionList.Item>
                            <ActionList.Item onSelect={addColumns}>
                              Add 5 Columns
                            </ActionList.Item>
                          </>
                        )}
                        {canAddComment || canAddReaction || canCreateReels ? (
                          <ActionList.Divider />
                        ) : null}
                        {canAddComment && (
                          <ActionList.Item
                            id={"comment-block-menu-start-btn"}
                            onSelect={() => {
                              const [[slateBlock, blockIndex]] = Editor.nodes(
                                editor,
                                {
                                  at: [],
                                  match: (n, p) =>
                                    p.length === 1 && n.uuid === block.uuid,
                                }
                              );
                              setCurrentBlock({
                                ...slateBlock,
                              });
                              Transforms.select(editor, {
                                anchor: Editor.start(editor, blockIndex),
                                focus: Editor.end(editor, blockIndex),
                              });
                              // setSelectedObjectId("add-comment");
                              // isLarge || isXtraLarge
                              //   ? handleAddItem("comment")
                              //   : setShowAddComment(true);
                              setShowAddComment(true);
                            }}
                          >
                            <ActionList.LeadingVisual>
                              <AddCommentIcon
                                color={
                                  colorMode === "day"
                                    ? Colors.gray["400"]
                                    : Colors.gray["600"]
                                }
                              />
                            </ActionList.LeadingVisual>
                            Add Comment
                          </ActionList.Item>
                        )}
                        {canCreateReels && (
                          <>
                            <ActionList.Item
                              onSelect={() => {
                                const [[slateBlock, blockIndex]] = Editor.nodes(
                                  editor,
                                  {
                                    at: [],
                                    match: (n, p) =>
                                      p.length === 1 && n.uuid === block.uuid,
                                  }
                                );

                                setCurrentBlock({
                                  ...slateBlock,
                                });
                                setSelectedObjectId("add-reel");
                                Transforms.select(editor, {
                                  anchor: Editor.start(editor, blockIndex),
                                  focus: Editor.end(editor, blockIndex),
                                });
                                // isLarge || isXtraLarge
                                //   ? handleAddItem("reel")
                                //   : setShowPostToReel(true);
                                setShowPostToReel(true);
                              }}
                            >
                              <ActionList.LeadingVisual>
                                <RssIcon />
                                {/* <AddReelIcon
                                  color={
                                    colorMode === "day"
                                      ? Colors.gray["400"]
                                      : Colors.gray["600"]
                                  }
                                /> */}
                              </ActionList.LeadingVisual>
                              Create Post
                            </ActionList.Item>
                          </>
                        )}
                        {canAddReaction && (
                          <Reactions
                            addReaction={addOrRemoveReaction}
                            removeReaction={() => {}}
                            emoji={""}
                            count={0}
                            reacted={false}
                            color={
                              colorMode === "day"
                                ? Colors.gray["400"]
                                : Colors.gray["600"]
                            }
                            onOpen={() => {
                              setOpenedEmojiPicker(true);
                            }}
                            onClose={() => {
                              setOpenedEmojiPicker(false);
                            }}
                            withText={true}
                            disabled={pendingSave}
                          />
                        )}
                        {canEdit && (
                          <>
                            <ActionList.Divider />
                            <ActionList.Item
                              onSelect={() => {
                                insertBlock(editor, "text", [
                                  editor.children.findIndex(
                                    (blo) => blo.uuid === block.uuid
                                  ),
                                ]);
                              }}
                            >
                              <ActionList.LeadingVisual>
                                <FoldUpIcon
                                  color={
                                    colorMode === "day"
                                      ? Colors.gray["400"]
                                      : Colors.gray["600"]
                                  }
                                />
                              </ActionList.LeadingVisual>
                              Insert block above
                            </ActionList.Item>
                            <ActionList.Item
                              onSelect={() => {
                                insertBlock(editor, "text", [
                                  editor.children.findIndex(
                                    (blo) => blo.uuid === block.uuid
                                  ) + 1,
                                ]);
                              }}
                            >
                              <ActionList.LeadingVisual>
                                <FoldDownIcon
                                  color={
                                    colorMode === "day"
                                      ? Colors.gray["400"]
                                      : Colors.gray["600"]
                                  }
                                />
                              </ActionList.LeadingVisual>
                              Insert block below
                            </ActionList.Item>
                          </>
                        )}

                        {canEdit ? (
                          <>
                            {editor.children.length > 1 && (
                              <ActionList.Divider />
                            )}
                            {editor.children.length > 1 && (
                              <ActionList.Item onSelect={deleteBlock}>
                                <ActionList.LeadingVisual>
                                  <TrashIcon color="blockWrapper.icon" />
                                </ActionList.LeadingVisual>
                                Delete block
                              </ActionList.Item>
                            )}
                          </>
                        ) : null}
                      </ActionList>
                    </ActionMenu.Overlay>
                  </ActionMenu>
                )}
              </>
            )}
          </div>
        )}

        {children}
        {showIconsToRight ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              userSelect: "none",
              position: isLarge || isXtraLarge ? "absolute" : "unset",
              left: isLarge || isXtraLarge ? "calc(100% + 35px)" : "unset",
              height: "fit-content",
            }}
            contentEditable={false}
          >
            <RightRailIcons
              threadItems={threadItems}
              commentAnchorRef={commentAnchorRef}
              setShowComments={setShowComments}
              reelItems={reelItems}
              reelAnchorRef={reelAnchorRef}
              setShowReels={setShowReels}
              reactionsCount={reactionsCount}
              topThreeReactedIcons={topThreeReactedIcons}
              reactionsAnchorRef={reactionsAnchorRef}
              openedEmojiPicker={openedEmojiPicker}
              setShowReactions={setShowReactions}
              commentsContainerRef={commentsContainerRef}
              isLarge={isLarge}
              isXtraLarge={isXtraLarge}
              setOpenedEmojiPicker={setOpenedEmojiPicker}
              showComments={showComments}
              handleCommentClick={props.actions.handleCommentClick}
              showAddComment={showAddComment}
              isSameBlock={block.uuid === currentBlock?.uuid}
              setShowAddComment={setShowAddComment}
              addMark={props.actions.addMark}
              showReels={showReels}
              hideHighlightText={hideHighlightText}
              showPostToReel={showPostToReel}
              setShowPostToReel={setShowPostToReel}
              showReactions={showReactions}
              blockUUID={block.uuid}
            />
          </Box>
        ) : null}

        {/* {!isXtraLarge &&
        !isLarge &&
        (blockFromContext?.reelCount > 0 ||
          blockFromContext?.commentCount > 0) ? (
          <div className="flex select-none h-fit" contentEditable={false}>
            {blockFromContext.commentCount > 0 && (
              <Button
                ref={commentAnchorRef}
                sx={{
                  color: "blockWrapper.icon",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                }}
                variant="invisible"
                onClick={() => {
                  setShowComments((prev) => !prev);
                }}
              >
                <CommentIcon />
                <Text sx={{ marginLeft: "4px" }}>
                  {blockFromContext.commentCount}
                </Text>
              </Button>
            )}
            {blockFromContext.reelCount > 0 && (
              <Button
                sx={{
                  color: "blockWrapper.icon",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                }}
                variant="invisible"
                onClick={() => {
                  setShowReels((prev) => !prev);
                }}
                size="small"
              >
                <AddReelIcon
                  color={
                    colorMode === "day"
                      ? Colors.gray["400"]
                      : Colors.gray["600"]
                  }
                />
                <Text sx={{ marginLeft: "4px" }}>
                  {blockFromContext.reelCount}
                </Text>
              </Button>
            )}
          </div>
        ) : null} */}
      </Box>
      {/* {!isXtraLarge && !isLarge && showComments && (
        <Overlay
          returnFocusRef={commentAnchorRef}
          ignoreClickRefs={[commentAnchorRef]}
          onEscape={() => setShowComments(false)}
          onClickOutside={() => setShowComments(false)}
          width="medium"
          top={100}
          left={window.innerWidth / 2 - 160}
          sx={{
            padding: "12px",
            position: "fixed",
            maxHeight: window.innerHeight - 124,
            overflow: "scroll",
          }}
        >
          <BlockThreads blockUUID={block.uuid} />
        </Overlay>
      )}
      {!isXtraLarge && !isLarge && showReels && (
        <Overlay
          returnFocusRef={reelAnchorRef}
          ignoreClickRefs={[reelAnchorRef]}
          onEscape={() => setShowReels(false)}
          onClickOutside={() => setShowReels(false)}
          width="medium"
          top={100}
          left={window.innerWidth / 2 - 160}
          sx={{
            position: "fixed",
            maxHeight: window.innerHeight - 124,
            overflow: "scroll",
          }}
        >
          <BlockReels blockUUID={block.uuid} />
        </Overlay>
      )} */}
      {showIconsToRight ? null : (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"flex-end"}
          contentEditable={false}
        >
          <RightRailIcons
            threadItems={threadItems}
            commentAnchorRef={commentAnchorRef}
            setShowComments={setShowComments}
            reelItems={reelItems}
            reelAnchorRef={reelAnchorRef}
            setShowReels={setShowReels}
            reactionsCount={reactionsCount}
            topThreeReactedIcons={topThreeReactedIcons}
            reactionsAnchorRef={reactionsAnchorRef}
            openedEmojiPicker={openedEmojiPicker}
            setShowReactions={setShowReactions}
            commentsContainerRef={commentsContainerRef}
            isLarge={isLarge}
            isXtraLarge={isXtraLarge}
            setOpenedEmojiPicker={setOpenedEmojiPicker}
            showComments={showComments}
            handleCommentClick={props.actions.handleCommentClick}
            showAddComment={showAddComment}
            isSameBlock={block.uuid === currentBlock?.uuid}
            setShowAddComment={setShowAddComment}
            addMark={props.actions.addMark}
            showReels={showReels}
            hideHighlightText={hideHighlightText}
            showPostToReel={showPostToReel}
            setShowPostToReel={setShowPostToReel}
            showReactions={showReactions}
            blockUUID={block.uuid}
          />
        </Box>
      )}
    </Container>
  );
});

BlockWrapper.displayName;
export default BlockWrapper;
