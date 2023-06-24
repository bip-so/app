import { Box } from "@primer/react";
import React from "react";

const MergeBlockWrapper = ({ children, element }) => {
  return (
    <Box
      sx={{
        bg: element.bgColor,
        width: ["100%", "100%", "600px", "800px"],
      }}
    >
      {children}
    </Box>
  );
};

export default MergeBlockWrapper;
