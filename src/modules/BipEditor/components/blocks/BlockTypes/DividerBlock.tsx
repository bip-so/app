import { Box, useTheme } from "@primer/react";
import { useFocused, useSelected } from "slate-react";
import Colors from "../../../../../utils/Colors";

function DividerBlock({ element, children, data, actions, attributes }) {
  const selected = useSelected();
  const focused = useFocused();
  const { colorMode } = useTheme();
  return (
    <Box
      {...attributes}
      contentEditable={false}
      sx={{
        cursor: "auto",
        width: "100%",
        borderTop: "1px solid ",
        borderTopColor: selected
          ? "dividerBlock.selected"
          : "dividerBlock.default",
        display: "inline-flex",
        position: "relative",
        top: "-4px",
        boxShadow:
          selected && focused
            ? `0px 0px 0px 6px ${
                colorMode === "day" ? Colors.blue["200"] : Colors.blue["300"]
              }`
            : null,
      }}
    >
      {children}
    </Box>
  );
}

export default DividerBlock;
