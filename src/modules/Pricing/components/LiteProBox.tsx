import { StarFillIcon } from "@primer/octicons-react";
import { Box, Button, Text } from "@primer/react";
import { DiamondIcon, ZapIcon } from "@primer/styled-octicons";
import Link from "next/link";
import React, { FC } from "react";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";
import BipRouteUtils from "../../../core/routeUtils";

interface LiteProBoxProps {
  isPro: boolean;
}

const LiteProBox: FC<LiteProBoxProps> = (props) => {
  const { isPro } = props;

  return (
    <Box
      sx={{
        width: ["303px", "303px", "480px", "480px"],
        display: "flex",
        flexDirection: "column",
        padding: ["48px 40px", "48px 40px", "48px 40px 80px", "48px 40px 80px"],
        bg: "#FFFFFF",
        border: "1px solid rgba(27, 31, 35, 0.15)",
        borderRadius: ["12px", "12px", "20px", "20px"],
      }}
    >
      {isPro ? (
        <DiamondIcon color={"#484F58"} />
      ) : (
        <ZapIcon color={"#484F58"} />
      )}
      <Text
        as="p"
        sx={{
          fontSize: ["14px", "14px", "24px", "24px"],
          lineHeight: ["20px", "20px", "48px", "48px"],
          color: "#484F58",
          fontWeight: 600,
          mt: ["4px", "4px", "16px", "16px"],
        }}
      >
        {isPro ? "Pro" : "Lite"}
      </Text>
      <Text
        as="p"
        sx={{
          fontSize: ["24px", "24px", "48px", "48px"],
          lineHeight: ["30px", "30px", "72px", "72px"],
          color: "#30363D",
          fontWeight: 600,
          mt: ["6px", "6px", "12px", "12px"],
        }}
      >
        {isPro ? "$10" : "$0"}
      </Text>
      <Text
        as="p"
        sx={{
          fontSize: ["12px", "12px", "16px", "16px"],
          lineHeight: ["18px", "18px", "24px", "24px"],
          color: "text.muted",
        }}
      >
        {isPro ? "per 1000 members per month" : "Free forever"}
      </Text>
      <Text
        as="p"
        sx={{
          fontSize: ["12px", "12px", "16px", "16px"],
          lineHeight: ["18px", "18px", "24px", "24px"],
          color: "text.muted",
          mt: "6px",
          visibility: isPro ? "visible" : "hidden",
        }}
      >
        {"Capped at $100 per month"}
      </Text>

      <Box
        sx={{
          border: "1px solid #8B949E",
          opacity: "0.8",
          bg: "#8B949E",
          width: ["80px", "80px", "200px", "200px"],
          mt: ["12px", "12px", "24px", "24px"],
        }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mt: ["22px", "22px", "50px", "50px"],
          gap: ["16px", "16px", "32px", "32px"],
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <StarFillIcon fill={"#6E7681"} />
          <Text
            as="p"
            sx={{
              fontSize: ["14px", "14px", "20px", "20px"],
              lineHeight: ["20px", "20px", "30px", "30px"],
              color: "#1B1F23",
              fontWeight: 600,
              ml: ["8px", "8px", "16px", "16px"],
            }}
          >
            {isPro ? "Unlimited Private Canvases" : "25 Private Canvases"}
          </Text>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <StarFillIcon fill={"#6E7681"} />
          <Text
            as="p"
            sx={{
              fontSize: ["14px", "14px", "20px", "20px"],
              lineHeight: ["20px", "20px", "30px", "30px"],
              color: "#484F58",
              ml: ["8px", "8px", "16px", "16px"],
            }}
          >
            Unlimited Public Canvases
          </Text>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <StarFillIcon fill={"#6E7681"} />
          <Text
            as="p"
            sx={{
              fontSize: ["14px", "14px", "20px", "20px"],
              lineHeight: ["20px", "20px", "30px", "30px"],
              color: "#484F58",
              ml: ["8px", "8px", "16px", "16px"],
            }}
          >
            All Features Included
          </Text>
        </Box>
      </Box>
      <Box
        sx={{
          flexDirection: "column",
          alignItems: "start",
          mt: "34px",
          display: ["flex", "flex", "none", "none"],
        }}
      >
        <Text
          as="p"
          sx={{ fontSize: "14px", lineHeight: "20px", color: "#484F58" }}
        >
          No credit card required*
        </Text>
        <LinkWithoutPrefetch href={BipRouteUtils.getSignInRoute()}>
          <Button variant="primary" size={"medium"} sx={{ mt: "8px" }}>
            Get started for free
          </Button>
        </LinkWithoutPrefetch>
      </Box>
    </Box>
  );
};

export default LiteProBox;
