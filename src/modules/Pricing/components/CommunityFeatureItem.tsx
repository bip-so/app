import React, { FC, useState } from "react";
import { Box, Text } from "@primer/react";
import FeatureDropdownItem from "./FeatureDropdownItem";
import FeatureItem from "./FeatureItem";
import { PeopleIcon } from "@primer/styled-octicons";

interface CommunityFeatureItemProps {}

const CommunityFeatureItem: FC<CommunityFeatureItemProps> = (props) => {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* <PeopleIcon
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
        Community
      </Text>
      {/*  <FeatureDropdownItem
        isOpen={open}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        text={"Share With the World"}
        infoText={""}
      /> */}
      <Box
        sx={{
          display: open ? "flex" : "none",
          flexDirection: "column",
        }}
      >
        <FeatureItem
          showBg={true}
          head={"Posts"}
          infoText={
            "Share discussion, announcement, snippets of your canvases with your community or to the world."
          }
          content={"Yes"}
        />
        <FeatureItem
          head={"Explore"}
          infoText={
            "A place for you to showcase your workspace. A place to discover other communities like you."
          }
          content={"Yes"}
        />
      </Box>
      <Box sx={{ border: "1px solid #D0D7DE", bg: "#D0D7DE", my: "28px" }} />
    </Box>
  );
};

export default CommunityFeatureItem;
