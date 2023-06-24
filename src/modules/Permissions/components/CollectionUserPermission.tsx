import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  ConfirmationDialog,
  Text,
} from "@primer/react";
import { PeopleIcon, PersonIcon, XIcon } from "@primer/styled-octicons";
import React, { FC, useMemo, useState } from "react";
import { useToasts } from "react-toast-notifications";
import ImageWithName from "../../../components/ImageWithName";
import Modal from "../../../components/Modal";
import { useUser } from "../../../context/userContext";
import { SYSTEM_ROLES } from "../../../utils/Constants";
import RoleMembersOverlay from "../../Canvas/components/RoleMembersOverlay";
import CollectionPermissionMenu from "../../Collections/components/CollectionPermissionMenu";
import CollectionService from "../../Collections/services";
import {
  CollectionPermissionType,
  CreateOrUpdatePermissionType,
  RoleType,
} from "../../Collections/types";
import { Member as MemberType } from "../../Studio/types";
import { CollectionPermissionGroupEnum } from "../enums";
import { PermissionGroup } from "../types";

type ItemType = CollectionPermissionType | RoleType | MemberType;

interface CollectionUserPermissionProps {
  item: ItemType;
  type: "role" | "member" | "permission";
  onUpdatePermission?: (item: CollectionPermissionType) => void;
  onCreatePermission?: (item: CollectionPermissionType) => void;
  onRemovePermission?: (item: CollectionPermissionType) => void;
  haveCanvases?: boolean;
  collectionId: number;
  disabled?: boolean;
  fromRightRail?: boolean;
}

const CollectionUserPermission: FC<CollectionUserPermissionProps> = (props) => {
  const {
    item,
    type,
    onUpdatePermission,
    onCreatePermission,
    onRemovePermission,
    haveCanvases,
    collectionId,
    disabled,
    fromRightRail,
  } = props;

  const [newPermissionGroup, setNewPermissionGroup] = useState(
    (): PermissionGroup | null => null
  );
  const [showInheritDialog, setShowInheritDialog] = useState(false);
  const [popupType, setPopupType] = useState("");
  const { addToast } = useToasts();
  const { user: currentUser } = useUser();

  const getPayload = (pg: PermissionGroup): CreateOrUpdatePermissionType => {
    return {
      permGroup: pg.systemName as CollectionPermissionGroupEnum,
      collectionId: collectionId,
      isOverridden: false,
      memberID:
        type === "member"
          ? (item as MemberType).id
          : type === "permission"
          ? (item as CollectionPermissionType)?.memberID || 0
          : 0,
      roleID:
        type === "role"
          ? (item as RoleType).id
          : type === "permission"
          ? (item as CollectionPermissionType)?.roleID || 0
          : 0,
    };
  };

  const createOrUpdateCollectinPG = async (
    pg: PermissionGroup,
    inherit: boolean
  ) => {
    try {
      const data = getPayload(pg);
      const response = await CollectionService.createOrUpdatePermission(
        data,
        inherit
      );
      const updatedPermission: CollectionPermissionType = response.data.data;
      if (type === "permission") {
        onUpdatePermission && onUpdatePermission(updatedPermission);
      } else {
        onCreatePermission && onCreatePermission(updatedPermission);
      }
      setNewPermissionGroup(null);
      addToast("Permission changed", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (err) {
      addToast("Problem changing permission", {
        appearance: "error",
        autoDismiss: true,
      });
      setNewPermissionGroup(null);
    }
  };

  const removeCollectionPG = async (inherit: boolean) => {
    try {
      await CollectionService.deletePermission(
        (item as CollectionPermissionType).id,
        inherit
      );
      onRemovePermission &&
        onRemovePermission(item as CollectionPermissionType);
      addToast("Permission removed", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (err) {
      addToast("Problem removing permission", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleChangeCollectionPG = (pg: PermissionGroup) => {
    if (haveCanvases) {
      setPopupType("change");
      setNewPermissionGroup(pg);
      setShowInheritDialog(true);
    } else {
      createOrUpdateCollectinPG(pg, false);
    }
  };

  const handleRemoveCollectionPG = () => {
    if (haveCanvases) {
      setPopupType("remove");
      setShowInheritDialog(true);
    } else {
      removeCollectionPG(false);
    }
  };

  const handleColPermConfirm = (gesture: string) => {
    if (gesture === "confirm") {
      if (popupType === "remove") {
        removeCollectionPG(true);
      } else {
        createOrUpdateCollectinPG(newPermissionGroup as PermissionGroup, true);
      }
    } else if (gesture === "cancel") {
      if (popupType === "remove") {
        removeCollectionPG(false);
      } else {
        createOrUpdateCollectinPG(newPermissionGroup as PermissionGroup, false);
      }
    }
    setShowInheritDialog(false);
  };

  const name = useMemo(() => {
    switch (type) {
      case "role":
        return (item as RoleType).name;
      case "member":
        return (
          (item as MemberType).user.fullName ||
          (item as MemberType).user.username
        );
      case "permission":
        const tItem = item as CollectionPermissionType;
        return tItem.role && tItem.roleID
          ? tItem.role.name
          : tItem.member && tItem.memberID
          ? tItem.member.user.fullName || tItem.member.user.username
          : "";
      default:
        return "";
    }
  }, [item]);

  const avatarType = useMemo(() => {
    switch (type) {
      case "role":
        return "people";
      case "permission":
        return (item as CollectionPermissionType).roleID ? "people" : "avatar";
      default:
        return "avatar";
    }
  }, [item]);

  const avatarUrl = useMemo(() => {
    switch (type) {
      case "member":
        return (item as MemberType).user.avatarUrl;
      case "permission":
        const tItem = item as CollectionPermissionType;
        return tItem.member && tItem.memberID
          ? tItem.member.user.avatarUrl
          : "";
      default:
        return "";
    }
  }, [item]);

  const isDisabled = useMemo(() => {
    if (type === "permission") {
      const perm = item as CollectionPermissionType;
      return (
        (perm.role?.isSystem && perm.role?.name === SYSTEM_ROLES.ADMIN) ||
        perm.collection?.userID === perm.member?.userID
      );
    }
    return false;
  }, [item]);

  const tooltipText = useMemo(() => {
    if (disabled) {
      return "Only moderator can update permission";
    }
    if (isDisabled) {
      const perm = item as CollectionPermissionType;
      if (perm.role?.isSystem && perm.role?.name === SYSTEM_ROLES.ADMIN) {
        return "Cannot update administrator role permission";
      }
      if (currentUser?.id === perm.collection?.userID) {
        return "Cannot update your own permission";
      }
      if (perm.collection?.userID === perm.member?.userID) {
        return "Cannot update creator permission";
      }
      return "";
    }
    return "";
  }, [disabled, isDisabled]);

  const pgSystemName = useMemo(() => {
    if (type === "permission") {
      return (item as CollectionPermissionType).permissionGroup;
    }
    return CollectionPermissionGroupEnum.NONE;
  }, [item]);

  return (
    <>
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        py={"8px"}
      >
        <Box display={"flex"} alignItems={"center"} sx={{ gap: "12px" }}>
          {avatarType === "people" ? (
            <PeopleIcon
              sx={{
                width: "20px",
                height: "20px",
              }}
            />
          ) : (
            <ImageWithName
              src={avatarUrl}
              sx={{
                color: "canvasUserPermissions.avatarText",
                width: "32px",
                height: "32px",
              }}
              name={name}
            />
          )}
          <div>
            <Text
              as="p"
              fontSize={type === "member" ? "14px" : "16px"}
              lineHeight={type === "member" ? "unset" : "24px"}
              sx={{
                color: "selectedUsers.username",
              }}
            >
              {name}
            </Text>
            {type === "member" ? (
              <Text as="p" fontSize={"12px"} color="selectedUsers.handle">
                @{(item as MemberType)?.user?.username}
              </Text>
            ) : null}
          </div>
        </Box>
        <Box display={"flex"} alignItems={"center"} sx={{ gap: "16px" }}>
          {type === "role" ||
          (type === "permission" &&
            (item as CollectionPermissionType)?.role) ? (
            (item as RoleType).members?.length > 0 ||
            (item as CollectionPermissionType).role?.members?.length > 0 ? (
              <ActionMenu>
                <ActionMenu.Anchor>
                  <Box
                    sx={{
                      borderRadius: "4px",
                      padding: "4px",
                      fontSize: "12px",
                      bg: "canvasUserPermissions.anchorBg",
                      display: "flex",
                      cursor: "pointer",
                      alignItems: "center",
                    }}
                  >
                    <PersonIcon size={14} />
                    <Text
                      sx={{
                        marginLeft: "4px",
                      }}
                    >
                      {type === "role"
                        ? (item as RoleType).members?.length || 0
                        : (item as CollectionPermissionType).role?.members
                            ?.length || 0}
                    </Text>
                  </Box>
                </ActionMenu.Anchor>

                <ActionMenu.Overlay
                  sx={{
                    borderRadius: "8px!important",
                  }}
                >
                  <RoleMembersOverlay
                    role={
                      type === "role"
                        ? item
                        : (item as CollectionPermissionType).role
                    }
                  />
                </ActionMenu.Overlay>
              </ActionMenu>
            ) : (
              <Box
                sx={{
                  borderRadius: "4px",
                  padding: "4px",
                  fontSize: "12px",
                  bg: "canvasUserPermissions.anchorBg",
                  display: "flex",
                  alignItems: "center",
                  opacity: 0.5,
                }}
              >
                <PersonIcon size={14} />
                <Text
                  sx={{
                    marginLeft: "4px",
                  }}
                >
                  0
                </Text>
              </Box>
            )
          ) : null}

          <CollectionPermissionMenu
            disabled={disabled || isDisabled}
            tooltipText={tooltipText}
            pgSystemName={pgSystemName}
            onChange={handleChangeCollectionPG}
            extraActions={
              type === "permission" ? (
                <ActionList.Item
                  variant="danger"
                  onSelect={handleRemoveCollectionPG}
                >
                  <ActionList.LeadingVisual>
                    <XIcon />
                  </ActionList.LeadingVisual>
                  Remove
                </ActionList.Item>
              ) : null
            }
          />
        </Box>
      </Box>
      {showInheritDialog && !fromRightRail ? (
        <ConfirmationDialog
          title="Set permissions for canvases?"
          onClose={handleColPermConfirm}
          confirmButtonContent="Ok"
          cancelButtonContent="No"
        >
          This will set same permission for all canvases
        </ConfirmationDialog>
      ) : null}
      {showInheritDialog && fromRightRail ? (
        <Modal
          closeHandler={() => {
            setShowInheritDialog(false);
          }}
          sx={{ maxWidth: "350px" }}
          hideCloseButton
        >
          <div
            className="flex flex-col space-y-2"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <Text as="p">Set permissions for canvases?</Text>
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="invisible"
                sx={{ color: "collectionPublicAccessOverlay.cancel" }}
                onClick={() => {
                  handleColPermConfirm("cancel");
                }}
              >
                No
              </Button>
              <Button
                variant="invisible"
                sx={{ color: "collectionPublicAccessOverlay.apply" }}
                onClick={() => {
                  handleColPermConfirm("confirm");
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
};

export default CollectionUserPermission;
