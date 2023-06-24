import { FC, useState } from "react";
import { NodeModel } from "@minoru/react-dnd-treeview";

import { PermissionNodeDataType } from "./PermissionTree";
import { CanvasPermissionGroupEnum, PermissionTreeContextEnum } from "../enums";
import { ICanvasPermissionNode, PermissionGroup } from "../types";
import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  ConfirmationDialog,
  IconButton,
  Tooltip,
} from "@primer/react";
import CanvasPermissionMenu, {
  getCanvasPGIcon,
} from "../../Canvas/components/CanvasPermissionMenu";
import { SYSTEM_ROLES } from "../../../utils/Constants";
import { IPGUpdatePayload } from "../../Canvas/interfaces";
import { CanvasBranchService } from "../../Canvas/services";
import { usePermissions } from "../../../context/permissionContext";
import { XIcon } from "@primer/octicons-react";
import PermissionRoleIndicator from "../../Collections/components/PermissionRoleIndicator";
import { CanvasMemberPermissionObject } from "../../Collections/types";
import { useToasts } from "react-toast-notifications";
import PermissionNodeWrapper from "./PermissionNodeWrapper";
import BipLoader from "../../../components/BipLoader";
import { useRouter } from "next/router";
import { mutate } from "swr";
import BipRouteUtils from "../../../core/routeUtils";

interface ICanvasPermissionNodeProps {
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
  fetchingSubCanvases: boolean;
}

const CanvasPermissionNode: FC<ICanvasPermissionNodeProps> = ({
  node,
  context,
  role,
  member,
  nodes,
  setNodes,
  isOpen,
  onToggle,
  depth,
  getCanvases,
  fetchingSubCanvases,
}) => {
  const { addToast } = useToasts();

  const { schema } = usePermissions();

  const canvas = node?.data as ICanvasPermissionNode;

  const [canvasPG, setCanvasPG] = useState((): PermissionGroup | null => null);
  const [showCanvasConfirmation, setShowCanvasConfirmation] = useState(false);

  const router = useRouter();

  const slug = router.query.slug as string;
  const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);

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

  const updateCanvasPG = async (
    permissionGroup: PermissionGroup,
    inheritPermission: boolean
  ) => {
    const updatedPG = permissionGroup.systemName as CanvasPermissionGroupEnum;
    try {
      const data: IPGUpdatePayload = {
        canvasBranchId: canvas?.defaultBranch?.id,
        permGroup: updatedPG,
        memberID: context === PermissionTreeContextEnum.Member ? member.id : 0,
        canvasRepositoryId: canvas?.id,
        collectionId: canvas?.collectionID!,
        isOverridden:
          updatedPG === CanvasPermissionGroupEnum.NONE
            ? false
            : canvas?.rolePermission
            ? true
            : false,
        roleID: context === PermissionTreeContextEnum.Role ? role.id : 0,
      };
      const response = await CanvasBranchService.updateMemberPG(
        data,
        inheritPermission
      );

      if (node?.data?.defaultBranchID === branchId) {
        mutate([branchId, "members"]);
      }

      const updatedNodeIndex = nodes.findIndex(
        (n: NodeModel<PermissionNodeDataType>) => n.id === node.id
      );

      let updatedNode: NodeModel<PermissionNodeDataType> =
        nodes[updatedNodeIndex];

      const previousCanvas: ICanvasPermissionNode =
        updatedNode?.data as ICanvasPermissionNode;

      const updatedCanvas: ICanvasPermissionNode = {
        ...previousCanvas,
        memberPermission: {
          ...previousCanvas.memberPermission,
          pg: updatedPG,
          memberId: response.data.data?.member?.id,
        } as CanvasMemberPermissionObject,
        defaultBranch: {
          ...previousCanvas.defaultBranch,
          permission: updatedPG,
        },
      };

      updatedNode = {
        ...updatedNode,
        data: updatedCanvas as PermissionNodeDataType,
      };

      let updatedNodes = [...nodes];
      updatedNodes[updatedNodeIndex] = updatedNode;
      if (inheritPermission) {
        if (canvas.areCanvasesFetched) {
          if (context === PermissionTreeContextEnum.Role) {
            updatedNodes = updatedNodes.map(
              (canvasNode: NodeModel<PermissionNodeDataType>) => {
                let tmpCanvas: ICanvasPermissionNode =
                  canvasNode?.data as ICanvasPermissionNode;
                if (tmpCanvas.parent === node.id) {
                  tmpCanvas.defaultBranch.permission = updatedPG;
                }
                return {
                  ...canvasNode,
                  data: tmpCanvas,
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
            setNodes(filteredNodes);
          } else {
            updatedNodes = updatedNodes.filter(
              (node: NodeModel<PermissionNodeDataType>) =>
                node.parent !== canvas.id
            );
            // setNodes(updatedNodes);
            // setTimeout(() => {
            // getCanvases(updatedNode);
            const childNodes = getAllFetchedChildCanvases(node);
            const filteredNodes = nodes.filter(
              (n) => childNodes.findIndex((cNode) => cNode.id === n.id) === -1
            );
            const curNodeIndex = filteredNodes.findIndex(
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
            setNodes(filteredNodes);
            // }, 2000);
            // const updatedNodeIndex = nodes.findIndex(
            //   (n: NodeModel<PermissionNodeDataType>) => n.id === node.id
            // );
            // let nodesv2 = [...nodes];
            // nodesv2[updatedNodeIndex] = updatedNode;
            // setNodes(nodesv2);
          }
        } else {
          setNodes(updatedNodes);
        }
      } else {
        setNodes(updatedNodes);
      }
      setCanvasPG(null);
      addToast("Permission Changed", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      setCanvasPG(null);
      addToast("Cannot update creator permission", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleChangeCanvasPG = (permissionGroup: PermissionGroup) => {
    if (
      canvas.subCanvasCount > 0 &&
      ((!role?.isSystem && context === PermissionTreeContextEnum.Role) ||
        context === PermissionTreeContextEnum.Member)
    ) {
      setCanvasPG(permissionGroup);
      setShowCanvasConfirmation(true);
    } else {
      updateCanvasPG(permissionGroup, false);
    }
  };

  const handleCanvasConfirm = (gesture: string) => {
    if (gesture === "confirm") {
      updateCanvasPG(canvasPG as PermissionGroup, true);
    } else if (gesture === "cancel") {
      updateCanvasPG(canvasPG as PermissionGroup, false);
    }
    setShowCanvasConfirmation(false);
  };

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
            canvas.rolePermission &&
            canvas.memberPermission &&
            canvas.memberPermission?.pg !== CanvasPermissionGroupEnum.NONE ? (
              <span
                className="mr-10"
                onClick={(e) => {
                  e.stopPropagation();
                }}
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
                      icon={() => getCanvasPGIcon(canvas.rolePermission?.pg!)}
                      aria-label="re-sync"
                    />
                  </ActionMenu.Anchor>
                  <ActionMenu.Overlay align="end">
                    <Box display={"flex"} flexDirection="column" padding={2}>
                      <Box fontSize={14} width={175}>
                        {`Over-rode permission from  '${canvas.rolePermission?.name}' role`}
                      </Box>
                      <div className="flex flex-row-reverse mt-2">
                        <Button
                          variant="invisible"
                          sx={{
                            color: "studioSettings.role.syncPermissionColor",
                            paddingLeft: "8px",
                          }}
                          onClick={() => {
                            const canvasNonePG =
                              schema?.canvas?.permissionGroups?.find(
                                (pg: PermissionGroup) =>
                                  pg.systemName ===
                                  CanvasPermissionGroupEnum.NONE
                              );
                            handleChangeCanvasPG(canvasNonePG!);
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
            <CanvasPermissionMenu
              disabled={
                context === PermissionTreeContextEnum.Role &&
                role?.isSystem &&
                role?.name === SYSTEM_ROLES.ADMIN // temp change only for v1
              }
              pgSystemName={
                context === PermissionTreeContextEnum.Role
                  ? canvas.defaultBranch?.permission
                  : ((canvas.memberPermission?.pg &&
                    canvas.memberPermission?.pg !==
                      CanvasPermissionGroupEnum.NONE
                      ? canvas.memberPermission?.pg
                      : canvas.rolePermission?.pg ??
                        CanvasPermissionGroupEnum.NONE) as CanvasPermissionGroupEnum)
              }
              onChange={handleChangeCanvasPG}
              extraActions={
                canvas.defaultBranch?.permission !==
                  CanvasPermissionGroupEnum.NONE &&
                canvas.defaultBranch?.permission !==
                  CanvasPermissionGroupEnum.VIEW_METADATA &&
                (context === PermissionTreeContextEnum.Role
                  ? true
                  : canvas.memberPermission &&
                    canvas.memberPermission?.pg !==
                      CanvasPermissionGroupEnum.NONE) ? (
                  <ActionList.Item
                    variant="danger"
                    onSelect={() => {
                      const pg = schema?.canvas?.permissionGroups?.find(
                        (pg: PermissionGroup) =>
                          pg.systemName === CanvasPermissionGroupEnum.NONE
                      );
                      if (pg) {
                        handleChangeCanvasPG(pg);
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
              canvas.rolePermission &&
              (!canvas.memberPermission ||
                canvas.memberPermission.pg ===
                  CanvasPermissionGroupEnum.NONE) ? (
                <Tooltip
                  direction="nw"
                  sx={{
                    zIndex: "101",
                  }}
                  text={`Permission inherited from ${canvas.rolePermission?.name} role`}
                >
                  <PermissionRoleIndicator />
                </Tooltip>
              ) : null}
            </Box>
          </Box>
          {fetchingSubCanvases && <BipLoader />}
        </Box>
      </PermissionNodeWrapper>
      {showCanvasConfirmation ? (
        <ConfirmationDialog
          title="Set permissions for sub canvases?"
          onClose={handleCanvasConfirm}
          confirmButtonContent="Ok"
          cancelButtonContent="No"
        >
          This will set same permission for all sub canvases
        </ConfirmationDialog>
      ) : null}
    </>
  );
};

export default CanvasPermissionNode;
