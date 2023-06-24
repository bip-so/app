import { useStudio } from "../context/studioContext";
import { useUser } from "../context/userContext";
import { BipPermissionKey } from "../modules/Permissions/enums";
import { BipPermission, PermissionGroup } from "../modules/Permissions/types";

export enum PermissionContextEnum {
  Studio = "studio",
  Collection = "collection",
  Canvas = "canvas",
}

export const useHasPermission = (
  permissionKey: BipPermissionKey,
  context: PermissionContextEnum,
  groupPermissions: BipPermission[] = [] //Only for Collection and Canvas
) => {
  const { isLoggedIn } = useUser();
  const { currentStudio } = useStudio();

  if (isLoggedIn) {
    let permissions: BipPermission[] = [];

    switch (context) {
      case PermissionContextEnum.Studio:
        permissions = currentStudio?.permissionGroup?.permissions || [];
        break;
      case PermissionContextEnum.Collection:
      case PermissionContextEnum.Canvas:
        permissions = groupPermissions;
        break;
      default:
        break;
    }

    if (!permissions) {
      return false;
    }
    return Boolean(
      permissions.find?.(
        (permission: BipPermission) => permission.key === permissionKey
      )?.value === 1
    );
  }
  return false;
};
