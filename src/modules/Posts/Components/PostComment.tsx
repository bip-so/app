import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Avatar, AvatarPair, Box, Button, Label, Text } from "@primer/react";
import TimeAgo from "react-timeago";
import {
  AVATAR_PLACEHOLDER,
  GITHUB_AVATAR_PLACEHOLDER,
} from "../../../commons/constants";
import {
  formatDateAndTime,
  shortTimeAgoFormatter,
  timeAgoFormatter,
} from "../../../utils/Common";
import { CreateCommentType, PostCommentType, PostType } from "../types";
import LikeComponent from "./LikeComponent";
import ReplyBox from "./ReplyBox";
import PostsService from "../services";
import { useToasts } from "react-toast-notifications";
import PostCommentMenu from "./PostCommentMenu";
import { useRouter } from "next/router";
import Link from "next/link";
import { getTextWithMentionsArray } from "../../../utils/mentions";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

interface CommentProps {
  comment: PostCommentType;
  onClickReply: () => void;
  isReply?: boolean;
  hideReply?: boolean;
  saveLink: () => void;
  deleteHandler: () => void;
  addReaction: (emoji: string) => void;
  removeReaction: (emoji: string) => void;
  shownReplies?: boolean;
}

const Comment: FC<CommentProps> = (props) => {
  const {
    comment,
    onClickReply,
    hideReply,
    isReply,
    saveLink,
    deleteHandler,
    addReaction,
    removeReaction,
    shownReplies,
  } = props;

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

  const reaction = useMemo(() => {
    if (comment.reactions?.length) {
      const reactedReaction = comment.reactions.find((reac) => reac.reacted);
      return reactedReaction ? reactedReaction.emoji : "";
    }
    return "";
  }, [comment]);

  return (
    <Box
      display={"flex"}
      id={comment.uuid}
      sx={commentUUID === comment.uuid ? { bg: "postInFeed.selCommentBg" } : {}}
    >
      <Avatar
        sx={{ height: "32px", width: "32px", flexShrink: 0 }}
        src={comment.createdByUser.avatarUrl || AVATAR_PLACEHOLDER}
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
              <LinkWithoutPrefetch href={`/${comment.createdByUser.username}`}>
                <Text
                  as="p"
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    cursor: "pointer",
                  }}
                >
                  {comment.createdByUser.fullName ||
                    comment.createdByUser.username}
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
              isReply={isReply}
              saveLink={saveLink}
              deleteHandler={deleteHandler}
              createdById={comment.createdById}
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
          {getTextWithMentionsArray(comment.comment, null)}
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

interface PostCommentProps {
  comment: PostCommentType;
  comments: PostCommentType[];
  setComments: Dispatch<SetStateAction<PostCommentType[]>>;
  depth: number;
  post: PostType;
}

const PostComment: FC<PostCommentProps> = (props) => {
  const { comment, comments, depth, setComments, post } = props;
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [addingReply, setAddingReply] = useState(false);
  const postId = post.id;

  const { addToast } = useToasts();

  const router = useRouter();
  const { handle, comment: commentQueries } = router.query;

  useEffect(() => {
    if (commentQueries) {
      const ids = (commentQueries as string).split("--");
      if (ids.length === 2 && parseInt(ids[1]) === comment.id) {
        setShowReplyBox(true);
        scrollToComment(ids[0]);
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

  const replies = useMemo(() => {
    return comments.filter((com) => com.parentPostCommentID === comment.id);
  }, [comments]);

  const updateComment = (updatedComment: PostCommentType) => {
    const commentIndex = comments.findIndex(
      (com) => com.id === updatedComment.id
    );
    comments[commentIndex] = updatedComment;
    setComments([...comments]);
  };

  const replyHandler = (
    replyText: string,
    mentions: any,
    resetData: () => void
  ) => {
    setAddingReply(true);
    const payload: CreateCommentType = {
      comment: replyText.trim(),
      isEdited: false,
      parentPostCommentID: comment.id,
    };
    PostsService.createComment(payload, postId)
      .then((r) => {
        const commentIndex = comments.findIndex((com) => com.id === comment.id);
        if (commentIndex !== -1) {
          comments[commentIndex] = {
            ...comment,
            commentCount: comment.commentCount + 1,
          };
        }
        setComments([r.data.data, ...comments]);
        setAddingReply(false);
        resetData();
        addToast("Successfully replied to comment", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((err) => {
        setAddingReply(false);
        addToast("Failed to reply.Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const saveLink = async () => {
    try {
      const url = `${window.location.origin}/${
        post.studio.handle
      }/feed?postId=${postId}&comment=${comment.uuid}${
        depth > 1 ? `--${comment.parentPostCommentID}` : ""
      }`;
      await navigator.clipboard.writeText(url);
      addToast("Copied link to clipboard.", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteComment = () => {
    PostsService.deleteComment(postId, comment.id)
      .then((r) => {
        if (depth > 1) {
          const commentIndex = comments.findIndex(
            (com) => com.id === comment.parentPostCommentID
          );
          if (commentIndex !== -1) {
            comments[commentIndex] = {
              ...comments[commentIndex],
              commentCount: comments[commentIndex].commentCount - 1,
            };
          }
        }
        setComments(comments.filter((com) => com.id !== comment.id));
        addToast("Successfully deleted.", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((err) => {
        addToast("Failed to delete.Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const getUpdatedReactions = (emoji: string, type: string) => {
    let reactions = comment?.reactions || [];
    const reactionIndex = reactions.findIndex((reac) => reac.emoji === emoji);
    if (type === "add") {
      if (reactionIndex !== -1) {
        reactions[reactionIndex] = {
          count: reactions[reactionIndex].count + 1,
          emoji: emoji,
          reacted: true,
        };
      } else {
        reactions.push({
          count: 1,
          emoji: emoji,
          reacted: true,
        });
      }
    } else {
      if (reactionIndex !== -1) {
        const count = reactions[reactionIndex].count;
        if (count === 1) {
          reactions = reactions.filter((reac) => reac.emoji !== emoji);
        } else {
          reactions[reactionIndex] = {
            count: reactions[reactionIndex].count - 1,
            emoji: emoji,
            reacted: false,
          };
        }
      }
    }
    return reactions;
  };

  const addReaction = (emoji: string) => {
    PostsService.addCommentReaction(postId, comment.id, { emoji: emoji })
      .then((r) => {
        const updatedComment = {
          ...comment,
          reactions: getUpdatedReactions(emoji, "add"),
        };
        updateComment(updatedComment);
      })
      .catch((err) => {
        addToast("Failed to add reaction.Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const removeReaction = (emoji: string) => {
    PostsService.removeCommentReaction(postId, comment.id, { emoji: emoji })
      .then((r) => {
        const updatedComment = {
          ...comment,
          reactions: getUpdatedReactions(emoji, "remove"),
        };
        updateComment(updatedComment);
      })
      .catch((err) => {
        addToast("Failed to add reaction.Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  return (
    <Box>
      <Comment
        comment={comment}
        onClickReply={() => {
          setShowReplyBox((prev) => !prev);
        }}
        hideReply={depth > 1}
        isReply={depth > 0}
        saveLink={saveLink}
        deleteHandler={deleteComment}
        addReaction={addReaction}
        removeReaction={removeReaction}
        shownReplies={showReplyBox}
      />
      {showReplyBox ? (
        <>
          <Box ml={"40px"}>
            <ReplyBox replyHandler={replyHandler} disabled={addingReply} />
          </Box>
          {replies?.length ? (
            <Box
              display={"flex"}
              flexDirection={"column"}
              ml={"40px"}
              mt={"16px"}
              sx={{ gap: "16px" }}
            >
              {replies.map((reply) => (
                <PostComment
                  key={reply.id}
                  comment={reply}
                  comments={comments}
                  depth={depth + 1}
                  setComments={setComments}
                  post={post}
                />
              ))}
            </Box>
          ) : null}
        </>
      ) : null}
    </Box>
  );
};

export default PostComment;
