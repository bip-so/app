import { NodeModel } from "@minoru/react-dnd-treeview";
import { XIcon } from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  Box,
  ConfirmationDialog,
  Text,
  Tooltip,
} from "@primer/react";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/styled-octicons";
import { FC, MouseEvent, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { usePermissions } from "../../../context/permissionContext";
import { SYSTEM_ROLES } from "../../../utils/Constants";
import CanvasPermissionMenu, {
  getCanvasPGIcon,
} from "../../Canvas/components/CanvasPermissionMenu";
import { IPGUpdatePayload } from "../../Canvas/interfaces";
import { CanvasBranchService } from "../../Canvas/services";
import PermissionRoleIndicator from "../../Collections/components/PermissionRoleIndicator";
import CollectionService from "../../Collections/services";
import {
  CanvasDataType,
  CollectionMemberPermissionObject,
} from "../../Collections/types";
import { CanvasPermissionGroupEnum, PermissionTreeContextEnum } from "../enums";
import {
  ICanvasPermissionNode,
  ICollectionPermissionNode,
  PermissionGroup,
} from "../types";
import CanvasPermissionNode from "./CanvasPermissionNode";
import CollectionPermissionNode from "./CollectionPermissionNode";
import { PermissionNodeDataType } from "./PermissionTree";

export enum PermissionNodeTypeEnum {
  COLLECTION = "COLLECTION",
  CANVAS = "CANVAS",
}

export const getCanvasRolePermission = (
  context: PermissionTreeContextEnum,
  canvas: CanvasDataType,
  schema: any,
  memberRoles: any[]
) => {
  let processedRolePermsObject = canvas.defaultBranch?.actualRolePermsObject;
  if (
    context === PermissionTreeContextEnum.Member &&
    memberRoles?.length &&
    processedRolePermsObject?.length
  ) {
    processedRolePermsObject = processedRolePermsObject?.filter(
      (rolePerm: any) =>
        memberRoles?.findIndex(
          (memberRole: any) => memberRole.id === rolePerm.roleId
        ) !== -1
    );
  }
  const canvasRole = processedRolePermsObject
    ?.map((canvasPerm: any) => {
      return {
        ...canvasPerm,
        weight: schema?.canvas?.permissionGroups?.find(
          (pg: PermissionGroup) => pg.systemName === canvasPerm?.pg
        )?.weight,
      };
    })
    .sort((a: any, b: any) => b.weight - a.weight)[0];
  return canvasRole;
};

interface IPermissionNodeProps {
  node: NodeModel<PermissionNodeDataType>;
  depth: number;
  isOpen: boolean;
  onToggle: () => void;
  nodes: NodeModel<PermissionNodeDataType>[];
  setNodes: (nodes: NodeModel<PermissionNodeDataType>[]) => void;

  context: PermissionTreeContextEnum;
  role: any;
  member: any;
  memberRoles: any[];
}

const PermissionNode: FC<IPermissionNodeProps> = ({
  node,
  depth,
  isOpen,
  onToggle,
  nodes,
  setNodes,

  context,
  member,
  role,
  memberRoles,
}: IPermissionNodeProps) => {
  const { addToast } = useToasts();

  const [loading, setLoading] = useState<boolean>(false);

  const { schema } = usePermissions();

  const getCanvases = async (
    parentNode?: NodeModel<PermissionNodeDataType>
  ) => {
    setLoading(true);
    const payload = {
      parentCollectionID:
        node.data?.type === PermissionNodeTypeEnum.COLLECTION
          ? node.id
          : node.data?.collectionID,
      parentCanvasRepositoryID:
        node.data?.type === PermissionNodeTypeEnum.COLLECTION ? 0 : node.id,
    };
    let resp;
    if (context === PermissionTreeContextEnum.Member) {
      resp = await CollectionService.getUserCollectionCanvasesWithPG(
        member.user.id,
        payload
      );
    } else {
      resp = await CollectionService.getRoleCollectionCanvasesWithPG(
        role.id,
        payload
      );
    }
    if (!resp.data.data) {
      setLoading(false);
      return;
    }
    // const nodeIds = nodes.map((node) => node.id);

    const newNodeIds = resp.data.data.map(
      (newNode: CanvasDataType) => newNode.id
    );

    const canvasNodes: NodeModel<PermissionNodeDataType>[] = resp.data.data
      // .filter((can: CanvasDataType) => !nodeIds.includes(can.id))
      .map((canvas: CanvasDataType) => {
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
              memberRoles
            ),
          },
        };
      });

    let tempNodes: NodeModel<PermissionNodeDataType>[] = [
      ...nodes.filter((tmpNode) => !newNodeIds.includes(tmpNode.id)),
      ...canvasNodes,
    ];

    const rootCanvasCount = tempNodes.filter(
      (tmpNode: NodeModel<PermissionNodeDataType>) => {
        if (tmpNode?.data?.type === PermissionNodeTypeEnum.CANVAS) {
          const canvas = tmpNode?.data as CanvasDataType;
          return !canvas.parentCanvasRepositoryID;
        }
        return false;
      }
    ).length;

    const updatedNodeData = {
      areCanvasesFetched: true,
      computedRootCanvasCount: rootCanvasCount,
    };

    tempNodes = tempNodes.map((el) =>
      parentNode?.id === el.id
        ? parentNode
        : el.id === node.id
        ? {
            ...node,
            data:
              node?.data?.type === PermissionNodeTypeEnum.COLLECTION
                ? {
                    ...(node?.data as ICollectionPermissionNode),
                    ...updatedNodeData,
                  }
                : {
                    ...(node?.data as ICanvasPermissionNode),
                    ...updatedNodeData,
                  },
          }
        : el
    );

    setNodes(tempNodes);
    setLoading(false);
  };

  const handleRemoveCanvasPG = async (permissionId: number) => {
    try {
      /* const resp = CanvasBranchService.removeMember(permissionId);
      const updatedNodeIndex = nodes.findIndex(
        (n: NodeModel) => n.id === node.id
      );
      const updatedNode = {
        ...nodes[updatedNodeIndex],
        defaultBranch: {
          ...node.defaultBranch,
          permission: permissionGroup.systemName,
        },
      };
      let updatedNodes = [...nodes];
      updatedNodes[updatedNodeIndex] = updatedNode;
      setNodes(updatedNodes); */

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
  };

  return (
    <>
      {node?.data?.type === PermissionNodeTypeEnum.COLLECTION ? (
        <CollectionPermissionNode
          context={context}
          node={node}
          nodes={nodes}
          member={member}
          role={role}
          setNodes={setNodes}
          isOpen={isOpen}
          onToggle={onToggle}
          depth={depth}
          getCanvases={getCanvases}
          fetchingCanvases={loading}
        />
      ) : (
        <CanvasPermissionNode
          context={context}
          node={node}
          nodes={nodes}
          member={member}
          role={role}
          setNodes={setNodes}
          isOpen={isOpen}
          onToggle={onToggle}
          depth={depth}
          getCanvases={getCanvases}
          fetchingSubCanvases={loading}
        />
      )}
    </>
  );
};

export default PermissionNode;
