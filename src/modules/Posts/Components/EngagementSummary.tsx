import { Box, Text } from "@primer/react";
import React, { FC, useMemo } from "react";
import CelebrateIcon from "../../../icons/CelebrateIcon";
import ExceptionalIcon from "../../../icons/ExceptionalIcon";
import JustLookingIcon from "../../../icons/JustLookingIcon";
import WellDoneIcon from "../../../icons/WellDoneIcon";
import { POST_REACTIONS } from "../constants";
import { PostReactionType } from "../types";

interface EngagementSummaryProps {
  text: string;
  sharesCount: number;
  commentsCount: number;
  reactions: PostReactionType[] | null;
  commentHandler: () => void;
  showCommentBox: boolean;
}

const EngagementSummary: FC<EngagementSummaryProps> = (props) => {
  const {
    text,
    sharesCount,
    commentsCount,
    reactions,
    commentHandler,
    showCommentBox,
  } = props;

  const getIcon = (emoji: string) => {
    switch (emoji) {
      case POST_REACTIONS.WELL_DONE:
        return <WellDoneIcon size={15} />;
      case POST_REACTIONS.JUST_LOOKING:
        return <JustLookingIcon size={15} />;
      case POST_REACTIONS.EXCEPTIONAL:
        return <ExceptionalIcon size={15} />;
      case POST_REACTIONS.CELEBRATE:
        return <CelebrateIcon size={15} />;
      default:
        return emoji;
    }
  };

  const getReactedComponents = () => {
    if (reactions?.length) {
      return reactions.map((reaction, index) =>
        index >= 3 ? null : (
          <Box
            key={reaction.emoji}
            sx={{ marginLeft: index > 0 ? "-2.5px" : "0px" }}
          >
            {getIcon(reaction.emoji)}
          </Box>
        )
      );
    }
    return null;
  };

  return text || reactions?.length || commentsCount ? (
    <Box
      display={"flex"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <Box display={"flex"} alignItems={"center"}>
        {text ? (
          <>
            {getReactedComponents()}

            <Text
              as="p"
              sx={{
                color: "postInFeed.textLight",
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "18px",
                ml: "4px",
              }}
            >
              {text}
            </Text>
          </>
        ) : null}
      </Box>
      {commentsCount ? (
        <Box
          display={"flex"}
          alignItems={"center"}
          color={"postInFeed.textLight"}
          sx={{ gap: "4px", cursor: "pointer" }}
          onClick={commentHandler}
        >
          {/* <Text
          as="p"
          sx={{
            fontSize: "12px",
            fontWeight: 400,
            lineHeight: "18px",
          }}
        >
          {sharesCount} Shares
        </Text>
        <Text as="p">•</Text> */}
          <Text
            as="p"
            sx={{
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: "18px",
              whiteSpace: "nowrap",
            }}
          >
            {showCommentBox
              ? `Hide comments (${commentsCount})`
              : `${commentsCount} Comment${commentsCount > 1 ? "s" : ""}`}
          </Text>
        </Box>
      ) : null}
    </Box>
  ) : null;
};

export default EngagementSummary;
