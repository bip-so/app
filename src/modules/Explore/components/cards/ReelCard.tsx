import {
  Box,
  Avatar,
  Text,
  Button,
  ActionMenu,
  ActionList,
  useTheme,
  Truncate,
  AvatarPair,
  Tooltip,
  IconButton,
} from "@primer/react";
import Link from "next/link";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import TimeAgo from "react-timeago";
import { useToasts } from "react-toast-notifications";
import { ChevronDownIcon, LinkExternalIcon } from "@primer/styled-octicons";
import {
  AVATAR_PLACEHOLDER,
  DEFAULT_USER_PLACEHOLDER,
  GITHUB_AVATAR_PLACEHOLDER,
} from "../../../../commons/constants";
import BipLoader from "../../../../components/BipLoader";
import MentionsInput from "../../../../components/MentionsInput";
import Reactions from "../../../../components/Reactions";
import { Divider } from "../../../../components/TableOfContents/styledComponents";
import { useUser } from "../../../../context/userContext";
import BipRouteUtils from "../../../../core/routeUtils";
import { MentionUsersType } from "../../../../types";
import {
  shortTimeAgoFormatter,
  formatDateAndTime,
  timeAgoFormatter,
  timeAgoFormatterWithoutSuffix,
  setTempStudioIdHeader,
} from "../../../../utils/Common";
import {
  getFilteredMentions,
  getTextWithMentionsArray,
} from "../../../../utils/mentions";
import { getUpdatedReactions } from "../../../../utils/reactions";
import ViewOnlyEditor from "../../../BipEditor/components/ViewOnlyEditor";
import BlocksService from "../../../BipEditor/services";
import {
  CreateMentionType,
  CreateReactionType,
  ReactionScope,
  ReelCommentType,
  ReelType,
} from "../../../BipEditor/types";
import StudioService from "../../../Studio/services";
import ExploreService from "../../services";
import ReplyIcon from "../../../../icons/ReplyIcon";
import ImageWithName from "../../../../components/ImageWithName";
import segmentEvents from "../../../../insights/segment";
import { useStudio } from "../../../../context/studioContext";
import { useCanvas } from "../../../../context/canvasContext";
import useDeviceDimensions from "../../../../hooks/useDeviceDimensions";
import { KebabHorizontalIcon } from "@primer/octicons-react";
import LikeCommentShare from "../../../Posts/Components/LikeCommentShare";
import ReplyBox from "../../../Posts/Components/ReplyBox";
import EngagementSummary from "../../../Posts/Components/EngagementSummary";
import PostCommentMenu from "../../../Posts/Components/PostCommentMenu";
import LikeComponent from "../../../Posts/Components/LikeComponent";
import { useRouter } from "next/router";
import LinkWithoutPrefetch from "../../../../components/LinkWithoutPrefetch";

interface CommentItemProps {
  comment: ReelCommentType;
  hideReply?: boolean;
  addReaction: (emoji: string) => void;
  removeReaction: (emoji: string) => void;
  onClickDelete: () => void;
  onClickReply?: () => void;
  reel: ReelType;
  shownReplies?: boolean;
}

const CommentItem: FC<CommentItemProps> = (props) => {
  const {
    comment,
    addReaction,
    removeReaction,
    hideReply,
    onClickReply,
    onClickDelete,
    shownReplies,
    reel,
  } = props;
  const { user: curUser } = useUser();
  const { addToast } = useToasts();

  const router = useRouter();
  const { comment: commentQueries } = router.query;

  const getParsedUUID = (commentQueries: string | string[] | undefined) => {
    if (commentQueries) {
      const ids = (commentQueries as string).split("--");
      return ids[0];
    }
    return "";
  };

  const commentUUID = getParsedUUID(commentQueries);

  const saveLink = async () => {
    try {
      let url = `${window.location.origin}/${reel.studio.handle}/feed?reelId=${
        reel.id
      }&comment=${comment.uuid}${hideReply ? `--${comment.parentID}` : ""}`;
      await navigator.clipboard.writeText(url);
      addToast("Copied link to clipboard.", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const reaction = useMemo(() => {
    if (comment.reactionCounter?.length) {
      const reactedReaction = comment.reactionCounter.find(
        (reac) => reac.reacted
      );
      return reactedReaction ? reactedReaction.emoji : "";
    }
    return "";
  }, [comment, comment.reactionCounter]);

  return (
    <Box
      display={"flex"}
      key={comment.id}
      id={comment.uuid}
      sx={commentUUID === comment.uuid ? { bg: "postInFeed.selCommentBg" } : {}}
    >
      <Avatar
        sx={{ height: "32px", width: "32px", flexShrink: 0 }}
        src={comment.user?.avatarUrl || AVATAR_PLACEHOLDER}
        draggable={false}
      />
      <Box display={"flex"} flex={1} flexDirection={"column"} ml={"8px"}>
        <Box display={"flex"} justifyContent={"space-between"}>
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"flex-start"}
          >
            <Box display={"flex"} sx={{ gap: "6px" }}>
              <LinkWithoutPrefetch href={`/${comment.user.username}`}>
                <Text
                  as="p"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    cursor: "pointer",
                  }}
                >
                  {comment.user.fullName || comment.user.username}
                </Text>
              </LinkWithoutPrefetch>
              <Text
                as="p"
                sx={{
                  display: "inline-block",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  color: "postInFeed.textLight",
                }}
              >
                •{" "}
                <TimeAgo
                  title={formatDateAndTime(comment.createdAt)}
                  minPeriod={60}
                  formatter={shortTimeAgoFormatter}
                  date={comment.createdAt}
                />
              </Text>
            </Box>
          </Box>
          <Box>
            <PostCommentMenu
              isReply={hideReply}
              saveLink={saveLink}
              deleteHandler={onClickDelete}
              createdById={comment.user.id}
            />
          </Box>
        </Box>
        <Text
          as={"p"}
          sx={{
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "20px",
            px: "4px",
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
          }}
        >
          {getTextWithMentionsArray(
            comment?.rangeStart?.text,
            comment.mentions
          )}
        </Text>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          mt={"8px"}
          sx={{ gap: "4px" }}
        >
          <Box display={"flex"} alignItems={"center"} sx={{ gap: "16px" }}>
            <LikeComponent
              showThumb={false}
              addReaction={addReaction}
              removeReaction={removeReaction}
              emoji={reaction}
            />
            {!hideReply ? (
              <Button
                variant="invisible"
                sx={{
                  color: "postInFeed.textLight",
                  border: "1px solid",
                  borderColor: "transparent",
                  fontSize: "12px",
                  fontWeight: 600,
                  lineHeight: "18px",
                  px: "4px",
                  ":focus:not([disabled])": { boxShadow: "none" },
                  ":hover:not([disabled])": {
                    border: "1px solid",
                    borderColor: "postInFeed.border",
                    color: "postInFeed.textBlack",
                  },
                }}
                onClick={onClickReply}
              >
                Reply
              </Button>
            ) : null}
          </Box>
          {comment.commentCount > 0 ? (
            <Text
              as="p"
              fontSize={"12px"}
              lineHeight={"18px"}
              color="reelCard.comment.repliesText"
              onClick={onClickReply}
              sx={{
                cursor: "pointer",
              }}
            >
              {shownReplies ? "Hide replies" : "View replies"}
            </Text>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

interface CommentProps {
  comment: ReelCommentType;
  addReaction: (emoji: string) => void;
  removeReaction: (emoji: string) => void;
  usersType?: MentionUsersType;
  reelId: number;
  reel: ReelType;
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
    usersType,
    reelId,
    updateComment,
    getReactionData,
    onClickDelete,
    reel,
  } = props;
  const { isLoggedIn } = useUser();
  const [replies, setReplies] = useState((): ReelCommentType[] => []);
  const [showReplies, setShowReplies] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [postingReply, setPostingReply] = useState(false);

  const { user: curUser } = useUser();
  const { addToast } = useToasts();
  const { colorMode } = useTheme();
  const router = useRouter();
  const { comment: commentQueries } = router.query;

  useEffect(() => {
    if (commentQueries) {
      const ids = (commentQueries as string).split("--");
      if (ids.length === 2 && parseInt(ids[1]) === comment.id) {
        setShowInput(true);
        getReplies();
      }
    }
  }, []);

  const scrollToComment = (commentUUID: string) => {
    if (commentUUID) {
      setTimeout(() => {
        const element = document.getElementById(commentUUID);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          addToast("Comment unavailable", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      }, 1000);
    }
  };

  const goToReply = () => {
    if (commentQueries) {
      const ids = (commentQueries as string).split("--");
      if (ids.length === 2 && parseInt(ids[1]) === comment.id) {
        scrollToComment(ids[0]);
      }
    }
  };

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
        goToReply();
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

  const postReplyComment = async (
    inputValue: string,
    mentionedUsers: any,
    resetData: () => void
  ) => {
    if (!isLoggedIn) {
      const url = `${window.location.origin}/${reel.studio.handle}/feed?reelId=${reel.id}`;
      router.push(BipRouteUtils.getSignInRoute(url));
      return;
    }
    try {
      const data = {
        data: { text: inputValue.trim() },
        isEdited: false,
        isReply: true,
        parentID: comment.id,
      };
      setTempStudioIdHeader(reel.studioID);
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
        setTempStudioIdHeader(reel.studioID);
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
      setPostingReply(false);
      resetData();
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

  return (
    <Box display={"flex"} flexDirection={"column"}>
      <CommentItem
        comment={comment}
        addReaction={addReaction}
        removeReaction={removeReaction}
        onClickReply={() => {
          if (!showInput) {
            getReplies();
          }
          setShowInput((prevState) => !prevState);
        }}
        onClickDelete={onClickDelete}
        reel={reel}
        shownReplies={showInput}
      />
      {showInput ? (
        <Box sx={{ ml: "40px" }}>
          <ReplyBox
            replyHandler={postReplyComment}
            disabled={postingReply}
            usersType={usersType}
          />
          {loadingReplies ? (
            <div className="flex items-center justify-center">
              <BipLoader />
            </div>
          ) : replies.length ? (
            replies.map((reply: ReelCommentType, index) => (
              <Box
                display={"flex"}
                flexDirection={"column"}
                mt={"16px"}
                sx={{ gap: "16px" }}
              >
                <CommentItem
                  key={index}
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
                  reel={reel}
                />
              </Box>
            ))
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

interface IReelCardProps {
  reel: ReelType;
  updateReel: (reel: ReelType) => void;
  usersType?: MentionUsersType;
  hideFollow?: boolean;
  showComments?: boolean;
}

const ReelCard: React.FunctionComponent<IReelCardProps> = (props) => {
  const { reel, updateReel, usersType, hideFollow } = props;
  const {
    user,
    createdAt,
    contextData,
    canvasRepository,
    studio,
    reactions,
    commentCount,
  } = reel;

  const [posting, setPosting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [comments, setComments] = useState((): ReelCommentType[] => []);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);
  const { currentStudio } = useStudio();
  const { repo } = useCanvas();
  const { isTabletOrMobile } = useDeviceDimensions();

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [reachedMaxHeight, setReachedMaxHeight] = useState(false);
  const boxRef = useRef(null);

  const { user: curUser, isLoggedIn } = useUser();
  const { addToast } = useToasts();
  const { colorMode } = useTheme();
  const router = useRouter();
  const { comment: commentQueries } = router.query;

  useEffect(() => {
    if (props.showComments) {
      getComments();
      setShowComments(true);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (boxRef?.current?.clientHeight > 370) {
        setReachedMaxHeight(true);
      } else {
        setReachedMaxHeight(false);
      }
    }, 100);
  }, []);

  const updateComment = (comment: ReelCommentType) => {
    const commentIndex = comments.findIndex((c) => c.id === comment.id);
    if (commentIndex >= 0) {
      comments[commentIndex] = comment;
      setComments([...comments]);
    }
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

  const addReelReaction = (emoji: string) => {
    if (!isLoggedIn) {
      const url = `${window.location.origin}/${studio.handle}/feed?reelId=${reel.id}`;
      router.push(BipRouteUtils.getSignInRoute(url));
      return;
    }
    const data = getReactionData("reel", emoji);
    segmentEvents.reactionAdded(
      currentStudio?.handle!,
      repo?.key!,
      user?.id,
      "reel"
    );
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

  const scrollToComment = (commentUUID: string) => {
    if (commentUUID) {
      setTimeout(() => {
        const element = document.getElementById(commentUUID);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          addToast("Comment unavailable", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      }, 1000);
    }
  };

  const goToComment = () => {
    if (commentQueries) {
      const ids = (commentQueries as string).split("--");
      if (ids.length === 1) {
        scrollToComment(ids[0]);
      }
    }
  };

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
        goToComment();
      })
      .catch((err) => {
        setLoadingComments(false);
      });
  };

  const deleteComment = (comment: ReelCommentType) => {
    segmentEvents.commentDeleted(
      currentStudio?.handle!,
      repo?.key,
      curUser?.id,
      "reel"
    );
    BlocksService.deleteReelComment(reel.id, comment.id)
      .then((r) => {
        const newComments = comments.filter((cm) => cm.id !== comment.id);
        setComments(newComments);
        updateReel({ ...reel, commentCount: commentCount - 1 });
      })
      .catch((err) => {
        addToast("Failed to delete. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const postReelComment = async (
    inputValue: string,
    mentionedUsers: any,
    resetData: () => void
  ) => {
    if (!isLoggedIn) {
      const url = `${window.location.origin}/${studio.handle}/feed?reelId=${reel.id}`;
      router.push(BipRouteUtils.getSignInRoute(url));
      return;
    }
    try {
      const data = {
        data: { text: inputValue.trim() },
        isEdited: false,
        isReply: false,
      };
      setPosting(true);
      segmentEvents.commentAdded(
        currentStudio?.handle,
        repo?.key,
        curUser?.id,
        "reel"
      );
      setTempStudioIdHeader(reel.studioID);
      const r = await BlocksService.addReelComment(reel.id, data);
      updateReel({ ...reel, commentCount: commentCount + 1 });
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

        setTempStudioIdHeader(reel.studioID);
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
        setComments([{ ...comment, mentions: newMentions }, ...comments]);
      } else {
        setComments([{ ...comment }, ...comments]);
      }
      setPosting(false);
      resetData();
    } catch (err) {
      addToast("Failed to add comment. Please try again", {
        appearance: "error",
        autoDismiss: true,
      });
      setPosting(false);
    }
  };

  const addReelCommentReaction = (emoji: string, comment: ReelCommentType) => {
    if (!isLoggedIn) {
      const url = `${window.location.origin}/${studio.handle}/feed?reelId=${reel.id}`;
      router.push(BipRouteUtils.getSignInRoute(url));
      return;
    }
    const data = getReactionData("reel_comment", emoji, comment);
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

  const unFollowUser = () => {
    const payload = {
      userId: user.id,
    };
    setLoadingFollow(true);
    ExploreService.unfollowUser(payload)
      .then((r) => {
        updateReel({
          ...reel,
          isUserFollower: false,
        });
        addToast(`Unfollowed ${user.username}`, {
          appearance: "success",
          autoDismiss: true,
        });
        setLoadingFollow(false);
      })
      .catch((err) => {
        addToast(`Unable to unfollow. Please try again after some time!`, {
          appearance: "error",
          autoDismiss: true,
        });
        setLoadingFollow(false);
      });
  };

  const followUser = () => {
    const payload = {
      userId: user.id,
    };
    setLoadingFollow(true);
    return ExploreService.followUser(payload)
      .then((r) => {
        updateReel({
          ...reel,
          isUserFollower: true,
        });
        addToast(`Following ${user.username}`, {
          appearance: "success",
          autoDismiss: true,
        });
        setLoadingFollow(false);
      })
      .catch((err) => {
        addToast(`Unable to Follow. Please try again after some time!`, {
          appearance: "error",
          autoDismiss: true,
        });
        setLoadingFollow(false);
      });
  };

  const leaveStudio = () => {
    setLoadingJoin(true);
    StudioService.leaveStudio(studio.id)
      .then((r) => {
        updateReel({
          ...reel,
          isStudioMember: false,
        });
        addToast(`Left ${studio.displayName}`, {
          appearance: "success",
          autoDismiss: true,
        });
        setLoadingJoin(false);
      })
      .catch((err) => {
        addToast(`Unable to Leave. Please try again after some time!`, {
          appearance: "error",
          autoDismiss: true,
        });
        setLoadingJoin(false);
      });
  };

  const joinStudio = () => {
    setLoadingJoin(true);
    return StudioService.joinStudio(studio.id)
      .then((r) => {
        updateReel({
          ...reel,
          isStudioMember: true,
        });
        addToast(`Joined ${studio.displayName}`, {
          appearance: "success",
          autoDismiss: true,
        });
        setLoadingJoin(false);
      })
      .catch((err) => {
        addToast(`Unable to Join. Please try again after some time!`, {
          appearance: "error",
          autoDismiss: true,
        });
        setLoadingJoin(false);
      });
  };

  const requestToJoin = () => {
    setLoadingJoin(true);
    StudioService.requestToJoin(reel.studio.id)
      .then((r) => {
        updateReel({
          ...reel,
          studio: {
            ...reel.studio,
            isRequested: true,
          },
        });
        addToast(`Requested to join ${studio.displayName}`, {
          appearance: "success",
          autoDismiss: true,
        });
        setLoadingJoin(false);
      })
      .catch((err) => {
        addToast(`Something went wrong. Please try again after some time!`, {
          appearance: "error",
          autoDismiss: true,
        });
        setLoadingJoin(false);
      });
  };

  const handleFollow = () => {
    if (isLoggedIn) {
      if (reel.isUserFollower) {
        unFollowUser();
      } else {
        followUser();
      }
    } else {
      loginAndRedirect(BipRouteUtils.getProfileRoute(user.username));
    }
  };

  const joinHandler = () => {
    if (isLoggedIn) {
      if (reel.isStudioMember) {
        leaveStudio();
      } else if (reel.studio.allowPublicMembership) {
        joinStudio();
      } else if (!reel.studio.isRequested) {
        requestToJoin();
      }
    } else {
      loginAndRedirect(BipRouteUtils.getStudioAboutRoute(studio.handle));
    }
  };

  const loginAndRedirect = (returnUrl: string) => {
    router.replace(`${BipRouteUtils.getSignInRoute()}?returnUrl=${returnUrl}`);
  };

  const onClickFollow = () => {
    setLoadingJoin(true);
    setLoadingFollow(true);
    const p1 = ExploreService.followUser({ userId: user.id });
    const p2 = StudioService.joinStudio(studio.id);
    Promise.all([p1, p2])
      .then((r) => {
        updateReel({ ...reel, isStudioMember: true, isUserFollower: true });
        setLoadingJoin(false);
        setLoadingFollow(false);
      })
      .catch((err) => {
        addToast(`Something went wrong. Please try again after some time!`, {
          appearance: "error",
          autoDismiss: true,
        });
        setLoadingJoin(false);
        setLoadingFollow(false);
      });
  };

  const copyLink = async () => {
    try {
      const url = `${window.location.origin}/${studio.handle}/feed?reelId=${reel.id}`;
      await navigator.clipboard.writeText(url);
      addToast("Copied link to clipboard.", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const emoji = useMemo(() => {
    if (reel.reactions?.length) {
      const reactedReaction = reel.reactions.find((reac) => reac.reacted);
      return reactedReaction ? reactedReaction.emoji : "";
    }
    return "";
  }, [reel]);

  const likesText = useMemo(() => {
    if (reel?.reactions?.length) {
      const count = reel.reactions.reduce(
        (acc, curValue) => acc + curValue.count,
        0
      );
      if (count === 1) {
        return emoji ? "You reacted" : `${reel.reactionCopy} reacted`;
      }
      if (count === 2) {
        return emoji
          ? "You and 1 other reacted"
          : `${reel.reactionCopy} and 1 other reacted`;
      }
      return emoji
        ? `You and ${count - 1} others reacted`
        : `${reel.reactionCopy} and ${count - 1} others reacted`;
    }
    return "";
  }, [reel]);

  const getReplyBoxId = () => {
    return `${reel.id}-reel-reply-box`;
  };

  const reelBlocks = reel?.selectedBlocks?.blockUUIDs
    ?.map((uuid) => {
      if (reel?.selectedBlocks?.blocksData) {
        return reel?.selectedBlocks?.blocksData[uuid];
      }
    })
    ?.filter((block) => block);
  // console.log(reel?.selectedBlocks, reelBlocks);

  const shouldShowExpandBtn = reelBlocks?.length > 2;

  const displayedBlocks = isExpanded ? reelBlocks : reelBlocks?.slice(0, 2);

  return (
    <Box
      backgroundColor={"reelCard.bg"}
      display={"flex"}
      flexDirection="column"
      padding={"16px"}
      border={"1px solid"}
      borderColor={"reelCard.border"}
      borderRadius={"12px"}
      className="space-y-4"
      sx={{
        width: ["360px", "500px", "600px", "600px"],
        boxShadow: "0px 1px 0px rgba(27, 31, 35, 0.04)",
      }}
    >
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"flex-start"}
      >
        <Box display={"flex"} sx={{ gap: "6px" }}>
          <Box width={"40px"} position={"sticky"}>
            <AvatarPair>
              <Avatar
                sx={{ height: "32px", width: "32px" }}
                src={user.avatarUrl || AVATAR_PLACEHOLDER}
                draggable={false}
              />
              <Avatar
                sx={{ height: "13px", width: "13px" }}
                src={studio.imageUrl || GITHUB_AVATAR_PLACEHOLDER}
                draggable={false}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = GITHUB_AVATAR_PLACEHOLDER;
                }}
              />
            </AvatarPair>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"flex-start"}
          >
            <Box display={"flex"} sx={{ gap: "6px" }}>
              <Tooltip aria-label={user.fullName || user.username}>
                <LinkWithoutPrefetch href={`/${user.username}`}>
                  <Truncate
                    as="p"
                    title={user.fullName || user.username}
                    maxWidth={["125px", "175px", "250px", "250px"]}
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      lineHeight: "20px",
                      cursor: "pointer",
                    }}
                  >
                    {user.fullName || user.username}
                  </Truncate>
                </LinkWithoutPrefetch>
              </Tooltip>
              <Text
                as="p"
                sx={{
                  display: "inline-block",
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  color: "postInFeed.textLight",
                }}
              >
                •{" "}
                <TimeAgo
                  title={formatDateAndTime(createdAt)}
                  minPeriod={60}
                  formatter={shortTimeAgoFormatter}
                  date={createdAt}
                />
              </Text>
            </Box>
            <LinkWithoutPrefetch href={`/${studio.handle}`}>
              <Text
                as="p"
                sx={{
                  fontSize: "12px",
                  fontWeight: 400,
                  lineHeight: "18px",
                  color: "postInFeed.textLight",
                  cursor: "pointer",
                }}
              >
                {studio.displayName}
              </Text>
            </LinkWithoutPrefetch>
          </Box>
        </Box>
        {studio.createdById === curUser?.id &&
        user.id === curUser?.id ? null : (
          <ActionMenu>
            <ActionMenu.Anchor>
              <IconButton
                variant="invisible"
                icon={KebabHorizontalIcon}
                sx={{ color: "postInFeed.textLight" }}
              />
            </ActionMenu.Anchor>
            <ActionMenu.Overlay align="end">
              <ActionList>
                {user.id === curUser?.id ? null : (
                  <ActionList.Item onSelect={handleFollow}>
                    <Text
                      sx={{
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        letterSpacing: "-0.15px",
                      }}
                    >
                      {reel.isUserFollower ? "Unfollow  User" : "Follow  User"}
                    </Text>
                  </ActionList.Item>
                )}
                {studio.createdById === curUser?.id ? null : (
                  <ActionList.Item onSelect={joinHandler}>
                    <Text
                      sx={{
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        letterSpacing: "-0.15px",
                      }}
                    >
                      {reel.isStudioMember
                        ? "Leave Studio"
                        : reel.studio.allowPublicMembership
                        ? "Join Studio"
                        : reel.studio.isRequested
                        ? "Requested"
                        : "Request to join"}
                    </Text>
                  </ActionList.Item>
                )}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )}
      </Box>

      <Text
        fontWeight={400}
        fontSize="16px"
        lineHeight={"24px"}
        color={"reelCard.text.reelMessage"}
        sx={{
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
        }}
      >
        {getTextWithMentionsArray(contextData.text, reel.mentions)}
      </Text>
      <Box
        sx={{
          minHeight: "100px",
          position: "relative",
          bg: "reelCard.editor.bg",
          border: "1px solid",
          borderColor: "reelCard.editor.border",
          borderRadius: "10px",
          overflow: "hidden",
          maxHeight:
            shouldShowExpandBtn || isExpanded || !reachedMaxHeight
              ? "auto"
              : "370px",
          ".expandBtn, .collapseBtn": {
            border: "none",
            position: "absolute",
            right: "8px",
            bottom: "8px",
            fontSize: "10px",
            padding: "0px 4px",
            bg: "none",
            color: "reelCard.editor.button.text",
            cursor: "pointer",
            borderRadius: "6px",
            ":hover": {
              bg: "reelCard.editor.button.hoverBg",
              color: "reelCard.editor.button.hoverText",
            },
          },
          ":hover": {
            ".expandBtn": {
              bg: "reelCard.editor.button.hoverBg",
              color: "reelCard.editor.button.hoverText",
            },
          },
        }}
        style={{
          cursor: isExpanded
            ? "auto"
            : shouldShowExpandBtn
            ? "pointer"
            : "auto",
        }}
        onClick={() => {
          shouldShowExpandBtn && !isExpanded
            ? setIsExpanded((prev) => !prev)
            : null;
        }}
        ref={boxRef}
      >
        <LinkWithoutPrefetch
          href={{
            pathname: BipRouteUtils.getCanvasRoute(
              studio.handle,
              canvasRepository?.name,
              canvasRepository?.defaultBranchID
            ),
          }}
        >
          <Box
            sx={{
              marginLeft: "8px",
              marginTop: "8px",
              cursor: "pointer",
              "&:hover": {
                borderBottom: "1px solid",
                borderColor: "reelCard.editor.link.hoverBorder",
              },
              display: "inline-block",
            }}
          >
            <Text
              as={"p"}
              sx={{
                fontSize: "14px",
                color: "reelCard.editor.link.text",
                "&:hover": {
                  color: "reelCard.editor.link.hoverText",
                },
              }}
            >
              <LinkExternalIcon /> {canvasRepository.name}
            </Text>
          </Box>
        </LinkWithoutPrefetch>
        <Box
          sx={{
            margin: "10px 0",
          }}
          ref={editorContainerRef}
        >
          {displayedBlocks?.length > 0 ? (
            <ViewOnlyEditor
              blocks={displayedBlocks}
              parentRef={editorContainerRef}
              origin={"reel"}
            />
          ) : (
            <Text as={"p"} color={"reelCard.editor.text"} textAlign="center">
              No blocks available for display
            </Text>
          )}
        </Box>
        {shouldShowExpandBtn && (
          <Box
            className={`${isExpanded ? "collapseBtn" : "expandBtn"}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded((prev) => !prev);
            }}
          >
            <Text fontSize={"14px"} fontWeight={400}>
              {isExpanded ? "Collapse" : "Expand"}
            </Text>
          </Box>
        )}
      </Box>
      {shouldShowExpandBtn || !reachedMaxHeight ? null : (
        <Box display={"flex"} justifyContent={"flex-end"}>
          <Button
            variant="invisible"
            onClick={() => {
              setIsExpanded((prev) => !prev);
            }}
            size={"small"}
            sx={{
              mt: "8px",
              color: "postInFeed.textLight",
            }}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </Box>
      )}

      <Divider style={{ border: "1px" }} />

      <EngagementSummary
        text={likesText}
        sharesCount={0}
        commentsCount={commentCount}
        reactions={reel.reactions}
        commentHandler={() => {
          if (!showComments) {
            getComments();
          }
          setShowComments((prevState) => !prevState);
        }}
        showCommentBox={showComments}
      />

      <LikeCommentShare
        commentHandler={() => {
          if (!showComments) {
            getComments();
          }
          !showComments && setShowComments(true);
          document.getElementById(getReplyBoxId())?.focus();
        }}
        addReaction={addReelReaction}
        removeReaction={removeReelReaction}
        emoji={emoji}
        shareHandler={copyLink}
      />

      {showComments ? (
        <Box>
          <ReplyBox
            replyHandler={postReelComment}
            disabled={posting}
            usersType={usersType}
            replyBoxId={getReplyBoxId()}
          />

          {loadingComments ? (
            <div className="flex items-center justify-center">
              <BipLoader />
            </div>
          ) : comments?.length ? (
            <Box
              mt={"16px"}
              sx={{
                display: "flex",
                flexDirection: "column",
                p: "6px",
                bg: "postInFeed.commentsBg",
                gap: "16px",
              }}
            >
              {comments.map((comment: ReelCommentType, index) => (
                <>
                  <Comment
                    key={index}
                    comment={comment}
                    addReaction={(emoji: string) => {
                      addReelCommentReaction(emoji, comment);
                    }}
                    removeReaction={(emoji: string) => {
                      removeReelCommentReaction(emoji, comment);
                    }}
                    usersType={usersType}
                    reelId={reel.id}
                    updateComment={updateComment}
                    getReactionData={getReactionData}
                    onClickDelete={() => {
                      deleteComment(comment);
                    }}
                    reel={reel}
                  />
                </>
              ))}
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export default ReelCard;
