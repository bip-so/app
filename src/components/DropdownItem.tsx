import { Box, Text } from "@primer/react";
import { ChevronDownIcon, ChevronRightIcon } from "@primer/styled-octicons";
import { FC } from "react";

interface DropDownItemProps {
  title: string;
  count: number;
  opened: boolean;
  onClick: () => void;
}

const DropDownItem: FC<DropDownItemProps> = ({
  title,
  count,
  opened,
  onClick,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: "8px",
        // mx: "4px",
        px: "4px",
        cursor: count ? "pointer" : "default",
        alignItems: "center",
        opacity: count ? 1 : 0.5,
        borderRadius: "6px",
        ":hover": {
          bg: count ? "mentionDropdown.hoverBg" : "none",
        },
      }}
      onClick={() => {
        onClick();
      }}
    >
      <Box display={"flex"} alignItems={"center"}>
        <Text
          as="p"
          sx={{
            fontSize: "12px",
            lineHeight: "18px",
            fontWeight: 500,
            color: "mentionDropdown.text",
          }}
        >
          {title}
        </Text>
        <Box
          as="p"
          sx={{
            fontSize: "12px",
            lineHeight: "18px",
            ml: "8px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "mentionDropdown.countColor",
            bg: "mentionDropdown.countBg",
            width: "20px",
            height: "20px",
          }}
        >
          {count}
        </Box>
      </Box>
      {opened ? (
        <ChevronDownIcon size={16} sx={{ color: "mentionDropdown.text" }} />
      ) : (
        <ChevronRightIcon size={16} sx={{ color: "mentionDropdown.text" }} />
      )}
    </Box>
  );
};

export default DropDownItem;
