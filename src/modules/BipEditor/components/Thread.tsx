import { CheckIcon, KebabHorizontalIcon } from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  Avatar,
  Box,
  Button,
  IconButton,
  Popover,
  Text,
  Truncate,
  useOnOutsideClick,
  useTheme,
} from "@primer/react";
import Link from "next/link";
import React, { createRef, FC, useRef, useState } from "react";
import TimeAgo from "react-timeago";
import { useToasts } from "react-toast-notifications";
import styled from "styled-components";
import { DEFAULT_USER_PLACEHOLDER } from "../../../commons/constants";
import { IUserMini } from "../../../commons/types";
import BipLoader from "../../../components/BipLoader";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";
import MentionsInput from "../../../components/MentionsInput";
import Reactions from "../../../components/Reactions";
import { useCanvas } from "../../../context/canvasContext";
import { useRightRail } from "../../../context/rightRailContext";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import BipRouteUtils from "../../../core/routeUtils";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../hooks/useHasPermission";
import segmentEvents from "../../../insights/segment";
import Colors from "../../../utils/Colors";
import {
  formatDateAndTime,
  shortTimeAgoFormatter,
  timeAgoFormatter,
} from "../../../utils/Common";
import {
  getFilteredMentions,
  getTextWithMentionsArray,
} from "../../../utils/mentions";
import { getUpdatedReactions } from "../../../utils/reactions";
import { BranchAccessEnum } from "../../Canvas/enums";
import { invalidateCanvasBlocks } from "../../Canvas/utils";
import { CanvasPermissionEnum } from "../../Permissions/enums";
import BlocksService from "../services";
import {
  CreateMentionType,
  CreateReactionType,
  MentionType,
  ReactionScope,
  ReactionType,
  ThreadCommentType,
  ThreadType,
} from "../types";

interface HeaderProps {
  showMenu?: boolean;
  showResolve?: boolean;
  onClickDelete?: () => void;
  onClickResolve?: () => void;
  createdAt: string;
  user: IUserMini;
  showReaction: boolean;
  addReaction?: (emoji: string) => void;
  removeReaction?: (emoji: string) => void;
}

const Header: FC<HeaderProps> = (props) => {
  const {
    showMenu,
    showResolve,
    onClickDelete,
    onClickResolve,
    createdAt,
    user,
    showReaction,
    addReaction,
    removeReaction,
  } = props;

  const [openMenu, setOpenMenu] = useState(false);
  const { branch } = useCanvas();
  const { isLoggedIn } = useUser();

  const menuRef = useRef(null);

  const hasAddReactionPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_ADD_REACTION,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;

  const canAddReaction = isLoggedIn && hasAddReactionPerm;

  return (
    <div className="flex items-center justify-between h-7">
      <div className="flex items-center space-x-2">
        <Avatar
          sx={{
            height: "24px",
            width: "24px",
          }}
          src={user?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
        />
        {/* <Avatar
          src={"/cat.png"}
          sx={{ width: "28px", height: "28px", flexShrink: 0 }}
          alt={"user"}
          draggable={false}
        /> */}
        <LinkWithoutPrefetch
          href={BipRouteUtils.getProfileRoute(user.username)}
        >
          <Text
            as="p"
            fontWeight={500}
            fontSize={"14px"}
            lineHeight={"20px"}
            color="thread.text.username"
            sx={{ cursor: "pointer" }}
          >
            <Truncate title={user.fullName || user.username}>
              {user.fullName || user.username}
            </Truncate>
          </Text>
        </LinkWithoutPrefetch>
        <Text
          as="p"
          fontWeight={400}
          fontSize={"12px"}
          lineHeight={"18px"}
          color="thread.text.date"
        >
          <TimeAgo
            title={formatDateAndTime(createdAt)}
            minPeriod={60}
            formatter={shortTimeAgoFormatter}
            date={createdAt}
          />
        </Text>
      </div>
      {showMenu || showResolve || showReaction ? (
        <div
          className={`items-center space-x-1 ${
            openMenu ? "flex" : "icons-container"
          } `}
        >
          {showReaction && canAddReaction ? (
            <Reactions
              addReaction={addReaction}
              removeReaction={removeReaction}
              emoji={""}
              count={0}
              reacted={false}
              color={Colors.gray["500"]}
            />
          ) : null}
          {showResolve ? (
            <IconButton
              variant="invisible"
              icon={CheckIcon}
              size="small"
              onClick={onClickResolve}
              sx={{ color: "thread.text.resolve", padding: "2px 4px" }}
            />
          ) : null}
          {showMenu ? (
            <IconButton
              ref={menuRef}
              variant="invisible"
              icon={KebabHorizontalIcon}
              size="small"
              sx={{ color: "thread.text.resolve", padding: "2px 4px" }}
              onClick={(event: any) => {
                setOpenMenu(!openMenu);
                event.stopPropagation();
              }}
            />
          ) : null}
          <ActionMenu
            open={openMenu}
            onOpenChange={setOpenMenu}
            anchorRef={menuRef}
          >
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item
                  onClick={() => {
                    setOpenMenu(false);
                    onClickDelete && onClickDelete();
                  }}
                >
                  Delete
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      ) : null}
    </div>
  );
};

interface CommentBodyProps {
  highlightedText: string;
  text: string;
  mentions: MentionType[] | null;
  showRepliesText: boolean;
  showingReplies?: boolean;
  repliesCount?: number;
  onClickRepliesText?: () => void;
  onClickHideReplies?: () => void;
  showResolve?: boolean;
  showMenu?: boolean;
  onClickDelete?: () => void;
  onClickResolve?: () => void;
  addReaction: (emoji: string) => void;
  removeReaction: (emoji: string) => void;
  reactions: ReactionType[] | null | undefined;
  createdAt: string;
  user: IUserMini;
  comments: ThreadCommentType[];
}

const CommentBodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  .icons-container {
    display: none;
  }
  &:hover {
    .icons-container {
      display: flex;
    }
  }
`;

const CommentBody: FC<CommentBodyProps> = (props) => {
  const {
    highlightedText,
    text,
    showRepliesText,
    onClickRepliesText,
    repliesCount,
    showingReplies,
    onClickHideReplies,
    showResolve,
    showMenu,
    onClickDelete,
    onClickResolve,
    addReaction,
    removeReaction,
    reactions,
    mentions,
    createdAt,
    user,
    comments,
  } = props;

  const { branch } = useCanvas();
  const { isLoggedIn } = useUser();

  const hasAddReactionPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_ADD_REACTION,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;

  const canAddReaction = isLoggedIn && hasAddReactionPerm;

  return (
    <CommentBodyContainer className="space-y-2">
      <Header
        showMenu={showMenu}
        showResolve={showResolve}
        onClickResolve={onClickResolve}
        onClickDelete={onClickDelete}
        createdAt={createdAt}
        user={user}
        showReaction={reactions && reactions?.length ? false : true}
        addReaction={addReaction}
        removeReaction={removeReaction}
      />
      {highlightedText?.length ? (
        <Box
          sx={{
            borderLeft: "3px solid",
            borderColor: "thread.highlightedTextBorder",
          }}
        >
          <Text
            as="p"
            fontSize={"14px"}
            lineHeight={"20px"}
            fontWeight={400}
            sx={{
              color: "thread.text.highlightedText",
              overflow: "hidden",
              whiteSpace: "pre-wrap",
              display: "-webkit-box",
              wordBreak: "break-word",
              WebkitLineClamp: 2,
              ml: "8px",
            }}
            style={{
              WebkitBoxOrient: "vertical",
            }}
          >
            {highlightedText}
          </Text>
        </Box>
      ) : null}
      <Text
        fontSize={"14px"}
        lineHeight={"20px"}
        fontWeight={400}
        sx={{
          color: "thread.text.message",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
        }}
        as="p"
      >
        {getTextWithMentionsArray(text, mentions)}
      </Text>
      {(showRepliesText && repliesCount) || (reactions && reactions?.length) ? (
        <div className="flex justify-between items-top">
          <div className="flex flex-wrap items-center gap-2">
            {reactions && reactions?.length
              ? reactions.map((reac) => (
                  <Reactions
                    key={reac.emoji}
                    addReaction={addReaction}
                    removeReaction={removeReaction}
                    emoji={reac.emoji}
                    count={reac.count}
                    reacted={reac.reacted}
                    viewOnly={!canAddReaction}
                  />
                ))
              : null}
            {reactions && reactions?.length && canAddReaction ? (
              <Reactions
                addReaction={addReaction}
                removeReaction={removeReaction}
                emoji={""}
                count={0}
                reacted={false}
                color={Colors.gray["500"]}
              />
            ) : null}
          </div>
          {showRepliesText && repliesCount ? (
            <Text
              as="p"
              fontWeight={700}
              whiteSpace={"nowrap"}
              fontSize={"12px"}
              lineHeight={"18px"}
              color="thread.text.repliesText"
              sx={{ cursor: "pointer" }}
              onClick={() => {
                if (showingReplies) {
                  onClickHideReplies && onClickHideReplies();
                } else {
                  onClickRepliesText && onClickRepliesText();
                }
              }}
            >
              {showingReplies ? "Hide replies" : "Show replies"}
              {/* {showingReplies && repliesCount === comments.length
                ? "Hide replies"
                : showingReplies
                ? `View ${repliesCount - comments.length} more`
                : `View ${repliesCount} ${
                    repliesCount === 1 ? "reply" : "replies"
                  }`} */}
            </Text>
          ) : null}
        </div>
      ) : null}
    </CommentBodyContainer>
  );
};

interface ThreadProps {
  thread: ThreadType;
  showHighlightedText?: boolean;
  showContainerBox?: boolean;
  alwaysShowReplyOption?: boolean;
  onDelete?: (thread: ThreadType) => void;
  onResolve?: (id: number) => void;
  handleCommentClick?: (thread: ThreadType) => void;
}

const Thread: FC<ThreadProps> = (props) => {
  const { selectedObjectId } = useRightRail();

  const { removeThread, updateThread } = useCanvas();

  const {
    thread,
    showHighlightedText = false,
    showContainerBox = true,
    alwaysShowReplyOption = false,
    onDelete,
    onResolve,
  } = props;
  const [inputValue, setInputValue] = useState("");
  const [posting, setPosting] = useState(false);

  const [comments, setComments] = useState((): ThreadCommentType[] => []);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const [deletingThread, setDeletingThread] = useState(false);
  const [deletingComment, setDeletingComment] = useState(false);

  const [mentionedUsers, setMentionedUsers] = useState([]);

  const { addToast } = useToasts();
  const { branch, repo } = useCanvas();
  const { user, isLoggedIn } = useUser();
  const { colorMode } = useTheme();
  const { currentStudio } = useStudio();

  const isCreator = thread.createdById === user?.id;

  const hasManageContentPerm = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_MANAGE_CONTENT,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );

  const canManageContent = isLoggedIn && hasManageContentPerm;

  const canDeleteComment = isLoggedIn && (canManageContent || isCreator);

  const hasAddCommentPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_ADD_COMMENT,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;

  const canAddComment = isLoggedIn && hasAddCommentPerm;

  const canResolveComments =
    isLoggedIn && (canManageContent || (!thread.isResolved && isCreator));

  const createThreadComment = async () => {
    try {
      setPosting(true);
      const payload = {
        data: {
          text: inputValue.trim(),
        },
        isEdited: false,
        isReply: false,
        parentId: 0,
        position: thread.commentCount + 1,
        threadId: thread.id,
      };
      segmentEvents.commentAdded(
        currentStudio?.handle!,
        repo?.key!,
        user?.id!,
        "comment"
      );
      const response1 = await BlocksService.createThreadComment(payload);
      const comment: ThreadCommentType = response1.data.data;
      const filteredMentions = getFilteredMentions(
        inputValue.trim(),
        mentionedUsers
      );
      if (filteredMentions?.length) {
        const data: CreateMentionType = {
          branches: [],
          objectID: comment.id,
          roles: [],
          scope: "block_comment",
          users: filteredMentions.map((men: any) => men.id),
        };
        // segmentEvents.mentionAdded(
        //   item.type,
        //   "block",
        //   user?.username!,
        //   item?.username,
        //   "",
        //   currentStudio?.handle!,
        //   repo?.key!,
        //   0
        // );
        const response2 = await BlocksService.mentionUsers(data);
        const newMentions =
          filteredMentions?.map((user: any) => {
            return {
              avatarUrl: user.avatarUrl,
              fullName: user.fullName,
              id: user.id,
              type: "user",
              username: user.username,
              uuid: user.uuid,
            };
          }) || [];
        setComments([
          ...comments,
          {
            ...comment,
            mentions: [...newMentions],
          },
        ]);
      } else {
        setComments([...comments, comment]);
      }
      setShowComments(true);
      setPosting(false);
      setInputValue("");
      setMentionedUsers([]);
      const updatedThread = {
        ...thread,
        commentCount: thread.commentCount + 1,
      };
      updateThread(updatedThread);
    } catch (err) {
      setPosting(false);
      addToast("Something went wrong.", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const getComments = () => {
    setLoadingComments(true);
    BlocksService.getBlockThreadComments(thread.id)
      .then((r) => {
        const data = r.data.data;
        const filteredComments = data.filter(
          (com: ThreadCommentType) => !com.isArchived
        );
        setComments(filteredComments);
        setLoadingComments(false);
        scrollThread();
      })
      .catch((err) => {
        setLoadingComments(false);
        setShowComments(false);
        addToast("Failed to load comments. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const resolveThread = () => {
    BlocksService.resolveThread(thread.id)
      .then((r) => {
        removeThread(thread);
        addToast("Successfully resolved thread", {
          appearance: "success",
          autoDismiss: true,
        });
        onResolve && onResolve(thread.id);
      })
      .catch((err) => {
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const commentDeletedEvent = (type: string) => {
    currentStudio?.handle &&
      repo?.key &&
      user?.id &&
      segmentEvents.commentDeleted(
        currentStudio?.handle,
        repo?.key,
        user?.id,
        type
      );
  };

  const deleteThread = () => {
    if (!deletingThread) {
      setDeletingThread(true);
      commentDeletedEvent("block");
      BlocksService.deleteBlockThread(thread.id)
        .then((r) => {
          setDeletingThread(false);
          removeThread(thread);
          // local caching blocks invalidate
          invalidateCanvasBlocks(branch?.id);
          onDelete && onDelete(thread);
        })
        .catch((err) => {
          setDeletingThread(false);
          addToast("Failed to delete. Please try again", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  };

  const deleteThreadComment = (comment: ThreadCommentType) => {
    if (!deletingComment) {
      setDeletingComment(true);
      commentDeletedEvent("comment");
      BlocksService.deleteBlockThreadComment(comment.id)
        .then((r) => {
          setDeletingComment(false);
          const filteredComments = comments.filter(
            (com) => com.id !== comment.id
          );
          setComments(filteredComments);
          const updatedThread = {
            ...thread,
            commentCount: thread.commentCount - 1,
          };
          updateThread(updatedThread);
        })
        .catch((err) => {
          setDeletingComment(false);
          addToast("Failed to delete comment. Please try again", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  };

  const getReactionData = (
    type: ReactionScope,
    emoji: string,
    comment?: ThreadCommentType
  ): CreateReactionType => {
    const data = {
      blockUUID: thread.startBlockUUID,
      blockThreadID: thread.id,
      canvasBranchID: thread.canvasBranchId,
      scope: type,
      emoji: emoji,
      reelCommentID: 0,
      reelID: 0,
    };
    switch (type) {
      case "block_thread":
        return {
          blockCommentID: 0,
          ...data,
        };

      case "block_comment":
        return {
          blockCommentID: comment ? comment.id : 0,
          ...data,
        };

      default:
        return {
          blockCommentID: 0,
          ...data,
        };
    }
  };

  const reactionAddedEvent = (type: string) => {
    currentStudio?.handle &&
      repo?.key &&
      user?.id &&
      segmentEvents.reactionAdded(
        currentStudio?.handle,
        repo?.key,
        user?.id,
        type
      );
  };

  const addThreadReaction = (emoji: string) => {
    const data = getReactionData("block_thread", emoji);
    reactionAddedEvent("comment");
    BlocksService.createReaction(data)
      .then((r) => {
        const reactions = getUpdatedReactions(thread.reactions, emoji);
        const updatedThread = { ...thread, reactions: reactions };
        updateThread(updatedThread);
      })
      .catch((err) => {
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const removeThreadReaction = (emoji: string) => {
    const data = getReactionData("block_thread", emoji);
    BlocksService.removeReaction(data)
      .then((r) => {
        const reactions = getUpdatedReactions(
          thread.reactions,
          emoji,
          "remove"
        );
        const updatedThread = { ...thread, reactions: reactions };
        updateThread(updatedThread);
      })
      .catch((err) => {
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const addCommentReaction = (emoji: string, comment: ThreadCommentType) => {
    const data = getReactionData("block_comment", emoji, comment);
    reactionAddedEvent("comment");
    BlocksService.createReaction(data)
      .then((r) => {
        const reactions = getUpdatedReactions(comment.reactions, emoji);
        comment.reactions = reactions;
        const commentIndex = comments.findIndex((com) => com.id === comment.id);
        if (commentIndex >= 0) {
          comments[commentIndex] = comment;
          setComments([...comments]);
        }
      })
      .catch((err) => {
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const removeCommentReaction = (emoji: string, comment: ThreadCommentType) => {
    const data = getReactionData("block_comment", emoji, comment);
    segmentEvents.reactionDeleted(
      currentStudio?.handle!,
      repo?.key!,
      user?.id!,
      "comment"
    );
    BlocksService.removeReaction(data)
      .then((r) => {
        const reactions = getUpdatedReactions(
          comment.reactions,
          emoji,
          "remove"
        );
        comment.reactions = reactions;
        const commentIndex = comments.findIndex((com) => com.id === comment.id);
        if (commentIndex >= 0) {
          comments[commentIndex] = comment;
          setComments([...comments]);
        }
      })
      .catch((err) => {
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const scrollThread = () => {
    const element = document.getElementById(`thread-${thread.id}`);
    const container = document.getElementById(`right-rail-container`);
    if (element && container) {
      container?.scrollTo({
        top: element.offsetTop - 50,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box
      width={"100%"}
      display={"flex"}
      flexDirection="column"
      position="relative"
      sx={{
        bg: showContainerBox ? "thread.bg" : "",
        border: showContainerBox ? "1px solid" : "",
        borderColor: showContainerBox ? "thread.border" : "",
        boxShadow: showContainerBox ? "0px 1px 0px rgba(27, 31, 35, 0.04)" : "",
        borderRadius: "12px",
        marginBottom: showContainerBox ? "8px" : "",
        padding: showContainerBox ? "8px" : "",
        ":last-child": {
          mb: "0px",
        },
      }}
      onClick={() => {
        if (props.handleCommentClick) {
          props.handleCommentClick(thread);
        }
      }}
      id={`thread-${thread.id}`}
    >
      <CommentBody
        highlightedText={showHighlightedText ? thread.highlightedText : ""}
        text={thread.text}
        showRepliesText={thread?.commentCount > 0}
        showingReplies={showComments}
        repliesCount={thread.commentCount}
        onClickHideReplies={() => {
          setShowComments(false);
        }}
        onClickRepliesText={() => {
          if (!loadingComments) {
            getComments();
            setShowComments(true);
          }
        }}
        showMenu={canDeleteComment}
        showResolve={canResolveComments && !thread?.isResolved}
        onClickResolve={resolveThread}
        onClickDelete={deleteThread}
        addReaction={addThreadReaction}
        removeReaction={removeThreadReaction}
        reactions={thread?.reactions}
        mentions={thread.mentions}
        createdAt={thread.createdAt}
        user={thread.user}
        comments={comments}
      />
      {showComments ? (
        loadingComments ? (
          <div className="flex items-center justify-center">
            <BipLoader />
          </div>
        ) : (
          <>
            <ActionList.Divider />
            <Box className="flex flex-col space-y-3">
              {comments.map((comment) => (
                <CommentBody
                  highlightedText={""}
                  text={comment.data.text}
                  showRepliesText={false}
                  repliesCount={0}
                  key={comment.id}
                  showMenu={
                    canManageContent || comment?.createdByID === user?.id
                  }
                  onClickDelete={() => {
                    deleteThreadComment(comment);
                  }}
                  addReaction={(emoji: string) => {
                    addCommentReaction(emoji, comment);
                  }}
                  removeReaction={(emoji: string) => {
                    removeCommentReaction(emoji, comment);
                  }}
                  reactions={comment.reactions}
                  mentions={comment.mentions}
                  createdAt={comment.createdAt}
                  user={comment.user}
                  comments={[]}
                />
              ))}
            </Box>
          </>
        )
      ) : null}
      {canAddComment &&
      (alwaysShowReplyOption ||
        selectedObjectId === `thread-${thread.uuid}`) ? (
        <div className="flex mt-3 space-x-2 items-top">
          <Avatar
            src={user?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
            sx={{ width: "28px", height: "28px", flexShrink: 0 }}
            alt={"user"}
            draggable={false}
          />
          <MentionsInput
            id={`block-thread-reply-${thread.id}`}
            onChange={(e: any, mentionedUsers) => {
              setInputValue(e.target.value);
              setMentionedUsers(mentionedUsers);
            }}
            onEnterClick={(e: any) => {
              if (!posting && inputValue?.trim()?.length) {
                createThreadComment();
              }
            }}
            maxRows={10}
            className={
              "overflow-hidden text-sm resize-none outline-0 flex flex-1 px-2 py-1 w-full box-border"
            }
            style={{
              border: "1px solid",
              borderColor:
                colorMode === "day" ? Colors.geyser : Colors.gray["700"],
              boxShadow: "inset 0px 1px 2px rgba(27, 31, 35, 0.075)",
              borderRadius: "6px",
              backgroundColor:
                colorMode === "day" ? Colors.white : Colors.gray["800"],
            }}
            placeholder="Type your reply here"
            // autoFocus
            value={inputValue}
            onClick={() => {
              if (!showComments) {
                scrollThread();
              }
            }}
          />
        </div>
      ) : null}

      {inputValue?.trim()?.length ? (
        <div className="flex flex-row-reverse mt-2">
          <Button
            size="small"
            variant="primary"
            sx={{ border: "none", marginLeft: "8px" }}
            disabled={posting || inputValue?.trim()?.length <= 0}
            onClick={createThreadComment}
          >
            {posting ? "Posting..." : "Post"}
          </Button>
          {!posting && (
            <Button
              size="small"
              variant="invisible"
              sx={{ border: "none", color: "text.subtle" }}
              onClick={() => {
                setInputValue("");
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      ) : null}
    </Box>
  );
};

export default Thread;
