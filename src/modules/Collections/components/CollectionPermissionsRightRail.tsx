import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  IconButton,
  Text,
  TextInput,
  UnderlineNav,
} from "@primer/react";
import {
  ChevronLeftIcon,
  CommentIcon,
  CopyIcon,
  EyeIcon,
  GlobeIcon,
  LockIcon,
  PencilIcon,
  PersonAddIcon,
  SearchIcon,
  XIcon,
} from "@primer/styled-octicons";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { useToasts } from "react-toast-notifications";
import BipLoader from "../../../components/BipLoader";
import { usePermissions } from "../../../context/permissionContext";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import { getPublicAccessDescription } from "../../Canvas/components/CanvasPublicAccessOverlay";
import RightRailContainer from "../../Canvas/components/RightRailContainer";
import CollectionPublicAccessOverlay from "../../Canvas/components/CollectionPublicAccessOverlay";
import { BranchAccessEnum } from "../../Canvas/enums";
import { CollectionPermissionGroupEnum } from "../../Permissions/enums";
import StudioService from "../../Studio/services";
import { Member } from "../../Studio/types";
import CollectionService from "../services";
import {
  CollectionDataType,
  CollectionPermissionType,
  RoleType,
} from "../types";
import CollectionUserPermission from "../../Permissions/components/CollectionUserPermission";
import InfiniteScroll from "react-infinite-scroll-component";
import DropDownItem from "../../../components/DropdownItem";

const getPublicAccessIcon = (publicAccess: BranchAccessEnum) => {
  switch (publicAccess) {
    case BranchAccessEnum.PRIVATE:
      return <LockIcon />;
    case BranchAccessEnum.VIEW:
      return <EyeIcon />;
    case BranchAccessEnum.COMMENT:
      return <CommentIcon />;
    case BranchAccessEnum.EDIT:
      return <PencilIcon />;
    default:
      return null;
  }
};

interface ICollectionRightRailProps {
  closeHandler: () => void;
  ignoredRefs: any[];
  currentCollection: CollectionDataType | null;
}

const CollectionPermissionRightRail: FC<ICollectionRightRailProps> = (
  props
) => {
  const { closeHandler, ignoredRefs, currentCollection } = props;
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const { currentStudio } = useStudio();
  const { isLoggedIn } = useUser();
  const router = useRouter();
  const { inheritDialogOpen } = usePermissions();
  const { collection, handle } = router.query;

  const [roles, setRoles] = useState((): RoleType[] => []);
  const [members, setMembers] = useState((): Member[] => []);
  const [membersSkip, setMembersSkip] = useState(0);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [colPerms, setColPerms] = useState(
    (): CollectionPermissionType[] => []
  );
  const [loading, setLoading] = useState(false);
  const [showInviteUsers, setShowInviteUsers] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [searchedMembers, setSearchedMembers] = useState((): Member[] => []);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [showRolesWithAccess, setShowRolesWithAccess] =
    useState<boolean>(false);
  const [showMembersWithAccess, setShowMembersWithAccess] =
    useState<boolean>(false);

  const [showRolesWithoutAccess, setShowRolesWithoutAccess] =
    useState<boolean>(false);
  const [showMembersWithoutAccess, setShowMembersWithoutAccess] =
    useState<boolean>(false);

  const publicAccessRef = useRef(null);
  const [openPublicAccessOverlay, setOpenPublicAccessOverlay] = useState(false);

  const isModerator =
    currentCollection?.permission === CollectionPermissionGroupEnum.MODERATE;

  const rolePermissions = useMemo(() => {
    return colPerms.filter((perm) => perm.roleID !== null);
  }, [colPerms]);

  const memberPermissions = useMemo(() => {
    return colPerms.filter((perm) => perm.memberID !== null);
  }, [colPerms]);

  useEffect(() => {
    setLoading(true);
    if (collection && currentStudio?.handle === handle) {
      const promise1 = StudioService.getStudioRoles();
      const promise2 = StudioService.getStudioMembers();
      const promise3 = CollectionService.getCollectionPermissions(
        collection as string
      );
      Promise.all([promise1, promise2, promise3])
        .then((responses) => {
          const roles = responses[0]?.data?.data || [];
          const members = responses[1]?.data?.data || [];
          const memSkip = responses[1]?.data?.next || -1;
          const permissions: CollectionPermissionType[] =
            responses[2]?.data?.data || [];
          setRoles(roles);
          setMembers(members);
          setMembersSkip(parseInt(memSkip));
          setColPerms(
            permissions.filter(
              (perm) =>
                perm.permissionGroup !==
                  CollectionPermissionGroupEnum.VIEW_METADATA &&
                perm.permissionGroup !== CollectionPermissionGroupEnum.NONE
            )
          );
          setLoading(false);
        })
        .catch((err) => {
          addToast("Something went wrong. Please try again!", {
            appearance: "error",
            autoDismiss: true,
          });
          setLoading(false);
        });
    }
  }, [currentStudio?.handle, collection]);

  const getNextPageMembers = () => {
    if (loadingMembers) return;
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

  const searchHandler = async (e: any) => {
    setInputValue(e.target.value);
    if (e.target.value.length >= 3) {
      setSearchKey(e.target.value);
    }
  };

  const searchStudioMembers = () => {
    setLoadingSearch(true);
    StudioService.searchStudioMembers(searchKey)
      .then((r) => {
        setSearchedMembers(r?.data?.data || []);
        setLoadingSearch(false);
      })
      .catch((err) => {
        setLoadingSearch(false);
      });
  };

  useEffect(() => {
    if (searchKey.length >= 3) {
      searchStudioMembers();
    }
  }, [searchKey]);

  const copyCurrentCollectionLink = () => {
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

  const filteredRoles = useMemo(() => {
    return roles.filter(
      (role) => colPerms.findIndex((perm) => perm.roleID === role.id) === -1
    );
  }, [roles, colPerms]);

  const filteredMembers = useMemo(() => {
    return members.filter(
      (member) =>
        colPerms.findIndex((perm) => perm.memberID === member.id) === -1
    );
  }, [members, colPerms]);

  const searchedRoles = useMemo(() => {
    if (searchKey.length >= 3) {
      return filteredRoles.filter((role) =>
        role.name.toLowerCase().includes(searchKey.toLowerCase())
      );
    }
    return [];
  }, [searchKey, filteredRoles]);

  const filteredSearchedMembers = useMemo(() => {
    return searchedMembers.filter(
      (member) =>
        colPerms.findIndex((perm) => perm.memberID === member.id) === -1
    );
  }, [searchedMembers, colPerms]);

  const handleUpdatePermission = (
    updatedPermission: CollectionPermissionType
  ) => {
    const updPerms = colPerms.map((perm) =>
      perm.id === updatedPermission.id
        ? {
            ...updatedPermission,
          }
        : perm
    );
    setColPerms(updPerms);
  };

  const handleRemovePermission = (permission: CollectionPermissionType) => {
    setColPerms(colPerms.filter((perm) => perm.id !== permission.id));
  };

  useEffect(() => {
    if (
      filteredMembers.length < 20 &&
      membersSkip > 0 &&
      inputValue.length < 3
    ) {
      getNextPageMembers();
    }
  }, [filteredMembers]);

  return (
    <RightRailContainer
      onClickOutSideRightRail={closeHandler}
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
      {loading || !currentCollection ? (
        <BipLoader />
      ) : (
        <Box
          className="px-4 pt-2 space-y-4"
          id={"content-container"}
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflowY: "auto",
          }}
        >
          {showInviteUsers ? (
            <>
              <div className="flex items-center">
                <IconButton
                  icon={ChevronLeftIcon}
                  sx={{
                    color: "text.subtle",
                  }}
                  size={"small"}
                  variant="invisible"
                  onClick={() => setShowInviteUsers(false)}
                />
                <Text fontWeight="bold" fontSize={14}>
                  {t("rightrail.back")}
                </Text>
              </div>
              <UnderlineNav
                aria-label="Main"
                sx={{ mb: "16px", border: "none" }}
              >
                <UnderlineNav.Link
                  as="button"
                  selected={true}
                  sx={{
                    padding: "12px",
                    pt: "0px",
                    borderBottomColor: "#0366D6 !important",
                  }}
                >
                  {t("rightrail.inviteUsers")}
                </UnderlineNav.Link>
              </UnderlineNav>
              <TextInput
                leadingVisual={() => <SearchIcon />}
                placeholder="Search workspace members"
                onChange={searchHandler}
                value={inputValue}
                sx={{
                  borderWidth: 1,
                  borderStyle: "solid",
                }}
                trailingAction={
                  searchKey?.length ? (
                    <TextInput.Action
                      onClick={() => {
                        setInputValue("");
                        setSearchKey("");
                      }}
                      icon={() => <XIcon size={"small"} />}
                      aria-label="Clear search"
                      sx={{ color: "fg.subtle", py: "0px" }}
                    />
                  ) : (
                    <></>
                  )
                }
              />
              <ActionList.Divider />
              {inputValue?.length < 3 ? (
                <>
                  <Box>
                    <DropDownItem
                      title="ROLES"
                      count={filteredRoles.length}
                      opened={showRolesWithAccess}
                      onClick={() => {
                        setShowRolesWithAccess(!showRolesWithAccess);
                      }}
                    />
                    <Box marginLeft={"10px"}>
                      {showRolesWithAccess &&
                        filteredRoles.map((role) => (
                          <CollectionUserPermission
                            key={role.id}
                            item={role}
                            type={"role"}
                            onCreatePermission={(
                              newPermission: CollectionPermissionType
                            ) => {
                              setColPerms([{ ...newPermission }, ...colPerms]);
                            }}
                            haveCanvases={
                              currentCollection.computedRootCanvasCount > 0
                            }
                            collectionId={currentCollection.id}
                            disabled={!isModerator}
                            fromRightRail={true}
                          />
                        ))}
                    </Box>
                  </Box>

                  <Box>
                    <DropDownItem
                      title="WORKSPACE MEMBERS"
                      count={
                        currentStudio?.membersCount
                          ? currentStudio.membersCount -
                              memberPermissions.length >
                            0
                            ? currentStudio.membersCount -
                              memberPermissions.length
                            : filteredMembers.length
                          : filteredMembers.length
                      }
                      opened={showMembersWithAccess}
                      onClick={() => {
                        setShowMembersWithAccess(!showMembersWithAccess);
                      }}
                    />
                    {showMembersWithAccess && filteredMembers?.length ? (
                      <Box marginLeft={"10px"}>
                        <InfiniteScroll
                          hasMore={membersSkip !== -1}
                          dataLength={filteredMembers.length}
                          next={getNextPageMembers}
                          loader={""}
                          scrollableTarget={"content-container"}
                        >
                          {filteredMembers.map((member) => (
                            <CollectionUserPermission
                              key={member.id}
                              item={member}
                              type={"member"}
                              onCreatePermission={(
                                newPermission: CollectionPermissionType
                              ) => {
                                setColPerms([
                                  ...colPerms,
                                  { ...newPermission },
                                ]);
                              }}
                              haveCanvases={
                                currentCollection.computedRootCanvasCount > 0
                              }
                              collectionId={currentCollection.id}
                              disabled={!isModerator}
                              fromRightRail={true}
                            />
                          ))}
                        </InfiniteScroll>
                      </Box>
                    ) : null}
                  </Box>

                  {loadingMembers ? (
                    <div className="flex items-center justify-center p-4">
                      <BipLoader />
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  {loadingSearch ? (
                    <div className="flex items-center justify-center p-4">
                      <BipLoader />
                    </div>
                  ) : searchedRoles.length === 0 &&
                    filteredSearchedMembers.length === 0 ? (
                    <Text as="p" textAlign={"center"} mt={"16px"}>
                      No results found
                    </Text>
                  ) : (
                    <>
                      <Box>
                        <DropDownItem
                          title="ROLES"
                          count={searchedRoles.length}
                          opened={showRolesWithoutAccess}
                          onClick={() => {
                            setShowRolesWithoutAccess(!showRolesWithoutAccess);
                          }}
                        />
                        <Box marginLeft={"10px"}>
                          {showRolesWithoutAccess &&
                            searchedRoles.map((role) => (
                              <CollectionUserPermission
                                key={role.id}
                                item={role}
                                type={"role"}
                                onCreatePermission={(
                                  newPermission: CollectionPermissionType
                                ) => {
                                  setColPerms([
                                    { ...newPermission },
                                    ...colPerms,
                                  ]);
                                }}
                                haveCanvases={
                                  currentCollection.computedRootCanvasCount > 0
                                }
                                collectionId={currentCollection.id}
                                disabled={!isModerator}
                                fromRightRail={true}
                              />
                            ))}
                        </Box>
                      </Box>
                      <Box>
                        <DropDownItem
                          title="WORKSPACE MEMBERS"
                          count={filteredSearchedMembers.length}
                          opened={showMembersWithoutAccess}
                          onClick={() => {
                            setShowMembersWithoutAccess(
                              !showMembersWithoutAccess
                            );
                          }}
                        />
                        {showMembersWithoutAccess &&
                          filteredSearchedMembers.map((member) => (
                            <CollectionUserPermission
                              key={member.id}
                              item={member}
                              type={"member"}
                              onCreatePermission={(
                                newPermission: CollectionPermissionType
                              ) => {
                                setColPerms([
                                  ...colPerms,
                                  { ...newPermission },
                                ]);
                              }}
                              haveCanvases={
                                currentCollection.computedRootCanvasCount > 0
                              }
                              collectionId={currentCollection.id}
                              disabled={!isModerator}
                              fromRightRail={true}
                            />
                          ))}
                      </Box>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
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
                  onClick={copyCurrentCollectionLink}
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
                      {currentCollection?.publicAccess ===
                      BranchAccessEnum.PRIVATE
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
                      {currentCollection
                        ? t(
                            getPublicAccessDescription(
                              currentCollection?.publicAccess as BranchAccessEnum
                            )
                          )
                        : ""}
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
                        {getPublicAccessIcon(
                          currentCollection.publicAccess as BranchAccessEnum
                        )}
                      </ActionMenu.Button>
                      <ActionMenu.Overlay
                        hidden={!isModerator}
                        align="end"
                        sx={{ bg: "canvasPublicAccessOverlay.bg" }}
                        onClickOutside={(e) => {
                          if (inheritDialogOpen) {
                          } else {
                            setOpenPublicAccessOverlay(false);
                          }
                        }}
                      >
                        <CollectionPublicAccessOverlay
                          id={currentCollection.id}
                          name={currentCollection.name}
                          computedRootCanvasCount={
                            currentCollection.computedRootCanvasCount
                          }
                          publicAccess={currentCollection.publicAccess}
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
                      {getPublicAccessIcon(
                        currentCollection?.publicAccess as BranchAccessEnum
                      )}
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
                    onClick={(e: any) => {
                      setShowInviteUsers(true);
                    }}
                  >
                    {t("rightrail.inviteUsers")}
                  </Button>
                )}
              </Box>
              <Box>
                <DropDownItem
                  title="ROLES"
                  count={rolePermissions.length}
                  opened={showRolesWithoutAccess}
                  onClick={() => {
                    setShowRolesWithoutAccess(!showRolesWithoutAccess);
                  }}
                />
                {showRolesWithoutAccess && (
                  <Box marginLeft={"10px"} marginTop="10px">
                    {rolePermissions.map((perm) => (
                      <CollectionUserPermission
                        key={perm.id}
                        item={perm}
                        type={"permission"}
                        onUpdatePermission={handleUpdatePermission}
                        onRemovePermission={handleRemovePermission}
                        haveCanvases={
                          currentCollection
                            ? currentCollection?.computedRootCanvasCount > 0
                            : false
                        }
                        collectionId={perm.collectionID}
                        disabled={!isModerator}
                        fromRightRail={true}
                      />
                    ))}
                  </Box>
                )}
              </Box>
              <Box>
                <DropDownItem
                  title="WORKSPACE MEMBERS"
                  count={memberPermissions.length}
                  opened={showMembersWithoutAccess}
                  onClick={() => {
                    setShowMembersWithoutAccess(!showMembersWithoutAccess);
                  }}
                />
                {showMembersWithoutAccess && (
                  <Box marginLeft={"10px"} marginTop="10px">
                    {memberPermissions.map((perm) => (
                      <CollectionUserPermission
                        key={perm.id}
                        item={perm}
                        type={"permission"}
                        onUpdatePermission={handleUpdatePermission}
                        onRemovePermission={handleRemovePermission}
                        haveCanvases={
                          currentCollection
                            ? currentCollection?.computedRootCanvasCount > 0
                            : false
                        }
                        collectionId={perm.collectionID}
                        disabled={!isModerator}
                        fromRightRail={true}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      )}
    </RightRailContainer>
  );
};

export default CollectionPermissionRightRail;
