import React, { FC, useState } from "react";
import { Box, Text } from "@primer/react";
import FeatureDropdownItem from "./FeatureDropdownItem";
import FeatureItem from "./FeatureItem";
import HindiAIcon from "../../../icons/HindiAIcon";

interface TranslationFeatureItemProps {}

const TranslationFeatureItem: FC<TranslationFeatureItemProps> = (props) => {
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
        <HindiAIcon />
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
        Language Translation
      </Text>
      {/* <FeatureDropdownItem
        isOpen={open}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        text={"Language Translation"}
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
          head={"Manual"}
          infoText={
            "Translate your canvas from English to multiple other languages."
          }
          content={"Yes"}
        />
        <FeatureItem
          head={"Number of languages"}
          infoText={"This is the number of languages available on bip."}
          content={"75"}
        />
      </Box>
      <Box sx={{ border: "1px solid #D0D7DE", bg: "#D0D7DE", my: "28px" }} />
    </Box>
  );
};

export default TranslationFeatureItem;
