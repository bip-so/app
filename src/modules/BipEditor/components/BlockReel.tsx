import {
  ActionList,
  ActionMenu,
  Avatar,
  Box,
  Button,
  IconButton,
  Popover,
  Text,
  useOnOutsideClick,
  useTheme,
} from "@primer/react";
import React, { createRef, FC, useRef, useState } from "react";
import TimeAgo from "react-timeago";
import { useToasts } from "react-toast-notifications";
import MentionsInput from "../../../components/MentionsInput";
import Reactions from "../../../components/Reactions";
import { useCanvas } from "../../../context/canvasContext";
import { useRightRail } from "../../../context/rightRailContext";
import ReplyIcon from "../../../icons/ReplyIcon";
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
import BlocksService from "../services";
import {
  BlockType,
  CreateMentionType,
  CreateReactionType,
  ReactionScope,
  ReelCommentType,
  ReelType,
} from "../types";
import AddReelIcon from "./AddReelIcon";
import {
  ChevronDownIcon,
  KebabHorizontalIcon,
  RssIcon,
} from "@primer/styled-octicons";
import { DEFAULT_USER_PLACEHOLDER } from "../../../commons/constants";
import { useUser } from "../../../context/userContext";
import BipLoader from "../../../components/BipLoader";
import styled from "styled-components";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../hooks/useHasPermission";
import {
  CanvasPermissionEnum,
  CanvasPermissionGroupEnum,
} from "../../Permissions/enums";
import { BranchAccessEnum } from "../../Canvas/enums";
import Colors from "../../../utils/Colors";
import segmentEvents from "../../../insights/segment";
import { useStudio } from "../../../context/studioContext";
import { useRouter } from "next/router";
import Link from "next/link";
import BipRouteUtils from "../../../core/routeUtils";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

interface HeaderProps {
  reel: ReelType;
  showReaction: boolean;
  addReaction?: (emoji: string) => void;
  removeReaction?: (emoji: string) => void;
  showContainerBox: boolean;
}

const Header: FC<HeaderProps> = ({
  reel,
  showReaction,
  addReaction,
  removeReaction,
  showContainerBox,
}: HeaderProps) => {
  const { createdAt, user } = reel;
  const [openMenu, setOpenMenu] = useState(false);

  const { user: curUser, isLoggedIn } = useUser();
  const { currentStudio } = useStudio();
  const { addToast } = useToasts();

  const { removeReel, branch } = useCanvas();

  const menuRef = useRef(null);

  const hasAddReactionPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_REACT_TO_REEL,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;
  const router = useRouter();

  const canAddReaction = isLoggedIn && hasAddReactionPerm;
  const { blocks, repo } = useCanvas();

  const hasEditPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_EDIT,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) || branch?.publicAccess === BranchAccessEnum.EDIT;

  const canEdit = isLoggedIn && hasEditPerm;

  const isModerator =
    branch?.permissionGroup?.systemName === CanvasPermissionGroupEnum.MODERATE;

  const canDeleteReel =
    isLoggedIn && (isModerator || (canEdit && curUser?.id === user?.id));

  const handleDeleteReel = async () => {
    try {
      segmentEvents.reelDeleted(
        currentStudio?.handle!,
        repo?.key!,
        repo?.name!,
        reel.contextData.text,
        blocks.length,
        user.id
      );

      const deleteReelResponse = await BlocksService.deleteReel(reel.id);
      removeReel(reel);
    } catch (error) {
      addToast("Something went wrong. Please try again", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  return (
    <div className="flex items-center justify-between h-7">
      {showContainerBox && (
        <Box
          className="absolute left-0 flex items-center justify-center w-4 h-4 rounded-full "
          sx={{
            bg: "reel.bg",
            boxShadow:
              "0px 8px 24px rgba(66, 74, 83, 0.12), 0px 1px 3px rgba(27, 31, 36, 0.12)",
          }}
        >
          <RssIcon />
        </Box>
      )}
      <div
        className={`flex items-center space-x-2 ${
          showContainerBox ? "ml-3" : ""
        }`}
      >
        <Avatar
          sx={{ height: "24px", width: "24px" }}
          src={reel.user.avatarUrl || DEFAULT_USER_PLACEHOLDER}
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
            color="reel.comment.text"
            sx={{ cursor: "pointer" }}
          >
            {user.fullName || user.username}
          </Text>
        </LinkWithoutPrefetch>
        <Text
          as="p"
          fontWeight={400}
          fontSize={"12px"}
          lineHeight={"18px"}
          color="reel.comment.time"
        >
          <TimeAgo
            title={formatDateAndTime(createdAt)}
            minPeriod={60}
            formatter={shortTimeAgoFormatter}
            date={createdAt}
          />
        </Text>
      </div>
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
        {canDeleteReel ? (
          <IconButton
            ref={menuRef}
            variant="invisible"
            icon={KebabHorizontalIcon}
            size="small"
            sx={{ color: "reel.comment.downIcon", padding: "2px 4px" }}
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
              <ActionList.Item onSelect={handleDeleteReel}>
                Delete
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: ReelCommentType;
  hideReply?: boolean;
  addReaction: (emoji: string) => void;
  removeReaction: (emoji: string) => void;
  onClickDelete: () => void;
  onClickReply?: () => void;
  onClickReplies?: () => void;
  repliesText?: string;
}

const CommentItem: FC<CommentItemProps> = (props) => {
  const {
    comment,
    addReaction,
    removeReaction,
    hideReply,
    onClickReply,
    onClickReplies,
    repliesText,
    onClickDelete,
  } = props;
  const { user: curUser, isLoggedIn } = useUser();
  const { branch, repo } = useCanvas();

  const hasAddReactionPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_REACT_TO_REEL,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;

  const canAddReaction = isLoggedIn && hasAddReactionPerm;

  const hasEditPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_EDIT,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) || branch?.publicAccess === BranchAccessEnum.EDIT;

  const canEdit = isLoggedIn && hasEditPerm;

  const isModerator =
    branch?.permissionGroup?.systemName === CanvasPermissionGroupEnum.MODERATE;

  const canDeleteComment =
    isLoggedIn &&
    (isModerator || (canEdit && curUser?.id === comment?.user?.id));

  return (
    <Box display={"flex"}>
      <Avatar
        src={comment.user?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
        sx={{ width: "28px", height: "28px", flexShrink: 0 }}
        alt={"user"}
        draggable={false}
      />
      <div className="flex flex-col flex-1">
        <Box
          display={"flex"}
          flexDirection={"column"}
          flex={1}
          backgroundColor={"reel.comment.bg"}
          padding={"6px 12px"}
          ml={"6px"}
          borderRadius={"0px 12px 12px 12px"}
        >
          <div className="flex justify-between">
            <div className="flex items-end">
              <LinkWithoutPrefetch
                href={BipRouteUtils.getProfileRoute(comment.user.username)}
              >
                <Text
                  as="p"
                  fontWeight={500}
                  color={"reel.comment.text"}
                  fontSize={"14px"}
                  mr={"4px"}
                  sx={{ cursor: "pointer" }}
                >
                  {comment.user?.fullName || comment.user?.username}
                </Text>
              </LinkWithoutPrefetch>
              <Text
                as="p"
                fontSize={"12px"}
                color={"reel.comment.time"}
                fontWeight={400}
              >
                <TimeAgo
                  title={formatDateAndTime(comment?.createdAt)}
                  minPeriod={60}
                  formatter={shortTimeAgoFormatter}
                  date={comment?.createdAt}
                />
              </Text>
            </div>
            {canDeleteComment ? (
              <ActionMenu>
                <ActionMenu.Anchor>
                  <Box
                    sx={{
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    <ChevronDownIcon color={"reel.comment.downIcon"} />
                  </Box>
                </ActionMenu.Anchor>
                <ActionMenu.Overlay
                  sx={{ minWidth: "70px", borderRadius: "unset" }}
                >
                  <ActionList sx={{ padding: "0px" }}>
                    <ActionList.Item variant="danger" onSelect={onClickDelete}>
                      Delete
                    </ActionList.Item>
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            ) : null}
          </div>
          <Text
            as="p"
            fontSize={"12px"}
            lineHeight={"18px"}
            mt={"4px"}
            sx={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
          >
            {getTextWithMentionsArray(
              comment?.rangeStart?.text,
              comment.mentions
            )}
          </Text>
          <div className="flex items-center justify-end space-x-2">
            <div className="flex items-center space-x-2">
              {comment.reactionCounter?.map((reac) => (
                <Reactions
                  key={reac.emoji}
                  addReaction={addReaction}
                  removeReaction={removeReaction}
                  emoji={reac.emoji}
                  count={reac.count}
                  reacted={reac.reacted}
                  viewOnly={!canAddReaction}
                />
              ))}
              {canAddReaction ? (
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
            {hideReply ? null : (
              <div className="cursor-pointer" onClick={onClickReply}>
                <ReplyIcon />
              </div>
            )}
            {comment.commentCount > 0 ? (
              <Text
                as="p"
                fontSize={"12px"}
                lineHeight={"18px"}
                color="reel.comment.repliesText"
                sx={{ cursor: "pointer" }}
                onClick={onClickReplies}
              >
                {repliesText ? repliesText : `${comment.commentCount} replies`}
              </Text>
            ) : null}
          </div>
        </Box>
      </div>
    </Box>
  );
};

interface CommentProps {
  comment: ReelCommentType;
  addReaction: (emoji: string) => void;
  removeReaction: (emoji: string) => void;
  reelId: number;
  updateComment: (comment: ReelCommentType) => void;
  onClickDelete: () => void;
  getReactionData: (
    type: ReactionScope,
    emoji: string,
    comment?: ReelCommentType
  ) => CreateReactionType;
}

const Comment: FC<CommentProps> = (props) => {
  const {
    comment,
    addReaction,
    removeReaction,
    reelId,
    updateComment,
    getReactionData,
    onClickDelete,
  } = props;

  const [replies, setReplies] = useState((): ReelCommentType[] => []);
  const [showReplies, setShowReplies] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [postingReply, setPostingReply] = useState(false);
  const { user, isLoggedIn } = useUser();
  const { branch, repo } = useCanvas();
  const { colorMode } = useTheme();
  const { currentStudio } = useStudio();

  const { addToast } = useToasts();

  const getReplies = () => {
    setLoadingReplies(true);
    BlocksService.getReelComments(reelId, comment.id)
      .then((r) => {
        const data = r.data.data;
        const filteredComments = data.filter(
          (com: ReelCommentType) => !com.isArchived
        );
        setLoadingReplies(false);
        setReplies(filteredComments);
      })
      .catch((err) => {
        setLoadingReplies(false);
      });
  };

  const deleteReply = (reply: ReelCommentType) => {
    BlocksService.deleteReelComment(reelId, reply.id)
      .then((r) => {
        const newReplies = replies.filter((rp) => rp.id !== reply.id);
        setReplies(newReplies);
        updateComment({ ...comment, commentCount: comment.commentCount - 1 });
      })
      .catch((err) => {
        addToast("Failed to delete. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const postReplyComment = async () => {
    try {
      const data = {
        data: { text: inputValue.trim() },
        isEdited: false,
        isReply: true,
        parentID: comment.id,
      };
      setPostingReply(true);
      const r = await BlocksService.addReelComment(reelId, data);
      updateComment({ ...comment, commentCount: comment.commentCount + 1 });
      const reply: ReelCommentType = r.data.data;
      const filteredMentions = getFilteredMentions(
        inputValue.trim(),
        mentionedUsers
      );
      if (filteredMentions?.length) {
        const data: CreateMentionType = {
          branches: [],
          objectID: reply.id,
          scope: "reel_comment",
          users: filteredMentions.map((men: any) => men.id),
        };
        // segmentEvents.mentionAdded(
        //   "user",
        //   "reel",
        //   curUser?.username,
        //   filteredMentions[0].username,
        //   "",
        //   currentStudio?.handle,
        //   repo?.key,
        //   reelId
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
        if (showReplies) {
          setReplies([{ ...reply, mentions: newMentions }, ...replies]);
        } else {
          setShowReplies(true);
          getReplies();
        }
      } else {
        if (showReplies) {
          setReplies([{ ...reply }, ...replies]);
        } else {
          setShowReplies(true);
          getReplies();
        }
      }
      setMentionedUsers([]);
      setPostingReply(false);
      setInputValue("");
    } catch (err) {
      addToast("Failed to add reply. Please try again", {
        appearance: "error",
        autoDismiss: true,
      });
      setPostingReply(false);
    }
  };

  const addReplyReaction = (emoji: string, reply: ReelCommentType) => {
    const data = getReactionData("reel_comment", emoji, reply);
    BlocksService.createReaction(data)
      .then((r) => {
        const reactions = getUpdatedReactions(reply.reactionCounter, emoji);
        reply.reactionCounter = reactions;
        const replyIndex = replies.findIndex((com) => com.id === reply.id);
        if (replyIndex >= 0) {
          replies[replyIndex] = reply;
          setReplies([...replies]);
        }
      })
      .catch((err) => {
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const removeReplyReaction = (emoji: string, reply: ReelCommentType) => {
    const data = getReactionData("reel_comment", emoji, reply);
    BlocksService.removeReaction(data)
      .then((r) => {
        const reactions = getUpdatedReactions(
          reply.reactionCounter,
          emoji,
          "remove"
        );
        reply.reactionCounter = reactions;
        const replyIndex = replies.findIndex((com) => com.id === reply.id);
        if (replyIndex >= 0) {
          replies[replyIndex] = reply;
          setReplies([...replies]);
        }
      })
      .catch((err) => {
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const hasAddCommentPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_COMMENT_ON_REEL,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;

  const canAddComment = isLoggedIn && hasAddCommentPerm;

  return (
    <Box display={"flex"} flexDirection={"column"}>
      <CommentItem
        comment={comment}
        addReaction={addReaction}
        removeReaction={removeReaction}
        onClickReply={() => {
          setShowInput(!showInput);
        }}
        onClickReplies={() => {
          if (showReplies) {
            setShowReplies(false);
          } else {
            setShowReplies(true);
            getReplies();
          }
        }}
        repliesText={
          showReplies ? "Hide replies" : `${comment.commentCount} replies`
        }
        onClickDelete={onClickDelete}
        hideReply={canAddComment ? false : true}
      />
      <Box sx={{ ml: "40px", mt: "16px" }} className="space-y-4">
        {showReplies ? (
          loadingReplies ? (
            <div className="flex items-center justify-center">
              <BipLoader />
            </div>
          ) : (
            replies.map((reply: ReelCommentType) => (
              <CommentItem
                comment={reply}
                hideReply={true}
                addReaction={(emoji: string) => {
                  addReplyReaction(emoji, reply);
                }}
                removeReaction={(emoji: string) => {
                  removeReplyReaction(emoji, reply);
                }}
                onClickDelete={() => {
                  deleteReply(reply);
                }}
              />
            ))
          )
        ) : null}
        {showInput ? (
          <div className="flex flex-col">
            <div className="flex space-x-2 items-top">
              <Avatar
                src={user?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
                sx={{ width: "28px", height: "28px", flexShrink: 0 }}
                alt={"user"}
                draggable={false}
              />
              <MentionsInput
                id={"reels-reply-comment-input-textarea"}
                onChange={(e: any, mentionedUsers: any) => {
                  setInputValue(e.target.value);
                  setMentionedUsers(mentionedUsers);
                }}
                onEnterClick={() => {
                  if (!postingReply && inputValue?.trim()?.length) {
                    postReplyComment();
                  }
                }}
                maxRows={5}
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
                value={inputValue}
              />
            </div>
            {inputValue?.trim()?.length ? (
              <Box display={"flex"} justifyContent={"flex-end"}>
                <Text
                  as="p"
                  fontSize={"10px"}
                  lineHeight={"14px"}
                  color={"reel.comment.time"}
                >
                  (shift + enter) for new line . (enter) to post
                </Text>
              </Box>
            ) : null}
          </div>
        ) : null}
      </Box>
    </Box>
  );
};

interface BlockReelProps {
  reel: ReelType;
  showContainerBox?: boolean;
  alwaysShowReplyOption?: boolean;
  showHighlightedText?: boolean;
  handleReelClick?: (reel: ReelType) => void;
}

const BlockReel: FC<BlockReelProps> = (props) => {
  const {
    reel,
    showContainerBox = true,
    alwaysShowReplyOption = false,
    showHighlightedText = false,
  } = props;
  const [comments, setComments] = useState((): ReelCommentType[] => []);
  const [loadingComments, setLoadingComments] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [posting, setPosting] = useState(false);
  const [postingReply, setPostingReply] = useState(false);
  const [replyCommentText, setReplyCommentText] = useState("");
  const [selectedComment, setSelectedComment] = useState((): any => null);
  const [showComments, setShowComments] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const { selectedObjectId } = useRightRail();
  const { user, isLoggedIn } = useUser();
  const { currentStudio } = useStudio();
  const { repo } = useCanvas();

  const textAreaRef = useRef(null);
  const replyCommentRef = useRef(null);

  const anchorRef = createRef();

  const { addToast } = useToasts();
  const { updateReel, branch } = useCanvas();
  const { colorMode } = useTheme();

  // const canDeleteReel = useHasPermission(
  //   CanvasPermissionEnum.CANVAS_BRANCH_CREATE_REEL,
  //   PermissionContextEnum.Canvas,
  //   branch?.permissionGroup?.permissions
  // );

  const hasAddReactionPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_REACT_TO_REEL,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;

  const canAddReaction = isLoggedIn && hasAddReactionPerm;

  const hasAddCommentPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_COMMENT_ON_REEL,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;

  const canAddComment = isLoggedIn && hasAddCommentPerm;

  const getComments = () => {
    setLoadingComments(true);
    BlocksService.getReelComments(reel.id)
      .then((r) => {
        const data = r.data.data;
        const filteredComments = data.filter(
          (com: ReelCommentType) => !com.isArchived
        );
        setLoadingComments(false);
        setComments(filteredComments);
        scrollReel();
      })
      .catch((err) => {
        setLoadingComments(false);
      });
  };

  const addCommentEvent = (type: string) => {
    currentStudio?.handle &&
      repo?.key &&
      user?.id &&
      segmentEvents.commentAdded(
        currentStudio?.handle,
        repo?.key,
        user?.id,
        type
      );
  };

  const postReelComment = async () => {
    try {
      const data = {
        data: { text: inputValue.trim() },
        isEdited: false,
        isReply: false,
      };
      setPosting(true);
      addCommentEvent("reel");
      const r = await BlocksService.addReelComment(reel.id, data);
      const comment: ReelCommentType = r.data.data;
      const filteredMentions = getFilteredMentions(
        inputValue.trim(),
        mentionedUsers
      );
      if (filteredMentions?.length) {
        const data: CreateMentionType = {
          branches: [],
          objectID: comment.id,
          scope: "reel_comment",
          users: filteredMentions.map((men: any) => men.id),
        };
        // segmentEvents.mentionAdded(
        //   "user",
        //   "reel",
        //   user?.username!,
        //   filteredMentions[0].username,
        //   "",
        //   currentStudio?.handle!,
        //   repo?.key!,
        //   reel?.id
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
        if (showComments) {
          setComments([{ ...comment, mentions: newMentions }, ...comments]);
        } else {
          setShowComments(true);
          getComments();
        }
      } else {
        if (showComments) {
          setComments([{ ...comment }, ...comments]);
        } else {
          setShowComments(true);
          getComments();
        }
      }
      updateReel({
        ...reel,
        commentCount: reel.commentCount + 1,
      });
      setMentionedUsers([]);
      setPosting(false);
      setInputValue("");
    } catch (err) {
      addToast("Failed to add comment. Please try again", {
        appearance: "error",
        autoDismiss: true,
      });
      setPosting(false);
    }
  };

  const postReplyComment = () => {
    const data = {
      data: { text: replyCommentText },
      isEdited: false,
      isReply: true,
      parentID: selectedComment?.id,
    };
    setPostingReply(true);
    BlocksService.addReelComment(reel.id, data)
      .then((r) => {
        setPostingReply(false);
        setReplyCommentText("");
        setSelectedComment(null);
      })
      .catch((err) => {
        addToast("Failed to add reply. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
        setPostingReply(false);
      });
  };

  const getReactionData = (
    type: ReactionScope,
    emoji: string,
    comment?: ReelCommentType
  ): CreateReactionType => {
    const data = {
      blockUUID: reel.startBlockUUID,
      blockThreadID: 0,
      blockCommentID: 0,
      canvasBranchID: reel.canvasBranchID,
      scope: type,
      emoji: emoji,
      reelID: reel.id,
    };
    switch (type) {
      case "reel":
        return {
          reelCommentID: 0,
          ...data,
        };

      case "reel_comment":
        return {
          reelCommentID: comment ? comment.id : 0,
          ...data,
        };

      default:
        return {
          reelCommentID: 0,
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

  const addReelReaction = (emoji: string) => {
    const data = getReactionData("reel", emoji);
    reactionAddedEvent("reel");
    BlocksService.createReaction(data)
      .then((r) => {
        const reactions = getUpdatedReactions(reel.reactions, emoji);
        const updatedReel = { ...reel, reactions: reactions };
        updateReel(updatedReel);
      })
      .catch((err) => {
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const removeReelReaction = (emoji: string) => {
    const data = getReactionData("reel", emoji);
    segmentEvents.reactionDeleted(
      currentStudio?.handle!,
      repo?.key!,
      user?.id!,
      "reel"
    );
    BlocksService.removeReaction(data)
      .then((r) => {
        const reactions = getUpdatedReactions(reel.reactions, emoji, "remove");
        const updatedReel = { ...reel, reactions: reactions };
        updateReel(updatedReel);
      })
      .catch((err) => {
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const addReelCommentReaction = (emoji: string, comment: ReelCommentType) => {
    const data = getReactionData("reel_comment", emoji, comment);
    reactionAddedEvent("comment");
    BlocksService.createReaction(data)
      .then((r) => {
        const reactions = getUpdatedReactions(comment.reactionCounter, emoji);
        comment.reactionCounter = reactions;
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

  const removeReelCommentReaction = (
    emoji: string,
    comment: ReelCommentType
  ) => {
    const data = getReactionData("reel_comment", emoji, comment);
    BlocksService.removeReaction(data)
      .then((r) => {
        const reactions = getUpdatedReactions(
          comment.reactionCounter,
          emoji,
          "remove"
        );
        comment.reactionCounter = reactions;
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

  const updateComment = (comment: ReelCommentType) => {
    const commentIndex = comments.findIndex((c) => c.id === comment.id);
    if (commentIndex >= 0) {
      comments[commentIndex] = comment;
      setComments([...comments]);
    }
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

  const deleteComment = (comment: ReelCommentType) => {
    commentDeletedEvent("reel");
    BlocksService.deleteReelComment(reel.id, comment.id)
      .then((r) => {
        const newComments = comments.filter((cm) => cm.id !== comment.id);
        setComments(newComments);
        updateReel({ ...reel, commentCount: reel.commentCount - 1 });
      })
      .catch((err) => {
        addToast("Failed to delete. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const scrollReel = () => {
    const element = document.getElementById(`reel-${reel.id}`);
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
      sx={{
        display: "flex",
        flexDirection: "column",
        bg: "reel.bg",
        border: showContainerBox ? "1px solid" : "",
        borderColor: showContainerBox ? "reel.border" : "",
        boxShadow: showContainerBox ? "0px 1px 0px rgba(27, 31, 35, 0.04)" : "",
        marginBottom: showContainerBox ? "8px" : "",
        borderRadius: "12px",
        width: "100%",
        padding: "8px",
        ":last-child": {
          mb: "0px",
        },
        ".icons-container": {
          display: "none",
        },
        ":hover": {
          ".icons-container": {
            display: "flex",
          },
        },
      }}
      className="space-y-2"
      onClick={() => {
        if (props.handleReelClick) {
          props.handleReelClick(reel);
        }
      }}
      id={`reel-${reel.id}`}
    >
      <Header
        reel={reel}
        showReaction={
          reel.reactions && reel.reactions.length > 0 ? false : true
        }
        addReaction={addReelReaction}
        removeReaction={removeReelReaction}
        showContainerBox={showContainerBox}
      />
      {showHighlightedText && reel.highlightedText ? (
        <Box
          sx={{
            borderLeft: "3px solid",
            borderColor: "reel.comment.highlightTextBorder",
          }}
        >
          <Text
            as="p"
            fontSize={"14px"}
            lineHeight={"20px"}
            fontWeight={400}
            sx={{
              color: "reel.comment.highlightText",
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
            {/* TMP FIX */}
            {typeof reel.highlightedText !== "object"
              ? reel.highlightedText
              : ""}
          </Text>
        </Box>
      ) : null}
      <Text
        fontSize={"14px"}
        lineHeight={"20px"}
        fontWeight={400}
        sx={{
          color: "reel.comment.message",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
        }}
        as="p"
      >
        {getTextWithMentionsArray(reel?.contextData?.text, reel.mentions)}
      </Text>
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <div className="flex flex-wrap items-center space-x-2">
          {reel.reactions && reel.reactions.length > 0 && (
            <>
              {reel.reactions?.map((reac) => (
                <Reactions
                  key={reac.emoji}
                  addReaction={addReelReaction}
                  removeReaction={removeReelReaction}
                  emoji={reac.emoji}
                  count={reac.count}
                  reacted={reac.reacted}
                  viewOnly={!canAddReaction}
                />
              ))}
              {canAddReaction ? (
                <Reactions
                  addReaction={addReelReaction}
                  removeReaction={removeReelReaction}
                  emoji={""}
                  count={0}
                  reacted={false}
                  color={Colors.gray["500"]}
                />
              ) : null}
            </>
          )}
        </div>
        {reel.commentCount > 0 ? (
          <Text
            as="p"
            fontWeight={700}
            fontSize={"12px"}
            lineHeight={"18px"}
            color="reel.comment.repliesText"
            sx={{ cursor: "pointer" }}
            onClick={() => {
              if (showComments) {
                setShowComments(false);
              } else {
                setShowComments(true);
                getComments();
              }
            }}
          >
            {showComments ? "Hide replies" : "Show replies"}
          </Text>
        ) : null}
      </Box>
      {canAddComment &&
      (alwaysShowReplyOption || selectedObjectId === `reel-${reel.uuid}`) ? (
        <Box className="flex mt-3 space-x-2 items-top">
          <Avatar
            src={user?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
            sx={{ width: "28px", height: "28px", flexShrink: 0 }}
            alt={"user"}
            draggable={false}
          />
          <MentionsInput
            id={`reels-reply-input-textarea-${reel.id}`}
            onChange={(e: any, mentionedUsers: any) => {
              setInputValue(e.target.value);
              setMentionedUsers(mentionedUsers);
            }}
            onEnterClick={() => {
              if (!posting && inputValue?.trim()?.length) {
                postReelComment();
              }
            }}
            maxRows={15}
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
            placeholder="Type your comment here"
            value={inputValue}
            onClick={() => {
              if (!showComments) {
                scrollReel();
              }
            }}
          />
        </Box>
      ) : null}
      {inputValue?.trim()?.length ? (
        <Box display={"flex"} alignItems={"center"} justifyContent={"flex-end"}>
          <Text
            as="p"
            fontSize={"10px"}
            lineHeight={"14px"}
            color={"reel.comment.time"}
            mr={"16px"}
          >
            (shift + enter) for new line . (enter) to post
          </Text>
          <Button
            variant="primary"
            sx={{ border: "none" }}
            disabled={posting}
            onClick={postReelComment}
            size={"small"}
          >
            {posting ? "Posting..." : "Post"}
          </Button>
        </Box>
      ) : null}
      {showComments ? (
        loadingComments ? (
          <div className="flex items-center justify-center">
            <BipLoader />
          </div>
        ) : (
          comments.map((comment: ReelCommentType) => (
            <Comment
              comment={comment}
              addReaction={(emoji: string) => {
                addReelCommentReaction(emoji, comment);
              }}
              removeReaction={(emoji: string) => {
                removeReelCommentReaction(emoji, comment);
              }}
              reelId={reel.id}
              updateComment={updateComment}
              getReactionData={getReactionData}
              onClickDelete={() => {
                deleteComment(comment);
              }}
            />
          ))
        )
      ) : null}
    </Box>
  );
};

export default BlockReel;
