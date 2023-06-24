import { ReactionType } from "../BipEditor/types";

export type CreatePostType = {
  attributes: { [key: string]: any };
  children: { blocks: string };
  isPublic: boolean;
  roleIds: number[];
};

export type CreatedPostUserType = {
  avatarUrl: string;
  fullName: string;
  id: number;
  username: string;
  uuid: string;
};

export type PostReactionType = ReactionType;

export type PostType = {
  attributes: { [key: string]: any };
  children: { blocks: string };
  commentCount: number;
  createdAt: string;
  createdById: number;
  createdByUser: CreatedPostUserType;
  id: number;
  reactionCopy: string;
  reactions: PostReactionType[] | null;
  studioID: number;
  updatedById: number;
  updatedByUser: CreatedPostUserType;
  uuid: string;
  context?: string;
  isUserFollower: boolean;
  isStudioMember: boolean;
  isUserStudioAdmin: boolean;
  studio: {
    id: number;
    displayName: string;
    handle: string;
    imageUrl: string;
    uuid: string;
    createdById: number;
    allowPublicMembership: boolean;
    isRequested: boolean;
  };
};

export type PostCommentType = {
  comment: string;
  commentCount: number;
  createdAt: string;
  createdById: number;
  createdByUser: CreatedPostUserType;
  id: number;
  isEdited: boolean;
  reactionCopy: string;
  reactions: PostReactionType[] | null;
  parentPostCommentID: number | null;
  postID: number;
  updatedById: number;
  updatedByUser: CreatedPostUserType;
  uuid: string;
};

export type CreateCommentType = {
  comment: string;
  isEdited: boolean;
  parentPostCommentID?: number;
};
