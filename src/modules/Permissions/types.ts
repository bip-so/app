import {
  CanvasDataType,
  CanvasMemberPermissionObject,
  CanvasRolePermissionObject,
  CollectionDataType,
  CollectionMemberPermissionObject,
  CollectionRolePermissionObject,
} from "../Collections/types";
import {
  BipPermissionKey,
  CanvasPermissionGroupEnum,
  CollectionPermissionGroupEnum,
} from "./enums";

export interface BipPermission {
  key: BipPermissionKey;
  value: 0 | 1;
}

export interface PermissionGroup {
  displayName: string;
  permissions: BipPermission[];
  studioID: number;
  systemName: CanvasPermissionGroupEnum | CollectionPermissionGroupEnum;
  type: string;
  weight: number;
}

export interface PermissionSchema {
  group: string;
  permissionGroups: PermissionGroup[];
  version: number;
}

export interface IPermissionNodeCommons {
  areCanvasesFetched: boolean;
  memberPermission?:
    | CollectionMemberPermissionObject
    | CanvasMemberPermissionObject;
  rolePermission?: CollectionRolePermissionObject | CanvasRolePermissionObject;
  permission: CollectionPermissionGroupEnum | CanvasPermissionGroupEnum;
  computedRootCanvasCount?: number;
}

export type ICollectionPermissionNode = CollectionDataType &
  IPermissionNodeCommons;

export type ICanvasPermissionNode = CanvasDataType & IPermissionNodeCommons;
