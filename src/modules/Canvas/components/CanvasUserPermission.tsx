import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  Text,
  Tooltip,
} from "@primer/react";
import { PeopleIcon, PersonIcon } from "@primer/styled-octicons";
import { FC, useState } from "react";
import { useToasts } from "react-toast-notifications";

import ImageWithName from "../../../components/ImageWithName";
import { usePermissions } from "../../../context/permissionContext";
import { PermissionGroup } from "../../Permissions/types";
import { IBranchMember, ICanvasBranch, IPGUpdatePayload } from "../interfaces";
import CanvasBranchService from "../services/canvasBranch";
import { useCanvas } from "../../../context/canvasContext";
import { BranchMemberTypeEnum } from "../enums";
import RoleMembersOverlay from "./RoleMembersOverlay";
import { useUser } from "../../../context/userContext";
import CanvasPermissionMenu from "./CanvasPermissionMenu";
import { useTranslation } from "next-i18next";
import { XIcon } from "@primer/octicons-react";
import { truncate } from "../../../utils/Common";
import AvatarWithPlaceholder from "../../../components/AvatarWithPlaceholder";
import { CanvasPermissionGroupEnum } from "../../Permissions/enums";
import Modal from "../../../components/Modal";
import { useRightRail } from "../../../context/rightRailContext";

interface ICanvasUserPermissionProps {
  member: IBranchMember;
  branch: ICanvasBranch;

  fromInvite?: boolean;
  onChangePermissionGroup?: (permissionGroup: PermissionGroup) => void;
  onRemove?: () => void;
  subCanvasCount?: number;
}

const CanvasUserPermission: FC<ICanvasUserPermissionProps> = ({
  member,
  branch,
  fromInvite,
  onChangePermissionGroup,
  onRemove,
  subCanvasCount,
}) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const { repo, updateMember, removeMember, setBranch } = useCanvas();
  const { isLoggedIn, user: currentUser } = useUser();
  const { schema } = usePermissions();

  const isModerator =
    branch?.permissionGroup?.systemName === CanvasPermissionGroupEnum.MODERATE;

  const { user } = member;
  const [memberPermissionGroup, setMemberPermissionGroup] = useState<string>(
    member.permissionGroup
  );
  const [showGroupMembers, setShowGroupMembers] = useState<boolean>(false);

  const { setPinned } = useRightRail();
  const [inheritDialogOpen, setInheritDialogOpen] = useState(false);
  const [branchAccess, setBranchAccess] = useState(
    (): PermissionGroup | null => null
  );

  const [loading, setLoading] = useState(false);

  const updateMemberPG = async (
    permissionGroup: PermissionGroup,
    inherit: boolean = false
  ) => {
    setLoading(true);
    const data: IPGUpdatePayload = {
      canvasBranchId: branch.id,
      permGroup: permissionGroup.systemName,
      memberID:
        member.type === BranchMemberTypeEnum.Member ? member.memberId! : 0,

      canvasRepositoryId: repo?.id!,
      collectionId: repo?.collectionID!,
      isOverridden: false,
      roleID: member.type === BranchMemberTypeEnum.Role ? member.roleId! : 0,
    };
    try {
      const resp = await CanvasBranchService.updateMemberPG(data, inherit);
      updateMember({
        ...member,
        permissionGroup:
          permissionGroup.systemName as CanvasPermissionGroupEnum,
      });
      if (user?.id === currentUser?.id) {
        setBranch({
          ...branch,
          permissionGroup: schema?.canvas.permissionGroups.find(
            (pg: PermissionGroup) =>
              permissionGroup.systemName === pg.systemName
          ),
        });
      }
      setMemberPermissionGroup(permissionGroup.systemName);
      addToast("Permission Changed", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      addToast("Problem changing permission", {
        appearance: "error",
        autoDismiss: true,
      });
    }
    setLoading(false);
  };

  const handlePermissionGroupChange = (permissionGroup: PermissionGroup) => {
    if (fromInvite) {
      onChangePermissionGroup && onChangePermissionGroup(permissionGroup);
    } else {
      if (subCanvasCount) {
        setBranchAccess(permissionGroup);
        setInheritDialogOpen(true);
        setPinned(true);
      } else {
        updateMemberPG(permissionGroup);
      }
    }
  };

  const handleRemoveUser = async (canvasBranchPermissionId: number) => {
    if (fromInvite) {
      onRemove!();
    } else {
      try {
        const removeResponse = await CanvasBranchService.removeMember(
          canvasBranchPermissionId
        );
        removeMember(member);
        addToast("Member removed from canvas", {
          appearance: "success",
          autoDismiss: true,
        });
      } catch (error) {
        addToast("Unable to remove", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Box
        className="flex items-center space-x-2"
        sx={{
          ...(fromInvite
            ? {
                px: "12px",
                bg: "canvasUserPermissions.bg",
                borderRadius: "20px",
              }
            : {}),
        }}
      >
        {member.type === BranchMemberTypeEnum.Member ? (
          <>
            <AvatarWithPlaceholder
              src={user?.avatarUrl}
              sx={{
                color: "canvasUserPermissions.avatarText",
                width: fromInvite ? "16px" : "32px",
                height: fromInvite ? "16px" : "32px",
              }}
            />
            <div className="flex flex-col">
              <Text
                sx={{
                  ...(fromInvite
                    ? {
                        fontSize: "12px",
                        lineHeight: "18px",
                        fontWeight: 600,
                      }
                    : {}),
                }}
              >
                {fromInvite
                  ? truncate(
                      user?.fullName || user?.username || user?.handle || "-",
                      25
                    )
                  : user?.fullName || user?.username || user?.handle || "-"}
              </Text>
            </div>
          </>
        ) : (
          <>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              // onMouseEnter={(event) => setShowGroupMembers(true)}
              // onMouseLeave={(event) => setShowGroupMembers(false)}
            >
              <Box
                className="flex items-center justify-center"
                sx={{
                  width: fromInvite ? "16px" : "32px",
                  height: fromInvite ? "16px" : "32px",
                  mr: "8px",
                }}
              >
                <PeopleIcon
                  sx={{
                    width: "16px",
                    height: "16px",
                  }}
                />
              </Box>
              <div className="flex space-x-3">
                <Text
                  sx={{
                    ...(fromInvite
                      ? {
                          fontSize: "12px",
                          lineHeight: "18px",
                          fontWeight: 600,
                        }
                      : {}),
                  }}
                >
                  {member?.role?.name}
                </Text>
              </div>
            </Box>
          </>
        )}
      </Box>
      <div className="flex items-center space-x-2">
        {member.type === BranchMemberTypeEnum.Role ? (
          member.role?.members?.length > 0 || member.role?.membersCount > 0 ? (
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
                    {member.role?.members?.length ||
                      member.role?.membersCount ||
                      0}
                  </Text>
                </Box>
              </ActionMenu.Anchor>

              <ActionMenu.Overlay
                sx={{
                  borderRadius: "8px!important",
                }}
              >
                <RoleMembersOverlay role={member.role!} />
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
        {isLoggedIn && (
          <CanvasPermissionMenu
            disabled={
              !isModerator ||
              (member.permissionGroup === CanvasPermissionGroupEnum.MODERATE &&
                repo?.createdByID === user?.id) ||
              member?.user?.id === currentUser?.id
            }
            isModerator={isModerator}
            tooltipMsg={
              member.permissionGroup === CanvasPermissionGroupEnum.MODERATE &&
              repo?.createdByID === user?.id &&
              user?.id !== currentUser?.id
                ? "Cannot update creator permission"
                : ""
            }
            pgSystemName={member.permissionGroup}
            onChange={handlePermissionGroupChange}
            extraActions={
              user?.id === currentUser?.id ||
              user?.id === repo?.defaultBranch?.isPublishedBy ||
              user?.id === branch?.createdByID ? (
                <Tooltip aria-label="Can't remove creator or admin">
                  <ActionList.Item disabled={true} variant="danger">
                    <ActionList.LeadingVisual>
                      <XIcon />
                    </ActionList.LeadingVisual>
                    {t("rightrail.removeUser")}
                  </ActionList.Item>
                </Tooltip>
              ) : (
                <ActionList.Item
                  variant="danger"
                  onSelect={(event) => handleRemoveUser(member.id!)}
                >
                  <ActionList.LeadingVisual>
                    <XIcon />
                  </ActionList.LeadingVisual>
                  {t("rightrail.removeUser")}
                </ActionList.Item>
              )
            }
          />
        )}
      </div>
      {inheritDialogOpen ? (
        <Modal
          closeHandler={() => {
            setInheritDialogOpen(false);
            setPinned(false);
          }}
          sx={{ maxWidth: "350px" }}
          hideCloseButton
        >
          <div className="flex flex-col space-y-2">
            <Text as="p">Set permissions for sub canvases?</Text>
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="invisible"
                sx={{ color: "canvasPublicAccessOverlay.cancel" }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  if (branchAccess) {
                    updateMemberPG(branchAccess);
                  }
                  setInheritDialogOpen(false);
                  setBranchAccess(null);
                  setPinned(false);
                }}
                disabled={loading}
              >
                No
              </Button>
              <Button
                variant="invisible"
                sx={{ color: "canvasPublicAccessOverlay.apply" }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  if (branchAccess) {
                    updateMemberPG(branchAccess, true);
                  }
                  setInheritDialogOpen(false);
                  setBranchAccess(null);
                  setPinned(false);
                }}
                disabled={loading}
              >
                Apply
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default CanvasUserPermission;
