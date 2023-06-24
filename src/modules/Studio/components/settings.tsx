import { ArrowLeftIcon, PlusIcon } from "@primer/octicons-react";
import {
  Box,
  Button,
  IconButton,
  Text,
  ToggleSwitch,
  ConfirmationDialog,
  UnderlineNav,
  Avatar,
  ActionMenu,
  ActionList,
  Tooltip,
} from "@primer/react";
import {
  CheckCircleIcon,
  KebabHorizontalIcon,
  PeopleIcon,
  PersonAddIcon,
  TrashIcon,
  XCircleIcon,
  XIcon,
} from "@primer/styled-octicons";
import { SearchIcon } from "@primer/octicons-react";
import {
  FC,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useToasts } from "react-toast-notifications";

import StyledTextInput from "../../../components/StyledTextInput";
import { useUser } from "../../../context/userContext";
import useDebounce from "../../../hooks/useDebounce";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../hooks/useHasPermission";

import {
  CollectionPermissionGroupEnum,
  PermissionTreeContextEnum,
  StudioPermissionEnum,
} from "../../Permissions/enums";
import SearchUsers from "./SearchUsers";
import SettingsBox from "./SettingsBox";
import StudioService from "../services";
import { FaDiscord } from "react-icons/fa";
import SlackIcon from "../../../icons/SlackIcon";
import { useStudio } from "../../../context/studioContext";
import { useRouter } from "next/router";
import {
  InviteViaEmailPayload,
  Member as MemberType,
  RequestType,
  StudioType,
} from "../types";
import { PermissionGroup } from "../../Permissions/types";
import { Label } from "@primer/react";
import { Overlay } from "@primer/react";
import React from "react";
import PermissionTree from "../../Permissions/components/PermissionTree";
import {
  AVATAR_PLACEHOLDER,
  DEFAULT_USER_PLACEHOLDER,
} from "../../../commons/constants";
import { Divider } from "../../../components/TableOfContents/styledComponents";
import { userInfo } from "os";
import RoleSelector from "./roleSelector";
import BipRouteUtils from "../../../core/routeUtils";
import InfiniteScroll from "react-infinite-scroll-component";
import BipLoader from "../../../components/BipLoader";
import { SYSTEM_ROLES } from "../../../utils/Constants";
import segmentEvents from "../../../insights/segment";
import { Integrations } from "@sentry/core";
import { IntegrationStatus } from "../../../core/enums";
import IntegrationStatusLabel from "./IntegrationStatusLabel";
import Link from "next/link";
import Colors from "../../../utils/Colors";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

import { useTranslation } from "next-i18next";
import { tabs, SETTINGS_TABS } from "../constants";
import CollectionService from "../../Collections/services";
import {
  CollectionDataType,
  CollectionPermissionType,
  CreateOrUpdatePermissionType,
  RoleType,
} from "../../Collections/types";
import AvatarWithPlaceholder from "../../../components/AvatarWithPlaceholder";
import CollectionUserPermission from "../../Permissions/components/CollectionUserPermission";
import CollectionSettings from "./CollectionSettings";

// import { TrashIcon } from "@primer/octicons-react";

interface RoleProps {
  isSelected: boolean;
  onClick: MouseEventHandler<HTMLDivElement> | undefined;
  deleteRole?: Function;
  name: string;
  hideDelete?: boolean;
}

interface MemberProps {
  onClick: MouseEventHandler<HTMLDivElement> | undefined;
  name: string;
  isSelected: boolean;
  avatarUrl: string;
}

const Member: FC<MemberProps> = (props) => {
  return (
    <Box
      px={"8px"}
      py={"6px"}
      borderRadius={"4px"}
      bg={props.isSelected ? "studioSettings.member.selectedBg" : "none"}
      sx={{ cursor: "pointer" }}
      onClick={props.onClick}
      mb={"6px"}
      display="flex"
      alignItems={"end"}
    >
      <Avatar
        src={props.avatarUrl || AVATAR_PLACEHOLDER}
        sx={{ width: "24px", height: "24px", flexShrink: 0 }}
      />
      <Text as="p" ml={"8px"} color={"studioSettings.member.name"}>
        {props.name}
      </Text>
    </Box>
  );
};

const Role: FC<RoleProps> = (props) => {
  return (
    <Box
      px={"8px"}
      py={"6px"}
      borderRadius={"6px"}
      bg={props.isSelected ? "studioSettings.role.selectedBg" : "none"}
      sx={{ cursor: "pointer" }}
      onClick={props.onClick}
      mb={"6px"}
      display="flex"
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <Text as="p" sx={{ color: "studioSettings.role.name" }}>
        {props.name}
      </Text>
      {props.hideDelete ? null : (
        <IconButton
          icon={TrashIcon}
          size={"small"}
          variant="invisible"
          onClick={(e: any) => {
            e.stopPropagation();
            props.deleteRole && props.deleteRole();
          }}
        />
      )}
    </Box>
  );
};

interface NoMembersProps {
  onClickAddMembers: () => void;
  isNotFound: boolean;
}

const NoMembers: FC<NoMembersProps> = (props) => {
  const { onClickAddMembers, isNotFound } = props;

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      mt={"32px"}
    >
      <PeopleIcon
        sx={{
          color: "studioSettings.box3Styles.peopleIcon",
          width: "31.51px",
          height: "22.01px",
        }}
      />
      <Text
        as="p"
        mt={"19px"}
        fontWeight={600}
        fontSize={"14px"}
        lineHeight={"20px"}
      >
        {isNotFound ? "No existing members found" : "No members yet"}
      </Text>
      <Text
        as="p"
        mt={"8px"}
        fontWeight={400}
        fontSize={"14px"}
        lineHeight={"16px"}
        textAlign={"center"}
      >
        {isNotFound
          ? "Confirm the spelling or hit the + icon below to add members to this Role"
          : 'To add members in this role, click on "add members" button.'}
      </Text>
      {/* <Button
        variant={"primary"}
        size={"large"}
        sx={{
          border: "none",
          borderRadius: "12px",
          mt: "16px",
        }}
        onClick={onClickAddMembers}
      >
        Add members
      </Button> */}
    </Box>
  );
};

interface SettingsProps {
  closeHandler: () => void;
}

const Settings: FC<SettingsProps> = (props) => {
  const router = useRouter();

  const { handle, message, status, provider, tab } = router.query;
  const [roles, setRoles] = useState((): RoleType[] => []);
  const [members, setMembers] = useState((): MemberType[] => []);
  const [membersSkip, setMembersSkip] = useState(0);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMember, setSelectedMember] = useState((): any => null);

  const [membersPopup, setMembersPopup] = useState(true);

  const [searchedMembers, setSearchedMembers] = useState(
    (): MemberType[] => []
  );
  const [membersSearchValue, setMembersSearchValue] = useState("");
  const debounceMemSearchValue = useDebounce(membersSearchValue, 500);

  const [btnBoolean, setBtnBoolean] = useState(false);

  const [rolesPopup, setRolesPopup] = useState(false);
  const rolesPopupRef = useRef(null);
  const [tabsInRole, setTabsInRole] = useState("display");
  const [searchMembersPopup, setSearchMembersPopup] = useState(true);
  const [roleOfSelectedMember, setRoleOfSelectedMember] = useState(
    (): any => []
  );
  const [fetchingMemberRoles, setFetchingMemberRoles] =
    useState<boolean>(false);
  const [openAddRoleToMemPopup, setOpenAddRoleToMemPopup] = useState(false);

  const [studioPermissions, setStudioPermissions] = useState((): any => []);
  const [selectedPermission, setSelectedPermission] = useState((): any => null);
  const [permissionsSchema, setPermissionsSchema] = useState(
    (): PermissionGroup[] => []
  );
  const [selectedPg, setSelectedPg] = useState((): any => null);
  const [showCreatePerm, setShowCreatePerm] = useState(false);
  const [itemCheckedForPerm, setItemCheckedForPerm] = useState("member");
  const [roleSelectedForPerm, setRoleSelectedFormPerm] = useState(
    (): any => null
  );

  const [memberSelectedForPerm, setMemberSelectedForPerm] = useState(
    (): any => null
  );
  const [integrationsIsLoading, setIntegrationsIsLoading] = useState({
    discord: false,
    slack: false,
    discordDm: false,
    slackDm: false,
  });

  const [membersSelectedForRole, setMembersSelectedForRole] = useState(
    (): any => []
  );

  const [integrations, setIntegrations] = useState({
    discord: false,
    slack: false,
    discordDm: false,
    discordIntegrationStatus: "",
    slackDm: false,
    slackIntegrationStatus: "",
  });

  const [selectedRole, setSelectedRole] = useState((): any => null);
  const [deleteConfRole, setDeleteConfRole] = useState((): any => null);
  const [roleName, setRoleName] = useState("");
  const debounceValue = useDebounce(roleName, 500);

  const [showSearchUser, setShowSearchUser] = useState(false);

  const { isLoggedIn, user: currentUser } = useUser();
  const { currentStudio, deleteStudio, studios, saveCurrentStudio } =
    useStudio();

  const isPersonalStudio = currentStudio?.id === currentUser?.defaultStudioID;

  const [selectedTab, setSelectedTab] = useState(
    tab
      ? tabs[tab]
      : isPersonalStudio
      ? SETTINGS_TABS.members
      : SETTINGS_TABS.roles
  );

  const [collections, setCollections] = useState(
    (): CollectionDataType[] => []
  );
  const [selectedCollection, setSelectedCollection] = useState(
    (): CollectionDataType | null => null
  );
  const [collectionSearchText, setCollectionSearchText] = useState("");

  const [selPermTab, setSelPermTab] = useState("permissions");

  const [popup, setPopup] = useState(false);
  const [deleteMembersPopup, setDeleteMembersPopup] = useState(false);

  const [modalType, setModalType] = useState("");
  const [valueOfRoles, setValueOfRoles] = useState((): any => null);

  const [rolesValue, setRolesValue] = useState("");

  const [roleMemberInputValue, setRoleMemberInputValue] = useState("");
  const [showAddMembersToRole, setShowAddMembersToRole] = useState(false);

  const [loading, setLoading] = useState(false);

  const [joinRequests, setJoinRequests] = useState((): RequestType[] => []);
  const [loadingAcceptingRejecting, setLoadingAcceptingRejecting] =
    useState(false);
  const [makingPublic, setMakingPublic] = useState(false);

  const handleDelete = () => {
    setPopup(true);
  };

  const anchorRef = React.useRef(null);

  const canCreateOrDeleteRole =
    useHasPermission(
      StudioPermissionEnum.STUDIO_CREATE_DELETE_ROLE,
      PermissionContextEnum.Studio
    ) && isLoggedIn;

  const canAddRemoveUserToRole = useHasPermission(
    StudioPermissionEnum.STUDIO_ADD_REMOVE_USER_TO_ROLE,
    PermissionContextEnum.Studio
  );

  const canManageIntegrations = useHasPermission(
    StudioPermissionEnum.STUDIO_MANAGE_INTEGRATION,
    PermissionContextEnum.Studio
  );

  const canManageBilling = useHasPermission(
    StudioPermissionEnum.CAN_MANAGE_BILLING,
    PermissionContextEnum.Studio
  );

  const { addToast } = useToasts();

  const { t } = useTranslation();

  useEffect(() => {
    if (provider) {
      if (status === "success") {
        addToast(`Connected to ${provider}`, {
          appearance: "success",
          autoDismiss: true,
        });
        if (provider === "discord") {
          setIntegrations({ ...integrations, discord: true, discordDm: true });
        } else if (provider === "slack") {
          setIntegrations({ ...integrations, slack: true });
        }
        segmentEvents.integrationConnected(
          provider as string,
          currentStudio?.handle!,
          currentUser?.id!
        );
      }
      if (status === "error") {
        const toatsMsg =
          message === "maximum_webhook_10"
            ? `Maximum number of webhooks reached for your Discord server. Please remove any integration and try again`
            : `Failed to connect to ${provider}`;
        addToast(toatsMsg, {
          appearance: "error",
          autoDismiss: true,
        });
      }
      router.push(
        BipRouteUtils.getStudioAboutRoute(currentStudio?.handle!),
        undefined,
        { shallow: true }
      );
    }
  }, [provider, status, addToast]);

  useEffect(() => {
    if (currentStudio?.id && currentStudio?.handle === handle) {
      const promise1 = StudioService.getStudioRoles();
      const promise2 = StudioService.getStudioMembers();
      const promise3 = StudioService.getStudioPermissions();
      const promise4 = StudioService.getStudioPermissionsSchema();
      const promise5 = StudioService.getStudioIntegrations();
      const promise6 = StudioService.getJoinRequests(currentStudio?.id);
      const promise7 = CollectionService.getCollections();

      Promise.all([
        promise1,
        promise2,
        promise3,
        promise4,
        promise5,
        promise6,
        promise7,
      ])
        .then((responses) => {
          const roles = responses[0]?.data?.data || [];
          const members = responses[1]?.data?.data || [];
          const memSkip = responses[1]?.data?.next || -1;
          const permissions = responses[2]?.data?.data || [];
          const schema = responses[3]?.data?.permissionGroups || [];
          const collections: CollectionDataType[] =
            responses[6]?.data?.data || [];
          setIntegrations(responses[4]?.data?.data);
          setJoinRequests(responses[5]?.data?.data || []);
          setCollections(collections);
          setRoles(roles);
          setMembers(members);
          setMembersSkip(parseInt(memSkip));
          setStudioPermissions(permissions);
          setPermissionsSchema(schema);
          if (roles?.length) {
            setSelectedRole(roles[0]);
            setRoleName(roles[0].name);
          }
          if (permissions?.length) {
            setSelectedPermission(permissions[0]);
          }
          if (collections?.length) {
            setSelectedCollection(collections[0]);
          }
        })
        .catch((_err) => {
          addToast("Something went wrong. Please try again!", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  }, [currentStudio?.handle]);

  const getNextPageMembers = () => {
    if (membersSkip === -1) return;
    setLoadingMembers(true);
    StudioService.getStudioMembers(membersSkip)
      .then((r) => {
        const newMembers = r?.data?.data || [];
        const skip = r?.data?.next || -1;
        setMembers([...members, ...newMembers]);
        setMembersSkip(parseInt(skip));
        setLoadingMembers(false);
      })
      .catch((err) => {
        setLoadingMembers(false);
        addToast("Something went wrong. Please try again!", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const getSearchedMembers = () => {
    setLoadingMembers(true);
    StudioService.searchStudioMembers(debounceMemSearchValue)
      .then((r) => {
        const newMembers = r?.data?.data || [];
        setSearchedMembers(newMembers);
        if (newMembers?.length) {
          setSelectedMember(newMembers[0]);
          getRolesOfMember(newMembers[0].id);
        } else {
          setSelectedMember(null);
        }
        setLoadingMembers(false);
      })
      .catch((err) => {
        setLoadingMembers(false);
        addToast("Something went wrong. Please try again!", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  useEffect(() => {
    setSearchedMembers([]);
    if (debounceMemSearchValue?.length && membersSkip !== -1) {
      getSearchedMembers();
    } else {
      if (members?.length) {
        setSelectedMember(members[0]);
        getRolesOfMember(members[0].id);
      }
    }
  }, [debounceMemSearchValue]);

  useEffect(() => {
    if (selectedTab === SETTINGS_TABS.members && members.length) {
      setSelectedMember(members[0]);
      setMembersPopup(false);
      getRolesOfMember(members[0]?.id);
    } else if (
      selectedTab === SETTINGS_TABS.collections &&
      collections?.length
    ) {
      setSelectedCollection(collections[0]);
      setSelPermTab("permissions");
    }
  }, [selectedTab]);

  const roleUpdate = () => {
    setLoading(true);
    StudioService.editRole({ roleId: selectedRole?.id, name: debounceValue })
      .then((_r: any) => {
        const role = roles.find((role: any) => role.id === selectedRole.id);
        if (role) {
          role.name = debounceValue;
        }
        setRoles([...roles]);
        addToast("Successfully updated role name", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((_err: any) => {
        addToast("Failed to updated role name", {
          appearance: "error",
          autoDismiss: true,
        });
      });
    setLoading(false);
  };

  const createRole = () => {
    setLoading(true);
    segmentEvents.roleCreated(
      "Role Name",
      currentStudio?.handle!,
      currentUser?.id!,
      currentUser?.username!
    );
    StudioService.createRole({ name: "Role Name", icon: "", color: "" })
      .then((r) => {
        const role = r.data.data;
        setTabsInRole("display");
        setSelectedRole(role);
        setRoleName(role.name);
        setRoles([...roles, role]);
      })
      .catch((_err: any) => {
        addToast("Failed to create role. Please try again!", {
          appearance: "error",
          autoDismiss: true,
        });
      });
    setLoading(false);
  };

  const deleteRole = (roleDelete: any) => {
    setLoading(true);
    segmentEvents.roleDeleted(
      currentStudio?.membersCount!,
      roleDelete?.name,
      currentStudio?.handle!
    );
    StudioService.deleteRole(roleDelete.id)
      .then((_r: any) => {
        const updatedRoles = roles.filter(
          (role: any) => role.id !== roleDelete.id
        );
        setRoles(updatedRoles);
        if (roleDelete.id === selectedRole?.id) {
          if (updatedRoles.length) {
            setSelectedRole(updatedRoles[0]);
            setRoleName(updatedRoles[0].name);
          }
        }
        setDeleteConfRole(null);
        addToast("Successfully deleted role", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((_err) => {
        addToast("Failed to delete role. Please try again!", {
          appearance: "error",
          autoDismiss: true,
        });
      });
    setLoading(false);
  };

  const resetSearchData = () => {
    setShowSearchUser(false);
    setMembersSelectedForRole([]);
  };

  const getRolesOfMember = async (memberId: any) => {
    setFetchingMemberRoles(true);
    await StudioService.getMemberRoles(memberId)
      .then((response) => {
        setRoleOfSelectedMember(response?.data?.data || []);
        setFetchingMemberRoles(false);
      })
      .catch((err) => console.log(err, "err here"));
  };

  const deleteAssignedRole = (memberId: any, roleId: any) => {
    let memId = [memberId];
    const data = StudioService.updateRoleMembership({
      membersRemoved: memId,
      roleId: roleId,
    })
      .then((r) => {
        const role = r.data.data;
        const roleIndex = roles?.findIndex((r: any) => r.id === role.id);
        if (roleIndex >= 0) {
          const updatedMembers = roles[roleIndex].members.filter(
            (m: any) => m.id !== memberId
          );
          const updatedRole = { ...role, members: updatedMembers };
          roles[roleIndex] = updatedRole;
          setRoles([...roles]);
          // setSelectedRole(role);
          setSelectedRole(updatedRole);
        }
        const newRoles = roleOfSelectedMember?.filter(
          (role: any) => role?.id !== roleId
        );
        setRoleOfSelectedMember(newRoles);
        resetSearchData();
        addToast("Successfully removed role ", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((_err) => {
        addToast("Failed to remove the role ", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const assignRoleToMember = async (memberId: any, roleId: any) => {
    setLoading(true);
    let memId = [memberId];
    const data = await StudioService.updateRoleMembership({
      membersAdded: memId,
      roleId: roleId,
    })
      .then((r) => {
        const role = r.data.data;
        const roleIndex = roles?.findIndex((r: any) => r.id === role.id);
        if (roleIndex >= 0) {
          const updatedMembers = [...roles[roleIndex].members, ...role.members];
          const updatedRole = { ...role, members: updatedMembers };
          roles[roleIndex] = updatedRole;
          setRoles([...roles]);
          // setSelectedRole(role);
          setSelectedRole(updatedRole);
        }
        resetSearchData();
        const data = {
          color: role.colot,
          id: role.id,
          isNonPerms: role.isNonPerms,
          isSystem: role.isSystem,
          memberId: memberId,
          name: role.name,
        };
        setRoleOfSelectedMember([...roleOfSelectedMember, data]);
        addToast("Successfully added role", {
          appearance: "success",
          autoDismiss: true,
        });
        setLoading(false);
      })
      .catch((_err) => {
        addToast("Failed to add role. Please try again!", {
          appearance: "error",
          autoDismiss: true,
        });
        setLoading(false);
      });
  };

  const addMembersToRole = (ids: string[] | number[], emails: string[]) => {
    const promises = [];
    let membersAdded: any = [];
    if (ids?.length) {
      membersAdded = [...ids];
    }
    if (membersSelectedForRole?.length) {
      membersAdded = [...membersAdded, ...membersSelectedForRole];
    }

    if (membersAdded.length) {
      promises.push(
        StudioService.updateRoleMembership({
          membersAdded: membersAdded,
          roleId: selectedRole?.id,
        })
      );
    }

    if (emails.length) {
      const payload = emails.map((email) => {
        return {
          email: email,
          roles: [selectedRole.id],
        };
      });
      promises.push(StudioService.inviteViaEmail(payload));
    }

    if (promises.length) {
      Promise.all(promises)
        .then((responses: any[]) => {
          if (membersAdded.length) {
            const role = responses[0].data.data;
            const roleMembers = role?.members;
            const roleIndex = roles?.findIndex((r: any) => r.id === role.id);
            if (roleIndex >= 0) {
              const updatedMembers = [...selectedRole.members, ...role.members];
              const updatedRole = { ...role, members: updatedMembers };
              roles[roleIndex] = updatedRole;
              setRoles([...roles]);
              setSelectedRole(updatedRole);
            }
            if (roleMembers?.length) {
              const filMembers = roleMembers.filter(
                (mem: any) =>
                  members.findIndex((member) => mem.id === member.id) === -1
              );
              setMembers([...members, ...filMembers]);
            }
          }
          setShowAddMembersToRole(false);
          addToast("Successfully invited members to role", {
            appearance: "success",
            autoDismiss: true,
          });
        })
        .catch((err) => {
          addToast("Failed to invite members to role. Please try again!", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  };

  const deleteRoleMember = (member: any, role: any) => {
    StudioService.updateRoleMembership({
      membersRemoved: [member?.id],
      roleId: role?.id,
    })
      .then((r) => {
        const urole = r.data.data;
        const roleIndex = roles?.findIndex((r: any) => r.id === role.id);
        if (roleIndex >= 0) {
          const updatedMembers = role.members.filter(
            (m: any) => m.id !== member?.id
          );
          const updatedRole = { ...urole, members: updatedMembers };
          roles[roleIndex] = updatedRole;
          setRoles([...roles]);
          // setSelectedRole(role);
          setSelectedRole(updatedRole);
        }
      })
      .catch((_err) => {
        addToast("Something went wrong. Please try again!", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const addMembersToStudio = (ids: string[] | number[], emails: string[]) => {
    const promises = [];

    if (ids?.length) {
      promises.push(
        StudioService.addMembers({
          usersAdded: ids,
        })
      );
    }

    const memberRole = roles.find(
      (role: any) => role.isSystem && role.name === SYSTEM_ROLES.MEMBER
    );
    if (emails.length && memberRole) {
      const payload = emails.map((email) => {
        return {
          email: email,
          roles: [memberRole.id],
        };
      });
      promises.push(StudioService.inviteViaEmail(payload));
    }

    if (promises.length) {
      Promise.all(promises)
        .then((responses) => {
          if (ids?.length) {
            const newMembers = responses[0]?.data?.data || [];
            const updatedMembers = [...members, ...newMembers];
            setMembers(updatedMembers);
            if (currentStudio) {
              saveCurrentStudio({
                ...currentStudio,
                membersCount: currentStudio?.membersCount
                  ? currentStudio.membersCount + newMembers.length
                  : updatedMembers.length,
              });
            }
          }
          if (filteredMembers?.length) {
            setSelectedMember(filteredMembers[0]);
            getRolesOfMember(filteredMembers[0].id);
          }
          setMembersPopup(false);
          addToast("Successfully invited members to workspace", {
            appearance: "success",
            autoDismiss: true,
          });
        })
        .catch((_err) => {
          addToast("Failed to invite members to workspace. Please try again!", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  };

  const toggleDiscordSwitch = async () => {
    if (integrations?.discord) {
      setIntegrationsIsLoading({ ...integrationsIsLoading, discord: true });
      try {
        await StudioService.deleteIntegration("discord");
        addToast("Integration removed successfully", {
          appearance: "success",
          autoDismiss: true,
        });
        segmentEvents.integrationDisconnected(
          "discord",
          currentStudio?.handle!,
          currentUser?.id!
        );
      } catch (error) {
        console.log(error);
        addToast("Failed to remove integration", {
          appearance: "error",
          autoDismiss: true,
        });
      }
      setIntegrationsIsLoading({ ...integrationsIsLoading, discord: false });
      setIntegrations({ ...integrations, discord: false });
    } else {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_BIP_API_VERSION}/integrations/discord/connect/?studioId=${currentStudio?.id}&userId=${currentUser?.id}`;
    }
  };

  const updateDmNotifStatusDiscord = async () => {
    setIntegrationsIsLoading({ ...integrationsIsLoading, discordDm: true });
    try {
      await StudioService.updateDiscordDMNotifsStatus(!integrations?.discordDm);
      setIntegrations({ ...integrations, discordDm: !integrations?.discordDm });
      addToast("Updated discord DM notificaiton status successfully", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      console.log(error);
      addToast("Failed to update discord DM notificaiton status", {
        appearance: "success",
        autoDismiss: true,
      });
    }
    setIntegrationsIsLoading({ ...integrationsIsLoading, discordDm: false });
  };

  const updateDmNotifStatusSlack = async () => {
    setIntegrationsIsLoading({ ...integrationsIsLoading, slackDm: true });
    try {
      await StudioService.updateSlackDMNotifsStatus(!integrations?.slackDm);
      setIntegrations({ ...integrations, slackDm: !integrations?.slackDm });
      addToast("Updated slack DM notificaiton status successfully", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      console.log(error);
      addToast("Failed to update slack DM notificaiton status", {
        appearance: "success",
        autoDismiss: true,
      });
    }
    setIntegrationsIsLoading({ ...integrationsIsLoading, slackDm: false });
  };

  const toggleSlackSwitch = async () => {
    if (integrations?.slack) {
      setIntegrationsIsLoading({ ...integrationsIsLoading, slack: true });
      try {
        await StudioService.deleteIntegration("slack");
        addToast("Integration removed successfully", {
          appearance: "success",
          autoDismiss: true,
        });
        segmentEvents.integrationDisconnected(
          "slack",
          currentStudio?.handle!,
          currentUser?.id!
        );
      } catch (error) {
        console.log(error);
        addToast("Failed to remove integration", {
          appearance: "error",
          autoDismiss: true,
        });
      }
      setIntegrations({ ...integrations, slack: false });
      setIntegrationsIsLoading({ ...integrationsIsLoading, slack: false });
    } else {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_BIP_API_VERSION}/slack/connect/?studioId=${currentStudio?.id}&userId=${currentUser?.id}`;
    }
  };

  const togglePublicSwitch = async () => {
    if (currentStudio) {
      setMakingPublic(true);
      try {
        await StudioService.toggleStudioPublicMembership();
        saveCurrentStudio({
          ...currentStudio,
          allowPublicMembership: !currentStudio.allowPublicMembership,
        });
        addToast("Updated public membership successfully", {
          appearance: "success",
          autoDismiss: true,
        });
      } catch (err) {
        addToast("Failed to update. Please try again.", {
          appearance: "error",
          autoDismiss: true,
        });
      }
      setMakingPublic(false);
    }
  };

  const acceptRequest = (request: RequestType) => {
    if (!loadingAcceptingRejecting) {
      setLoadingAcceptingRejecting(true);
      StudioService.acceptJoinRequest(currentStudio?.id, request.id)
        .then((r) => {
          if (currentStudio) {
            saveCurrentStudio({
              ...currentStudio,
              membersCount: currentStudio?.membersCount
                ? currentStudio.membersCount + 1
                : 1,
            });
          }
          setJoinRequests(joinRequests.filter((req) => req.id !== request.id));
          const updatedMembers = [...members, r.data.data];
          setMembers(updatedMembers);
          addToast(
            `Accepted ${
              request.user.fullName || request.user.username
            }'s join request`,
            {
              appearance: "success",
              autoDismiss: true,
            }
          );
          setLoadingAcceptingRejecting(false);
        })
        .catch((err) => {
          addToast(`Something went wrong. Please try again!`, {
            appearance: "error",
            autoDismiss: true,
          });
          setLoadingAcceptingRejecting(false);
        });
    }
  };

  const rejectRequest = (request: RequestType) => {
    if (!loadingAcceptingRejecting) {
      setLoadingAcceptingRejecting(true);
      StudioService.rejectJoinRequest(currentStudio?.id, request.id)
        .then((r) => {
          setJoinRequests(joinRequests.filter((req) => req.id !== request.id));
          addToast(
            `Rejected ${
              request.user.fullName || request.user.username
            }'s join request`,
            {
              appearance: "success",
              autoDismiss: true,
            }
          );
          setLoadingAcceptingRejecting(false);
        })
        .catch((err) => {
          addToast(`Something went wrong. Please try again!`, {
            appearance: "error",
            autoDismiss: true,
          });
          setLoadingAcceptingRejecting(false);
        });
    }
  };

  const handleClose = async (gesture: string) => {
    if (gesture === "confirm") {
      try {
        const deleteMember = await StudioService.banMembers({
          banReason: "",
          userId: selectedMember?.user?.id,
        });
        const updatedMembers = members.filter(
          (mem: any) => mem.id !== selectedMember?.id
        );
        const updatedSearchedMembers = searchedMembers.filter(
          (mem: any) => mem.id !== selectedMember?.id
        );
        const updatedFilteredMembers = filteredMembers.filter(
          (mem: any) => mem.id !== selectedMember?.id
        );
        if (updatedFilteredMembers?.length) {
          setSelectedMember(updatedFilteredMembers[0]);
          getRolesOfMember(updatedFilteredMembers[0].id);
        } else {
          setSelectedMember(null);
        }
        setMembers(updatedMembers);
        setSearchedMembers(updatedSearchedMembers);
        if (currentStudio) {
          saveCurrentStudio({
            ...currentStudio,
            membersCount: currentStudio?.membersCount
              ? currentStudio.membersCount - 1
              : updatedMembers.length,
          });
        }
      } catch (error) {
        console.log(error);
      }
      setDeleteMembersPopup(false);
    } else {
      setDeleteMembersPopup(false);
    }
  };

  const handleCloseConfirmation = async (gesture: string) => {
    if (gesture === "confirm") {
      try {
        const filteredStudios = studios.filter(
          (studio: StudioType) => studio.id !== currentStudio?.id
        );
        segmentEvents.studioDeleted(
          currentStudio?.handle,
          currentStudio?.membersCount
        );
        await StudioService.deleteStudio(currentStudio?.id as number);
        deleteStudio(currentStudio?.id as number);
        if (filteredStudios?.length) {
          const firstStudio: StudioType = filteredStudios[0];
          router.replace(`/${firstStudio.handle}`);
        } else {
          router.replace("/");
        }
        addToast("Workspace deleted successfully", {
          appearance: "success",
          autoDismiss: true,
        });
        setPopup(false);
        props.closeHandler();
      } catch (err) {
        addToast("Problem deleting workspace", {
          appearance: "error",
          autoDismiss: true,
        });
        setPopup(false);
      }
    } else {
      setPopup(false);
    }
  };

  const handleDeleteRoleConfirmation = (gesture: string) => {
    if (gesture === "confirm") {
      deleteRole(deleteConfRole);
    } else {
      setDeleteConfRole(null);
    }
  };

  const resetPermsData = () => {
    setShowCreatePerm(false);
    setSelectedPg(null);
    setItemCheckedForPerm("member");
    setRoleSelectedFormPerm(null);
    setMemberSelectedForPerm(null);
  };

  const createStudioPermission = () => {
    const data: any = {
      permsGroup: selectedPg?.systemName,
      isOverriddenFlag: false,
    };
    if (itemCheckedForPerm === "member") {
      data["memberId"] = memberSelectedForPerm.id;
    } else {
      data["roleId"] = roleSelectedForPerm.id;
    }
    StudioService.createStudioPermission(data)
      .then((r) => {
        const perm = r.data.data;
        const permIndex = studioPermissions.findIndex(
          (permission: any) => permission.id === perm.id
        );
        if (permIndex >= 0) {
          studioPermissions[permIndex] = perm;
          setStudioPermissions([...studioPermissions]);
        } else {
          setStudioPermissions([...studioPermissions, perm]);
        }
        setSelectedPermission(perm);
        resetPermsData();
        addToast("Successfully created permission", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((_err) => {
        addToast("Failed to create permission. Please try again!", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const getPermission = (permsGroup: string): string => {
    const schema: any = permissionsSchema.find(
      (pg: any) => pg?.systemName === permsGroup
    );
    return schema ? schema.displayName : "";
  };

  const filteredRoles = useMemo(() => {
    if (rolesValue?.length) {
      return roles?.filter((role: any) =>
        role.name.toLowerCase().includes(rolesValue.toLowerCase())
      );
    }
    return roles;
  }, [rolesValue, roles]);

  const filteredCollections = useMemo(() => {
    if (collectionSearchText?.length) {
      return collections.filter((col) =>
        col.name.toLowerCase().includes(collectionSearchText.toLowerCase())
      );
    }
    return collections;
  }, [collectionSearchText, collections]);

  const filteredRolesForMember = useMemo(() => {
    if (roleOfSelectedMember?.length) {
      const nonAddedRoles = roles.filter((role: any) => {
        const curRole = roleOfSelectedMember.find(
          (rm: any) => rm.id === role.id
        );
        return !Boolean(curRole);
      });
      if (rolesValue?.length) {
        return nonAddedRoles?.filter((role: any) =>
          role.name.toLowerCase().includes(rolesValue.toLowerCase())
        );
      }
      return nonAddedRoles;
    }
    return roles;
  }, [rolesValue, roles, roleOfSelectedMember]);

  const filteredMembers = useMemo(() => {
    if (debounceMemSearchValue?.length && membersSkip !== -1) {
      return searchedMembers;
    }
    if (debounceMemSearchValue?.length) {
      return members?.filter(
        (mem: any) =>
          mem.user.fullName
            .toLowerCase()
            .includes(debounceMemSearchValue.toLowerCase()) ||
          mem.user.username
            .toLowerCase()
            .includes(debounceMemSearchValue.toLowerCase())
      );
    }
    return members;
  }, [debounceMemSearchValue, members, searchedMembers, membersSkip]);

  const filteredRoleMembers = useMemo(() => {
    if (selectedRole) {
      const roleMembers = selectedRole?.members;
      if (roleMembers?.length) {
        if (roleMemberInputValue.length) {
          return roleMembers?.filter(
            (mem: any) =>
              mem.user.fullName
                .toLowerCase()
                .includes(roleMemberInputValue.toLowerCase()) ||
              mem.user.username
                .toLowerCase()
                .includes(roleMemberInputValue.toLowerCase())
          );
        }
        return roleMembers;
      }
      return [];
    }
    return [];
  }, [roleMemberInputValue, selectedRole]);

  useEffect(() => {
    segmentEvents.studioSettingOpened(
      currentStudio?.handle,
      currentUser?.id,
      currentStudio?.description,
      currentStudio?.createdById
    );
  }, []);

  return (
    <div className="flex w-full h-full">
      <Box
        display={"flex"}
        flexDirection={"column"}
        width={"25%"}
        bg={"studioSettings.box1"}
        padding={"23px 8px 8px 16px"}
      >
        <SettingsBox
          onClickTab={(tab) => {
            setSelectedTab(tab);
            resetSearchData();
            if (tab === SETTINGS_TABS.roles && roles?.length) {
              setSelectedRole(roles[0]);
              setRoleName(roles[0].name);
            } else if (
              tab === SETTINGS_TABS.members &&
              studioPermissions?.length
            ) {
              setSelectedPermission(studioPermissions[0]);
            }
          }}
          selectedTab={selectedTab}
          membersCount={
            currentStudio?.membersCount!
            //  > members?.length
            //   ? currentStudio?.membersCount!
            //   : members?.length
          }
        />
      </Box>

      {selectedTab === SETTINGS_TABS.roles ||
      selectedTab === SETTINGS_TABS.members ||
      selectedTab === SETTINGS_TABS.collections ? (
        <Box
          display={"flex"}
          width={"25%"}
          flexDirection={"column"}
          bg={"studioSettings.box2"}
          padding={"42px 10px 8px 10px"}
          overflowY={"auto"}
          id={"box-2-container"}
        >
          {selectedTab === SETTINGS_TABS.roles ? (
            <Box>
              <Text
                as="p"
                sx={{
                  fontSize: "12px",
                  lineHeight: "18px",
                  fontWeight: 600,
                  mb: "8px",
                  color: "studioSettings.settingsHeading",
                }}
              >
                Roles
              </Text>

              <Box>
                <StyledTextInput
                  leadingVisual={SearchIcon}
                  placeholder={"Search Roles"}
                  value={rolesValue}
                  sx={{
                    ":focus-within": {
                      border: "none",
                    },
                  }}
                  onChange={(e) => {
                    setRolesValue(e.target.value);
                  }}
                />
              </Box>
              {filteredRoles?.map((role: any) => (
                <Role
                  key={role?.id}
                  name={role?.name}
                  isSelected={role?.id === selectedRole?.id}
                  onClick={() => {
                    setTabsInRole("display");
                    setSelectedRole(role);
                    setRoleName(role.name);
                  }}
                  deleteRole={() => {
                    setDeleteConfRole(role);
                  }}
                  hideDelete={role?.isSystem || !canCreateOrDeleteRole}
                />
              ))}
              <Button
                disabled={loading}
                variant="default"
                sx={{ mt: "16px", width: "100%" }}
                onClick={createRole}
              >
                + Create Role
              </Button>
            </Box>
          ) : selectedTab === SETTINGS_TABS.members ? (
            <Box>
              <Text
                as="p"
                sx={{
                  fontSize: "12px",
                  lineHeight: "18px",
                  fontWeight: 600,
                  mb: "8px",
                  color: "studioSettings.settingsHeading",
                }}
              >
                Members
              </Text>
              <Box mt={"10px"}>
                <StyledTextInput
                  leadingVisual={SearchIcon}
                  sx={{
                    ":focus-within": {
                      border: "none",
                    },
                  }}
                  placeholder={"Search Members"}
                  value={membersSearchValue}
                  onChange={(e) => {
                    setMembersSearchValue(e.target.value);
                  }}
                />
              </Box>

              {debounceMemSearchValue?.length && membersSkip !== -1 ? (
                searchedMembers?.map((member: any) => (
                  <Member
                    key={member.id}
                    name={
                      member.user.fullName
                        ? member.user.fullName
                        : member.user.username
                    }
                    avatarUrl={member.user.avatarUrl}
                    isSelected={member.id === selectedMember?.id}
                    onClick={() => {
                      setSelectedMember(member);
                      setMembersPopup(false);
                      getRolesOfMember(member?.id);
                    }}
                  />
                ))
              ) : (
                <InfiniteScroll
                  hasMore={membersSkip !== -1}
                  dataLength={filteredMembers.length}
                  next={getNextPageMembers}
                  loader={""}
                  scrollableTarget={"box-2-container"}
                >
                  {filteredMembers?.map((member: any) => (
                    <Member
                      key={member.id}
                      name={
                        member.user.fullName
                          ? member.user.fullName
                          : member.user.username
                      }
                      avatarUrl={member.user.avatarUrl}
                      isSelected={member.id === selectedMember?.id}
                      onClick={() => {
                        setSelectedMember(member);
                        setMembersPopup(false);
                        getRolesOfMember(member?.id);
                      }}
                    />
                  ))}
                </InfiniteScroll>
              )}

              {loadingMembers ? (
                <div className="flex items-center justify-center p-4">
                  <BipLoader />
                </div>
              ) : null}

              <Button
                variant="default"
                sx={{
                  mt: "16px",
                  width: "100%",
                  position: "sticky",
                  bottom: "5px",
                }}
                onClick={() => {
                  setMembersPopup(true);
                  setSelectedMember("");
                }}
              >
                + Add Members
              </Button>
            </Box>
          ) : selectedTab === SETTINGS_TABS.collections ? (
            <Box>
              <Text
                as="p"
                sx={{
                  fontSize: "12px",
                  lineHeight: "18px",
                  fontWeight: 600,
                  mb: "8px",
                  color: "studioSettings.settingsHeading",
                }}
              >
                Collections
              </Text>
              <Box>
                <StyledTextInput
                  leadingVisual={SearchIcon}
                  placeholder={"Search collections"}
                  value={collectionSearchText}
                  sx={{
                    ":focus-within": {
                      border: "none",
                    },
                  }}
                  onChange={(e) => {
                    setCollectionSearchText(e.target.value);
                  }}
                />
              </Box>
              {filteredCollections.map((col) => (
                <Box
                  px={"8px"}
                  py={"6px"}
                  borderRadius={"6px"}
                  bg={
                    col.id === selectedCollection?.id
                      ? "studioSettings.role.selectedBg"
                      : "none"
                  }
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedCollection(col);
                    setSelPermTab("permissions");
                  }}
                  mb={"6px"}
                  display="flex"
                  alignItems={"center"}
                >
                  <Text as="p" sx={{ color: "studioSettings.role.name" }}>
                    {col.name}
                  </Text>
                </Box>
              ))}
            </Box>
          ) : null}
        </Box>
      ) : null}

      {selectedTab === SETTINGS_TABS.roles ||
      selectedTab === SETTINGS_TABS.members ||
      selectedTab === SETTINGS_TABS.collections ? (
        <Box
          position={"relative"}
          display={"flex"}
          width={"50%"}
          bg={"studioSettings.box3"}
        >
          <Box
            display={"flex"}
            width={"100%"}
            flexDirection={"column"}
            padding={"40px 32px 32px 32px"}
            overflowY={"auto"}
            id={"box-3-container"}
          >
            {selectedTab === SETTINGS_TABS.roles && selectedRole ? (
              <Box display={"flex"} flexDirection={"column"}>
                {showAddMembersToRole && tabsInRole === "members" ? (
                  <>
                    <Box display={"flex"} alignItems={"center"}>
                      <IconButton
                        size="small"
                        variant="invisible"
                        icon={ArrowLeftIcon}
                        sx={{
                          color: "studioSettings.box3Styles.leftArrowIcon",
                        }}
                        onClick={() => {
                          setShowAddMembersToRole(false);
                        }}
                      />
                      <Text
                        as="p"
                        fontWeight={600}
                        fontSize={"16px"}
                        line-height={"24px"}
                        ml={"8px"}
                      >
                        Add members - {selectedRole.name}
                      </Text>
                    </Box>
                    <Divider className="my-4" />
                    <SearchUsers
                      inviteUsers={addMembersToRole}
                      showInviteAlways
                      placeholder={"Enter email address or username"}
                      addedUsers={
                        selectedRole?.members?.length
                          ? selectedRole.members.map((mem: any) => mem.user)
                          : []
                      }
                      members={members}
                      membersSkip={membersSkip}
                      loadingMembers={loadingMembers}
                      getNextPageMembers={getNextPageMembers}
                      scrollContainerId={"box-3-container"}
                      isRoleTab={true}
                    />
                  </>
                ) : (
                  <>
                    <Box display={"flex"} alignItems={"center"}>
                      <Text
                        as="p"
                        fontWeight={600}
                        fontSize={"16px"}
                        line-height={"24px"}
                      >
                        Edit Role - {selectedRole.name}
                      </Text>
                      {selectedRole?.isSystem ? (
                        <Box
                          display={"flex"}
                          sx={{
                            p: "0px 10px",
                            color: "studioSettings.box3Styles.systemRole",
                            border: "1px solid",
                            borderColor: "studioSettings.box3Styles.systemRole",
                            borderRadius: "20px",
                            fontSize: "12px",
                            lineHeight: "18px",
                            ml: "16px",
                          }}
                        >
                          System Role
                        </Box>
                      ) : null}
                    </Box>
                    <Divider className="my-4" />
                    <Box display={"flex"}>
                      <UnderlineNav sx={{ borderBottom: "none" }}>
                        <UnderlineNav.Link
                          onClick={() => setTabsInRole("display")}
                          selected={tabsInRole === "display"}
                          sx={{
                            cursor: "pointer",
                            fontWeight: tabsInRole === "display" ? 600 : 400,
                          }}
                        >
                          Display
                        </UnderlineNav.Link>
                        <UnderlineNav.Link
                          onClick={() => {
                            setTabsInRole("members");
                            setShowAddMembersToRole(false);
                          }}
                          selected={tabsInRole === "members"}
                          sx={{
                            cursor: "pointer",
                            display: "flex",
                            fontWeight: tabsInRole === "members" ? 600 : 400,
                          }}
                        >
                          Members
                          <Text
                            as="span"
                            sx={{
                              padding: "1px 8px",
                              bg: "studioSettings.box3Styles.countBg",
                              borderRadius: "10px",
                              fontWeight: 600,
                              fontSize: "12px",
                              lineHeight: "18px",
                              ml: "4px",
                            }}
                          >
                            {selectedRole?.members?.length || 0}
                          </Text>
                        </UnderlineNav.Link>
                        <UnderlineNav.Link
                          onClick={() => setTabsInRole("permissions")}
                          selected={tabsInRole === "permissions"}
                          sx={{
                            cursor: "pointer",
                            fontWeight:
                              tabsInRole === "permissions" ? 600 : 400,
                          }}
                        >
                          Permissions
                        </UnderlineNav.Link>
                      </UnderlineNav>
                    </Box>
                    {tabsInRole === "display" ? (
                      <Box
                        mt={"16px"}
                        display={"flex"}
                        flexDirection={"column"}
                      >
                        <Text
                          as="p"
                          fontWeight={600}
                          fontSize={"14px"}
                          lineHeight={"20px"}
                        >
                          Role Name
                        </Text>
                        <StyledTextInput
                          placeholder="Edit Role"
                          value={roleName}
                          onChange={(e) => {
                            setRoleName(e.target.value);
                          }}
                          emptyBoxHeight={"0px"}
                          disabled={selectedRole?.isSystem}
                          sx={{
                            width: "100%",
                            marginTop: "8px",
                            bg: "transparent",
                          }}
                        />
                        <Box className="flex justify-end" mt={"20px"}>
                          {roleName.length === 0 ||
                          selectedRole?.isSystem ||
                          roleName.trim() === SYSTEM_ROLES.ADMIN ||
                          roleName.trim() === SYSTEM_ROLES.MEMBER ||
                          roleName.trim() === SYSTEM_ROLES.BILLING ? (
                            <Tooltip
                              direction="nw"
                              aria-label={
                                roleName.length === 0
                                  ? "Role name cannot be empty"
                                  : selectedRole?.isSystem
                                  ? "Can't edit system role"
                                  : "Can't set system role name"
                              }
                            >
                              <Button
                                disabled={true}
                                variant="primary"
                                size="small"
                                sx={{
                                  border: "none",
                                  ":disabled": {
                                    cursor: "not-allowed",
                                  },
                                }}
                              >
                                Save
                              </Button>
                            </Tooltip>
                          ) : (
                            <Button
                              disabled={loading}
                              variant="primary"
                              size="small"
                              sx={{
                                border: "none",
                              }}
                              onClick={roleUpdate}
                            >
                              Save
                            </Button>
                          )}
                        </Box>
                      </Box>
                    ) : tabsInRole === "members" ? (
                      <>
                        <Box
                          display={"flex"}
                          flexDirection={"column"}
                          mt={"16px"}
                        >
                          {selectedRole?.members?.length ? (
                            <>
                              <StyledTextInput
                                placeholder={"Search Members"}
                                sx={{
                                  bg: "transparent",
                                  ":focus-within": {
                                    border: "none",
                                  },
                                }}
                                leadingVisual={SearchIcon}
                                value={roleMemberInputValue}
                                onChange={(e) => {
                                  setRoleMemberInputValue(e.target.value);
                                }}
                              />
                              {filteredRoleMembers?.length ? (
                                <Box className="space-y-4">
                                  {filteredRoleMembers?.map((member: any) => (
                                    <Box
                                      key={member.id}
                                      className="flex items-center justify-between"
                                      sx={{
                                        ":hover": {
                                          ".x-icon-vis": {
                                            display: "block",
                                            marginLeft: "8px",
                                          },
                                        },
                                      }}
                                    >
                                      <Box
                                        display={"flex"}
                                        alignItems={"flex-end"}
                                        key={member.id}
                                      >
                                        <Avatar
                                          src={
                                            member?.user?.avatarUrl ||
                                            AVATAR_PLACEHOLDER
                                          }
                                          sx={{ width: "20px", height: "20px" }}
                                        />
                                        <Text
                                          as="p"
                                          fontSize={"16px"}
                                          key={member.id}
                                          sx={{ marginLeft: "8px" }}
                                        >
                                          {member.user.fullName ||
                                            member.user.username}
                                        </Text>
                                      </Box>
                                      {member.user.id ===
                                        currentStudio?.createdById &&
                                      selectedRole?.isSystem ? null : currentUser?.id !==
                                        member.user.id ? (
                                        <Box
                                          sx={{
                                            cursor: "pointer",
                                            display: "none",
                                          }}
                                          className="x-icon-vis"
                                          onClick={() => {
                                            deleteRoleMember(
                                              member,
                                              selectedRole
                                            );
                                          }}
                                        >
                                          <XIcon />
                                        </Box>
                                      ) : null}
                                    </Box>
                                  ))}
                                </Box>
                              ) : (
                                <NoMembers
                                  onClickAddMembers={() => {
                                    setShowAddMembersToRole(true);
                                  }}
                                  isNotFound={true}
                                />
                              )}
                            </>
                          ) : (
                            <NoMembers
                              onClickAddMembers={() => {
                                setShowAddMembersToRole(true);
                              }}
                              isNotFound={false}
                            />
                          )}
                        </Box>
                        <Button
                          variant={"primary"}
                          size={"medium"}
                          sx={{
                            border: "none",
                            borderRadius: "12px",
                            padding: "10px",
                            position: "absolute",
                            bottom: "54px",
                            right: "32px",
                            ":hover": {
                              ".add-mem-vis": {
                                display: "block",
                                marginLeft: "8px",
                              },
                            },
                          }}
                          onClick={() => {
                            setShowAddMembersToRole(true);
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <PlusIcon />
                            <Text
                              as="p"
                              sx={{ display: "none" }}
                              className="add-mem-vis"
                            >
                              Add members
                            </Text>
                          </Box>
                        </Button>
                      </>
                    ) : (
                      <Box mt={"16px"}>
                        <PermissionTree
                          key={selectedRole?.id}
                          context={PermissionTreeContextEnum.Role}
                          role={selectedRole}
                        />
                      </Box>
                    )}
                  </>
                )}
              </Box>
            ) : selectedTab === SETTINGS_TABS.members ? (
              membersPopup ? (
                <Box>
                  <Text as="p" ml={"6px"} fontWeight={600} mb={"16px"}>
                    Add Members - {currentStudio?.displayName}
                  </Text>
                  <SearchUsers
                    inviteUsers={addMembersToStudio}
                    showInviteAlways
                    placeholder={"Enter email address or username"}
                    addedUsers={
                      members?.length ? members.map((mem) => mem.user) : []
                    }
                  />
                </Box>
              ) : selectedMember ? (
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  align-items={"flex-start"}
                >
                  <Box
                    display={"flex"}
                    justifyContent={"space-between"}
                    mb={"12px"}
                  >
                    <Text
                      as="p"
                      fontWeight={600}
                      fontSize={" 16px"}
                      line-height={"24px"}
                    >
                      {selectedMember?.user?.fullName
                        ? selectedMember?.user?.fullName
                        : selectedMember?.user?.username}
                    </Text>
                    {selectedMember?.user?.id ===
                    currentStudio?.createdById ? null : (
                      <ActionMenu>
                        <ActionMenu.Anchor>
                          <IconButton
                            icon={KebabHorizontalIcon}
                            variant="invisible"
                            sx={{
                              color: "studioSettings.box3Styles.horizontalIcon",
                            }}
                            size="small"
                          />
                        </ActionMenu.Anchor>
                        <ActionMenu.Overlay align="end">
                          <ActionList>
                            <ActionList.Item
                              onSelect={() => setDeleteMembersPopup(true)}
                            >
                              Remove user from studio
                            </ActionList.Item>
                          </ActionList>
                        </ActionMenu.Overlay>
                      </ActionMenu>
                    )}
                  </Box>
                  {fetchingMemberRoles ? (
                    <BipLoader />
                  ) : (
                    <>
                      <Box className="flex items-center">
                        <Box className="flex flex-wrap items-center gap-2 mr-2">
                          {roleOfSelectedMember?.map((role: any) => {
                            return (
                              <Label
                                key={role.id}
                                size={"large"}
                                sx={{
                                  border: "1px solid",
                                  borderColor:
                                    "studioSettings.box3Styles.tokenBorder",
                                }}
                              >
                                {role.name}
                                {selectedMember?.user?.id ===
                                  currentStudio?.createdById &&
                                role?.isSystem ? null : (
                                  <Box
                                    ml={"10px"}
                                    onClick={() => {
                                      deleteAssignedRole(
                                        role?.memberId,
                                        role?.id
                                      );
                                    }}
                                  >
                                    <XIcon
                                      size={16}
                                      sx={{ cursor: "pointer" }}
                                      color={"studioSettings.box3Styles.xIcon"}
                                    />
                                  </Box>
                                )}
                              </Label>
                            );
                          })}
                        </Box>
                        <RoleSelector
                          open={openAddRoleToMemPopup}
                          setOpen={setOpenAddRoleToMemPopup}
                          allRoles={roles}
                          selectedRoles={roleOfSelectedMember}
                          deleteRole={deleteAssignedRole}
                          addRole={assignRoleToMember}
                          selectedMember={selectedMember}
                        />
                      </Box>
                      <div className="mt-4">
                        <PermissionTree
                          key={selectedMember?.id}
                          context={PermissionTreeContextEnum.Member}
                          member={selectedMember}
                          memberRoles={roleOfSelectedMember}
                        />
                      </div>
                    </>
                  )}
                </Box>
              ) : null
            ) : selectedTab === SETTINGS_TABS.collections &&
              selectedCollection ? (
              <CollectionSettings
                collection={selectedCollection}
                getNextPageMembers={getNextPageMembers}
                members={members}
                roles={roles}
                membersSkip={membersSkip}
                updateCollection={(collection) => {
                  setCollections(
                    collections.map((col) =>
                      col.id === collection.id ? collection : col
                    )
                  );
                  setSelectedCollection(collection);
                }}
              />
            ) : // <Box display={"flex"} flexDirection={"column"}>
            //   <Text
            //     as="p"
            //     fontWeight={600}
            //     fontSize={"16px"}
            //     line-height={"24px"}
            //   >
            //     {selectedCollection.name}
            //   </Text>
            //   <Divider className="mt-4" />
            //   <Text
            //     as="p"
            //     sx={{
            //       fontSize: "14px",
            //       lineHeight: "20px",
            //       fontWeight: 500,
            //       letterSpacing: "-0.15px",
            //       color: "rightRailPermissions.darkText",
            //       my: "16px",
            //     }}
            //   >
            //     People with access
            //   </Text>
            //   {loadingColPerms ? (
            //     <Box
            //       display={"flex"}
            //       alignItems={"center"}
            //       justifyContent={"center"}
            //     >
            //       <BipLoader />
            //     </Box>
            //   ) : (
            //     <>
            //       <Box>
            //         {colPerms.map((perm) => (
            //           <CollectionUserPermission
            //             key={perm.id}
            //             item={perm}
            //             type={"permission"}
            //             onUpdatePermission={(
            //               updatedPermission: CollectionPermissionType
            //             ) => {
            //               const updPerms = colPerms.map((perm) =>
            //                 perm.id === updatedPermission.id
            //                   ? {
            //                       ...updatedPermission,
            //                       type: updatedPermission.role
            //                         ? "role"
            //                         : updatedPermission.member
            //                         ? "member"
            //                         : "",
            //                     }
            //                   : perm
            //               );
            //               setColPerms(updPerms);
            //             }}
            //             onRemovePermission={(
            //               permission: CollectionPermissionType
            //             ) => {
            //               setColPerms(
            //                 colPerms.filter(
            //                   (perm) => perm.id !== permission.id
            //                 )
            //               );
            //             }}
            //             haveCanvases={
            //               selectedCollection.computedRootCanvasCount > 0
            //             }
            //             collectionId={perm.collectionID}
            //           />
            //         ))}
            //       </Box>
            //       {filteredRolesForColPermission?.length === 0 &&
            //       filteredMembersForColPermission?.length === 0 ? null : (
            //         <>
            //           <ActionList.Divider sx={{ mt: "16px" }} />
            //           <Text
            //             as="p"
            //             sx={{
            //               fontSize: "14px",
            //               lineHeight: "20px",
            //               fontWeight: 500,
            //               letterSpacing: "-0.15px",
            //               color: "rightRailPermissions.darkText",
            //               my: "16px",
            //             }}
            //           >
            //             People without access
            //           </Text>
            //           <Box>
            //             {filteredRolesForColPermission.map((role) => (
            //               <CollectionUserPermission
            //                 key={role.id}
            //                 item={role}
            //                 type={"role"}
            //                 onCreatePermission={(
            //                   newPermission: CollectionPermissionType
            //                 ) => {
            //                   setColPerms([
            //                     { ...newPermission, type: "role" },
            //                     ...colPerms,
            //                   ]);
            //                 }}
            //                 haveCanvases={
            //                   selectedCollection.computedRootCanvasCount > 0
            //                 }
            //                 collectionId={selectedCollection.id}
            //               />
            //             ))}
            //             {filteredMembersForColPermission?.length ? (
            //               <InfiniteScroll
            //                 hasMore={membersSkip !== -1}
            //                 dataLength={
            //                   filteredMembersForColPermission.length
            //                 }
            //                 next={getNextPageMembers}
            //                 loader={<BipLoader />}
            //                 scrollableTarget={"box-3-container"}
            //               >
            //                 {filteredMembersForColPermission?.map(
            //                   (member) => (
            //                     <CollectionUserPermission
            //                       key={member.id}
            //                       item={member}
            //                       type={"member"}
            //                       onCreatePermission={(
            //                         newPermission: CollectionPermissionType
            //                       ) => {
            //                         setColPerms([
            //                           ...colPerms,
            //                           {
            //                             ...newPermission,
            //                             type: "member",
            //                           },
            //                         ]);
            //                       }}
            //                       haveCanvases={
            //                         selectedCollection.computedRootCanvasCount >
            //                         0
            //                       }
            //                       collectionId={selectedCollection.id}
            //                     />
            //                   )
            //                 )}
            //               </InfiniteScroll>
            //             ) : null}
            //           </Box>
            //         </>
            //       )}
            //     </>
            //   )}
            // </Box>
            null}
          </Box>
        </Box>
      ) : null}

      {canManageIntegrations && selectedTab === SETTINGS_TABS.integrations ? (
        <Box
          display={"flex"}
          flexDirection={"column"}
          width={"75%"}
          padding={"40px 32px 32px 32px"}
          bg={"studioSettings.box3"}
        >
          <Box>
            <Text
              as="p"
              ml={"6px"}
              fontWeight={600}
              mb={"16px"}
              fontSize={"20px"}
              lineHeight={"24px"}
            >
              Integrations
            </Text>
            <hr />
            <Box
              display={"flex"}
              mt={"30px"}
              justifyContent={"space-between"}
              mr={"20px"}
              mb={"12px"}
            >
              <Box display={"flex"}>
                <FaDiscord className="mt-1 mr-2 text-lg " color="#5865F2" />
                <Box display={"flex"} flexDirection={"column"}>
                  <Box
                    display="flex"
                    sx={{
                      mb: "5px",
                    }}
                    alignItems="center"
                  >
                    <Text
                      as="p"
                      ml={"6px"}
                      fontWeight={600}
                      fontSize={"14px"}
                      lineHeight={"20px"}
                      marginRight="10px"
                    >
                      Discord
                    </Text>
                    {integrations?.discordIntegrationStatus ===
                      IntegrationStatus.PENDING ||
                    integrations?.discordIntegrationStatus ===
                      IntegrationStatus.FAILED ? (
                      <Tooltip
                        aria-label={
                          integrations?.discordIntegrationStatus ===
                          IntegrationStatus.PENDING
                            ? "Integration In Progress, we will notify you once completed."
                            : "Discord integration failed, please retry after some time or chat with us."
                        }
                      >
                        <IntegrationStatusLabel
                          status={
                            integrations?.discordIntegrationStatus as IntegrationStatus
                          }
                        />
                      </Tooltip>
                    ) : null}
                  </Box>
                  <Text
                    as="p"
                    ml={"6px"}
                    mb={"16px"}
                    fontWeight={400}
                    fontSize={"12px"}
                    lineHeight={"18px"}
                  >
                    Integrate discord with Bip and manage your community
                    seamlessly
                  </Text>
                </Box>
              </Box>
              <div>
                <ToggleSwitch
                  aria-labelledby="switchLabel"
                  onClick={toggleDiscordSwitch}
                  disabled={
                    integrationsIsLoading.discord ||
                    integrations?.discordIntegrationStatus ===
                      IntegrationStatus.PENDING
                  }
                  loading={integrationsIsLoading.discord}
                  // onChange={distoggleDiscordSwitch}
                  checked={integrations?.discord}
                />
              </div>
            </Box>
            {integrations?.discord ? (
              <Box
                display={"flex"}
                mt={"4px"}
                justifyContent={"space-between"}
                mr={"20px"}
                mb={"12px"}
              >
                <Box display={"flex"} ml={"7px"}>
                  <Box display={"flex"} flexDirection={"column"} ml={"25px"}>
                    <Text
                      as="p"
                      fontWeight={600}
                      mb={"8px"}
                      fontSize={"14px"}
                      lineHeight={"20px"}
                    >
                      DM Notifications
                    </Text>
                    <Text
                      as="p"
                      mb={"16px"}
                      fontWeight={400}
                      fontSize={"12px"}
                      lineHeight={"18px"}
                    >
                      Notify users of important updates via DMs on Discord. For
                      ex. when you invite or mention someone on a bip canvas
                    </Text>
                  </Box>
                </Box>
                <div>
                  <ToggleSwitch
                    aria-labelledby="switchLabel"
                    // onChange={updateDmNotifStatus}
                    onClick={updateDmNotifStatusDiscord}
                    disabled={integrationsIsLoading.discordDm}
                    loading={integrationsIsLoading.discordDm}
                    checked={integrations?.discordDm}
                  />
                </div>
              </Box>
            ) : null}
            <hr />
            <Box
              display={"flex"}
              mt={"16px"}
              justifyContent={"space-between"}
              mr={"20px"}
              mb={"12px"}
            >
              <Box display={"flex"}>
                <div className="mt-1">
                  <SlackIcon />
                </div>
                <Box display={"flex"} flexDirection={"column"} ml={"9px"}>
                  <Box
                    display="flex"
                    sx={{
                      mb: "5px",
                    }}
                    alignItems="center"
                  >
                    <Text
                      as="p"
                      ml={"6px"}
                      fontWeight={600}
                      fontSize={"14px"}
                      marginRight="10px"
                    >
                      Slack
                    </Text>
                    {integrations?.slackIntegrationStatus ===
                      IntegrationStatus.PENDING ||
                    integrations?.slackIntegrationStatus ===
                      IntegrationStatus.FAILED ? (
                      <IntegrationStatusLabel
                        status={
                          integrations?.slackIntegrationStatus as IntegrationStatus
                        }
                      />
                    ) : null}
                  </Box>
                  <Text
                    as="p"
                    ml={"6px"}
                    mb={"16px"}
                    fontWeight={400}
                    fontSize={"12px"}
                    lineHeight={"18px"}
                  >
                    Integrate slack with Bip and manage your community
                    seamlessly
                  </Text>
                </Box>
              </Box>
              <div>
                <ToggleSwitch
                  aria-labelledby="switchLabel"
                  onClick={toggleSlackSwitch}
                  checked={integrations?.slack}
                  disabled={integrationsIsLoading.slack}
                  loading={integrationsIsLoading.slack}
                />
              </div>
            </Box>
            {integrations?.slack ? (
              <Box
                display={"flex"}
                mt={"4px"}
                justifyContent={"space-between"}
                mr={"20px"}
                mb={"12px"}
              >
                <Box display={"flex"} ml={"7px"}>
                  <Box display={"flex"} flexDirection={"column"} ml={"25px"}>
                    <Text
                      as="p"
                      fontWeight={600}
                      mb={"8px"}
                      fontSize={"14px"}
                      lineHeight={"20px"}
                    >
                      DM Notifications
                    </Text>
                    <Text
                      as="p"
                      mb={"16px"}
                      fontWeight={400}
                      fontSize={"12px"}
                      lineHeight={"18px"}
                    >
                      Notify users of important updates via DMs on Slack. For
                      ex. when you invite or mention someone on a bip canvas
                    </Text>
                  </Box>
                </Box>
                <div>
                  <ToggleSwitch
                    aria-labelledby="switchLabel"
                    // onChange={updateDmNotifStatus}
                    onClick={updateDmNotifStatusSlack}
                    disabled={integrationsIsLoading.slackDm}
                    loading={integrationsIsLoading.slackDm}
                    checked={integrations?.slackDm}
                  />
                </div>
              </Box>
            ) : null}
          </Box>
        </Box>
      ) : selectedTab === SETTINGS_TABS.general ? (
        <Box
          display={"flex"}
          flexDirection={"column"}
          width={"75%"}
          padding={"40px 32px 32px 32px"}
          bg={"studioSettings.box3"}
        >
          <Text as="p" fontWeight={600} fontSize={"20px"} lineHeight={"24px"}>
            General
          </Text>
          <Divider className="my-4" />
          <Box
            display={"flex"}
            mt={"20px"}
            justifyContent={"space-between"}
            mr={"20px"}
            mb={"12px"}
          >
            <Box display={"flex"}>
              <PersonAddIcon className="mt-1 mr-2 text-lg" />
              <Box display={"flex"} flexDirection={"column"}>
                <Box
                  display="flex"
                  sx={{
                    mb: "5px",
                  }}
                  alignItems="center"
                >
                  <Text
                    as="p"
                    ml={"6px"}
                    fontWeight={600}
                    fontSize={"14px"}
                    lineHeight={"20px"}
                    marginRight="10px"
                  >
                    {t("workspace.publicWorkspace")}
                  </Text>
                </Box>
                <Text
                  as="p"
                  ml={"6px"}
                  mb={"16px"}
                  fontWeight={400}
                  fontSize={"12px"}
                  lineHeight={"18px"}
                >
                  {t("workspace.joinMessage")}
                </Text>
              </Box>
            </Box>
            <div>
              <ToggleSwitch
                aria-labelledby="switchLabel"
                onClick={togglePublicSwitch}
                disabled={makingPublic}
                loading={integrationsIsLoading.discord}
                checked={currentStudio?.allowPublicMembership}
              />
            </div>
          </Box>
          <Divider className="my-4" />
          <Box display={"flex"} justifyContent={"space-between"} mt={"20px"}>
            <Box display={"flex"}>
              <TrashIcon mt={"5px"} />
              <Box display={"flex"} flexDirection={"column"} ml={"10px"}>
                <Text
                  as="p"
                  fontWeight={600}
                  fontSize={"14px"}
                  lineHeight={"24px"}
                >
                  {t("workspace.delete")}
                </Text>
                <Text
                  as="p"
                  fontWeight={400}
                  fontSize={"12px"}
                  lineHeight={"24px"}
                  mt={"4px"}
                >
                  {t("workspace.deleteAlert")}
                </Text>
              </Box>
            </Box>

            <Box mr={"20px"}>
              <Button variant="danger" onClick={handleDelete}>
                <Text
                  as="p"
                  fontWeight={600}
                  // color={"studioSettings.box3Styles.danger"}
                  fontSize={"12px"}
                  lineHeight={"18px"}
                >
                  Delete Forever
                </Text>
              </Button>
            </Box>
          </Box>
        </Box>
      ) : selectedTab === SETTINGS_TABS["pending requests"] ? (
        <Box
          display={"flex"}
          flexDirection={"column"}
          width={"75%"}
          padding={"40px 32px 32px 32px"}
          bg={"studioSettings.box3"}
          overflowY={"auto"}
        >
          <Text as="p" fontWeight={600} fontSize={"20px"} lineHeight={"24px"}>
            Pending Requests
          </Text>
          <Divider className="my-4" />
          {joinRequests.length ? (
            <Box display={"flex"} flexDirection={"column"} sx={{ gap: "16px" }}>
              {joinRequests.map((request) => (
                <Box
                  padding={"16px"}
                  borderRadius="12px"
                  borderWidth="1px"
                  borderColor={"userCard.border"}
                  borderStyle="solid"
                >
                  <Box
                    display={"flex"}
                    justifyContent={"space-between"}
                    alignItems={"flex-start"}
                  >
                    <Box display={"flex"}>
                      <Avatar
                        sx={{
                          height: "48px",
                          width: "48px",
                          flexShrink: 0,
                        }}
                        size={48}
                        src={request.user.avatarUrl || DEFAULT_USER_PLACEHOLDER}
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null; // prevents looping
                          currentTarget.src = DEFAULT_USER_PLACEHOLDER;
                        }}
                      />
                      <LinkWithoutPrefetch
                        href={BipRouteUtils.getProfileRoute(
                          request.user.username
                        )}
                      >
                        <Box ml={"16px"} sx={{ cursor: "pointer" }}>
                          <Text
                            as="p"
                            color={"userCard.text.username"}
                            fontWeight={600}
                            fontSize="16px"
                            lineHeight={"24px"}
                            sx={{
                              whiteSpace: "initial",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {request.user.fullName || request.user.username}
                          </Text>
                          <Text
                            color="userCard.text.handle"
                            fontWeight={400}
                            fontSize="14px"
                            lineHeight={"20px"}
                            as="p"
                          >
                            @{request.user.username}
                          </Text>
                        </Box>
                      </LinkWithoutPrefetch>
                    </Box>
                    <Box display={"flex"} sx={{ gap: "16px" }}>
                      <Box
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                          acceptRequest(request);
                        }}
                      >
                        <CheckCircleIcon
                          color={Colors.green["600"]}
                          size="medium"
                        />
                      </Box>
                      <Box
                        sx={{ cursor: "pointer" }}
                        onClick={() => {
                          rejectRequest(request);
                        }}
                      >
                        <XCircleIcon color={Colors.red["600"]} size="medium" />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Text as="p">No Pending Requests</Text>
            </Box>
          )}
        </Box>
      ) : null}
      {popup ? (
        <ConfirmationDialog
          title={
            <div className="flex">
              <TrashIcon mt={"3px"} mr={"10px"} />
              <div className="text-sm">{t("workspace.delete")}?</div>
            </div>
          }
          confirmButtonType="danger"
          confirmButtonContent="Delete Forever"
          onClose={handleCloseConfirmation}
        >
          <div className="ml-1">This action is irreversible</div>
        </ConfirmationDialog>
      ) : null}
      {deleteConfRole ? (
        <ConfirmationDialog
          title={
            <div className="flex">
              <TrashIcon mt={"3px"} mr={"10px"} />
              <div className="text-sm">
                Delete &apos;{deleteConfRole?.name}&apos; Role?
              </div>
            </div>
          }
          confirmButtonType="danger"
          confirmButtonContent="Delete"
          onClose={handleDeleteRoleConfirmation}
        >
          <ActionList.Divider sx={{ marginTop: "0px" }} />
          <div className="ml-1">
            Both the role and its settings will be deleted. This action cannot
            be undone.
          </div>
        </ConfirmationDialog>
      ) : null}
      {deleteMembersPopup ? (
        <ConfirmationDialog
          title={
            <div className="flex">
              <TrashIcon mt={"3px"} mr={"10px"} />
              <div className="text-sm">{t("workspace.removeMember")}</div>
            </div>
          }
          confirmButtonType="danger"
          confirmButtonContent="Delete"
          onClose={handleClose}
        >
          <ActionList.Divider sx={{ marginTop: "0px" }} />
          <div className="ml-1">{t("workspace.confirmRemoveMember")}</div>
        </ConfirmationDialog>
      ) : null}
    </div>
  );
};

export default Settings;
