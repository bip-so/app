import { Box } from "@primer/react";
import React from "react";

const Default = ({ attributes, children, data, actions, element }: any) => {
  const renderedJSX = (
    <Box
      sx={{
        color: "defaultBlock.text",
      }}
      {...attributes}
    >
      {children}
    </Box>
  );
  return <div>{renderedJSX}</div>;
};

export default Default;
