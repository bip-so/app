import React, { FC, useState } from "react";
import { Box, Text } from "@primer/react";
import { NoteIcon } from "@primer/styled-octicons";
import FeatureDropdownItem from "./FeatureDropdownItem";
import FeatureItem from "./FeatureItem";

interface CanvasFeatureItemProps {}

const CanvasFeatureItem: FC<CanvasFeatureItemProps> = (props) => {
  const [open, setOpen] = useState(true);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mt: ["46px", "46px", "74px", "74px"],
      }}
    >
      {/* <NoteIcon
        size={48}
        color={"#484F58"}
        sx={{
          width: ["24px", "24px", "48px", "48px"],
          height: ["20px", "20px", "36px", "36px"],
        }}
      /> */}
      <Text
        as="p"
        sx={{
          fontSize: ["14px", "14px", "24px", "24px"],
          lineHeight: ["20px", "20px", "36px", "36px"],
          fontWeight: 600,
          color: "#484F58",
          mt: ["6px", "6px", "10px", "10px"],
          mb: ["20px", "20px", "44px", "44px"],
        }}
      >
        Canvas
      </Text>
      {/* <FeatureDropdownItem
        isOpen={open}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        text={"Canvas"}
        infoText={"These are documents where your community collaborates"}
      /> */}
      <Box
        sx={{
          display: open ? "flex" : "none",
          flexDirection: "column",
        }}
      >
        <FeatureItem
          showBg={true}
          head={"Private Canvas"}
          infoText={
            "These canvases can be viewed only by specific users decided by the moderator."
          }
          content={"25 Private Canvases"}
          isCanvasFeatureItem
        />
        <FeatureItem
          head={"Public Canvas"}
          infoText={
            "Anobody can view these canvases. Just add “/public” to the canvas and you are good to go."
          }
          content={"Unlimited Public Canvases"}
        />
      </Box>
      <Box sx={{ border: "1px solid #D0D7DE", bg: "#D0D7DE", my: "28px" }} />
    </Box>
  );
};

export default CanvasFeatureItem;
