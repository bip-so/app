import { Box, Text } from "@primer/react";
import React from "react";
import PointLeftIcon from "../icons/PointLeftIcon";

const CanvasNotFound = () => {
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      padding={"32px"}
      marginTop={"50px"}
    >
      <PointLeftIcon />
      <Text
        as="p"
        fontWeight={600}
        fontSize={"24px"}
        margin={"20px 0"}
        lineHeight={"36px"}
      >
        Canvas not found.
      </Text>

      <Text
        as="p"
        sx={{
          width: "400px",
        }}
        textAlign={"center"}
        fontSize={"14px"}
        color={"text.subtle"}
      >
        {`Someone is pulling your leg, or they have changed their mind and deleted
        the canvas. But since you're here anyways, you could check out the ones
        you have access to :P`}
      </Text>
    </Box>
  );
};

export default CanvasNotFound;
