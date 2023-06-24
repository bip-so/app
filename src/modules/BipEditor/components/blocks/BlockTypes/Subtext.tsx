import { Box } from "@primer/react";
import React from "react";

const Subtext = ({ attributes, children, data, actions, element }: any) => {
  const renderedJSX = (
    <Box
      sx={{
        color: "subTextBlock.text",
        fontSize: "12px",
      }}
      {...attributes}
    >
      {children}
    </Box>
  );
  return <div>{renderedJSX}</div>;
};

export default Subtext;
