import { KebabHorizontalIcon } from "@primer/octicons-react";
import { ActionList, ActionMenu, IconButton, Text } from "@primer/react";
import { LinkIcon, TrashIcon } from "@primer/styled-octicons";
import React, { FC } from "react";
import { useUser } from "../../../context/userContext";
import { PostCommentType } from "../types";

interface PostCommentMenuProps {
  isReply?: boolean;
  deleteHandler: () => void;
  saveLink: () => void;
  createdById: number;
}

const PostCommentMenu: FC<PostCommentMenuProps> = (props) => {
  const { isReply, createdById, saveLink, deleteHandler } = props;
  const { user: currentUser } = useUser();

  return (
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
          <ActionList.Item sx={{ alignItems: "center" }} onSelect={saveLink}>
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
              {isReply ? "Copy Link to Reply" : "Copy Link to Comment"}
            </Text>
          </ActionList.Item>
          {currentUser?.id === createdById ? (
            <>
              <ActionList.Divider />
              <ActionList.Item
                variant="danger"
                sx={{ alignItems: "center" }}
                onSelect={deleteHandler}
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
                  {isReply ? "Delete Reply" : "Delete Comment"}
                </Text>
              </ActionList.Item>
            </>
          ) : null}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
};

export default PostCommentMenu;
