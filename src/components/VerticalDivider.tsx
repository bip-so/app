import React from "react";
import { Box } from "@primer/react";

interface VerticalDividerProps {
  height?: string;
  marginLeft?: string;
  marginRight?: string;
}

const VerticalDivider = (props: VerticalDividerProps) => {
  const { marginLeft = "16px", marginRight = "16px", height = "100%" } = props;
  return (
    <Box //default-card
      sx={{
        width: 1,
        display: "inline-flex",
        alignItems: "center",
        borderLeftWidth: 1,
        borderLeftStyle: "solid",
        borderLeftColor: "verticalDivider.border",
        height: height,
        marginLeft: marginLeft,
        marginRight: marginRight,
      }}
    />
  );
};

export default VerticalDivider;
