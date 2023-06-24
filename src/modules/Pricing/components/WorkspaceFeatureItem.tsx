import React, { FC, useState } from "react";
import { Box, Text } from "@primer/react";
import FeatureDropdownItem from "./FeatureDropdownItem";
import FeatureItem from "./FeatureItem";
import { BriefcaseIcon } from "@primer/styled-octicons";

interface WorkspaceFeatureItemProps {}

const WorkspaceFeatureItem: FC<WorkspaceFeatureItemProps> = (props) => {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* <BriefcaseIcon
        color={"#484F58"}
        sx={{
          width: ["24px", "24px", "48px", "48px"],
          height: ["20px", "20px", "45px", "45px"],
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
        Workspace
      </Text>
      {/* <FeatureDropdownItem
        isOpen={open}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        text={"Studio"}
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
          head={"Workspace Members"}
          infoText={
            "This is the total number of users who are part of your workspace."
          }
          content={"Yes"}
        />
        <FeatureItem
          head={"Total Workspace Storage"}
          infoText={"This is size of all your canvases combined"}
          content={"Unlimited"}
        />
      </Box>
      <Box sx={{ border: "1px solid #D0D7DE", bg: "#D0D7DE", my: "28px" }} />
    </Box>
  );
};

export default WorkspaceFeatureItem;
