import { NodeModel } from "@minoru/react-dnd-treeview";
import { XIcon } from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  ConfirmationDialog,
  IconButton,
  Tooltip,
} from "@primer/react";
import { FC, useState } from "react";
import { useToasts } from "react-toast-notifications";
import BipLoader from "../../../components/BipLoader";
import { usePermissions } from "../../../context/permissionContext";
import { SYSTEM_ROLES } from "../../../utils/Constants";
import CollectionPermissionMenu, {
  getCollectionPGIcon,
} from "../../Collections/components/CollectionPermissionMenu";
import PermissionRoleIndicator from "../../Collections/components/PermissionRoleIndicator";
import CollectionService from "../../Collections/services";
import {
  CollectionMemberPermissionObject,
  CreateOrUpdatePermissionType,
} from "../../Collections/types";
import {
  CollectionPermissionGroupEnum,
  PermissionTreeContextEnum,
} from "../enums";
import {
  ICanvasPermissionNode,
  ICollectionPermissionNode,
  PermissionGroup,
} from "../types";
import { getCanvasPGByCollectionPG } from "../utils";
import PermissionNodeWrapper from "./PermissionNodeWrapper";
import { PermissionNodeDataType } from "./PermissionTree";

interface ICollectionPermissionNodeProps {
  node: NodeModel<PermissionNodeDataType>;
  context: PermissionTreeContextEnum;

  member: any;
  role: any;

  nodes: NodeModel<PermissionNodeDataType>[];
  setNodes: (nodes: NodeModel<PermissionNodeDataType>[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  depth: number;
  getCanvases: (parentNode?: NodeModel<PermissionNodeDataType>) => void;
  fetchingCanvases: boolean;
}

const CollectionPermissionNode: FC<ICollectionPermissionNodeProps> = ({
  context,
  node,
  nodes,
  member,
  role,
  setNodes,
  isOpen,
  onToggle,
  depth,
  getCanvases,
  fetchingCanvases,
}) => {
  const { addToast } = useToasts();
  const { schema } = usePermissions();

  const collection = node?.data as ICollectionPermissionNode;

  const [collectionPG, setCollectionPG] = useState(
    (): PermissionGroup | null => null
  );
  const [showCollectionConfirmation, setShowCollectionConfirmation] =
    useState(false);

  const getCanvasRolePermission = (node: any) => {
    const canvasRole = node.defaultBranch?.actualRolePermsObject
      ?.map((canvasPerm: any) => {
        return {
          ...canvasPerm,
          weight: schema?.canvas?.permissionGroups?.find(
            (pg: PermissionGroup) => pg.systemName === canvasPerm.actualRole?.pg
          )?.weight,
        };
      })
      .sort((a: any, b: any) => b.weight - a.weight)[0];
    return canvasRole;
  };

  const getAllFetchedChildCanvases = (
    node: NodeModel<PermissionNodeDataType>
  ): NodeModel<PermissionNodeDataType>[] => {
    const filteredNodes = nodes.filter((pNode) => pNode.parent === node.id);
    if (filteredNodes.length) {
      return [
        ...filteredNodes,
        ...filteredNodes
          .map((fNode: NodeModel<PermissionNodeDataType>) =>
            getAllFetchedChildCanvases(fNode)
          )
          .flat(),
      ];
    }
    return [];
  };

  const updateCollectionPG = async (
    permissionGroup: PermissionGroup,
    inheritPermission: boolean
  ) => {
    const updatedPg =
      permissionGroup.systemName as CollectionPermissionGroupEnum;
    try {
      const data: CreateOrUpdatePermissionType = {
        permGroup: updatedPg,
        collectionId: node.id,
        isOverridden: false,
        memberID: context === PermissionTreeContextEnum.Member ? member.id : 0,
        roleID: context === PermissionTreeContextEnum.Role ? role.id : 0,
      };
      const response = await CollectionService.createOrUpdatePermission(
        data,
        inheritPermission
      );

      const updatedNodeIndex: number = nodes.findIndex(
        (n: NodeModel) => n.id === node.id
      )!;

      let updatedNode: NodeModel<PermissionNodeDataType> =
        nodes[updatedNodeIndex];

      const previousCollection: ICollectionPermissionNode =
        updatedNode?.data as ICollectionPermissionNode;

      const collectionPermUpdateData = {
        collectionID: collection.id,
        collectionPermissionID: response.data.data?.id,
        isOverRidden: response.data.data?.isOverridden,
        pg: updatedPg,
      };

      const updatedCollection: ICollectionPermissionNode = {
        ...previousCollection,
        permission: updatedPg,
        memberPermission:
          context === PermissionTreeContextEnum.Member
            ? {
                ...collectionPermUpdateData,
                memberId: response.data.data?.memberID,
              }
            : previousCollection.memberPermission,
      };
      // updatedNode.data = updatedCollection as PermissionNodeDataType;
      updatedNode = {
        ...updatedNode,
        data: updatedCollection as PermissionNodeDataType,
      };
      let updatedNodes: NodeModel<PermissionNodeDataType>[] = [...nodes];

      updatedNodes[updatedNodeIndex] = updatedNode;
      if (updatedCollection.areCanvasesFetched && inheritPermission) {
        const updatedCanvasPg = getCanvasPGByCollectionPG(
          updatedPg as CollectionPermissionGroupEnum
        );
        updatedNodes = updatedNodes.map(
          (canvasNode: NodeModel<PermissionNodeDataType>) => {
            let canvas: ICanvasPermissionNode =
              canvasNode?.data as ICanvasPermissionNode;
            if (canvas.parent === node.id) {
              if (context === PermissionTreeContextEnum.Role) {
                canvas.defaultBranch.permission = updatedCanvasPg;
              } else {
                // getCanvases(updatedNode);
                // if (canvas.memberPermission) {
                //   canvas.memberPermission.pg = updatedCanvasPg;
                // } else {
                //   canvas.memberPermission = {
                //     branchID: canvas.defaultBranchId,
                //   };
                // }
              }
            }

            return {
              ...canvasNode,
              data: canvas,
            };
          }
        );
        const childNodes = getAllFetchedChildCanvases(node);
        const filteredNodes = updatedNodes.filter(
          (n) => childNodes.findIndex((cNode) => cNode.id === n.id) === -1
        );
        const curNodeIndex = updatedNodes.findIndex(
          (fNode) => fNode.id === node.id
        );
        if (curNodeIndex !== -1) {
          filteredNodes[curNodeIndex] = {
            ...updatedNode,
            data: {
              ...updatedNode.data,
              areCanvasesFetched: false,
            },
          };
        }
        updatedNodes = filteredNodes;
      }
      setNodes(updatedNodes);
      setCollectionPG(null);
      addToast("Permission changed", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      setCollectionPG(null);
      addToast("Problem changing permission", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleChangeCollectionPG = (permissionGroup: PermissionGroup) => {
    const collection = node?.data as ICollectionPermissionNode;
    if (collection.computedRootCanvasCount > 0 && !role?.isSystem) {
      setCollectionPG(permissionGroup);
      setShowCollectionConfirmation(true);
    } else {
      updateCollectionPG(permissionGroup, false);
    }
  };

  const handleRemoveCollectionPG = async (permissionId: number) => {
    try {
      /* const response = await CollectionService.deletePermission(data);

      const updatedNodeIndex = nodes.findIndex(
        (n: NodeModel) => n.id === node.id
      );
      const updatedNode = {
        ...nodes[updatedNodeIndex],
        permission: permissionGroup.systemName,
      };
      let updatedNodes = [...nodes];
      updatedNodes[updatedNodeIndex] = updatedNode;
      setNodes(updatedNodes); */

      addToast("Permission changed", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      addToast("Cannot update creator permission", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleCollectionConfirm = (gesture: string) => {
    if (gesture === "confirm") {
      updateCollectionPG(collectionPG as PermissionGroup, true);
    } else if (gesture === "cancel") {
      updateCollectionPG(collectionPG as PermissionGroup, false);
    }
    setShowCollectionConfirmation(false);
  };

  const permissionObject =
    context === PermissionTreeContextEnum.Role
      ? (collection.permission as CollectionPermissionGroupEnum)
      : ((collection?.memberPermission &&
        collection?.memberPermission?.pg !== CollectionPermissionGroupEnum.NONE
          ? collection?.memberPermission?.pg
          : collection?.rolePermission?.pg) as CollectionPermissionGroupEnum);

  return (
    <>
      <PermissionNodeWrapper
        node={node}
        isOpen={isOpen}
        onToggle={onToggle}
        depth={depth}
        getCanvases={getCanvases}
      >
        <Box display="flex" flexDirection="column">
          <Box display="flex" alignItems="center" className="space-x-1">
            {context !== PermissionTreeContextEnum.Role &&
            collection.rolePermission &&
            collection.memberPermission &&
            collection.memberPermission?.pg !==
              CollectionPermissionGroupEnum.NONE ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="mr-10"
              >
                <ActionMenu>
                  <ActionMenu.Anchor>
                    <IconButton
                      size={"small"}
                      variant="invisible"
                      sx={{
                        color: "text.muted",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                      }}
                      icon={() =>
                        getCollectionPGIcon(collection.rolePermission?.pg!)
                      }
                      aria-label="re-sync"
                    />
                  </ActionMenu.Anchor>

                  <ActionMenu.Overlay align="end">
                    <Box display={"flex"} flexDirection="column" padding={2}>
                      <Box fontSize={14} width={175}>
                        {`Over-rode permission from  '${collection.rolePermission?.name}' role`}
                      </Box>
                      <div className="flex flex-row-reverse mt-2">
                        <Button
                          variant="invisible"
                          sx={{
                            color: "studioSettings.role.syncPermissionColor",
                            paddingLeft: "8px",
                          }}
                          onClick={() => {
                            const collectionNonePG =
                              schema?.collection?.permissionGroups?.find(
                                (pg: PermissionGroup) =>
                                  pg.systemName ===
                                  CollectionPermissionGroupEnum.NONE
                              );
                            handleChangeCollectionPG(collectionNonePG!);
                          }}
                        >
                          Re-Sync
                        </Button>
                      </div>
                    </Box>
                  </ActionMenu.Overlay>
                </ActionMenu>
              </span>
            ) : null}
            <CollectionPermissionMenu
              disabled={
                context === PermissionTreeContextEnum.Role &&
                role?.isSystem &&
                role?.name === SYSTEM_ROLES.ADMIN // temp change only for v1
              }
              pgSystemName={
                context === PermissionTreeContextEnum.Role
                  ? (collection.permission as CollectionPermissionGroupEnum)
                  : ((collection?.memberPermission?.pg &&
                    collection?.memberPermission?.pg !==
                      CollectionPermissionGroupEnum.NONE
                      ? collection?.memberPermission?.pg
                      : collection?.rolePermission
                          ?.pg) as CollectionPermissionGroupEnum)
              }
              onChange={handleChangeCollectionPG}
              extraActions={
                collection?.permission !== CollectionPermissionGroupEnum.NONE &&
                collection?.permission !==
                  CollectionPermissionGroupEnum.VIEW_METADATA &&
                (context === PermissionTreeContextEnum.Role
                  ? true
                  : collection.memberPermission &&
                    collection.memberPermission?.pg !==
                      CollectionPermissionGroupEnum.NONE) ? (
                  <ActionList.Item
                    variant="danger"
                    onSelect={() => {
                      const pg = schema?.collection?.permissionGroups.find(
                        (pg: PermissionGroup) =>
                          pg.systemName === CollectionPermissionGroupEnum.NONE
                      );
                      if (pg) {
                        handleChangeCollectionPG(pg);
                        // handleRemoveMemberFromCollection(pg);
                        // updateCollectionPG(pg, false);
                      }
                    }}
                  >
                    <ActionList.LeadingVisual>
                      <XIcon />
                    </ActionList.LeadingVisual>
                    Remove
                  </ActionList.Item>
                ) : null
              }
            />
            <Box width={"8px"}>
              {context !== PermissionTreeContextEnum.Role &&
              collection.rolePermission &&
              collection.rolePermission?.pg !==
                CollectionPermissionGroupEnum.VIEW_METADATA &&
              (!collection.memberPermission ||
                collection.memberPermission.pg ===
                  CollectionPermissionGroupEnum.NONE) ? (
                <Tooltip
                  direction="nw"
                  sx={{
                    zIndex: "101",
                  }}
                  text={`Permission inherited from ${collection.rolePermission?.name} role`}
                >
                  <PermissionRoleIndicator />
                </Tooltip>
              ) : null}
            </Box>
          </Box>
          {fetchingCanvases && <BipLoader />}
        </Box>
      </PermissionNodeWrapper>
      {showCollectionConfirmation ? (
        <ConfirmationDialog
          title="Set permissions for canvases?"
          onClose={handleCollectionConfirm}
          confirmButtonContent="Ok"
          cancelButtonContent="No"
        >
          This will set same permission for all canvases in collection.
        </ConfirmationDialog>
      ) : null}
    </>
  );
};

export default CollectionPermissionNode;
