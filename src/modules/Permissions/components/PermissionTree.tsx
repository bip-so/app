import {
  DndProvider,
  getBackendOptions,
  MultiBackend,
  NodeModel,
  Tree,
} from "@minoru/react-dnd-treeview";
import { ActionMenu, Text, TextInput } from "@primer/react";
import { SearchIcon } from "@primer/octicons-react";
import { FC, useState, useMemo, ChangeEvent, useEffect } from "react";
import useSWR, { mutate } from "swr";

import BipLoader from "../../../components/BipLoader";
import PermissionNode, {
  getCanvasRolePermission,
  PermissionNodeTypeEnum,
} from "./PermissionNode";

import CollectionService from "../../Collections/services";
import { PermissionTreeContextEnum } from "../enums";
import { CanvasDataType, CollectionDataType } from "../../Collections/types";
import { usePermissions } from "../../../context/permissionContext";
import {
  ICanvasPermissionNode,
  ICollectionPermissionNode,
  PermissionGroup,
} from "../types";
import useDebounce from "../../../hooks/useDebounce";
import { useTranslation } from "next-i18next";
import { XIcon } from "@primer/styled-octicons";

export type PermissionNodeDataType =
  | ICollectionPermissionNode
  | ICanvasPermissionNode;

interface IPermissionTreeProps {
  context: PermissionTreeContextEnum;
  member?: any;
  role?: any;
  memberRoles?: any[];
}

const PermissionTree: FC<IPermissionTreeProps> = ({
  context,
  member,
  role,
  memberRoles,
}) => {
  const [searchText, setSearchText] = useState<string>("");
  const debounceSearch = useDebounce(searchText, 500);
  const [loading, setLoading] = useState(false);

  const [nodes, setNodes] = useState<NodeModel<PermissionNodeDataType>[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<
    NodeModel<PermissionNodeDataType>[]
  >([]);

  const { schema } = usePermissions();
  const { t } = useTranslation();

  useEffect(() => {
    if (debounceSearch?.length) {
      searchCanvases();
    } else {
      mutate([
        context === PermissionTreeContextEnum.Member ? member.id : role.id,
        "collections",
      ]);
    }
  }, [debounceSearch]);

  const getCollectionRolePermission = (collection: CollectionDataType) => {
    let processedRolePermsObject = collection.actualRolePermsObject;
    if (context === PermissionTreeContextEnum.Member && memberRoles?.length) {
      processedRolePermsObject = processedRolePermsObject.filter(
        (rolePerm: any) =>
          memberRoles?.findIndex(
            (memberRole: any) => memberRole.id === rolePerm.roleId
          ) !== -1
      );
    }
    const collectionRolePerm = processedRolePermsObject
      ?.map((rolePerm: any) => {
        return {
          ...rolePerm,
          weight: schema?.collection?.permissionGroups?.find(
            (pg: PermissionGroup) => pg.systemName === rolePerm.pg
          )?.weight,
        };
      })
      .sort((a: any, b: any) => b.weight - a.weight)[0];

    return collectionRolePerm;
  };

  const getCollections = async () => {
    let collectionsResp;
    setLoading(true);
    try {
      if (context === PermissionTreeContextEnum.Member) {
        collectionsResp = await CollectionService.getUserCollectionsWithPG(
          member.user?.id
        );
      } else {
        collectionsResp = await CollectionService.getRoleCollectionsWithPG(
          role.id
        );
      }
      const collectionNodes: NodeModel<PermissionNodeDataType>[] =
        collectionsResp.data.data.map((collection: CollectionDataType) => {
          return {
            id: collection.id,
            parent: collection.parent,
            text: collection.name,
            data: {
              ...collection,
              memberPermission:
                context === PermissionTreeContextEnum.Member
                  ? collection.actualMemberPermsObject
                      ?.collectionPermissionID !== 0
                    ? collection.actualMemberPermsObject
                    : null
                  : null,
              rolePermission: PermissionTreeContextEnum.Member
                ? collection.actualRolePermsObject
                  ? getCollectionRolePermission(collection)
                  : null
                : null,
            },
          };
        });
      setNodes(collectionNodes);
      setLoading(false);
      return collectionNodes;
    } catch (error) {
      console.log("Error fetching collections");
    }
    setLoading(false);
  };

  const { data, error } = useSWR(
    member || role
      ? [
          context === PermissionTreeContextEnum.Member ? member.id : role.id,
          "collections",
        ]
      : null,
    getCollections
  );
  const isLoading = !data && !error;

  const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const getProcessedCollectionNodes = (
    nodes: NodeModel<PermissionNodeDataType>[]
  ) => {
    const processedNodes = nodes
      .filter(
        (node: NodeModel<PermissionNodeDataType>) =>
          node.data?.type === PermissionNodeTypeEnum.COLLECTION
      )
      .map((node: NodeModel<PermissionNodeDataType>) => {
        if (
          node.data?.type === PermissionNodeTypeEnum.COLLECTION &&
          node.data?.rolePermission
        ) {
          let collection = node.data as ICollectionPermissionNode;
          const updatedCollectionRolePermission =
            getCollectionRolePermission(collection);
          if (
            updatedCollectionRolePermission &&
            updatedCollectionRolePermission.roleId !==
              collection.rolePermission?.roleId
          ) {
            collection.rolePermission = updatedCollectionRolePermission;
            collection.areCanvasesFetched = false;
          }
          return {
            ...node,
            data: collection,
          };
        }
        return node;
      });
    // .filter((node: NodeModel<PermissionNodeDataType>) => node !== undefined);

    return processedNodes;
  };

  const searchCanvases = async () => {
    setLoading(true);
    try {
      let resp;
      if (context === PermissionTreeContextEnum.Member) {
        resp = await CollectionService.searchUserCollectionCanvasesWithPG(
          member.user?.id,
          debounceSearch
        );
      } else {
        resp = await CollectionService.searchRoleCollectionCanvasesWithPG(
          role.id,
          debounceSearch
        );
      }
      if (!resp?.data?.data) {
        setLoading(false);
        return;
      }
      const collectionNodes: NodeModel<PermissionNodeDataType>[] =
        resp.data.data.collections?.map((collection: CollectionDataType) => {
          return {
            id: collection.id,
            parent: collection.parent,
            text: collection.name,
            data: {
              ...collection,
              memberPermission:
                context === PermissionTreeContextEnum.Member
                  ? collection.actualMemberPermsObject
                      ?.collectionPermissionID !== 0
                    ? collection.actualMemberPermsObject
                    : null
                  : null,
              rolePermission: PermissionTreeContextEnum.Member
                ? collection.actualRolePermsObject
                  ? getCollectionRolePermission(collection)
                  : null
                : null,
            },
          };
        }) || [];
      const processedCollectionNodes = getProcessedCollectionNodes(
        collectionNodes
      ).map((node) => {
        return {
          ...node,
          data: node.data
            ? {
                ...node.data,
                areCanvasesFetched: true,
              }
            : node.data,
        };
      });
      const canvases: CanvasDataType[] = resp.data.data?.canvases || [];
      const canvasNodes: NodeModel<PermissionNodeDataType>[] =
        canvases?.map((canvas: CanvasDataType) => {
          return {
            id: canvas.id,
            parent: canvas.parent,
            text: canvas.name,
            data: {
              ...canvas,
              memberPermission: canvas.defaultBranch?.actualMemberPermsObject
                ?.branchPermissionID
                ? canvas.defaultBranch?.actualMemberPermsObject
                : null,
              rolePermission: getCanvasRolePermission(
                context,
                canvas,
                schema,
                memberRoles as any[]
              ),
              areCanvasesFetched: true,
              subCanvasCount: canvases.filter((can) => can.parent === canvas.id)
                .length
                ? canvas.subCanvasCount
                : 0,
            },
          };
        }) || [];
      setNodes([...processedCollectionNodes, ...canvasNodes]);
    } catch (error) {}
    setLoading(false);
  };

  useEffect(() => {
    if (nodes.length && context === PermissionTreeContextEnum.Member) {
      const processedNodes = getProcessedCollectionNodes(nodes);
      setNodes(processedNodes);
    }
  }, [memberRoles?.length]);

  return (
    <div className="flex flex-col w-full space-y-4">
      <div className="flex space-x-2">
        <div className="flex flex-1">
          <TextInput
            placeholder="Search canvas"
            leadingVisual={SearchIcon}
            sx={{
              boxShadow: "none",
              background: "transparent",
              border: "1px soild",
              borderColor: "permissionTree.inputBorder",
              boxSizing: "border-box",
              outline: "none",
              width: "100%",
              // ":focus-within": {
              //   border: "none",
              // },
            }}
            value={searchText}
            onChange={handleSearch}
            trailingAction={
              searchText?.length ? (
                <TextInput.Action
                  onClick={() => {
                    setSearchText("");
                  }}
                  icon={() => <XIcon size={"small"} />}
                  aria-label="Clear input"
                  sx={{ color: "fg.subtle", py: "0px" }}
                />
              ) : (
                <></>
              )
            }
          />
        </div>
        {/* <IconButton icon={FilterIcon} /> */}
      </div>
      <div className="flex justify-between w-full">
        <Text lineHeight={"24px"} fontSize="14px" fontWeight={400}>
          Canvas
        </Text>
        <Text lineHeight={"24px"} fontSize="14px" fontWeight={400}>
          Permissions
        </Text>
      </div>
      <ActionMenu.Divider sx={{ bg: "permissionTree.divider" }} />

      {isLoading || loading ? (
        <BipLoader />
      ) : searchText !== "" && nodes.length === 0 ? (
        <Text
          fontSize={"14px"}
          color="sidebar.studionav.textSecondary"
          sx={{
            textAlign: "center",
          }}
        >
          {t("pages.noresults")}
        </Text>
      ) : (
        <DndProvider backend={MultiBackend} options={getBackendOptions()}>
          <Tree
            tree={nodes}
            rootId={0}
            onDrop={() => null}
            canDrag={() => false}
            canDrop={() => false}
            sort={false}
            render={(node, { depth, isOpen, onToggle }) => (
              <PermissionNode
                node={node}
                depth={depth}
                isOpen={isOpen}
                onToggle={onToggle}
                nodes={nodes}
                setNodes={setNodes}
                context={context}
                member={member}
                role={role}
                memberRoles={memberRoles ? memberRoles : []}
              />
            )}
            {...(debounceSearch.length
              ? { initialOpen: nodes.map((node) => node.id) }
              : {})}
          />
        </DndProvider>
      )}
    </div>
  );
};

export default PermissionTree;
