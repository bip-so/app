import { KebabHorizontalIcon } from "@primer/octicons-react";
import { ActionList, ActionMenu, IconButton, Text } from "@primer/react";
import {
  BookmarkIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
} from "@primer/styled-octicons";
import React, { FC } from "react";
import { useUser } from "../../../context/userContext";
import { PostType } from "../types";
import { useTranslation } from "next-i18next";

interface PostCardMenuProps {
  deleteHandler: () => void;
  editHandler: () => void;
  copyLink: () => void;
  post: PostType;
  unFollowUser: () => void;
  followUser: () => void;
  joinStudio: () => void;
  leaveStudio: () => void;
  requestToJoin: () => void;
}

const PostCardMenu: FC<PostCardMenuProps> = (props) => {
  const {
    deleteHandler,
    editHandler,
    post,
    copyLink,
    leaveStudio,
    joinStudio,
    followUser,
    unFollowUser,
    requestToJoin,
  } = props;
  const { user: currentUser } = useUser();

  const joinHandler = () => {
    if (post.isStudioMember) {
      leaveStudio();
    } else if (post.studio.allowPublicMembership) {
      joinStudio();
    } else if (!post.studio.isRequested) {
      requestToJoin();
    }
  };
  const {t} = useTranslation();

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
          {currentUser?.id === post.createdById ? (
            <ActionList.Item
              sx={{ alignItems: "center" }}
              onSelect={editHandler}
            >
              <ActionList.LeadingVisual>
                <PencilIcon size={16} />
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
          ) : null}

          {post.createdByUser.id === currentUser?.id ? null : (
            <ActionList.Item
              onSelect={() => {
                if (post.isUserFollower) {
                  unFollowUser();
                } else {
                  followUser();
                }
              }}
            >
              <Text
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.15px",
                }}
              >
                {post.isUserFollower ? "Unfollow  User" : "Follow  User"}
              </Text>
            </ActionList.Item>
          )}

          {post.studio.createdById === currentUser?.id ? null : (
            <ActionList.Item onSelect={joinHandler}>
              <Text
                sx={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  letterSpacing: "-0.15px",
                }}
              >
                {post.isStudioMember
                  ? t("workspace.actionLeave")
                  : post.studio.allowPublicMembership
                  ? t("workspace.actionJoin")
                  : post.studio.isRequested
                  ? "Requested"
                  : "Request to Join"}
              </Text>
            </ActionList.Item>
          )}

          {currentUser?.id === post.createdById || post.isUserStudioAdmin ? (
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
                  Delete Post
                </Text>
              </ActionList.Item>
            </>
          ) : null}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
};

export default PostCardMenu;
