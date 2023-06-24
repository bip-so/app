import React, { FC, useState } from "react";
import { Box, Text } from "@primer/react";
import { PlugIcon } from "@primer/styled-octicons";
import FeatureDropdownItem from "./FeatureDropdownItem";
import FeatureItem from "./FeatureItem";

interface IntegrationsFeatureItemProps {}

const IntegrationsFeatureItem: FC<IntegrationsFeatureItemProps> = (props) => {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* <PlugIcon
        size={48}
        color={"#484F58"}
        sx={{
          width: ["24px", "24px", "48px", "48px"],
          height: ["20px", "20px", "40px", "40px"],
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
        Integrations
      </Text>
      {/* <FeatureDropdownItem
        isOpen={open}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        text={"Integrations"}
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
          head={"Integrations with Slack/Discord"}
          infoText={
            "Connect your bip workspace with your discord/slack community."
          }
          content={"Yes"}
        />
        <FeatureItem
          head={"Access canvas inside Discord"}
          infoText={
            "Our deep integration lets you access your canvases from Discord."
          }
          content={"Yes"}
        />
        <FeatureItem
          showBg={true}
          head={"bip Mark"}
          infoText={"Save conversations on Discord or Slack to your canvas"}
          content={"Yes"}
        />
        <FeatureItem
          head={"Sync role permissions"}
          infoText={
            "Members get the same permissions on bip as they have on Discord or Slack"
          }
          content={"Yes"}
        />
      </Box>
      <Box sx={{ border: "1px solid #D0D7DE", bg: "#D0D7DE", my: "28px" }} />
    </Box>
  );
};

export default IntegrationsFeatureItem;
