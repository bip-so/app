import {
  CanvasPermissionGroupEnum,
  CollectionPermissionGroupEnum,
} from "./enums";

export const getCanvasPGByCollectionPG = (
  collectionPg: CollectionPermissionGroupEnum
): CanvasPermissionGroupEnum => {
  switch (collectionPg) {
    case CollectionPermissionGroupEnum.COMMENT:
      return CanvasPermissionGroupEnum.COMMENT;
    case CollectionPermissionGroupEnum.EDIT:
      return CanvasPermissionGroupEnum.EDIT;
    case CollectionPermissionGroupEnum.MODERATE:
      return CanvasPermissionGroupEnum.MODERATE;
    case CollectionPermissionGroupEnum.VIEW:
      return CanvasPermissionGroupEnum.VIEW;
    default:
      return CanvasPermissionGroupEnum.NONE;
  }
};
