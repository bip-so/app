import React from "react";
import { Box } from "@primer/react";

interface CardProps {
  padding?: string;
  height?: string;
  width?: string;
  sx?: object;
  children?: any;
  display?: string;
  border: boolean;
}

const Card = (props: CardProps) => {
  const {
    sx,
    padding,
    children,
    height,
    width,
    display,
    border = true,
  } = props;
  return (
    <Box //default-card
      display={display}
      flexDirection="column"
      justifyContent={"center"}
      alignItems="center"
      padding={padding}
      boxShadow="0px 1px 0px rgba(27, 31, 35, 0.04)"
      borderRadius="12px"
      borderWidth={border ? "1px" : "0px"}
      borderStyle="solid"
      height={height}
      width={width}
      sx={sx}
    >
      {children}
    </Box>
  );
};

export default Card;
