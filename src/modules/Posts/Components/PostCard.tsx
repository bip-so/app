import {
  ActionList,
  ActionMenu,
  Avatar,
  AvatarPair,
  Box,
  Button,
  Label,
  Text,
  Tooltip,
  Truncate,
} from "@primer/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TimeAgo from "react-timeago";
import { useToasts } from "react-toast-notifications";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import { ReactEditor, withReact } from "slate-react";

import {
  AVATAR_PLACEHOLDER,
  GITHUB_AVATAR_PLACEHOLDER,
} from "../../../commons/constants";
import BipLoader from "../../../components/BipLoader";
import ImageWithName from "../../../components/ImageWithName";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";
import { Divider } from "../../../components/TableOfContents/styledComponents";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import {
  formatDateAndTime,
  setTempStudioIdHeader,
  shortTimeAgoFormatter,
  timeAgoFormatter,
} from "../../../utils/Common";
import ExploreService from "../../Explore/services";
import StudioService from "../../Studio/services";
import PostsService from "../services";
import {
  CreateCommentType,
  CreatePostType,
  PostCommentType,
  PostType,
} from "../types";
import EngagementSummary from "./EngagementSummary";
import LikeCommentShare from "./LikeCommentShare";
import PostCardMenu from "./PostCardMenu";
import PostComment from "./PostComment";
import PostsEditor from "./PostsEditor";
import ReplyBox from "./ReplyBox";

interface PostCardProps {
  post: PostType;
  deletePostHandler: (id: number) => void;
  showComments?: boolean;
  updatePost: (updatedPost: PostType) => void;
}

const PostCard: FC<PostCardProps> = (props) => {
  const { post, deletePostHandler, showComments, updatePost } = props;
  const blocksString = post.children?.blocks;
  const blocks = blocksString ? JSON.parse(blocksString) : [];

  const { addToast } = useToasts();
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { postId, handle, comment: commentQueries } = router.query;
  const { currentStudio, saveCurrentStudio } = useStudio();

  const [comments, setComments] = useState((): PostCommentType[] => []);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const editorContainerRef = useRef(null);
  const [reachedMaxHeight, setReachedMaxHeight] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const editor: ReactEditor = useMemo(
    () => withHistory(withReact(createEditor())),
    []
  );

  useEffect(() => {
    setTimeout(() => {
      if (editorContainerRef?.current?.clientHeight === 120) {
        setReachedMaxHeight(true);
      } else {
        setReachedMaxHeight(false);
      }
    }, 100);
  }, [post.children.blocks, editMode]);

  useEffect(() => {
    if (showComments) {
      getComments();
      setShowCommentBox(true);
    }
  }, []);

  const deletePost = () => {
    setTempStudioIdHeader(post.studioID);
    PostsService.deletePost(post.id)
      .then((r) => {
        deletePostHandler(post.id);
        addToast("Successfully deleted your post.", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((e) => {
        addToast("Failed to delete your post.Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const followBoth = () => {
    setLoadingJoin(true);
    setLoadingFollow(true);
    const p1 = ExploreService.followUser({ userId: post.createdByUser.id });
    const p2 = StudioService.joinStudio(post.createdByUser.id);
    Promise.all([p1, p2])
      .then((r) => {
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

  const unFollowBoth = () => {
    setLoadingJoin(true);
    setLoadingFollow(true);
    const p1 = ExploreService.unfollowUser({ userId: post.createdByUser.id });
    const p2 = StudioService.leaveStudio(post.createdByUser.id);
    Promise.all([p1, p2])
      .then((r) => {
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

  const unFollowUser = () => {
    const payload = {
      userId: post.createdByUser.id,
    };
    setLoadingFollow(true);
    ExploreService.unfollowUser(payload)
      .then((r) => {
        updatePost({
          ...post,
          isUserFollower: false,
        });
        addToast(`Unfollowed ${post.createdByUser.fullName}`, {
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
      userId: post.createdByUser.id,
    };
    setLoadingFollow(true);
    return ExploreService.followUser(payload)
      .then((r) => {
        updatePost({
          ...post,
          isUserFollower: true,
        });
        addToast(`Following ${post.createdByUser.fullName}`, {
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
    StudioService.leaveStudio(post.studio.id)
      .then((r) => {
        updatePost({
          ...post,
          isStudioMember: false,
        });
        if (currentStudio?.id) {
          saveCurrentStudio({ ...currentStudio, isJoined: false });
        }
        addToast(`Left ${post.studio.displayName}`, {
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
    StudioService.joinStudio(post.studio.id)
      .then((r) => {
        updatePost({
          ...post,
          isStudioMember: true,
        });
        if (currentStudio?.id) {
          saveCurrentStudio({ ...currentStudio, isJoined: true });
        }
        addToast(`Joined ${post.studio.displayName}`, {
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
    StudioService.requestToJoin(post.studio.id)
      .then((r) => {
        updatePost({
          ...post,
          studio: {
            ...post.studio,
            isRequested: true,
          },
        });
        if (currentStudio?.id) {
          saveCurrentStudio({ ...currentStudio, isRequested: true });
        }
        addToast(`Requested to join ${post.studio.displayName}`, {
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

  const getUpdatedReactions = (emoji: string, type: string) => {
    let reactions = post.reactions || [];
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
    PostsService.addReaction(post.id, { emoji: emoji })
      .then((r) => {
        const updatedPost = {
          ...post,
          reactions: getUpdatedReactions(emoji, "add"),
        };
        updatePost(updatedPost);
      })
      .catch((err) => {
        addToast("Failed to add reaction.Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const removeReaction = (emoji: string) => {
    PostsService.removeReaction(post.id, { emoji: emoji })
      .then((r) => {
        const updatedPost = {
          ...post,
          reactions: getUpdatedReactions(emoji, "remove"),
        };
        updatePost(updatedPost);
      })
      .catch((err) => {
        addToast("Failed to remove reaction.Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const addComment = (
    commentText: string,
    mentionedUsers: any,
    resetData: () => void
  ) => {
    setAddingComment(true);
    const payload: CreateCommentType = {
      comment: commentText.trim(),
      isEdited: false,
    };
    PostsService.createComment(payload, post.id)
      .then((r) => {
        setComments([r.data.data, ...comments]);
        const updatedPost = {
          ...post,
          commentCount: post.commentCount + 1,
        };
        updatePost(updatedPost);
        setAddingComment(false);
        resetData();
        addToast("Successfully replied to post", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((err) => {
        setAddingComment(false);
        addToast("Failed to post your reply.Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const scrollToComment = (commentUUID: string) => {
    if (commentUUID) {
      setTimeout(() => {
        const element = document.getElementById(commentUUID as string);
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
    PostsService.getPostComments(post.id)
      .then((r) => {
        setComments(r.data.data);
        setLoadingComments(false);
        goToComment();
      })
      .catch((err) => {
        setLoadingComments(false);
      });
  };

  const navigateToPost = () => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          postId: post.id,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const copyLink = async () => {
    try {
      const url = `${window.location.origin}/${post.studio.handle}/feed?postId=${post.id}`;
      await navigator.clipboard.writeText(url);
      addToast("Copied link to clipboard.", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const editPost = () => {
    if (isEmptyEditor()) {
      addToast("Please share something to edit", {
        appearance: "error",
        autoDismiss: true,
      });
    } else {
      setEditing(true);
      const data: CreatePostType = {
        attributes: {},
        children: { blocks: JSON.stringify(editor.children) },
        isPublic: true,
        roleIds: [],
      };
      PostsService.editPost(data, post.id)
        .then((r) => {
          const updatedPost: PostType = r.data.data;
          const blocksString = updatedPost.children.blocks;
          const blocks = JSON.parse(blocksString);
          editor.children = blocks;
          editor.onChange();
          updatePost(updatedPost);
          setEditMode(false);
          setEditing(false);
          addToast("Successfully edited your post", {
            appearance: "success",
            autoDismiss: true,
          });
        })
        .catch((err) => {
          setEditing(false);
          addToast("Something went wrong. Please try again", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  };

  const resetData = () => {
    editor.children = blocks;
    editor.onChange();
    setEditMode(false);
  };

  const isEmptyEditor = () => {
    if (editor?.children?.length) {
      let text = "";
      editor.children.forEach((elm: any) => {
        text = text + elm.children[0].text;
      });
      return text.trim().length === 0;
    }
    return true;
  };

  const parentComments = useMemo(() => {
    return comments.filter((comment) => !comment.parentPostCommentID);
  }, [comments]);

  const emoji = useMemo(() => {
    if (post.reactions?.length) {
      const reactedReaction = post.reactions.find((reac) => reac.reacted);
      return reactedReaction ? reactedReaction.emoji : "";
    }
    return "";
  }, [post]);

  const likesText = useMemo(() => {
    if (post?.reactions?.length) {
      const count = post.reactions.reduce(
        (acc, curValue) => acc + curValue.count,
        0
      );
      if (count === 1) {
        return emoji ? "You reacted" : `${post.reactionCopy} reacted`;
      }
      if (count === 2) {
        return emoji
          ? "You and 1 other reacted"
          : `${post.reactionCopy} and 1 other reacted`;
      }
      return emoji
        ? `You and ${count - 1} others reacted`
        : `${post.reactionCopy} and ${count - 1} others reacted`;
    }
    return "";
  }, [post]);

  const getReplyBoxId = () => {
    return `${post.id}-post-reply-box`;
  };

  return (
    <Box
      border={"1px solid"}
      borderColor={"postInFeed.border"}
      borderRadius={"12px"}
      padding={"16px"}
      bg={"postInFeed.cardBg"}
      sx={{
        width: ["360px", "500px", "600px", "600px"],
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
                src={post.createdByUser.avatarUrl || AVATAR_PLACEHOLDER}
                draggable={false}
              />
              <Avatar
                sx={{ height: "13px", width: "13px" }}
                src={post.studio.imageUrl || GITHUB_AVATAR_PLACEHOLDER}
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
              <Tooltip
                aria-label={
                  post.createdByUser.fullName || post.createdByUser.username
                }
              >
                <LinkWithoutPrefetch href={`/${post.createdByUser.username}`}>
                  <Truncate
                    as="p"
                    title={
                      post.createdByUser.fullName || post.createdByUser.username
                    }
                    maxWidth={["125px", "175px", "250px", "250px"]}
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      lineHeight: "20px",
                      cursor: "pointer",
                    }}
                  >
                    {post.createdByUser.fullName || post.createdByUser.username}
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
                  title={formatDateAndTime(post.createdAt)}
                  minPeriod={60}
                  formatter={shortTimeAgoFormatter}
                  date={post.createdAt}
                />
              </Text>
            </Box>
            <LinkWithoutPrefetch href={`/${post.studio.handle}`}>
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
                {post.studio.displayName}
              </Text>
            </LinkWithoutPrefetch>
          </Box>
        </Box>
        <Box
          display={"flex"}
          alignItems={"center"}
          sx={{
            gap: "16px",
          }}
        >
          <PostCardMenu
            deleteHandler={deletePost}
            editHandler={() => {
              setEditMode(true);
            }}
            copyLink={copyLink}
            post={post}
            followUser={followUser}
            unFollowUser={unFollowUser}
            joinStudio={joinStudio}
            leaveStudio={leaveStudio}
            requestToJoin={requestToJoin}
          />
        </Box>
      </Box>
      <Box
        paddingX={"4px"}
        marginTop={"16px"}
        ref={editorContainerRef}
        sx={{
          maxHeight: editMode || expanded ? "auto" : "120px",
          overflow: "hidden",
        }}
      >
        <PostsEditor editor={editor} readOnly={!editMode} blocks={blocks} />
      </Box>
      {editMode ? null : reachedMaxHeight ? (
        <Box display={"flex"} justifyContent={"flex-end"}>
          <Button
            variant="invisible"
            onClick={() => {
              setExpanded((prev) => !prev);
            }}
            size={"small"}
            sx={{
              mt: "8px",
              color: "postInFeed.textLight",
            }}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
        </Box>
      ) : null}
      {editMode ? (
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"flex-end"}
          sx={{ gap: "16px", mt: "16px" }}
        >
          <Button
            variant="invisible"
            onClick={resetData}
            sx={{
              px: 1,
              width: "63px",
              ":focus:not([disabled])": { boxShadow: "none" },
              color: "postInFeed.textLight",
            }}
            disabled={editing}
          >
            Cancel
          </Button>
          <Button
            onClick={editPost}
            variant="primary"
            sx={{
              borderColor: "postInFeed.border",
              ":focus:not([disabled])": { boxShadow: "none" },
            }}
            disabled={editing}
          >
            Save
          </Button>
        </Box>
      ) : null}
      <Box bg={"postInFeed.border"} my={"16px"} height={"1px"} />

      <EngagementSummary
        text={likesText}
        sharesCount={0}
        commentsCount={post.commentCount}
        reactions={post.reactions}
        commentHandler={() => {
          if (!showCommentBox) {
            getComments();
          }
          setShowCommentBox((prevState) => !prevState);
        }}
        showCommentBox={showCommentBox}
      />
      <LikeCommentShare
        commentHandler={() => {
          if (!showCommentBox) {
            getComments();
          }
          !showCommentBox && setShowCommentBox(true);
          document.getElementById(getReplyBoxId())?.focus();
        }}
        addReaction={addReaction}
        removeReaction={removeReaction}
        emoji={emoji}
        shareHandler={copyLink}
        sx={{ mt: "12px" }}
      />
      {showCommentBox ? (
        <>
          <ReplyBox
            replyHandler={addComment}
            disabled={addingComment}
            replyBoxId={getReplyBoxId()}
          />
          {loadingComments ? (
            <Box display={"flex"} justifyContent={"center"} my={"8px"}>
              <BipLoader />
            </Box>
          ) : parentComments?.length ? (
            <Box
              mt={"16px"}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                p: "6px",
                bg: "postInFeed.commentsBg",
              }}
            >
              {parentComments?.map((comment) => (
                <PostComment
                  key={comment.id}
                  comment={comment}
                  comments={comments}
                  depth={1}
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

export default PostCard;
