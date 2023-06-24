import { Box, Text, Tooltip } from "@primer/react";
import { InfoIcon } from "@primer/styled-octicons";
import React, { FC } from "react";

interface FeatureItemProps {
  showBg?: boolean;
  head: string;
  infoText: string;
  content: string;
  subContent?: string;
  isCanvasFeatureItem?: boolean;
}

const FeatureItem: FC<FeatureItemProps> = (props) => {
  const { showBg, head, content, subContent, infoText, isCanvasFeatureItem } =
    props;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        py: "24px",
        borderRadius: "8px",
        bg: showBg
          ? "#F6F8FA"
          : ["#F6F8FA", "#F6F8FA", "transparent", "transparent"],
        mt: ["12px", "12px", "0px", "0px"],
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: ["column", "column", "row", "row"],
          alignItems: ["flex-start", "flex-start", "center", "center"],
          width: "50%",
        }}
      >
        <Tooltip
          aria-label={infoText}
          noDelay
          sx={{
            display: "inline-flex",
            alignItems: "center",
            cursor: ["auto", "auto", "help", "help"],
            "::before": {
              display: [
                "none !important",
                "none !important",
                "flex !important",
                "flex !important",
              ],
            },
            "::after": {
              display: [
                "none !important",
                "none !important",
                "flex !important",
                "flex !important",
              ],
            },
          }}
        >
          <Text
            as="p"
            sx={{
              fontSize: ["14px", "14px", "16px", "16px"],
              lineHeight: ["18px", "18px", "24px", "24px"],
              color: "#484F58",
              ml: ["28px", "28px", "64px", "64px"],
              mr: "16px",
            }}
          >
            {head}
          </Text>
          <Box sx={{ display: ["none", "none", "flex", "flex"] }}>
            <InfoIcon size={20} color={"#8B949E"} />
          </Box>
        </Tooltip>
        <Text
          as="p"
          sx={{
            display: ["block", "block", "none", "none"],
            fontSize: ["12px", "12px", "16px", "16px"],
            lineHeight: ["18px", "18px", "24px", "24px"],
            color: "#8B949E",
            ml: "28px",
            mr: "16px",
            mt: "8px",
          }}
        >
          {infoText}
        </Text>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "50%",
        }}
      >
        <Text
          as="p"
          sx={{
            fontSize: ["12px", "12px", "16px", "16px"],
            lineHeight: ["18px", "18px", "24px", "24px"],
            color: "#000",
            textAlign: "center",
          }}
        >
          {content}
        </Text>
        {subContent ? (
          <Text
            as="p"
            sx={{
              fontSize: ["12px", "12px", "16px", "16px"],
              lineHeight: ["18px", "18px", "24px", "24px"],
              color: "#000",
              textAlign: "center",
              mt: ["24px", "24px", "0px", "0px"],
            }}
          >
            {subContent}
          </Text>
        ) : null}
        {isCanvasFeatureItem ? (
          <Text
            as="p"
            sx={{
              fontSize: ["12px", "12px", "16px", "16px"],
              lineHeight: ["18px", "18px", "24px", "24px"],
              color: "#000",
              textAlign: "center",
              mt: ["24px", "24px", "0px", "0px"],
            }}
          >
            Unlimited Private Canvases{" "}
            <Text
              sx={{
                fontSize: ["12px", "12px", "16px", "16px"],
                lineHeight: ["18px", "18px", "24px", "24px"],
                color: "#000",
                whiteSpace: "nowrap",
              }}
            >
              (in Pro)
            </Text>
          </Text>
        ) : null}
      </Box>
    </Box>
  );
};

export default FeatureItem;
