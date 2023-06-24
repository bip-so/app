import { Avatar, Box, Button, Text, useTheme } from "@primer/react";
import React, { FC, useState } from "react";
import { DEFAULT_USER_PLACEHOLDER } from "../../../commons/constants";
import MentionsInput from "../../../components/MentionsInput";
import { useUser } from "../../../context/userContext";
import { MentionUsersType } from "../../../types";
import Colors from "../../../utils/Colors";

interface ReplyBoxProps {
  replyHandler: (
    replyText: string,
    mentions: any,
    resetData: () => void
  ) => void;
  disabled?: boolean;
  usersType?: MentionUsersType;
  replyBoxId?: string;
}

const ReplyBox: FC<ReplyBoxProps> = (props) => {
  const { replyHandler, disabled, usersType, replyBoxId } = props;
  const { colorMode } = useTheme();
  const { user: currentUser } = useUser();
  const [commentText, setCommentText] = useState("");
  const [mentionedUsers, setMentionedUsers] = useState((): any => []);

  const resetData = () => {
    setCommentText("");
    setMentionedUsers([]);
  };

  const handleReply = () => {
    if (!disabled && commentText?.trim()?.length) {
      replyHandler(commentText, mentionedUsers, resetData);
    }
  };

  return (
    <Box display={"flex"} flexDirection={"column"}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          mt: "12px",
          gap: "8px",
        }}
      >
        <Avatar
          src={currentUser?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
          sx={{ width: "28px", height: "28px", flexShrink: 0 }}
          alt={"user"}
          draggable={false}
        />
        <MentionsInput
          value={commentText}
          onChange={(e: any, mentionedUsers: any) => {
            setCommentText(e.target.value);
            setMentionedUsers(mentionedUsers);
          }}
          onEnterClick={handleReply}
          maxRows={5}
          className={
            "overflow-hidden text-sm resize-none outline-0 flex flex-1 px-2 py-1 w-full box-border"
          }
          style={{
            backgroundColor: colorMode === "day" ? "#F6F8FA" : "#30363D",
            boxShadow: "inset 0px 1px 2px rgba(27, 31, 35, 0.075)",
            border: "1px solid",
            borderColor: colorMode === "day" ? "#D0D7DE" : "#484F58",
            borderRadius: "6px",
          }}
          placeholder="Reply to this post"
          autoFocus
          usersType={usersType}
          id={replyBoxId}
        />
      </Box>
      {commentText?.trim()?.length ? (
        <Box display={"flex"} justifyContent={"flex-end"} mt={"4px"}>
          <Text
            as="p"
            fontSize={"10px"}
            lineHeight={"14px"}
            color={"reelCard.text.hintText"}
          >
            (shift + enter) for new line . (enter) to post
          </Text>
        </Box>
      ) : null}
    </Box>
  );
};

export default ReplyBox;
