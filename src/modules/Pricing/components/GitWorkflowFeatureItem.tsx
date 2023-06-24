import React, { FC, useState } from "react";
import { Box, Text } from "@primer/react";
import { WorkflowIcon } from "@primer/styled-octicons";
import FeatureDropdownItem from "./FeatureDropdownItem";
import FeatureItem from "./FeatureItem";

interface GitWorkflowFeatureItemProps {}

const GitWorkflowFeatureItem: FC<GitWorkflowFeatureItemProps> = (props) => {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* <WorkflowIcon
        size={48}
        color={"#484F58"}
        sx={{
          width: ["24px", "24px", "48px", "48px"],
          height: ["24px", "24px", "48px", "48px"],
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
        Git Workflow
      </Text>
      {/* <FeatureDropdownItem
        isOpen={open}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        text={"Access"}
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
          head={"Edit Access"}
          infoText={
            "Moderator can add/remove members who can edit the canvas. Moderator can also add new moderators."
          }
          content={"Yes"}
        />
        <FeatureItem
          head={"Git Workflow"}
          infoText={
            "Any changes to the canvases is approved by the moderator before it is merged."
          }
          content={"Yes"}
        />
        <FeatureItem
          showBg={true}
          head={"Role Based Access"}
          infoText={
            "Moderators can change the access for a role consisting of group of members, instead of each member."
          }
          content={"Yes"}
        />
        <FeatureItem
          head={"Add Custom Roles"}
          infoText={"Moderators can create new roles"}
          content={"Yes"}
        />
      </Box>
      <Box sx={{ border: "1px solid #D0D7DE", bg: "#D0D7DE", my: "28px" }} />
    </Box>
  );
};

export default GitWorkflowFeatureItem;
