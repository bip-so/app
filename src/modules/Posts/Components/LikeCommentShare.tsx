import { Box, Button, Text } from "@primer/react";
import { BetterSystemStyleObject } from "@primer/react/lib/sx";
import { CommentIcon, ShareIcon } from "@primer/styled-octicons";
import React, { FC } from "react";
import LikeComponent from "./LikeComponent";

interface LikeCommentShareProps {
  commentHandler: () => void;
  shareHandler: () => void;
  emoji?: string;
  addReaction: (emoji: string) => void;
  removeReaction: (emoji: string) => void;
  sx?: BetterSystemStyleObject;
}

const LikeCommentShare: FC<LikeCommentShareProps> = (props) => {
  const {
    sx,
    commentHandler,
    shareHandler,
    emoji,
    addReaction,
    removeReaction,
  } = props;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        ...(sx ? sx : {}),
      }}
    >
      <Box sx={{ display: "flex", flex: 1 }}>
        <LikeComponent
          showThumb={true}
          emoji={emoji}
          addReaction={addReaction}
          removeReaction={removeReaction}
        />
      </Box>
      <Box sx={{ display: "flex", flex: 1, justifyContent: "center" }}>
        <Button
          variant="invisible"
          sx={{
            color: "postInFeed.textLight",
            border: "none",
            borderColor: "none",
            ":hover:not([disabled])": {
              border: "none",
              borderColor: "none",
            },
          }}
          onClick={commentHandler}
        >
          <Box
            display={"flex"}
            alignItems={"center"}
            sx={{
              gap: "5px",
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
      </Box>
      <Box sx={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
        <Button
          variant="invisible"
          sx={{
            color: "postInFeed.textLight",
            border: "none",
            borderColor: "none",
            ":hover": {
              border: "none",
              borderColor: "none",
            },
          }}
          onClick={shareHandler}
        >
          <Box
            display={"flex"}
            alignItems={"center"}
            sx={{
              gap: "5px",
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
  );
};

export default LikeCommentShare;
