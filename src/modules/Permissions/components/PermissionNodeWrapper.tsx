import { FC, ReactNode } from "react";
import { NodeModel } from "@minoru/react-dnd-treeview";

import { PermissionNodeDataType } from "./PermissionTree";
import { PermissionNodeTypeEnum } from "./PermissionNode";
import { ICanvasPermissionNode, ICollectionPermissionNode } from "../types";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/styled-octicons";
import { Text } from "@primer/react";

interface IPermissionNodeWrapperProps {
  node: NodeModel<PermissionNodeDataType>;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  depth: number;
  getCanvases: () => void;
}

const PermissionNodeWrapper: FC<IPermissionNodeWrapperProps> = ({
  node,
  isOpen,
  onToggle,
  children,
  depth,
  getCanvases,
}) => {
  const indent = depth * 24;

  const handleToggle = (e: any) => {
    let fetchCanvases: boolean = true;
    if (isOpen || node.data?.areCanvasesFetched) fetchCanvases = false;
    else {
      if (node.data?.type === PermissionNodeTypeEnum.COLLECTION) {
        const collection = node.data as ICollectionPermissionNode;
        if (!collection.computedRootCanvasCount) {
          fetchCanvases = false;
        }
      } else {
        const canvas = node.data as ICanvasPermissionNode;
        if (!canvas.subCanvasCount) {
          fetchCanvases = false;
        }
      }
    }
    if (fetchCanvases) {
      getCanvases();
    }

    // if (
    //   !isOpen &&
    //   !node.data?.areCanvasesFetched &&
    //   ((node.data?.type === PermissionNodeTypeEnum.COLLECTION &&
    //     node.data?.computedRootCanvasCount) ||
    //     (node.data?.type === PermissionNodeTypeEnum.CANVAS &&
    //       node.data?.subCanvasCount))
    // ) {
    //   getCanvases();
    // }

    onToggle();
  };

  const NodeExpandIcon = ({
    node,
  }: {
    node: NodeModel<PermissionNodeDataType>;
  }) => {
    let visible = false;
    if (node?.data?.type === PermissionNodeTypeEnum.COLLECTION) {
      const collection = node?.data as ICollectionPermissionNode;
      visible = collection.computedRootCanvasCount > 0;
    } else {
      const canvas = node?.data as ICanvasPermissionNode;
      visible = canvas.subCanvasCount > 0;
    }

    return (
      <div
        className={`flex items-center mr-1 ${
          visible ? "visible" : "invisible"
        }`}
      >
        {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
      </div>
    );
  };

  return (
    <div
      onClick={handleToggle}
      style={{ paddingInlineStart: indent }}
      className="group  flex p-0.5 py-1 items-center  cursor-pointer justify-between"
    >
      <div className="flex items-center w-full">
        <NodeExpandIcon node={node} />

        <div className="flex items-center justify-between w-full text-base">
          <Text>{node.text}</Text>
          <div
            style={{
              paddingInlineStart: -indent,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionNodeWrapper;
