import { BranchAccessEnum } from "../Canvas/enums";
import { PermissionGroup } from "../Permissions/types";

export interface ICollectionBranch {
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
  
    permissionGroup?: PermissionGroup;
  
    parent?: number;
    position?: number;
    type?: string;
  }