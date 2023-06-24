import {
  BookmarkIcon,
  CommentIcon,
  KebabHorizontalIcon,
  LinkIcon,
  ShareIcon,
  ThumbsupIcon,
  TrashIcon,
} from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  AnchoredOverlay,
  Avatar,
  AvatarPair,
  Box,
  Button,
  IconButton,
  Label,
  Text,
  Tooltip,
} from "@primer/react";
import { useCallback, useState } from "react";
import {
  AVATAR_PLACEHOLDER,
  DEFAULT_USER_PLACEHOLDER,
} from "../../../commons/constants";
import MentionsInput from "../../../components/MentionsInput";
import ExceptionalIcon from "../../../icons/ExceptionalIcon";
import JustLookingIcon from "../../../icons/JustLookingIcon";
import WellDoneIcon from "../../../icons/WellDoneIcon";
import { IUser } from "../../User/interfaces/IUser";
import LikeComponent from "./LikeComponent";
import ReplyToComment from "./ReplyToComponent";

interface IFeedCardProps {
  item: any;
  postDeleteHandler: (id: number) => void;
  currentUser: IUser | null;
  setDummyAPI: any;
  dummyAPI: any;
}

const FeedCard: React.FunctionComponent<IFeedCardProps> = (props) => {
  const { item, postDeleteHandler, currentUser, setDummyAPI, dummyAPI } = props;
  const [showLikeOverlay, setShowLikeOverlay] = useState(false);
  const [showCommentLikeOverlay, setShowCommentLikeOverlay] = useState(false);
  const [showReplyLikeOverlay, setShowReplyLikeOverlay] = useState(false);
  setShowReplyLikeOverlay;
  const [showCommentBox, setShowCommentBox] = useState(() => false);
  const [commentBody, setCommentBody] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(() => false);
  const [replyBody, setReplyBody] = useState("");
  const [size, setSize] = useState(24);
  const openOverlay = useCallback(
    () => setShowLikeOverlay(true),
    [setShowLikeOverlay]
  );
  const closeOverlay = useCallback(
    () => setShowLikeOverlay(false),
    [setShowLikeOverlay]
  );

  const openCommentOverlay = useCallback(
    () => setShowCommentLikeOverlay(true),
    [setShowCommentLikeOverlay]
  );
  const closeCommentOverlay = useCallback(
    () => setShowCommentLikeOverlay(false),
    [setShowCommentLikeOverlay]
  );
  const index = dummyAPI.findIndex((element: any) => element.id === item.id);
  const commentHandler = () => {
    const newComment = {
      id: Math.floor(Math.random() * 9999),
      avatarUrl: currentUser?.avatarUrl,
      displayName: currentUser?.username,
      time: "2hrs ago",
      perms: "Moderator",
      msg: commentBody,
      isLiked: false,
      commentsArray: [],
    };

    dummyAPI[index] = {
      ...item,
      commentsArray: [newComment, ...(dummyAPI[index]?.commentsArray || [])],
    };
    // console.log("dumm", dummyAPI);

    setCommentBody("");
  };

  const replyIndex = dummyAPI[index].commentsArray?.findIndex(
    (element: any) => element.id === item.id
  );

  const replyHandler = () => {
    const newReply = {
      id: Math.floor(Math.random() * 9999),
      avatarUrl: currentUser?.avatarUrl,
      displayName: currentUser?.username,
      time: "2hrs ago",
      perms: "Moderator",
      msg: replyBody,
      isLiked: false,
    };

    dummyAPI[index].commentsArray.repliesArray = [
      newReply,
      ...(dummyAPI[index]?.commentsArray.repliesArray || []),
    ];
    console.log("dumm", dummyAPI);

    setReplyBody("");
    setShowReplyBox((prevState) => !prevState);
  };

  return (
    <Box //feedCard
      border={"1px solid"}
      borderColor={"postInFeed.border"}
      borderRadius={"6px"}
      padding={"16px"}
    >
      <Box display={"flex"} flexDirection={"column"}>
        <Box display={"flex"} sx={{ gap: "6px" }} alignItems={"center"}>
          {/* top-row */}
          <Box width={"40px"} position={"sticky"}>
            {/* avatar */}
            <AvatarPair>
              <Avatar
                sx={{ height: "32px", width: "32px" }}
                src={item.imageUrl || AVATAR_PLACEHOLDER}
              />
              <Avatar
                sx={{ height: "13px", width: "13px" }}
                src={item.avatarUrl || DEFAULT_USER_PLACEHOLDER}
              />
            </AvatarPair>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            // marginLeft="46px"
            width={"100%!important"}
          >
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Box sx={{ whiteSpace: "nowrap" }}>
                <Text
                  sx={{
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    maxWidth: "30px",
                    whiteSpace: "initial",
                    overflowWrap: "anywhere",
                  }}
                >
                  {item.displayName}
                </Text>
                <Text
                  sx={{
                    display: "inline-block",
                    marginLeft: "6px",
                    fontSize: "14px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    // width: "10px",
                    color: "postInFeed.textLight",
                    whiteSpace: "initial",
                    // overflowWrap: "anywhere",
                  }}
                >
                  • {item.time}
                </Text>
              </Box>
              <Box
                display={"flex"}
                alignItems={"center"}
                sx={{
                  gap: "16px",
                }}
              >
                {/* <Button variant="invisible">
                  <Text
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      lineHeight: "18px",
                      color: "postInFeed.textLight",
                    }}
                  >
                    Follow
                  </Text>
                </Button> */}
                {/* {reel.isStudioMember || reel.isUserFollower ? ( */}
                <ActionMenu>
                  <ActionMenu.Button
                    variant="invisible"
                    sx={{
                      fontSize: "12px",
                      fontWeight: 600,
                      lineHeight: "18px",
                      color: "postInFeed.textLight",
                    }}
                  >
                    {item.isFollowing ? "Unfollow" : "Follow"}
                  </ActionMenu.Button>
                  <ActionMenu.Overlay>
                    <ActionList>
                      <ActionList.Item
                      // disabled={loadingFollow}
                      // onSelect={() => {
                      //   if (reel.isUserFollower) {
                      //     unFollowUser();
                      //   } else {
                      //     followUser();
                      //   }
                      // }}
                      >
                        {/* {reel.isUserFollower
                      ? `Unfollow ${reel.user.fullName}`
                      : "Follow"} */}
                        <Text
                          sx={{
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "20px",
                            letterSpacing: "-0.15px",
                          }}
                        >
                          {item.isFollowing
                            ? "Unfollow  User Only"
                            : "Follow  User Only"}
                        </Text>
                      </ActionList.Item>
                      <ActionList.Item
                      // disabled={loadingJoin}
                      // onSelect={() => {
                      //   if (reel.isStudioMember) {
                      //     leaveStudio();
                      //   } else {
                      //     joinStudio();
                      //   }
                      // }}
                      >
                        {/* {reel.isStudioMember
                      ? `Leave ${reel.studio.displayName}`
                      : "Join"} */}
                        <Text
                          sx={{
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "20px",
                            letterSpacing: "-0.15px",
                          }}
                        >
                          {item.isFollowing
                            ? "Unfollow  User and Studio"
                            : "Follow  User and Studio"}
                        </Text>
                      </ActionList.Item>
                      <ActionList.Divider />
                      <ActionList.Item>
                        <Text
                          sx={{
                            fontSize: "14px",
                            fontWeight: 400,
                            lineHeight: "20px",
                            letterSpacing: "-0.15px",
                          }}
                        >
                          Cancel
                        </Text>
                      </ActionList.Item>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
                {/* ) : (
            <Button
              sx={{
                color: "reelCard.followButton",
                fontWeight: "600",
                borderRadius: "6px",
              }}
              disabled={loadingJoin || loadingFollow}
              onClick={onClickFollow}
            >
              Follow
            </Button>
          )} */}
                <Box>
                  <ActionMenu>
                    <ActionMenu.Anchor sx={{ color: "postInFeed.textLight" }}>
                      <IconButton
                        variant="invisible"
                        icon={KebabHorizontalIcon}
                      />
                    </ActionMenu.Anchor>

                    <ActionMenu.Overlay>
                      <ActionList>
                        <ActionList.Item sx={{ alignItems: "center" }}>
                          <ActionList.LeadingVisual>
                            <BookmarkIcon size={16} />
                          </ActionList.LeadingVisual>
                          <Text
                            sx={{
                              fontSize: "14px",
                              fontWeight: 400,
                              lineHeight: "20px",
                              letterSpacing: "-0.15px",
                            }}
                          >
                            Save Post
                          </Text>
                        </ActionList.Item>
                        <ActionList.Item sx={{ alignItems: "center" }}>
                          <ActionList.LeadingVisual>
                            <LinkIcon size={16} />
                          </ActionList.LeadingVisual>
                          <Text
                            sx={{
                              fontSize: "14px",
                              fontWeight: 400,
                              lineHeight: "20px",
                              letterSpacing: "-0.15px",
                            }}
                          >
                            Edit Post
                          </Text>
                        </ActionList.Item>
                        <ActionList.Item sx={{ alignItems: "center" }}>
                          <ActionList.LeadingVisual>
                            <LinkIcon size={16} />
                          </ActionList.LeadingVisual>
                          <Text
                            sx={{
                              fontSize: "14px",
                              fontWeight: 400,
                              lineHeight: "20px",
                              letterSpacing: "-0.15px",
                            }}
                          >
                            Copy Link to Post
                          </Text>
                        </ActionList.Item>
                        <ActionList.Divider />
                        <ActionList.Item
                          variant="danger"
                          sx={{ alignItems: "center" }}
                          onSelect={() => postDeleteHandler(item.id)}
                        >
                          <ActionList.LeadingVisual>
                            <TrashIcon size={16} />
                          </ActionList.LeadingVisual>
                          <Text
                            sx={{
                              fontSize: "14px",
                              fontWeight: 400,
                              lineHeight: "20px",
                              letterSpacing: "-0.15px",
                            }}
                          >
                            Delete Post
                          </Text>
                        </ActionList.Item>
                      </ActionList>
                    </ActionMenu.Overlay>
                  </ActionMenu>
                </Box>
              </Box>
            </Box>
            <Box marginTop={"-5px"}>
              <Label
                sx={{
                  bg: "postInFeed.labelBg   ",
                }}
              >
                {item.perms}
              </Label>
            </Box>
          </Box>
        </Box>
        <Box //midBox
          paddingX={"4px"}
          marginTop={"17px"}
        >
          <Text
            sx={{
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "20px",
            }}
          >
            {item.msg}
          </Text>
        </Box>
        <Box //divider
          border={"1px solid"}
          borderColor={"postInFeed.border"}
          bg={"postInFeed.border"}
          marginTop={"20px"}
          marginBottom={"13px"}
        />
        <Box //details
          display={"flex"}
          alignItems={"center"}
          // flexDirection={"column"}
          justifyContent={"space-between"}
        >
          <Box
            display={"flex"}
            flexDirection={"row"}
            alignItems={"center"}
            sx={{ gap: "4px" }}
          >
            <Box display={"flex"}>
              <WellDoneIcon size={15} />
              <Box sx={{ marginLeft: "-2.5px" }}>
                <ExceptionalIcon size={15} />
              </Box>
              <Box sx={{ marginLeft: "-2.5px" }}>
                <JustLookingIcon size={15} />
              </Box>
            </Box>
            <Text
              sx={{
                color: "postInFeed.textLight",
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "18px",
              }}
            >
              Darshana Hazarika and 62 others
            </Text>
          </Box>
          <Box
            display={"flex"}
            alignItems={"center"}
            color={"postInFeed.textLight"}
            sx={{ gap: "4px" }}
          >
            <Text
              sx={{
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "18px",
                whiteSpace: "nowrap",
              }}
            >
              {item.shares} Shares
            </Text>
            <Text>•</Text>
            <Text
              sx={{
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "18px",
                whiteSpace: "nowrap",
              }}
            >
              {item.commentsCount} Comments
            </Text>
          </Box>
        </Box>
        <Box //buttons
          // marginTop={40}
          display={"flex"}
          justifyContent={"space-between"}
          mt="0.75rem"
          //   flexDirection={"row-reverse"}
          //   sx={{ gap: "16px" }}
        >
          <LikeComponent showThumb={true} />
          <Button
            variant="invisible"
            sx={{
              ":focus:not([disabled])": { boxShadow: "none" },
              ":hover:not([disabled])": {
                border: "1px solid",
                borderColor: "postInFeed.border",
              },
            }}
            onClick={() => setShowCommentBox((prevState) => !prevState)}
          >
            <Box
              display={"flex"}
              alignItems={"center"}
              color={"postInFeed.textLight"}
              sx={{
                gap: "5px",
                ":hover": {
                  color: "postInFeed.textBlack",
                },
              }}
            >
              <CommentIcon size={14} />
              <Text
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  lineHeight: "18px",
                }}
              >
                Comment
              </Text>
            </Box>
          </Button>

          <Button
            variant="invisible"
            sx={{
              px: 1,
              width: "63px",
              ":focus:not([disabled])": { boxShadow: "none" },
              color: "postInFeed.text",
              ":hover": {
                border: "1px solid",
                borderColor: "postInFeed.border",
              },
            }}
          >
            <Box
              display={"flex"}
              alignItems={"center"}
              color={"postInFeed.textLight"}
              sx={{
                gap: "5px",
                ":hover": {
                  color: "postInFeed.textBlack",
                },
              }}
            >
              <ShareIcon size={14} />
              <Text
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  lineHeight: "18px",
                }}
              >
                Share
              </Text>
            </Box>
          </Button>
        </Box>
      </Box>
      {showCommentBox && (
        <Box className="flex mt-3 space-x-2 items-top" alignItems={"center"}>
          <Avatar
            src={currentUser?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
            sx={{ width: "28px", height: "28px", flexShrink: 0 }}
            alt={"user"}
            draggable={false}
          />
          <MentionsInput
            onChange={(e) => setCommentBody(e.target.value)}
            onEnterClick={() => {
              commentBody.trim()?.length && commentHandler();
            }}
            value={commentBody}
            // onChange={(e: any, mentionedUsers: any) => {
            // setInputValue(e.target.value);
            // setMentionedUsers(mentionedUsers);
            // }}
            // onEnterClick={() => {
            //   if (!posting && inputValue?.trim()?.length) {
            //     postReelComment();
            //   }
            // }}
            maxRows={15}
            className={
              "overflow-hidden text-sm resize-none outline-0 flex flex-1 px-2 py-1 w-full box-border"
            }
            style={{
              border: "1px solid",
              borderColor: "#D0D7DE",
              // borderColor:
              // colorMode === "day" ? Colors.geyser : Colors.gray["700"],
              boxShadow: "inset 0px 1px 2px rgba(27, 31, 35, 0.075)",
              borderRadius: "6px",
              // backgroundColor:
              //   colorMode === "day" ? Colors.white : Colors.gray["800"],
            }}
            placeholder="Type your comment here"
            // value={inputValue}
          />
          <Button
            onClick={commentHandler}
            disabled={commentBody.length === 0}
            variant="primary"
            sx={{
              borderColor: "postInFeed.border",
              // mt: "0.75rem",
              ":focus:not([disabled])": { boxShadow: "none" },
            }}
          >
            Reply
          </Button>
        </Box>
      )}
      {dummyAPI[index]?.commentsArray?.map((comment: any) => {
        return (
          <Box display={"flex"} flexDirection={"column"} marginTop={"16px"}>
            <Box display={"flex"} sx={{ gap: "6px" }}>
              <Box width={"40px"} position={"sticky"} marginTop={"10px"}>
                {item.perm === "Moderator" ? (
                  <AvatarPair>
                    <Avatar
                      sx={{ height: "32px", width: "32px" }}
                      src={comment.imageUrl || AVATAR_PLACEHOLDER}
                    />
                    <Avatar
                      sx={{ height: "13px", width: "13px" }}
                      src={comment.avatarUrl || DEFAULT_USER_PLACEHOLDER}
                    />
                  </AvatarPair>
                ) : (
                  <Avatar
                    sx={{ height: "32px", width: "32px" }}
                    src={comment.avatarUrl || DEFAULT_USER_PLACEHOLDER}
                  />
                )}
              </Box>
              <Box
                display={"flex"}
                flexDirection={"column"}
                width={"100%!important"}
              >
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Box sx={{ whiteSpace: "nowrap" }}>
                    <Text
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                        lineHeight: "20px",
                        maxWidth: "30px",
                        whiteSpace: "initial",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {comment.displayName}
                    </Text>
                    <Text
                      sx={{
                        display: "inline-block",
                        marginLeft: "6px",
                        fontSize: "14px",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: "postInFeed.textLight",
                        whiteSpace: "initial",
                      }}
                    >
                      • {comment.time}
                    </Text>
                  </Box>
                  <Box
                    display={"flex"}
                    alignItems={"center"}
                    sx={{
                      gap: "16px",
                    }}
                  >
                    <Box>
                      <ActionMenu>
                        <ActionMenu.Anchor
                          sx={{ color: "postInFeed.textLight" }}
                        >
                          <IconButton
                            variant="invisible"
                            icon={KebabHorizontalIcon}
                          />
                        </ActionMenu.Anchor>

                        <ActionMenu.Overlay>
                          <ActionList>
                            <ActionList.Item sx={{ alignItems: "center" }}>
                              <ActionList.LeadingVisual>
                                <LinkIcon size={16} />
                              </ActionList.LeadingVisual>
                              <Text
                                sx={{
                                  fontSize: "14px",
                                  fontWeight: 400,
                                  lineHeight: "20px",
                                  letterSpacing: "-0.15px",
                                }}
                              >
                                Copy Link to Comment
                              </Text>
                            </ActionList.Item>
                            <ActionList.Divider />
                            <ActionList.Item
                              variant="danger"
                              sx={{ alignItems: "center" }}
                              // onSelect={() =>
                              //   postDeleteHandler(item.id)
                              // }
                            >
                              <ActionList.LeadingVisual>
                                <TrashIcon size={16} />
                              </ActionList.LeadingVisual>
                              <Text
                                sx={{
                                  fontSize: "14px",
                                  fontWeight: 400,
                                  lineHeight: "20px",
                                  letterSpacing: "-0.15px",
                                }}
                              >
                                Delete Comment
                              </Text>
                            </ActionList.Item>
                          </ActionList>
                        </ActionMenu.Overlay>
                      </ActionMenu>
                    </Box>
                  </Box>
                </Box>
                <Box marginTop={"-5px"}>
                  <Label
                    sx={{
                      bg: "postInFeed.labelBg   ",
                    }}
                  >
                    {comment.perms}
                  </Label>
                </Box>

                <Box //midBox
                  paddingX={"4px"}
                  marginTop={"17px"}
                >
                  <Text
                    sx={{
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "20px",
                    }}
                  >
                    {comment.msg}
                  </Text>
                </Box>

                <Box display={"flex"} mt="0.75rem">
                  <LikeComponent />
                  <Button
                    variant="invisible"
                    sx={{
                      ":focus:not([disabled])": { boxShadow: "none" },
                      ":hover": {
                        border: "1px solid",
                        borderColor: "postInfeed.border",
                      },
                    }}
                    onClick={() => setShowReplyBox((prevState) => !prevState)}
                  >
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      color={"postInFeed.textLight"}
                      sx={{
                        gap: "5px",
                        ":hover": {
                          color: "postInFeed.textBlack",
                        },
                      }}
                    >
                      <Text
                        sx={{
                          fontSize: "12px",
                          fontWeight: 600,
                          lineHeight: "18px",
                        }}
                      >
                        Reply
                      </Text>
                    </Box>
                  </Button>
                </Box>
                {showReplyBox && (
                  <Box
                    className="flex mt-3 space-x-2 items-top"
                    alignItems={"center"}
                  >
                    <Avatar
                      src={currentUser?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
                      sx={{ width: "28px", height: "28px", flexShrink: 0 }}
                      alt={"user"}
                      draggable={false}
                    />
                    <MentionsInput
                      onChange={(e) => setReplyBody(e.target.value)}
                      onEnterClick={() => {
                        replyBody.trim()?.length && replyHandler();
                      }}
                      value={replyBody}
                      // onChange={(e: any, mentionedUsers: any) => {
                      // setInputValue(e.target.value);
                      // setMentionedUsers(mentionedUsers);
                      // }}
                      // onEnterClick={() => {
                      //   if (!posting && inputValue?.trim()?.length) {
                      //     postReelComment();
                      //   }
                      // }}
                      maxRows={15}
                      className={
                        "overflow-hidden text-sm resize-none outline-0 flex flex-1 px-2 py-1 w-full box-border"
                      }
                      style={{
                        border: "1px solid",
                        borderColor: "#D0D7DE",
                        // borderColor:
                        // colorMode === "day" ? Colors.geyser : Colors.gray["700"],
                        boxShadow: "inset 0px 1px 2px rgba(27, 31, 35, 0.075)",
                        borderRadius: "6px",
                        // backgroundColor:
                        //   colorMode === "day" ? Colors.white : Colors.gray["800"],
                      }}
                      placeholder="Type your comment here"
                      // value={inputValue}
                    />
                    <Button
                      onClick={replyHandler}
                      disabled={replyBody.length === 0}
                      variant="primary"
                      sx={{
                        borderColor: "postInFeed.border",
                        // mt: "0.75rem",
                        ":focus:not([disabled])": { boxShadow: "none" },
                      }}
                    >
                      Reply
                    </Button>
                  </Box>
                )}
                {dummyAPI[index]?.commentsArray?.repliesArray?.map(
                  (comment: any) => {
                    return (
                      <ReplyToComment
                        setShowReplyBox={setShowReplyBox}
                        comment={comment}
                      />
                    );
                  }
                )}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default FeedCard;
