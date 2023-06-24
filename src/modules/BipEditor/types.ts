import { IUserMini } from "../../commons/types";
import { UserType } from "../Explore/types";

export type CreateBlockThreadType = {
  canvasBranchId: number;
  canvasRepositoryId: number;
  highlightedText: string;
  position: number;
  startBlockUUID: string;
  text: string;
  textRangeEnd: number;
  textRangeStart: number;
};

export type BlockType = {
  archivedAt: string;
  archivedByID: null | number;
  children: { text: string }[];
  createdAt: string;
  createdByID: number;
  id: number;
  isArchived: boolean;
  rank: number;
  type: string;
  updatedAt: string;
  updatedByID: number;
  uuid: string;
  version: number;
  reelCount: number;
  commentCount: number;
  reactions: ReactionType[] | null;
  contributors: UserType[];
};

export type ReactionType = {
  count: number;
  emoji: string;
  reacted: boolean;
};

export type ThreadType = {
  archivedAt: string;
  archivedById: number | null;
  canvasBranchId: number;
  canvasRepositoryId: number;
  commentCount: number;
  createdAt: string;
  createdById: number;
  highlightedText: string;
  id: number;
  isArchived: boolean;
  isResolved: boolean;
  mentions: MentionType[] | null;
  position: number;
  reactions?: ReactionType[] | null;
  resolvedAt: string;
  resolvedById: number | null;
  startBlockUUID: string;
  text: string;
  textRangeEnd: number;
  textRangeStart: number;
  updatedAt: string;
  updatedById: number;
  uuid: string;
  user: IUserMini;
};

export type ThreadCommentType = {
  archivedAt: string;
  archivedByID: number;
  createdByID: number;
  createdAt: string;
  data: { text: string };
  id: number;
  isArchived: false;
  isEdited: false;
  isReply: false;
  mentions: MentionType[] | null;
  parentId: number | null;
  position: number;
  threadID: number;
  uuid: string;
  UpdatedByID: number;
  updatedAt: string;
  reactions: ReactionType[] | null;
  user: IUserMini;
};

export type CreateBlockThreadCommentType = {
  data: any;
  isEdited: boolean;
  isReply: boolean;
  parentId: number;
  position: number;
  threadId: number;
};

export type ReelType = {
  archivedAt: string;
  archivedByID: number;
  canvasBranchID: number;
  canvasRepositoryID: number;
  commentCount: number;
  contextData: { text: string };
  createdAt: string;
  createdByID: number;
  highlightedText: string;
  mentions: MentionType[] | null;
  id: number;
  isArchived: false;
  rangeEnd: { pos: number };
  rangeStart: { pos: number };
  reactions: ReactionType[] | null;
  reactionCopy: string;
  startBlockID: number;
  startBlockUUID: string;
  isStudioMember: boolean;
  isUserFollower: boolean;
  studio: {
    displayName: string;
    handle: string;
    id: number;
    imageUrl: string;
    uuid: string;
    createdById: number;
    allowPublicMembership: boolean;
    isRequested: boolean;
  };
  studioID: number;
  textRangeEnd: number;
  textRangeStart: number;
  updatedAt: number;
  updatedByID: number;
  user: {
    avatarUrl: string;
    fullName: string;
    id: number;
    username: string;
    uuid: string;
  };
  uuid: string;
  context?: string;
};

export type ReelCommentType = {
  archivedAt: string;
  archivedByID: number;
  createdAt: string;
  id: number;
  isArchived: boolean;
  isEdited: boolean;
  mentions: MentionType[] | null;
  isReply: boolean;
  parentID: null;
  position: number;
  rangeStart: { text: string };
  reactionCounter: ReactionType[] | null;
  reelID: number;
  updatedAt: string;
  updatedByID: number;
  uuid: string;
  commentCount: number;
  user: {
    avatarUrl: string;
    fullName: string;
    id: number;
    username: string;
    uuid: string;
  };
};

export type ReactionScope =
  | "block"
  | "block_comment"
  | "reel"
  | "reel_comment"
  | "block_thread";

export type CreateReactionType = {
  blockCommentID: number;
  blockUUID: string;
  blockThreadID: number;
  canvasBranchID: number;
  emoji: string;
  reelCommentID: number;
  reelID: number;
  scope: ReactionScope;
};

export type MentionScope =
  | "block"
  | "block_comment"
  | "reel"
  | "reel_comment"
  | "block_thread";

export type CreateMentionType = {
  branches?: number[];
  objectID: number;
  roles?: number[];
  scope: MentionScope;
  users: number[];
};

export type MentionType = {
  avatarUrl: string;
  fullName: string;
  id: number;
  type: string;
  username: string;
  uuid: string;
};
