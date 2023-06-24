import { Box, Text } from "@primer/react";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/styled-octicons";
import React, { FC } from "react";

interface FeatureDropdownItemProps {
  text: string;
  onClick: () => void;
  isOpen: boolean;
  infoText: string;
}

const FeatureDropdownItem: FC<FeatureDropdownItemProps> = (props) => {
  const { text, onClick, isOpen, infoText } = props;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: ["flex-start", "flex-start", "center", "center"],
        mb: ["0px", "0px", "32px", "32px"],
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: ["flex-start", "flex-start", "center", "center"],
          width: "50%",
        }}
      >
        <Box onClick={onClick} sx={{ cursor: "pointer", display: "flex" }}>
          {isOpen ? (
            <ChevronDownIcon color={"#484F58"} size={16} />
          ) : (
            <ChevronRightIcon color={"#484F58"} size={16} />
          )}
        </Box>
        <Box sx={{ ml: "12px" }}>
          <Text
            as="p"
            sx={{
              fontWeight: 600,
              fontSize: ["14px", "14px", "16px", "16px"],
              lineHeight: ["18px", "18px", "24px", "24px"],
              color: "#484F58",
            }}
          >
            {text}
          </Text>

          <Text
            as="p"
            sx={{
              fontSize: "12px",
              lineHeight: "18px",
              color: "#8B949E",
              mt: "8px",
              display: !isOpen ? "none" : ["block", "block", "none", "none"],
            }}
          >
            {infoText}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default FeatureDropdownItem;
