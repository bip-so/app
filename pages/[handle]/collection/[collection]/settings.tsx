import React, { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BipPage } from "../../../../src/commons/types";
import StudioLayout from "../../../../src/layouts/StudioLayout/StudioLayout";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  Text,
} from "@primer/react";
import { useToasts } from "react-toast-notifications";
import StudioService from "../../../../src/modules/Studio/services";
import CollectionService from "../../../../src/modules/Collections/services";
import { CreateOrUpdatePermissionType } from "../../../../src/modules/Collections/types";
import { ArrowLeftIcon } from "@primer/styled-octicons";
import { CheckIcon } from "@primer/octicons-react";
import { HandleWrapper } from "../../../../src/hooks/useHandle";

const CollectionPermissionsPage: BipPage = () => {
  const router = useRouter();
  const { collection } = router.query;
  const { addToast } = useToasts();

  const [roles, setRoles] = useState((): any => []);
  const [members, setMembers] = useState([]);
  const [permissions, setPermissions] = useState((): any => []);
  const [permissionsSchema, setPermissionsSchema] = useState([]);

  const [selectedPermission, setSelectedPermission] = useState((): any => null);
  const [selectedPg, setSelectedPg] = useState((): any => null);
  const [showCreatePerm, setShowCreatePerm] = useState(false);
  const [itemCheckedForPerm, setItemCheckedForPerm] = useState("member");
  const [roleSelectedForPerm, setRoleSelectedFormPerm] = useState(
    (): any => null
  );
  const [memberSelectedForPerm, setMemberSelectedForPerm] = useState(
    (): any => null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (collection) {
      const promise1 = StudioService.getStudioRoles();
      const promise2 = StudioService.getStudioMembers();
      const promise3 = CollectionService.getCollectionPermissions(
        collection as string
      );
      const promise4 = CollectionService.getPermissionsSchema();
      Promise.all([promise1, promise2, promise3, promise4])
        .then((responses) => {
          const roles = responses[0]?.data?.data || [];
          const members = responses[1]?.data?.data || [];
          const permissions = responses[2]?.data?.data || [];
          const schema = responses[3]?.data?.permissionGroups || [];
          setRoles(roles);
          setMembers(members);
          setPermissions(permissions);
          setPermissionsSchema(schema);
          if (permissions?.length) {
            setSelectedPermission(permissions[0]);
          }
        })
        .catch((err) => {
          addToast("Something went wrong. Please try again!", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  }, [collection]);

  const resetPermsData = () => {
    setShowCreatePerm(false);
    setSelectedPg(null);
    setItemCheckedForPerm("member");
    setRoleSelectedFormPerm(null);
    setMemberSelectedForPerm(null);
  };

  const createCollectionPermission = () => {
    setLoading(true);
    const data: CreateOrUpdatePermissionType = {
      permGroup: selectedPg?.systemName,
      collectionId: parseInt(collection as string),
      isOverridden: false,
    };
    if (itemCheckedForPerm === "member") {
      data["memberID"] = memberSelectedForPerm.id;
    } else {
      data["roleID"] = roleSelectedForPerm.id;
    }
    CollectionService.createOrUpdatePermission(data)
      .then((r) => {
        const perm = r.data.data;
        const permIndex = permissions.findIndex(
          (permission: any) => permission.id === perm.id
        );
        if (permIndex >= 0) {
          permissions[permIndex] = perm;
          setPermissions([...permissions]);
        } else {
          setPermissions([...permissions, perm]);
        }
        setSelectedPermission(perm);
        resetPermsData();
        addToast("Successfully created permission", {
          appearance: "success",
          autoDismiss: true,
        });
      })
      .catch((err) => {
        addToast("Failed to create permission. Please try again!", {
          appearance: "error",
          autoDismiss: true,
        });
      });
    setLoading(false);
  };

  const getPermission = (permsGroup: string): string => {
    const schema: any = permissionsSchema.find(
      (pg: any) => pg?.systemName === permsGroup
    );
    return schema ? schema.displayName : "";
  };

  return (
    <HandleWrapper>
      <div className="flex h-screen">
        <Box
          display={"flex"}
          flexDirection={"column"}
          flex={1}
          bg={"app.bg.aliceBlue"}
        >
          <Text as="p" p={"10px"} fontWeight={600} fontSize={"16px"}>
            Collection Settings
          </Text>
          <Box p={"10px"}>
            <Box
              p={"12px"}
              borderRadius={"6px"}
              bg={"app.bg.hawkesBlue"}
              sx={{ cursor: "pointer", textTransform: "capitalize" }}
            >
              Permissions
            </Box>
          </Box>
        </Box>

        <Box
          display={"flex"}
          flex={1}
          flexDirection={"column"}
          bg={"app.bg.gray"}
        >
          <Box pl={"16px"} pr={"10px"} pt={"16px"}>
            <Text as="p" fontWeight={600} fontSize={"24px"} mb={"10px"}>
              Permissions
            </Text>
            {
              // const filteredPermissions= permissions?.filter((perm:any)=>perm.permissionGroup !== "pg_collection_view_metadata");
              permissions
                .filter(
                  (perm) =>
                    perm.permissionGroup !== "pg_collection_view_metadata"
                )
                ?.map((perm: any) => (
                  // filteredPermissions?.map((perm: any) => (
                  // if(perm.permissionGroup === "pg_collection_view_metadata")
                  <Box
                    key={perm.id}
                    px={"8px"}
                    py={"6px"}
                    borderRadius={"4px"}
                    bg={
                      perm.id === selectedPermission?.id
                        ? "app.bg.brightStar"
                        : "none"
                    }
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedPermission(perm);
                    }}
                    mb={"6px"}
                    display="flex"
                    alignItems={"center"}
                    justifyContent={"space-between"}
                  >
                    <Text as="p">{`${getPermission(perm.permissionGroup)}-${
                      perm.id
                    }`}</Text>
                  </Box>
                ))
            }
            <Button
              variant="default"
              sx={{ mt: "16px", width: "100%" }}
              onClick={() => {
                setShowCreatePerm(true);
              }}
            >
              + Create Permission
            </Button>
          </Box>
        </Box>

        <Box
          display={"flex"}
          flex={2}
          flexDirection={"column"}
          bg={"app.text.white"}
        >
          <Box width={"80%"} mt={"24px"} p={"20px"}>
            {showCreatePerm ? (
              <>
                <Box display={"flex"} alignItems={"center"} mb={"16px"}>
                  <IconButton
                    icon={ArrowLeftIcon}
                    size="medium"
                    variant="invisible"
                    onClick={() => {
                      resetPermsData();
                    }}
                  />
                  <Text as="p" ml={"6px"} fontWeight={600}>
                    Permissions
                  </Text>
                </Box>
                <Text as="p" fontWeight={600} mb={"10px"}>
                  Select Permission
                </Text>
                {permissionsSchema.map((schema: any) => (
                  <Box
                    px={"8px"}
                    py={"6px"}
                    borderRadius={"4px"}
                    sx={{
                      cursor: "pointer",
                      ":hover": {
                        bg: "app.bg.hawkesBlue",
                      },
                    }}
                    mb={"6px"}
                    display="flex"
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    onClick={() => {
                      setSelectedPg(schema);
                    }}
                    key={`selected-${schema?.systemName}-index`}
                  >
                    <Text as="p">{schema?.displayName}</Text>
                    {selectedPg?.systemName === schema?.systemName ? (
                      <CheckIcon size={16} fill={"#44B244"} />
                    ) : null}
                  </Box>
                ))}
                <Box mt={"10px"}>
                  <Text as="p" fontWeight={600} mb={"10px"}>
                    Select Type
                  </Text>
                  <form>
                    <FormControl>
                      <Checkbox
                        checked={itemCheckedForPerm === "member"}
                        onChange={() => {
                          setItemCheckedForPerm("member");
                        }}
                      />
                      <FormControl.Label>Members</FormControl.Label>
                    </FormControl>
                    <FormControl>
                      <Checkbox
                        checked={itemCheckedForPerm === "role"}
                        onChange={() => {
                          setItemCheckedForPerm("role");
                        }}
                      />
                      <FormControl.Label>Roles</FormControl.Label>
                    </FormControl>
                  </form>
                </Box>
                <Text as="p" fontWeight={600} mt={"16px"} mb={"10px"}>
                  {itemCheckedForPerm === "member" ? "Members" : "Roles"}
                </Text>
                {itemCheckedForPerm === "member" ? (
                  <Autocomplete key={itemCheckedForPerm}>
                    <Autocomplete.Input
                      id="autocompleteInput-member"
                      placeholder="Select Member"
                      value={memberSelectedForPerm?.text}
                    />
                    <Autocomplete.Overlay>
                      <Autocomplete.Menu
                        items={members.map((mem: any) => {
                          return {
                            text: mem.user.firstName
                              ? mem.user.firstName
                              : mem.user.username,
                            id: mem.id,
                          };
                        })}
                        selectedItemIds={[]}
                        aria-labelledby="autocompleteLabel-customFilter"
                        filterFn={(item) => true}
                        emptyStateText={"Please add members"}
                        selectionVariant={"single"}
                        onSelectedChange={(value: any) => {
                          if (value?.length) {
                            setMemberSelectedForPerm(value[0]);
                          }
                        }}
                      />
                    </Autocomplete.Overlay>
                  </Autocomplete>
                ) : itemCheckedForPerm === "role" ? (
                  <Autocomplete key={itemCheckedForPerm}>
                    <Autocomplete.Input
                      id="autocompleteInput-role"
                      placeholder="Select Role"
                      value={roleSelectedForPerm?.text}
                    />
                    <Autocomplete.Overlay>
                      <Autocomplete.Menu
                        items={roles.map((role: any) => {
                          return {
                            text: role.name,
                            id: role.id,
                          };
                        })}
                        selectedItemIds={[]}
                        aria-labelledby="autocompleteLabel-customFilter"
                        filterFn={(item) => true}
                        emptyStateText={"Please create roles"}
                        selectionVariant={"single"}
                        onSelectedChange={(value: any) => {
                          if (value?.length) {
                            setRoleSelectedFormPerm(value[0]);
                          }
                        }}
                      />
                    </Autocomplete.Overlay>
                  </Autocomplete>
                ) : null}
                {selectedPg &&
                (itemCheckedForPerm === "member"
                  ? Boolean(memberSelectedForPerm)
                  : Boolean(roleSelectedForPerm)) ? (
                  <Box display={"flex"} justifyContent={"flex-end"} mt={"16px"}>
                    <Button
                      disabled={loading}
                      variant="primary"
                      onClick={createCollectionPermission}
                    >
                      Create
                    </Button>
                  </Box>
                ) : null}
              </>
            ) : selectedPermission ? (
              <>
                <Text as="p" fontWeight={600} mb={"16px"}>
                  Permission Details
                </Text>
                <Text as="p">
                  {selectedPermission?.role
                    ? `Role - ${selectedPermission.role.name}`
                    : selectedPermission?.member
                    ? `Member - ${selectedPermission.member.user.firstName}`
                    : ""}
                </Text>
              </>
            ) : null}
          </Box>
        </Box>
      </div>
    </HandleWrapper>
  );
};

CollectionPermissionsPage.getLayout = function getLayout(
  page: ReactElement,
  hideSidebar
) {
  return <StudioLayout>{page}</StudioLayout>;
};

CollectionPermissionsPage.auth = true;

export default CollectionPermissionsPage;
