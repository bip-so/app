import { IUserMini } from "../../commons/types";
import { CanvasPermissionGroupEnum } from "../Permissions/enums";
import { PermissionGroup } from "../Permissions/types";
import {
  BranchAccessEnum,
  BranchMemberTypeEnum,
  MergeRequestStatusEnum,
} from "./enums";
import { BlockType } from "../BipEditor/types";

export interface IBranchAccessToken {
  branchId: number;
  repoId: number;
  repoKey: string;
  createdById: number;
  inviteCode: string;
  isActive: boolean;
  permissionGroup: CanvasPermissionGroupEnum;
}

export interface IEditCanvasPayload {
  icon?: string;
  name?: string;
  publicAccess?: string;
  coverUrl?: string;
  canvasRepoId?: number;
}
export interface ICanvasBranch {
  id: number;
  key: string;
  name: string;
  permission: string;
  publicAccess: BranchAccessEnum;
  uuid: string;
  archivedById: null;
  committed: boolean;
  createdById: number;
  createdFromCommitID: string;
  fromBranchID: number;
  isDefault: boolean;
  isDraft: boolean;
  isMerged: boolean;
  isRoughBranch: boolean;
  lastSyncedAllAttributionsCommitID: string;
  roughBranchCreatorID: number;
  roughFromBranchID: number;
  updatedById: number;
  mergeRequest: number;
  branchAccessTokens: IBranchAccessToken[];
  accessRequests: any[];

  permissionGroup?: PermissionGroup;

  collectionId: number;
  collectionID: number;
  canvasRepositoryID?: number;
  CanvasRepositoryId?: number;

  parent?: number;
  position?: number;
  type?: string;
  isNewRough?: boolean;
  isPublishedBy?: number;
  isLanguageCanvas?: boolean;

  contributorsList?: any[];
  updatedAt: string;
}

export interface IRole {
  id: number;
  uuid: string;
  name: string;
  membersCount: number;

  color: string;
  icon: string;
  isNonPerms: boolean;
  isSystem: boolean;
}

export interface IBranchMember {
  type: BranchMemberTypeEnum;
  permissionGroup: CanvasPermissionGroupEnum;
  memberID?: number;
  memberId?: number;
  roleID?: number;
  roleId?: number;
  user?: IUserMini;
  role?: IRole;
  id?: number; //canvasBranchPermissionId
}

export interface ICanvasRepo {
  collectionID: number;
  createdAt: string;
  createdByID: number;
  defaultBranch: ICanvasBranch;
  defaultBranchID: number;
  icon: string;
  id: number;
  isPublished: boolean;
  key: string;
  name: string;
  parent: number;
  parentCanvasRepositoryID: number;
  position: number;
  subCanvasCount: number;
  type: string;
  updatedAt: string;
  updatedByID: number;
  uuid: string;

  branches?: ICanvasBranch[];
  hasBranch?: boolean;
  coverUrl?: string;
}

export interface IPGUpdatePayload {
  canvasBranchId: number;
  canvasRepositoryId: number;
  collectionId: number;
  isOverridden: boolean;
  memberID: number;
  parentCanvasRepositoryId?: number;
  permGroup: CanvasPermissionGroupEnum;
  roleID?: number;
  userID?: number;
}

export interface InviteViaEmailsPayload {
  invites: {
    canvasPermissionsGroup: CanvasPermissionGroupEnum;
    email: string;
  }[];
}

export interface ICanvasBranchesPayload {
  canvasId: number;
  collectionId: number;
  parentCanvasId: number;
}

export interface ICreateBranchPayload {
  canvasRepoId: number;
  collectionId: number;
  fromCanvasBranchId: number;
  parentCanvasRepoId: number;
}

export interface ICreateRoughBranchPayload {
  canvasRepoId: number;
  collectionId: number;
  parentCanvasRepoId: number;
}

export interface ICommitMessagePayload {
  message: string;
}

export interface IAcceptMergePayload {
  commitMessage: string;
  status: string;
}

export interface ICanvasMovePayload {
  canvasRepoID: string | number;
  futurePosition: number | undefined;
  toCollectionID: string | number;
  toParentCanvasRepositoryID: string | number;
}

export interface ICanvasBranchNavPayload {
  canvasId: number;
  collectionId: number;
  parentCanvasId: number;
}
export type CommitHistoryType = {
  commitId: string;
  createdAt: string;
  message: string;
  user: {
    avatarUrl: string;
    fullName: string;
    id: number;
    username: string;
    uuid: string;
  };
};

export interface ICreateBranchAccessTokenPayload {
  permissionGroup: CanvasPermissionGroupEnum;
}

export interface IMergeRequest {
  changesAccepted: any;
  closedAt: string;
  closedByUser: IUserMini;
  commitMessage: string;
  createdAt: string;
  createdByID: number;
  createdByUser: IUserMini;
  destinationBranchID: number;
  id: number;
  sourceBranchID: number;
  status: MergeRequestStatusEnum;
  uuid: string;
}

export interface IMergeRequestResponse {
  branch: ICanvasBranch;
  canvasRepository: ICanvasRepo;
  mergeRequest: IMergeRequest;
  destinationBlocks: BlockType;
  sourceBlocks: BlockType;
}

export interface IPublishRequestData {
  canvasBranchID: number;
  canvasRepositoryID: number;
  createdAt: string;
  createdByID: number;
  id: number;
  message: string;
  reviewedByUserID: number;
  status: string;
  studioID: number;
  updatedAt: string;
  uuid: string;
}

export interface ICanvasBranchResponse {
  canvasBranch: ICanvasBranch;
  canvasRepo: ICanvasRepo;
  canvasBranchErr: any;
}
