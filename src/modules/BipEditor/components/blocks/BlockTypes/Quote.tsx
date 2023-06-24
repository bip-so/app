import { Box } from "@primer/react";
import React from "react";

const Quote = ({ attributes, children, data, actions, element }: any) => {
  const renderedJSX = (
    <Box
      as={"blockquote"}
      sx={{
        color: "quoteBlock.text",
        paddingLeft: "16px",
        borderLeft: "3px solid",
        borderLeftColor: "quoteBlock.borderColor",
      }}
      {...attributes}
    >
      {children}
    </Box>
  );
  return <div>{renderedJSX}</div>;
};

export default Quote;
