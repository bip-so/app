import { ActionMenu, Box, Text, TextInput } from "@primer/react";
import { FC, useEffect, useMemo, useState } from "react";
import BipLoader from "../../../components/BipLoader";
import {
  CollectionDataType,
  CollectionPermissionType,
  RoleType,
} from "../../Collections/types";
import { Member as MemberType } from "../../Studio/types";
import CollectionUserPermission from "../../Permissions/components/CollectionUserPermission";
import InfiniteScroll from "react-infinite-scroll-component";
import CollectionService from "../../Collections/services";
import { CollectionPermissionGroupEnum } from "../../Permissions/enums";
import StyledTextInput from "../../../components/StyledTextInput";
import { SearchIcon } from "@primer/octicons-react";
import DropDownItem from "../../../components/DropdownItem";
import { Divider } from "../../../components/TableOfContents/styledComponents";
import StudioService from "../services";
import { GlobeIcon, XIcon } from "@primer/styled-octicons";
import { BranchAccessEnum } from "../../Canvas/enums";
import { useTranslation } from "next-i18next";
import { getPublicAccessDescription } from "../../Canvas/components/CanvasPublicAccessOverlay";
import CollectionPublicAccessOverlay, {
  getPublicAccessIcon,
} from "../../Canvas/components/CollectionPublicAccessOverlay";
import { useStudio } from "../../../context/studioContext";

interface ICollectionSettingsProps {
  collection: CollectionDataType;
  roles: RoleType[];
  members: MemberType[];
  getNextPageMembers: Function;
  membersSkip: number;
  updateCollection: (collection: CollectionDataType) => void;
}

const CollectionSettings: FC<ICollectionSettingsProps> = ({
  collection,
  roles,
  members,
  getNextPageMembers,
  membersSkip,
  updateCollection,
}) => {
  const [loading, setLoading] = useState(false);
  const [openPublicAccessOverlay, setOpenPublicAccessOverlay] = useState(false);

  const [showRolesWithAccess, setShowRolesWithAccess] =
    useState<boolean>(false);
  const [showMembersWithAccess, setShowMembersWithAccess] =
    useState<boolean>(false);

  const [showRolesWithoutAccess, setShowRolesWithoutAccess] =
    useState<boolean>(false);
  const [showMembersWithoutAccess, setShowMembersWithoutAccess] =
    useState<boolean>(false);

  const [permissions, setPermissions] = useState(
    (): CollectionPermissionType[] => []
  );

  const [searchKey, setSearchKey] = useState("");
  const [searchedMembers, setSearchedMembers] = useState(
    (): MemberType[] => []
  );
  const { currentStudio } = useStudio();

  const { t } = useTranslation();

  const rolesWithAccess = useMemo(() => {
    const rolePerms = permissions.filter((perm) => perm.roleID !== null);
    if (searchKey.length >= 3) {
      return rolePerms.filter((perm) =>
        perm.role?.name.toLowerCase().includes(searchKey.toLowerCase())
      );
    }
    return rolePerms;
  }, [permissions, searchKey]);

  const membersWithAccess = useMemo(() => {
    const memberPerms = permissions.filter((perm) => perm.memberID !== null);
    if (searchKey.length >= 3) {
      return memberPerms.filter((perm) =>
        perm.member?.user?.fullName
          .toLowerCase()
          .includes(searchKey.toLowerCase())
      );
    }
    return memberPerms;
  }, [permissions, searchKey]);

  const filteredRolesForColPermission = useMemo(() => {
    const rolesForColPermission = roles.filter(
      (role) => permissions.findIndex((perm) => perm.roleID === role.id) === -1
    );
    if (searchKey.length >= 3) {
      return rolesForColPermission.filter((role) =>
        role.name.toLowerCase().includes(searchKey.toLowerCase())
      );
    }
    return rolesForColPermission;
  }, [roles, permissions, searchKey]);

  const filteredMembersForColPermission = useMemo(() => {
    return members.filter(
      (member) =>
        permissions.findIndex((perm) => perm.memberID === member.id) === -1
    );
  }, [members, permissions]);

  const filteredSearchedMembersForColPermission = useMemo(() => {
    return searchedMembers.filter(
      (member) =>
        permissions.findIndex((perm) => perm.memberID === member.id) === -1
    );
  }, [searchedMembers, permissions]);

  useEffect(() => {
    if (
      filteredMembersForColPermission.length < 20 &&
      membersSkip > 0 &&
      searchKey.length < 3
    ) {
      getNextPageMembers();
    }
  }, [filteredMembersForColPermission]);

  const getCollectionPermissions = (colId: number) => {
    setLoading(true);
    CollectionService.getCollectionPermissions(colId)
      .then((r) => {
        const perms: CollectionPermissionType[] = r?.data?.data || [];

        setPermissions(
          perms.filter(
            (perm) =>
              perm.permissionGroup !==
                CollectionPermissionGroupEnum.VIEW_METADATA &&
              perm.permissionGroup !== CollectionPermissionGroupEnum.NONE
          )
        );
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  //   const getSearchedMembers = async (search: string) => {
  //     try {
  //       const r = await StudioService.searchStudioMembers(search);
  //       const newMembers = r?.data?.data || [];
  //       searchedMembers.current = newMembers
  //         .filter((member) => !member.isRemoved)
  //         .map((member) => {
  //           return { ...member.user, type: "user" };
  //         });
  //     } catch (err) {}
  //   };

  const handleUpdatePermission = (
    updatingPermission: CollectionPermissionType
  ) => {
    const updPerms = permissions.map((perm) =>
      perm.id === updatingPermission.id
        ? {
            ...updatingPermission,
            type: updatingPermission.role
              ? "role"
              : updatingPermission.member
              ? "member"
              : "",
          }
        : perm
    );
    setPermissions(updPerms);
  };

  const handleRemovePermission = (
    removingPermission: CollectionPermissionType
  ) => {
    setPermissions(
      permissions.filter((perm) => perm.id !== removingPermission.id)
    );
  };

  const handleCreatePermission = (
    newPermission: CollectionPermissionType,
    type: "role" | "member"
  ) => {
    setPermissions([
      ...permissions,
      {
        ...newPermission,
        type,
      },
    ]);
  };

  useEffect(() => {
    getCollectionPermissions(collection.id);
  }, [collection?.id]);

  const searchStudioMembers = () => {
    setLoading(true);
    StudioService.searchStudioMembers(searchKey)
      .then((r) => {
        setSearchedMembers(r?.data?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (searchKey.length >= 3) {
      searchStudioMembers();
    }
  }, [searchKey]);

  const searchHandler = async (e: any) => {
    setSearchKey(e.target.value);
  };

  return (
    <Box display={"flex"} flexDirection={"column"}>
      <Text as="p" fontWeight={600} fontSize={"16px"} line-height={"24px"}>
        {collection.name}
      </Text>
      <Divider className="my-4" />

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
              {collection?.publicAccess === BranchAccessEnum.PRIVATE
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
              {t(
                getPublicAccessDescription(
                  collection?.publicAccess as BranchAccessEnum
                )
              )}
            </Text>
          </div>
        </div>
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
              bg: "transparent",
            }}
          >
            {getPublicAccessIcon(collection.publicAccess as BranchAccessEnum)}
          </ActionMenu.Button>
          <ActionMenu.Overlay
            align="end"
            sx={{ bg: "canvasPublicAccessOverlay.bg" }}
          >
            <CollectionPublicAccessOverlay
              id={collection.id}
              name={collection.name}
              computedRootCanvasCount={collection.computedRootCanvasCount}
              publicAccess={collection.publicAccess}
              onUpdate={(publicAccess) => {
                updateCollection({ ...collection, publicAccess });
              }}
              showVisibilityMenu={setOpenPublicAccessOverlay}
            />
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>

      <TextInput
        leadingVisual={() => <SearchIcon />}
        placeholder="Search workspace members"
        onChange={searchHandler}
        value={searchKey}
        sx={{
          borderWidth: 1,
          borderStyle: "solid",
          mb: "16px",
        }}
        trailingAction={
          searchKey?.length ? (
            <TextInput.Action
              onClick={() => {
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

      {loading ? (
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
          <BipLoader />
        </Box>
      ) : (
        <>
          <Text
            as="p"
            sx={{
              fontSize: "14px",
              lineHeight: "20px",
              fontWeight: 500,
              letterSpacing: "-0.15px",
              color: "rightRailPermissions.darkText",
              my: "16px",
            }}
          >
            People with access
          </Text>
          <Box>
            <DropDownItem
              title="ROLES"
              count={rolesWithAccess.length}
              opened={showRolesWithAccess}
              onClick={() => {
                setShowRolesWithAccess(!showRolesWithAccess);
              }}
            />

            {showRolesWithAccess && (
              <Box
                sx={{
                  marginLeft: "10px",
                }}
              >
                {rolesWithAccess.map((perm) => (
                  <CollectionUserPermission
                    key={perm.id}
                    item={perm}
                    type={"permission"}
                    onUpdatePermission={handleUpdatePermission}
                    onRemovePermission={handleRemovePermission}
                    haveCanvases={collection.computedRootCanvasCount > 0}
                    collectionId={perm.collectionID}
                  />
                ))}
              </Box>
            )}
          </Box>
          <Box>
            <DropDownItem
              title="WORKSPACE MEMBERS"
              count={membersWithAccess.length}
              opened={showMembersWithAccess}
              onClick={() => {
                setShowMembersWithAccess(!showMembersWithAccess);
              }}
            />

            {showMembersWithAccess && (
              <Box
                sx={{
                  marginLeft: "10px",
                }}
              >
                {membersWithAccess.map((perm) => (
                  <CollectionUserPermission
                    key={perm.id}
                    item={perm}
                    type={"permission"}
                    onUpdatePermission={handleUpdatePermission}
                    onRemovePermission={handleRemovePermission}
                    haveCanvases={collection.computedRootCanvasCount > 0}
                    collectionId={perm.collectionID}
                  />
                ))}
              </Box>
            )}
          </Box>
          <Divider className="my-4" />
          {filteredRolesForColPermission?.length === 0 &&
          filteredMembersForColPermission?.length === 0 ? null : (
            <>
              <Text
                as="p"
                sx={{
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: 500,
                  letterSpacing: "-0.15px",
                  color: "rightRailPermissions.darkText",
                  my: "16px",
                }}
              >
                People without access
              </Text>
              <Box>
                <DropDownItem
                  title="ROLES"
                  count={filteredRolesForColPermission.length}
                  opened={showRolesWithoutAccess}
                  onClick={() => {
                    setShowRolesWithoutAccess(!showRolesWithoutAccess);
                  }}
                />
                <Box
                  sx={{
                    marginLeft: "10px",
                  }}
                >
                  {showRolesWithoutAccess &&
                    filteredRolesForColPermission.map((role) => (
                      <CollectionUserPermission
                        key={role.id}
                        item={role}
                        type={"role"}
                        onCreatePermission={(
                          newPermission: CollectionPermissionType
                        ) => {
                          handleCreatePermission(newPermission, "role");
                        }}
                        haveCanvases={collection.computedRootCanvasCount > 0}
                        collectionId={collection.id}
                      />
                    ))}
                </Box>
              </Box>
              <Box>
                <DropDownItem
                  title="WORKSPACE MEMBERS"
                  count={
                    searchKey.length >= 3
                      ? filteredSearchedMembersForColPermission.length
                      : currentStudio?.membersCount
                      ? currentStudio.membersCount - membersWithAccess.length >
                        0
                        ? currentStudio.membersCount - membersWithAccess.length
                        : filteredMembersForColPermission.length
                      : filteredMembersForColPermission.length
                  }
                  opened={showMembersWithoutAccess}
                  onClick={() => {
                    setShowMembersWithoutAccess(!showMembersWithoutAccess);
                  }}
                />
                {showMembersWithoutAccess && (
                  <Box
                    sx={{
                      marginLeft: "10px",
                    }}
                  >
                    {/* <StyledTextInput
                      leadingVisual={SearchIcon}
                      placeholder={"Search members"}
                      value={searchText}
                      sx={{
                        marginTop: "10px",
                        ":focus-within": {
                          border: "none",
                        },
                      }}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                      }}
                    /> */}
                    {searchKey.length >= 3 ? (
                      filteredSearchedMembersForColPermission?.map((member) => (
                        <CollectionUserPermission
                          key={member.id}
                          item={member}
                          type={"member"}
                          onCreatePermission={(
                            newPermission: CollectionPermissionType
                          ) => {
                            handleCreatePermission(newPermission, "member");
                          }}
                          haveCanvases={collection.computedRootCanvasCount > 0}
                          collectionId={collection.id}
                        />
                      ))
                    ) : filteredMembersForColPermission?.length ? (
                      <InfiniteScroll
                        hasMore={membersSkip !== -1}
                        dataLength={filteredMembersForColPermission.length}
                        next={() => getNextPageMembers()}
                        loader={<BipLoader />}
                        scrollableTarget={"box-3-container"}
                      >
                        {filteredMembersForColPermission?.map((member) => (
                          <CollectionUserPermission
                            key={member.id}
                            item={member}
                            type={"member"}
                            onCreatePermission={(
                              newPermission: CollectionPermissionType
                            ) => {
                              handleCreatePermission(newPermission, "member");
                            }}
                            haveCanvases={
                              collection.computedRootCanvasCount > 0
                            }
                            collectionId={collection.id}
                          />
                        ))}
                      </InfiniteScroll>
                    ) : null}
                  </Box>
                )}
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default CollectionSettings;
