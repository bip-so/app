import { BranchAccessEnum } from "../Canvas/enums";
import {
  CanvasPermissionGroupEnum,
  CollectionPermissionGroupEnum,
} from "../Permissions/enums";
import { Member, StudioType } from "../Studio/types";

export type RoleType = {
  color: string;
  createdAt: string;
  icon: string;
  id: number;
  isNonPerms: boolean;
  isSystem: boolean;
  members: Member[];
  name: string;
  studioID: number;
  updatedAt: string;
  uuid: string;
};

export type CollectionPermissionType = {
  collection: CollectionDataType;
  collectionID: number;
  id: number;
  isOverridden: null;
  member: Member | null;
  memberID: number | null;
  permissionGroup: CollectionPermissionGroupEnum;
  role: RoleType | null;
  roleID: number | null;
  studio: StudioType;
  studioID: number;
  uuid: string;
  type?: string;
};

export type CollectionRolePermissionObject = {
  collectionID: number;
  collectionPermissionID: number;
  isOverRidden: boolean;
  name: string;
  pg: CollectionPermissionGroupEnum;
  roleId: number;
};

export type CollectionMemberPermissionObject = {
  collectionID: number;
  collectionPermissionID: number;
  isOverRidden: boolean;
  memberId: number;
  pg: CollectionPermissionGroupEnum;
};

export type CollectionDataType = {
  id: number;
  name: string;
  position: number;
  icon: string;
  studioId: number;
  userId: number;
  userID?: number;
  parentCollectionId: number | null;
  publicAccess: string;
  areCanvasesFetched?: boolean;
  computedRootCanvasCount: number;
  computedAllCanvasCount: string;
  type?: string;
  parent: number;
  permission: string;

  hasBranch?: boolean;
  hasPublicCanvas?: boolean;

  // for branch, canvas #temp
  collectionID?: number;
  collectionId?: number;

  actualMemberPermsObject: CollectionMemberPermissionObject;

  actualRolePermsObject: CollectionRolePermissionObject[];
  isLanguageCanvas?: boolean;
};

export interface IEditCollectionPayload {
  computedAllCanvasCount: number;
  computedRootCanvasCount: number;
  icon: string;
  id: number;
  name: string;
  publicAccess: string;
}

export interface IUpdateCollectionVisibilityPayload {
  publicAccess: string;
}

export interface IEditCanvasPayload {
  icon: string;
  name: string;
  publicAccess: string;
}

export type CanvasPermissionObject = {
  branchID: number;
  branchPermissionID: number;
  collectionID: number;
  isOverRidden: boolean;
  name: string;
  pg: CanvasPermissionGroupEnum;

  repoID: boolean;

  // Member
  memberId: number;

  // Role
  roleId: number;
};

export type CanvasMemberPermissionObject = {
  branchID: number;
  branchPermissionID: number;
  collectionID: number;
  isOverRidden: boolean;
  memberId: number;
  pg: CanvasPermissionGroupEnum;
  repoID: number;
};

export type CanvasRolePermissionObject = {
  branchID: number;
  branchPermissionID: number;
  collectionID: number;
  isOverRidden: boolean;
  name: string;
  pg: CanvasPermissionGroupEnum;
  repoID: number;
  roleId: number;
};

export type CanvasDefaultBranch = {
  canPublish: boolean;
  hasPublishRequest: boolean;
  id: number;
  isPublishedBy: number;
  key: string;
  name: string;
  permission: CanvasPermissionGroupEnum;
  publicAccess: BranchAccessEnum;
  slug: string;
  uuid: string;

  actualMemberPermsObject: CanvasMemberPermissionObject;

  actualRolePermsObject: CanvasRolePermissionObject[];
};

export type CanvasDataType = {
  id: number;
  collectionId: number;
  collectionID?: number;
  studioId: number;
  name: string;
  position: number;
  icon: string;
  publicAccess: string;
  isPublished: boolean;
  defaultBranchId: number;
  parentCanvasRepositoryID: number;
  createdById: number;
  updatedById: number;
  isArchived: boolean;
  archivedAt: Date;
  archivedById: number;
  parent: number;
  type?: string;
  subCanvasCount: number;

  defaultBranch: CanvasDefaultBranch;
  isLanguageCanvas?: boolean;
};

export type GetCanvasRepoPayloadType = {
  parentCollectionID: number;
  parentCanvasRepositoryID: number;
};

export type CreateOrUpdatePermissionType = {
  collectionId: number | string;
  isOverridden: false;
  memberID?: number | string;
  permGroup: string;
  roleID?: number | string;
  studioID?: number | string;
  userID?: number | string;
};

export type AddEmojiIconType = {
  icon: string | undefined;
  name: string | undefined;
  canvasRepoId: string | number | undefined;
};
export type ChangeVisibilityType = {
  canvasBranchId: number;
  visibility: string;
};

export type CreateReaction = {
  emoji: string;
  scope: string;
  canvasBranchID: string | number;
  blockUUID?: string | number;
  blockCommentID?: string | number;
  blockThreadID?: string | number;
  reelID?: number | string;
  reelCommentID?: string | number;
};

export type CollectionPublicAccessPayload = {
  id: number;
  name: string;
  publicAccess: string;
};
export type MoveCollectionType = {
  collectionId: string | number;
  position: number;
};

export type AttributionsType = {
  canvasBranchID: string | number;
};
