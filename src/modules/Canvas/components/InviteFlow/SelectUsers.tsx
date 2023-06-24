import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import useSWR from "swr";

import {
  ActionList,
  Box,
  Button,
  Heading,
  IconButton,
  Text,
  TextInput,
  Truncate,
  UnderlineNav,
} from "@primer/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LinkIcon,
  PlusIcon,
} from "@primer/styled-octicons";
import UserService from "../../../User/services";
import BipLoader from "../../../../components/BipLoader";
import { IUserMini } from "../../../../commons/types";
import MemberListItem from "./MemberListItem";
import { useCanvas } from "../../../../context/canvasContext";
import CanvasUserPermission from "../CanvasUserPermission";
import {
  IBranchAccessToken,
  IBranchMember,
  InviteViaEmailsPayload,
  IPGUpdatePayload,
  IRole,
} from "../../interfaces";
import { BranchMemberTypeEnum } from "../../enums";
import {
  CanvasPermissionEnum,
  CanvasPermissionGroupEnum,
} from "../../../Permissions/enums";
import { PermissionGroup } from "../../../Permissions/types";
import CanvasBranchService from "../../services/canvasBranch";
import { useToasts } from "react-toast-notifications";
import { ChevronLeftIcon, XIcon } from "@primer/octicons-react";
import CanvasPermissionMenu from "../CanvasPermissionMenu";
import ReactTextareaAutosize from "react-textarea-autosize";
import BranchAccessToken, {
  BranchAccessTokenModeEnum,
} from "../BranchAccessToken";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../../hooks/useHasPermission";
import Modal from "../../../../components/Modal";
import { useRightRail } from "../../../../context/rightRailContext";
import { Member } from "../../../Studio/types";
import { isValidEmail, truncate } from "../../../../utils/Common";
import { useUser } from "../../../../context/userContext";
import { usePermissions } from "../../../../context/permissionContext";
import AvatarWithPlaceholder from "../../../../components/AvatarWithPlaceholder";
import InfiniteScroll from "react-infinite-scroll-component";
import segmentEvents from "../../../../insights/segment";
import { useStudio } from "../../../../context/studioContext";
import StudioService from "../../../Studio/services";

interface DropDownItemProps {
  title: string;
  count: number;
  opened: boolean;
  onClick: () => void;
}

const DropDownItem: FC<DropDownItemProps> = ({
  title,
  count,
  opened,
  onClick,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: "8px",
        px: "4px",
        cursor: count ? "pointer" : "default",
        alignItems: "center",
        opacity: count ? 1 : 0.5,
        borderRadius: "6px",
        ":hover": {
          bg: count ? "mentionDropdown.hoverBg" : "none",
        },
      }}
      onClick={() => {
        if (count > 0) {
          onClick();
        }
      }}
    >
      <Box display={"flex"} alignItems={"center"}>
        <Text
          as="p"
          sx={{
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: 500,
            color: "mentionDropdown.text",
          }}
        >
          {title}
        </Text>
        <Box
          as="p"
          sx={{
            fontSize: "12px",
            lineHeight: "18px",
            ml: "8px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "mentionDropdown.countColor",
            bg: "mentionDropdown.countBg",
            width: "20px",
            height: "20px",
          }}
        >
          {count || 0}
        </Box>
      </Box>
      {opened ? (
        <ChevronDownIcon size={14} sx={{ color: "mentionDropdown.text" }} />
      ) : (
        <ChevronRightIcon size={14} sx={{ color: "mentionDropdown.text" }} />
      )}
    </Box>
  );
};

enum INVITESTEPSENUM {
  EMAIL,
  LINK,
}

enum CanvasInviteStepEnum {
  SELECT_USERS,
  SELECT_PERMISSIONS,
}

interface EmailType {
  email: string;
  permissionGroup: CanvasPermissionGroupEnum;
}

interface ISelectUsersProps {
  onCancel: () => void;
  contacts: Member[];
  contactsSkip: number;
  getNextPageContacts: () => void;
  loadingContacts: boolean;
  roles: IRole[];
}

const SelectUsers: FC<ISelectUsersProps> = ({
  onCancel,
  contacts,
  contactsSkip,
  getNextPageContacts,
  loadingContacts,
  roles,
}) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const { isLoggedIn } = useUser();
  const { currentStudio } = useStudio();

  const { branch, repo, members, setMembers, branchAccessTokens } = useCanvas();
  const [selectedMembers, setSelectedMembers] = useState<IBranchMember[]>([]);

  const [searchKey, setSearchKey] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<INVITESTEPSENUM>(
    INVITESTEPSENUM.EMAIL
  );
  const [currentStep, setCurrentSetp] = useState<CanvasInviteStepEnum>(
    CanvasInviteStepEnum.SELECT_USERS
  );

  const [overAllPG, setOverAllPG] = useState(CanvasPermissionGroupEnum.EDIT);
  const [personalMessage, setPersonalMessage] = useState("");
  const [emails, setEmails] = useState((): EmailType[] => []);
  const [showRoles, setShowRoles] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [studioMembers, setStudioMembers] = useState((): Member[] => []);
  const [searchedRoles, setSearchedRoles] = useState((): IRole[] => []);
  const [searchedUsers, setSearchedUsers] = useState((): IUserMini[] => []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchSkip, setSearchSkip] = useState(0);

  const [creatingBranchAccessToken, setCreatingBranchAccessToken] =
    useState<boolean>(false);

  const { inheritDialogOpen, setInheritDialogOpen } = usePermissions();

  const canManagePermissions = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_MANAGE_PERMS,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );

  const searchHandler = async (e: any) => {
    setInputValue(e.target.value);
    if (e.target.value.length >= 3) {
      setSearchKey(e.target.value);
    }
  };

  const searchUsers = (searchKey: string) => {
    setIsLoading(true);
    const resp1: any = StudioService.searchStudioMembers(searchKey);
    const resp2: any = UserService.getUsers(searchKey);
    return Promise.all([resp1, resp2])
      .then((r) => {
        const studioMembers = r[0]?.data?.data || [];
        const sRoles = r[1].data?.data?.roles || [];
        const sUsers = r[1].data?.data?.users || [];
        setSearchSkip(parseInt(r[1].data?.next || "-1"));
        setSearchedRoles(sRoles);
        setSearchedUsers(sUsers);
        setStudioMembers(studioMembers);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (searchKey && searchKey.length >= 3) {
      searchUsers(searchKey);
    }
  }, [searchKey]);

  const searchNextPageUsers = () => {
    if (searchSkip !== -1) {
      UserService.getUsers(searchKey, searchSkip)
        .then((r) => {
          const sRoles = r.data?.data?.roles || [];
          const sUsers = r.data?.data?.users || [];
          setSearchSkip(parseInt(r.data?.next || "-1"));
          setSearchedRoles([...searchedRoles, ...sRoles]);
          setSearchedUsers([...searchedUsers, ...sUsers]);
        })
        .catch((err) => {});
    }
  };

  const addMember = (
    user: IUserMini | undefined,
    role: IRole | undefined,
    type: BranchMemberTypeEnum
  ) => {
    const member: IBranchMember = {
      user,
      role,
      type: type,
      permissionGroup: CanvasPermissionGroupEnum.EDIT,
    };
    setSelectedMembers([...selectedMembers, member]);
  };

  const removeMember = (member: IBranchMember) => {
    const updatedSelectedMembers = selectedMembers.filter(
      (selectedMember: IBranchMember) =>
        member.type === BranchMemberTypeEnum.Role
          ? selectedMember?.role?.id !== member?.role?.id
          : selectedMember?.user?.id !== member?.user?.id
    );
    setSelectedMembers(updatedSelectedMembers);
    if (updatedSelectedMembers.length === 0 && emails.length === 0) {
      setCurrentSetp(CanvasInviteStepEnum.SELECT_USERS);
    }
  };

  const SelectionHeading = () => {
    return (
      <Text
        as="p"
        sx={{
          fontSize: "14px",
          lineHeight: "20px",
          fontWeight: 500,
          letterSpacing: "-0.15px",
          color: "selectedUsers.darkText",
        }}
      >
        {t("rightrail.selected")}{" "}
        <Text
          sx={{
            px: "6px",
            background: "rgba(175, 184, 193, 0.2)",
            fontSize: "12px",
            lineHeight: "16px",
            color: "selectedUsers.veryDarkText",
            borderRadius: "20px",
          }}
        >
          {selectedMembers.length + emails.length}
        </Text>
      </Text>
    );
  };

  const handleChangePG = (
    pg: PermissionGroup,
    selectedMember: IBranchMember
  ) => {
    const updatedMembers = selectedMembers.map((member: IBranchMember) => {
      if (
        member.type === BranchMemberTypeEnum.Member
          ? selectedMember.user?.id === member.user?.id
          : selectedMember.role?.id === member.role?.id
      ) {
        return {
          ...selectedMember,
          permissionGroup: pg.systemName,
        };
      }
      return member;
    });
    setSelectedMembers(updatedMembers);
  };

  const handleChangeAllMemPG = (pg: PermissionGroup) => {
    const updatedMembers = selectedMembers.map((member: IBranchMember) => {
      return {
        ...member,
        permissionGroup: pg.systemName,
      };
    });
    setSelectedMembers(updatedMembers);
    const updatedEmails = emails.map((email: EmailType) => {
      return {
        ...email,
        permissionGroup: pg.systemName,
      };
    });
    setEmails(updatedEmails);
  };

  const handleInvite = async (inheritToSubCanvases: boolean) => {
    const promises = [];
    if (selectedMembers.length) {
      const payload: IPGUpdatePayload[] = selectedMembers.map(
        (member: IBranchMember) => {
          return {
            canvasBranchId: branch?.id!,
            canvasRepositoryId: repo?.id!,
            collectionId: repo?.collectionID!,
            isOverridden: false,
            memberID: 0,
            parentCanvasRepositoryId: repo?.parentCanvasRepositoryID || 0,
            permGroup: member.permissionGroup,
            roleID:
              member?.type === BranchMemberTypeEnum.Role ? member.role?.id : 0,
            userID:
              member?.type === BranchMemberTypeEnum.Member
                ? member.user?.id
                : 0,
          };
        }
      );
      promises.push(
        CanvasBranchService.inviteUsers(payload, inheritToSubCanvases)
      );
    }
    if (emails.length && branch) {
      const payload: InviteViaEmailsPayload = {
        invites: emails.map((email) => {
          return {
            email: email.email,
            canvasPermissionsGroup: email.permissionGroup,
          };
        }),
      };
      promises.push(CanvasBranchService.inviteViaEmails(branch.id, payload));
    }

    setLoading(true);
    await Promise.all(promises)
      .then((responses: any[]) => {
        setLoading(false);
        if (selectedMembers.length) {
          const inviteResponse = responses[0];
          const newMembers = inviteResponse.data.data.map((inviteData: any) => {
            const type = inviteData.member
              ? BranchMemberTypeEnum.Member
              : BranchMemberTypeEnum.Role;
            return {
              id: inviteData.id,
              memberId:
                type === BranchMemberTypeEnum.Member ? inviteData.memberID : 0,
              roleId:
                type === BranchMemberTypeEnum.Role ? inviteData.roleID : 0,
              type: type,
              role: inviteData.role,
              user: inviteData?.member?.user,
              permissionGroup: inviteData?.permissionGroup,
            };
          });
          setMembers([...members, ...newMembers]);
          if (inheritDialogOpen) {
            setInheritDialogOpen(false);
          }
        }
        addToast("Selected users invited to canvas", {
          appearance: "success",
          autoDismiss: true,
        });
        onCancel();
      })
      .catch((error) => {
        setLoading(false);
        addToast("Something went wrong. please try again after sometime.", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  // const inviteViaEmails = () => {
  //   if (emails.length && branch) {
  //     CanvasBranchService.inviteViaEmails(branch.id, payload)
  //       .then((r) => {})
  //       .catch((err) => {});
  //   }
  // };

  const addEmail = (email: string) => {
    setEmails([
      { email: email.trim(), permissionGroup: CanvasPermissionGroupEnum.EDIT },
      ...emails,
    ]);
  };

  const removeEmail = (email: EmailType, index: number) => {
    const filteredEmails = emails.filter(
      (email: EmailType, emailIndex: number) => emailIndex !== index
    );
    setEmails(filteredEmails);
    if (filteredEmails.length === 0 && selectedMembers.length === 0) {
      setCurrentSetp(CanvasInviteStepEnum.SELECT_USERS);
    }
  };

  const onEnterClick = () => {
    if (isValidEmail(inputValue.trim())) {
      addEmail(inputValue.trim());
      setInputValue("");
    } else {
      addToast("Please enter valid email!", {
        appearance: "warning",
        autoDismiss: true,
      });
    }
  };

  const filteredRoles = useMemo(() => {
    if (searchedRoles?.length) {
      return searchedRoles?.filter(
        (role: IRole) =>
          selectedMembers.findIndex(
            (selectedMember: IBranchMember) =>
              selectedMember?.role?.id === role.id
          ) === -1 &&
          members.findIndex(
            (member: IBranchMember) => member?.role?.id === role.id
          ) === -1
      );
    }
    return [];
  }, [searchedRoles, selectedMembers]);

  const filteredMembers = useMemo(() => {
    if (studioMembers?.length) {
      return studioMembers.filter(
        (contact: Member) =>
          selectedMembers.findIndex(
            (selectedMember: IBranchMember) =>
              selectedMember.user?.id === contact.user.id
          ) === -1 &&
          members.findIndex(
            (member: IBranchMember) => member.user?.id === contact.user.id
          ) === -1
      );
    }
    return [];
  }, [studioMembers, selectedMembers]);

  const filteredUsers = useMemo(() => {
    if (searchedUsers?.length) {
      return searchedUsers.filter(
        (user: IUserMini) =>
          selectedMembers.findIndex(
            (selectedMember: IBranchMember) =>
              selectedMember.user?.id === user.id
          ) === -1 &&
          members.findIndex(
            (member: IBranchMember) => member.user?.id === user.id
          ) === -1 &&
          filteredMembers.findIndex(
            (member: Member) => member.user?.id === user?.id
          ) === -1
      );
    }
    return [];
  }, [searchedUsers, selectedMembers, filteredMembers]);

  const filteredContacts = useMemo(() => {
    if (contacts?.length) {
      return contacts.filter(
        (contact: Member) =>
          selectedMembers.findIndex(
            (selectedMember: IBranchMember) =>
              selectedMember.user?.id === contact.user.id
          ) === -1 &&
          members.findIndex(
            (member: IBranchMember) => member.user?.id === contact.user.id
          ) === -1
      );
    }
    return [];
  }, [contacts, selectedMembers]);

  useEffect(() => {
    if (!filteredContacts?.length) {
      setShowUsers(false);
    }
  }, [filteredContacts]);

  const remainingContactsCount = useMemo(() => {
    if (currentStudio?.membersCount) {
      const selectedUsersCount = selectedMembers.filter(
        (mem) => mem.type === "member" && !mem.user?.objectID
      ).length;
      const canvasMembersCount = members.filter(
        (mem) => mem.type === "member"
      ).length;
      return (
        currentStudio.membersCount - selectedUsersCount - canvasMembersCount
      );
    }
    return filteredContacts.length;
  }, [contacts, selectedMembers]);

  const filteredStudioRoles = useMemo(() => {
    if (roles?.length) {
      return roles.filter(
        (role: IRole) =>
          selectedMembers.findIndex(
            (selectedMember: IBranchMember) =>
              selectedMember?.role?.id === role.id
          ) === -1 &&
          members.findIndex(
            (member: IBranchMember) => member?.role?.id === role.id
          ) === -1
      );
    }
    return [];
  }, [roles, selectedMembers]);

  useEffect(() => {
    if (filteredContacts.length < 15 && contactsSkip !== -1) {
      getNextPageContacts();
    }
  }, []);

  if (
    currentTab === INVITESTEPSENUM.EMAIL &&
    currentStep === CanvasInviteStepEnum.SELECT_PERMISSIONS
  ) {
    return (
      <div>
        <div className="flex items-center mb-2">
          <IconButton
            icon={ChevronLeftIcon}
            sx={{
              color: "text.subtle",
            }}
            size={"small"}
            variant="invisible"
            onClick={() => setCurrentSetp(CanvasInviteStepEnum.SELECT_USERS)}
          />
          <Text fontWeight="bold" fontSize={14}>
            {t("rightrail.back")}
          </Text>
        </div>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "selectedUsers.permsTab.bg",
            border: "1px solid",
            borderColor: "selectedUsers.permsTab.border",
            borderRadius: "8px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              px: "8px",
              pt: "8px",
            }}
          >
            <CanvasPermissionMenu
              pgSystemName={overAllPG}
              onChange={(permissionGroup: PermissionGroup) => {
                setOverAllPG(permissionGroup.systemName);
                handleChangeAllMemPG(permissionGroup);
              }}
            />
          </Box>
          <ActionList.Divider sx={{ bg: "selectedUsers.permsTab.border" }} />
          <ActionList sx={{ padding: "8px" }} className="space-y-2">
            {emails.map((email: EmailType, index: number) => (
              <div className="flex items-center justify-between">
                <Text
                  as="p"
                  sx={{
                    fontSize: "12px",
                    lineHeight: "18px",
                    fontWeight: 600,
                    px: "12px",
                    borderRadius: "20px",
                    bg: "selectedUsers.permsTab.emailBg",
                  }}
                >
                  <Truncate title={email.email} maxWidth={"240px"}>
                    {email.email}
                  </Truncate>
                </Text>
                {isLoggedIn && (
                  <CanvasPermissionMenu
                    pgSystemName={email.permissionGroup}
                    onChange={(pg: PermissionGroup) => {
                      emails[index].permissionGroup = pg.systemName;
                      setEmails([...emails]);
                    }}
                    extraActions={
                      <ActionList.Item
                        variant="danger"
                        onSelect={(event) => removeEmail(email, index)}
                      >
                        <ActionList.LeadingVisual>
                          <XIcon />
                        </ActionList.LeadingVisual>
                        {t("rightrail.removeUser")}
                      </ActionList.Item>
                    }
                  />
                )}
              </div>
            ))}
            {selectedMembers.map((member: IBranchMember, index: number) => (
              <CanvasUserPermission
                branch={branch!}
                key={index}
                member={member}
                fromInvite
                onChangePermissionGroup={(pg: PermissionGroup) =>
                  handleChangePG(pg, member)
                }
                onRemove={() => removeMember(member)}
              />
            ))}
            <div className="flex items-center mb-2">
              <Button
                leadingIcon={PlusIcon}
                sx={{
                  color: "selectedUsers.permsTab.addMoreUsers",
                  ":hover": {
                    textDecoration: "underline",
                    bg: "transparent!important",
                  },
                }}
                size={"small"}
                variant="invisible"
                onClick={(e: any) =>
                  setCurrentSetp(CanvasInviteStepEnum.SELECT_USERS)
                }
              >
                <Text>{t("rightrail.addMoreUsers")}</Text>
              </Button>
            </div>
          </ActionList>
        </Box>
        <Box
          className="p-2 mt-8"
          sx={{
            color: "selectedUsers.permsTab.inputText",
            bg: "selectedUsers.permsTab.bg",
            border: "1px solid",
            borderColor: "selectedUsers.permsTab.border",
            boxShadow: "inset 0px 2px 0px rgba(225, 228, 232, 0.2)",
            borderRadius: "6px",
          }}
        >
          <ReactTextareaAutosize
            placeholder={"Add a personal message (optional)"}
            value={personalMessage}
            onChange={(e) => {
              setPersonalMessage(e.target.value);
            }}
            maxRows={5}
            minRows={5}
            className={
              "border-0 overflow-hidden text-sm resize-none outline-0 w-full"
            }
            style={{ backgroundColor: "transparent" }}
          />
        </Box>
        <div className="flex items-center justify-end mt-4 space-x-4">
          <Button
            disabled={loading}
            variant="default"
            size="small"
            sx={{
              border: "none",
              fontSize: "12px",
            }}
            onClick={() => onCancel()}
          >
            {t("rightrail.cancel")}
          </Button>
          <Button
            disabled={loading}
            variant="primary"
            size="small"
            sx={{
              border: "none",
              fontSize: "12px",
            }}
            onClick={() => {
              if (repo?.subCanvasCount) {
                setInheritDialogOpen(true);
              } else {
                handleInvite(false);
                // inviteViaEmails();
              }
            }}
          >
            {t("rightrail.sendInvite")}
          </Button>
        </div>
        {inheritDialogOpen && repo?.subCanvasCount ? (
          <Modal
            closeHandler={() => setInheritDialogOpen(false)}
            sx={{ maxWidth: "350px" }}
            hideCloseButton
          >
            <div className="flex flex-col space-y-2">
              <Text as="p">Set permissions for sub canvases?</Text>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="invisible"
                  sx={{ color: "selectedUsers.permsTab.no" }}
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleInvite(false);
                    // inviteViaEmails();
                  }}
                >
                  No
                </Button>
                <Button
                  disabled={loading}
                  variant="invisible"
                  sx={{ color: "selectedUsers.permsTab.apply" }}
                  onClick={(e: any) => {
                    e.stopPropagation();
                    handleInvite(true);
                    // inviteViaEmails();
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </Modal>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-2">
        <IconButton
          icon={ChevronLeftIcon}
          sx={{
            color: "text.subtle",
          }}
          size={"small"}
          variant="invisible"
          onClick={() => onCancel()}
        />
        <Text fontWeight="bold" fontSize={14}>
          {t("rightrail.back")}
        </Text>
      </div>
      <UnderlineNav aria-label="Main" sx={{ mb: "16px", border: "none" }}>
        <UnderlineNav.Link
          as="button"
          selected={currentTab === INVITESTEPSENUM.EMAIL}
          onClick={() => {
            setCurrentTab(INVITESTEPSENUM.EMAIL);
          }}
          sx={{
            padding: "12px",
            borderBottomColor:
              currentTab === INVITESTEPSENUM.EMAIL
                ? "#0366D6 !important"
                : "transparent",
          }}
        >
          {t("rightrail.inviteUsers")}
        </UnderlineNav.Link>
        <UnderlineNav.Link
          as="button"
          selected={currentTab === INVITESTEPSENUM.LINK}
          onClick={() => {
            setCurrentTab(INVITESTEPSENUM.LINK);
          }}
          sx={{
            padding: "12px",
            borderBottomColor:
              currentTab === INVITESTEPSENUM.LINK
                ? "#0366D6 !important"
                : "transparent",
          }}
        >
          {t("rightrail.createInviteLink")}
        </UnderlineNav.Link>
      </UnderlineNav>
      {currentTab === INVITESTEPSENUM.EMAIL ? (
        currentStep === CanvasInviteStepEnum.SELECT_USERS ? (
          <>
            <TextInput
              placeholder="Enter email or username"
              onChange={searchHandler}
              value={inputValue}
              sx={{
                borderWidth: 1,
                borderStyle: "solid",
              }}
              onKeyDown={(e) => {
                if (!e.shiftKey && e.key === "Enter") {
                  e.preventDefault();
                  onEnterClick();
                }
              }}
              autoFocus
            />
            {inputValue?.length >= 3 ? (
              <Text
                as="p"
                fontSize={"0.625rem"}
                lineHeight="0.875rem"
                mt={"0.25rem"}
                ml={"0.25rem"}
              >
                Press enter on keyboard to add user(s)
              </Text>
            ) : null}
            {selectedMembers.length > 0 || emails.length > 0 ? (
              <Box
                sx={{
                  mt: "16px",
                  bg: "rightRailContainer.bg",
                  position: "sticky",
                  top: "-8px",
                  zIndex: 1,
                }}
              >
                <div className="flex items-center justify-between">
                  <SelectionHeading />
                  <Button
                    variant="primary"
                    // trailingIcon={ArrowRightIcon}
                    size="small"
                    sx={{
                      border: "none",
                      fontSize: "12px",
                    }}
                    onClick={() =>
                      setCurrentSetp(CanvasInviteStepEnum.SELECT_PERMISSIONS)
                    }
                  >
                    {t("rightrail.next")}
                  </Button>
                </div>
                <ActionList
                  sx={{
                    pt: "8px",
                    pb: "0px",
                    maxHeight: "300px",
                    overscrollBehavior: "contain",
                    overflow: "overlay",
                  }}
                >
                  {emails.map((email: EmailType, index: number) => (
                    <ActionList.Item
                      key={index}
                      sx={{
                        display: "flex",
                        mx: "0px",
                        width: "100%",
                      }}
                      onSelect={() => removeEmail(email, index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center h-10 space-x-2">
                          <AvatarWithPlaceholder
                            src={""}
                            size={32}
                            sx={{
                              color: "text.default",
                            }}
                          />
                          <div className="flex flex-col">
                            <Text
                              as="p"
                              sx={{
                                fontSize: "14px",
                                lineHeight: "20px",
                              }}
                            >
                              <Truncate title={email.email} maxWidth={"240px"}>
                                {email.email}
                              </Truncate>
                            </Text>
                          </div>
                        </div>
                        <CheckIcon color="selectedUsers.checkIcon" />
                      </div>
                    </ActionList.Item>
                  ))}
                  {selectedMembers.map(
                    (member: IBranchMember, index: number) => (
                      <ActionList.Item
                        key={index}
                        sx={{
                          display: "flex",
                          mx: "0px",
                          width: "100%",
                        }}
                        onSelect={() => removeMember(member)}
                      >
                        <MemberListItem
                          type={member.type}
                          user={member.user}
                          role={member.role}
                          selected
                        />
                      </ActionList.Item>
                    )
                  )}
                </ActionList>
              </Box>
            ) : null}
            <ActionList.Divider />
            {inputValue?.length < 3 ? (
              <>
                <ActionList>
                  <DropDownItem
                    title="ROLES"
                    count={filteredStudioRoles?.length}
                    opened={showRoles}
                    onClick={() => {
                      setShowRoles(!showRoles);
                    }}
                  />
                  {showRoles &&
                    filteredStudioRoles?.map((role: IRole) => (
                      <ActionList.Item
                        key={role.id}
                        sx={{
                          display: "flex",
                          mx: "0px",
                          width: "100%",
                        }}
                        onSelect={() =>
                          addMember(undefined, role, BranchMemberTypeEnum.Role)
                        }
                      >
                        <MemberListItem
                          type={BranchMemberTypeEnum.Role}
                          role={role}
                        />
                      </ActionList.Item>
                    ))}
                </ActionList>
                <ActionList>
                  <DropDownItem
                    title={t("MEMBERS.WORKSPACE")}
                    count={remainingContactsCount}
                    opened={showUsers}
                    onClick={() => {
                      setShowUsers(!showUsers);
                    }}
                  />
                  {showUsers && (
                    <InfiniteScroll
                      hasMore={contactsSkip !== -1}
                      dataLength={filteredContacts.length}
                      next={getNextPageContacts}
                      loader={""}
                      scrollableTarget={"content-container"}
                    >
                      {filteredContacts?.map((contact: Member) => (
                        <ActionList.Item
                          key={contact.id}
                          sx={{
                            display: "flex",
                            mx: "0px",
                            width: "100%",
                          }}
                          onSelect={() =>
                            addMember(
                              contact.user,
                              undefined,
                              BranchMemberTypeEnum.Member
                            )
                          }
                        >
                          <MemberListItem
                            type={BranchMemberTypeEnum.Member}
                            user={contact.user}
                          />
                        </ActionList.Item>
                      ))}
                    </InfiniteScroll>
                  )}
                </ActionList>
              </>
            ) : null}

            {loadingContacts ? (
              <div className="flex items-center justify-center p-4">
                <BipLoader />
              </div>
            ) : null}
            {inputValue?.length >= 3 ? (
              isLoading ? (
                <BipLoader />
              ) : (
                <ActionList>
                  {filteredRoles?.length ? (
                    <div className="mb-4">
                      <Text
                        as="p"
                        sx={{
                          fontSize: "14px",
                          lineHeight: "20px",
                          color: "selectedUsers.veryDarkText",
                          letterSpacing: "-0.15px",
                          mb: "16px",
                        }}
                      >
                        {t("rightrail.roles")}
                      </Text>
                      {filteredRoles?.map((role: IRole) => (
                        <ActionList.Item
                          sx={{
                            display: "flex",
                            mx: "0px",
                            width: "100%",
                          }}
                          onSelect={() =>
                            addMember(
                              undefined,
                              role,
                              BranchMemberTypeEnum.Role
                            )
                          }
                        >
                          <MemberListItem
                            type={BranchMemberTypeEnum.Role}
                            role={role}
                          />
                        </ActionList.Item>
                      ))}
                    </div>
                  ) : null}

                  {filteredMembers?.length ? (
                    <>
                      <Text
                        as="p"
                        sx={{
                          fontSize: "14px",
                          lineHeight: "20px",
                          fontWeight: 500,
                          color: "selectedUsers.darkText",
                          mb: "8px",
                        }}
                      >
                       {t("MEMBERS.WORKSPACE")}
                      </Text>
                      {filteredMembers?.map((contact: Member) => (
                        <ActionList.Item
                          key={contact.id}
                          sx={{
                            display: "flex",
                            mx: "0px",
                            width: "100%",
                          }}
                          onSelect={() =>
                            addMember(
                              contact.user,
                              undefined,
                              BranchMemberTypeEnum.Member
                            )
                          }
                        >
                          <MemberListItem
                            type={BranchMemberTypeEnum.Member}
                            user={contact.user}
                          />
                        </ActionList.Item>
                      ))}
                    </>
                  ) : null}

                  {filteredUsers?.length ? (
                    <>
                      <Text
                        as="p"
                        sx={{
                          fontSize: "14px",
                          lineHeight: "20px",
                          fontWeight: 500,
                          letterSpacing: "-0.15px",
                          color: "selectedUsers.darkText",
                          mt: "16px",
                        }}
                      >
                        OTHERS
                      </Text>
                      <InfiniteScroll
                        hasMore={searchSkip !== -1}
                        dataLength={filteredUsers.length}
                        next={searchNextPageUsers}
                        loader={<BipLoader />}
                        scrollableTarget={"content-container"}
                      >
                        {filteredUsers?.map((user: IUserMini) => (
                          <ActionList.Item
                            sx={{
                              display: "flex",
                              mx: "0px",
                              width: "100%",
                            }}
                            onSelect={() =>
                              addMember(
                                user,
                                undefined,
                                BranchMemberTypeEnum.Member
                              )
                            }
                          >
                            <MemberListItem
                              type={BranchMemberTypeEnum.Member}
                              user={user}
                            />
                          </ActionList.Item>
                        ))}
                      </InfiniteScroll>
                    </>
                  ) : null}
                </ActionList>
              )
            ) : null}
          </>
        ) : null
      ) : (
        <>
          <div className="mt-2">
            {
              <BranchAccessToken
                branchAccessToken={{}}
                mode={BranchAccessTokenModeEnum.CREATE}
                onCancel={() => {
                  onCancel();
                }}
              />
            }
          </div>
        </>
      )}
    </div>
  );
};

export default SelectUsers;
