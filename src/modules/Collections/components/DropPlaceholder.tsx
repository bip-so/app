import { NodeModel } from "@minoru/react-dnd-treeview";
import { Box } from "@primer/react";
import { FC } from "react";
import { PageType } from "../../../context/pagesContext";

interface IDropPlaceholderProps {
  node: NodeModel<PageType>;
  depth: number;
}

const DropPlaceholder: FC<IDropPlaceholderProps> = ({
  node,
  depth,
}: IDropPlaceholderProps) => {
  const left = depth * 24;
  return (
    <Box
      sx={{
        backgroundColor: "border.ultraSubtle",
        height: "2px!important",
        position: "absolute",
        right: 0,
        top: 0,
        transform: "translateY(-50%)",
        left,
      }}
    ></Box>
  );
};

export default DropPlaceholder;
