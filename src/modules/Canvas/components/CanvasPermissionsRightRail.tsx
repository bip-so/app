import { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  IconButton,
  Text,
} from "@primer/react";
import {
  CopyIcon,
  PersonAddIcon,
  XIcon,
  GlobeIcon,
} from "@primer/styled-octicons";
import styled from "styled-components";
import { useTranslation } from "next-i18next";

import CanvasUserPermission from "./CanvasUserPermission";
import { IBranchAccessToken, IRole } from "../interfaces";
import { useCanvas } from "../../../context/canvasContext";
import { useUser } from "../../../context/userContext";
import CanvasPublicAccessOverlay, {
  getPublicAccessDescription,
  getPublicAccessIcon,
} from "./CanvasPublicAccessOverlay";
import SelectUsers from "./InviteFlow/SelectUsers";
import RightRailContainer from "./RightRailContainer";
import BranchAccessToken, {
  BranchAccessTokenModeEnum,
} from "./BranchAccessToken";
import { LockIcon } from "@primer/octicons-react";
import { useToasts } from "react-toast-notifications";
import { BranchAccessEnum, BranchMemberTypeEnum } from "../enums";
import StudioService from "../../Studio/services";
import { Member } from "../../Studio/types";
import { usePermissions } from "../../../context/permissionContext";
import {
  CanvasPermissionEnum,
  CanvasPermissionGroupEnum,
} from "../../Permissions/enums";

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
`;

interface ICanvasRightRailProps {
  closeHandler: () => void;
  ignoredRefs: any[];
}

const CanvasPermissionsRightRail: FC<ICanvasRightRailProps> = ({
  closeHandler,
  ignoredRefs,
}) => {
  const { t } = useTranslation();
  const { repo, branch, members, branchAccessTokens } = useCanvas();
  const { isLoggedIn } = useUser();

  const [addingUsers, setAddingUsers] = useState<boolean>(false);
  const [contacts, setContacts] = useState((): Member[] => []);
  const [contactsSkip, setContactsSkip] = useState(0);
  const [roles, setRoles] = useState((): IRole[] => []);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const { addToast } = useToasts();
  const publicAccessRef = useRef(null);
  const [openPublicAccessOverlay, setOpenPublicAccessOverlay] = useState(false);

  const { inheritDialogOpen, setInheritDialogOpen } = usePermissions();

  const isModerator =
    branch?.permissionGroup?.systemName === CanvasPermissionGroupEnum.MODERATE;

  useEffect(() => {
    getNextPageContacts();
    getRoles();
  }, []);

  const getNextPageContacts = () => {
    setLoadingContacts(true);
    StudioService.getStudioMembers(contactsSkip)
      .then((r) => {
        const newMembers = r?.data?.data || [];
        const skip = r?.data?.next || -1;
        setContacts([...contacts, ...newMembers]);
        setContactsSkip(parseInt(skip));
        setLoadingContacts(false);
      })
      .catch((err) => {
        setLoadingContacts(false);
        addToast("Something went wrong. Please try again!", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const getRoles = () => {
    StudioService.getStudioRoles()
      .then((r) => {
        const rolesData = r?.data?.data || [];
        setRoles(rolesData);
      })
      .catch((err) => {});
  };

  const copyCurrentCanvasLink = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        addToast("Copied link to clipboard.", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((err) => console.error("Error while copying!", err));
  };

  const filteredMembers = useMemo(() => {
    if (members?.length) {
      const roles = members.filter(
        (mem) => mem.type === BranchMemberTypeEnum.Role
      );
      const nonRoles = members.filter(
        (mem) => mem.type !== BranchMemberTypeEnum.Role
      );
      return [...roles, ...nonRoles];
    }
    return [];
  }, [members]);

  return (
    <RightRailContainer
      onClickOutSideRightRail={inheritDialogOpen ? () => null : closeHandler}
      ignoredRefs={ignoredRefs}
    >
      <div className="flex items-center justify-between w-full px-4 mt-2">
        <div className="flex items-center">
          <LockIcon />
          <h3 className="inline-block ml-1 font-medium">Permissions</h3>
        </div>
        <IconButton
          icon={XIcon}
          sx={{
            color: "text.subtle",
          }}
          size={"small"}
          variant="invisible"
          onClick={closeHandler}
        />
      </div>

      <ActionList.Divider sx={{ px: "16px" }} />
      <ContentContainer
        className="px-4 pt-2 space-y-2 overflow-y-scroll"
        id={"content-container"}
      >
        <>
          {addingUsers ? (
            <SelectUsers
              onCancel={() => setAddingUsers(false)}
              contacts={contacts}
              contactsSkip={contactsSkip}
              getNextPageContacts={getNextPageContacts}
              loadingContacts={loadingContacts}
              roles={roles}
            />
          ) : (
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <Text
                  as="p"
                  sx={{
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "rightRailPermissions.darkText",
                  }}
                >
                  {t("rightrail.generalAccess")}
                </Text>
                <Button
                  leadingIcon={CopyIcon}
                  sx={{
                    color: "rightRailPermissions.copyLink",
                  }}
                  size={"small"}
                  variant="invisible"
                  onClick={copyCurrentCanvasLink}
                >
                  {t("rightrail.copyLink")}
                </Button>
              </div>
              <div className="flex items-center justify-between my-5">
                <div className="flex space-x-2">
                  <Box sx={{ mt: "4px", display: "flex" }}>
                    <GlobeIcon color={"rightRailPermissions.lightText"} />
                  </Box>
                  <div>
                    <Text
                      as="p"
                      sx={{
                        fontSize: "14px",
                        lineHeight: "20px",
                        fontWeight: 500,
                        letterSpacing: "-0.15px",
                        color: "rightRailPermissions.veryDarkText",
                      }}
                    >
                      {branch?.publicAccess! === BranchAccessEnum.PRIVATE
                        ? t("rightrail.restricted")
                        : t("rightrail.anyone")}
                    </Text>
                    <Text
                      as="p"
                      sx={{
                        fontSize: "12px",
                        lineHeight: "18px",
                        fontWeight: 400,
                        letterSpacing: "-0.15px",
                        color: "rightRailPermissions.lightText",
                      }}
                    >
                      {t(getPublicAccessDescription(branch?.publicAccess!))}
                    </Text>
                  </div>
                </div>
                {isLoggedIn ? (
                  isModerator ? (
                    <ActionMenu
                      open={openPublicAccessOverlay}
                      onOpenChange={setOpenPublicAccessOverlay}
                    >
                      <ActionMenu.Button
                        sx={{
                          color: "rightRailPermissions.lightText",
                          border: "none",
                          padding: "4px",
                          boxShadow: "none",
                        }}
                      >
                        {getPublicAccessIcon(branch?.publicAccess!)}
                      </ActionMenu.Button>
                      <ActionMenu.Overlay
                        hidden={!isModerator}
                        align="end"
                        sx={{ bg: "canvasPublicAccessOverlay.bg" }}
                        onClickOutside={(e) => {
                          if (
                            publicAccessRef?.current?.isInheritDialogOpened &&
                            publicAccessRef?.current?.isInheritDialogOpened()
                          ) {
                          } else {
                            setOpenPublicAccessOverlay(false);
                          }
                        }}
                      >
                        <CanvasPublicAccessOverlay
                          node={repo}
                          branch={branch!}
                          subCanvasCount={repo?.subCanvasCount}
                          ref={publicAccessRef}
                          showVisibilityMenu={setOpenPublicAccessOverlay}
                        />
                      </ActionMenu.Overlay>
                    </ActionMenu>
                  ) : (
                    <Box
                      sx={{
                        color: "rightRailPermissions.lightText",
                      }}
                    >
                      {getPublicAccessIcon(branch?.publicAccess!)}
                    </Box>
                  )
                ) : null}
              </div>
              <ActionList.Divider />
              <Box className="flex items-center justify-between mt-2">
                <Text
                  as="p"
                  sx={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    fontWeight: 500,
                    letterSpacing: "-0.15px",
                    color: "rightRailPermissions.darkText",
                  }}
                >
                  {t("rightrail.peopleWithAccess")}
                </Text>
                {isModerator && (
                  <Button
                    leadingIcon={PersonAddIcon}
                    sx={{
                      color: "rightRailPermissions.inviteUsers",
                    }}
                    size={"small"}
                    variant="invisible"
                    onClick={(e: any) => setAddingUsers(true)}
                  >
                    {t("rightrail.inviteUsers")}
                  </Button>
                )}
              </Box>
              {isModerator && branchAccessTokens.length ? (
                <div className="mt-4 space-y-2">
                  {branchAccessTokens?.map(
                    (accessToken: IBranchAccessToken) => (
                      <BranchAccessToken
                        key={accessToken.inviteCode}
                        branchAccessToken={accessToken}
                        mode={BranchAccessTokenModeEnum.EDIT}
                      />
                    )
                  )}
                </div>
              ) : null}
              <div className="mt-6 space-y-6">
                {filteredMembers
                  .filter(
                    (perm: any) =>
                      perm.permissionGroup !==
                        CanvasPermissionGroupEnum.VIEW_METADATA &&
                      perm.permissionGroup !== CanvasPermissionGroupEnum.NONE
                  )
                  ?.map((member, i) => (
                    <CanvasUserPermission
                      branch={branch!}
                      key={i}
                      member={member}
                      subCanvasCount={repo?.subCanvasCount}
                    />
                  ))}
              </div>
            </div>
          )}
        </>
      </ContentContainer>
    </RightRailContainer>
  );
};

export default CanvasPermissionsRightRail;
