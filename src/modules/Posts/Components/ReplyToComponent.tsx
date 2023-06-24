import {
  KebabHorizontalIcon,
  LinkIcon,
  TrashIcon,
} from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  Avatar,
  AvatarPair,
  Box,
  Button,
  IconButton,
  Text,
} from "@primer/react";
import * as React from "react";
import {
  AVATAR_PLACEHOLDER,
  DEFAULT_USER_PLACEHOLDER,
} from "../../../commons/constants";
import LikeComponent from "./LikeComponent";

interface IReplyToCommentProps {
  comment?: any;
  setShowReplyBox?: any;
}

const ReplyToComment: React.FunctionComponent<IReplyToCommentProps> = (
  props
) => {
  const { setShowReplyBox, comment } = props;
  return (
    <Box display={"flex"} flexDirection={"column"} marginTop={"16px"}>
      <Box display={"flex"} sx={{ gap: "6px" }}>
        <Box width={"40px"} position={"sticky"} marginTop={"10px"}>
          {comment.perms === "Moderator" ? (
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
        <Box display={"flex"} flexDirection={"column"} width={"100%!important"}>
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
                          Copy Link to Reply
                        </Text>
                      </ActionList.Item>
                      <ActionList.Divider />
                      <ActionList.Item
                        variant="danger"
                        sx={{ alignItems: "center" }}
                        // onSelect={() =>
                        //   props.postDeleteHandler(props.item.id)
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
                          Delete Reply
                        </Text>
                      </ActionList.Item>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              </Box>
            </Box>
          </Box>
          {/* <Box marginTop={"-5px"}>
                              <Label
                                sx={{
                                  bg: "postInFeed.labelBg   ",
                                }}
                              >
                                {comment.perms}
                              </Label>
                            </Box> */}

          <Box //midBox
            paddingX={"4px"}
            // marginTop={"17px"}
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
          <Box display={"flex"}>
            <LikeComponent />
            <Button
              variant="invisible"
              sx={{
                mt: "0.75rem",
                ":focus:not([disabled])": {
                  boxShadow: "none",
                },
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

          {/* {showReplyBox && (
                              <Box
                                className="flex mt-3 space-x-2 items-top"
                                alignItems={"center"}
                              >
                                <Avatar
                                  src={
                                    props.currentUser.avatarUrl ||
                                    DEFAULT_USER_PLACEHOLDER
                                  }
                                  sx={{
                                    width: "28px",
                                    height: "28px",
                                    flexShrink: 0,
                                  }}
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
                                    boxShadow:
                                      "inset 0px 1px 2px rgba(27, 31, 35, 0.075)",
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
                                    ":focus:not([disabled])": {
                                      boxShadow: "none",
                                    },
                                  }}
                                >
                                  Reply
                                </Button>
                              </Box>
                            )} */}
        </Box>
      </Box>
    </Box>
  );
};

export default ReplyToComment;
