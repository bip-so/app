import { Box } from "@primer/react";
import { FileIcon } from "@primer/styled-octicons";
import { FC, useEffect } from "react";

interface ICanvasDragPreviewProps {
  monitorProps: any;
  canChangePosition?: boolean;
}

const CanvasDragPreview: FC<ICanvasDragPreviewProps> = ({
  monitorProps,
  canChangePosition,
}: ICanvasDragPreviewProps) => {
  const item = monitorProps.item;
  return (
    <Box
      display="flex"
      sx={{
        bg: "sidebar.bg",
        alignItems: "center",
        maxWidth: "200px!important",
        color: "text.muted",
      }}
    >
      <div className={"flex items-center text-base p-0.5 py-1"}>
        {canChangePosition ? (
          <>
            <FileIcon className="mr-1" />
            <span>
              {item.name}
              {/* {node.name} - {node.id} - {node.position} */}
            </span>
          </>
        ) : (
          <span>Only admin can move</span>
        )}
      </div>
    </Box>
  );
};

export default CanvasDragPreview;
