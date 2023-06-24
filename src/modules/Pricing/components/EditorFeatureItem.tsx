import React, { FC, useState } from "react";
import { Box, Text } from "@primer/react";
import FeatureDropdownItem from "./FeatureDropdownItem";
import FeatureItem from "./FeatureItem";
import PencilDraftIcon from "../../../icons/PencilDraftIcon";

interface EditorFeatureItemProps {}

const EditorFeatureItem: FC<EditorFeatureItemProps> = (props) => {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* <Box
        sx={{
          display: "flex",
          width: ["24px", "24px", "48px", "48px"],
          height: ["20px", "20px", "36px", "36px"],
        }}
      >
        <PencilDraftIcon />
      </Box> */}
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
        Editor
      </Text>
      {/* <FeatureDropdownItem
        isOpen={open}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        text={"Editor"}
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
          head={"Slash Command"}
          infoText={
            "All the functionalities are easily accesible with a “/” command."
          }
          content={"Yes"}
        />
        <FeatureItem
          head={"Contributor Attribution"}
          infoText={
            "Each contribution is attributed to the member who has added value to the canvas."
          }
          content={"Yes"}
        />
        <FeatureItem
          showBg={true}
          head={"Version History"}
          infoText={"View what changes were made in the canvas"}
          content={"Yes"}
        />
        <FeatureItem
          head={"Blocks - Tables, Embeds"}
          infoText={
            "Add headings, tables, embed figma, videos and tons of other things"
          }
          content={"Yes"}
        />
        <FeatureItem
          showBg={true}
          head={"File Upload Size"}
          infoText={"The file size limit on each block."}
          content={"Yes"}
        />
        <FeatureItem
          head={"Sync across devices"}
          infoText={"We auto sync the changes in canvases across devices"}
          content={"Yes"}
        />
      </Box>
      <Box sx={{ border: "1px solid #D0D7DE", bg: "#D0D7DE", my: "28px" }} />
    </Box>
  );
};

export default EditorFeatureItem;
