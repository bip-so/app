import React, { FC } from "react";
import { Avatar, Box, Text } from "@primer/react";
import { StudioType } from "../modules/Explore/types";
import ImageWithName from "./ImageWithName";
import Link from "next/link";
import LinkWithoutPrefetch from "./LinkWithoutPrefetch";

interface CommunityCardProps {
  studio: StudioType;
}

const CommunityCard: FC<CommunityCardProps> = ({ studio }) => {
  return (
    <LinkWithoutPrefetch href={`/@${studio.handle}/about`}>
      <Box
        p={"16px"}
        bg={"auth.home.box2.cardBg"}
        borderRadius={"8px"}
        width={"284px"}
        height={"140px"}
        mr={"1rem"}
        mb={"2rem"}
        display={"flex"}
        flexDirection={"column"}
        sx={{ cursor: "pointer" }}
      >
        <Box display={"flex"} flex={1}>
          <ImageWithName
            sx={{
              height: "48px",
              width: "48px",
              color: "auth.home.box2.image",
              border: studio.imageUrl ? "none" : "1px solid",
              borderColor: "auth.home.box2.image",
            }}
            src={studio.imageUrl}
            name={studio.displayName}
          />
          <Box display={"flex"} flex={1} flexDirection="column" ml={"12px"}>
            <Text
              as="p"
              color={"auth.home.box2.cardHead"}
              fontSize={["14px", "14px", "14px", "16px"]}
              lineHeight={"26px"}
              fontWeight={400}
            >
              {studio.displayName}
            </Text>
            <Text
              color={"auth.home.box2.cardSubHead"}
              fontSize={["13px", "13px", "13px", "14px"]}
              lineHeight={"22px"}
              fontWeight={400}
              sx={{
                overflow: "hidden",
                whiteSpace: "normal",
                display: "-webkit-box",
                wordBreak: "break-word",
                WebkitLineClamp: 2,
              }}
              style={{
                WebkitBoxOrient: "vertical",
              }}
            >
              {studio.description}
            </Text>
          </Box>
        </Box>
        <Box height={"1px"} bg={"auth.home.box2.divider"} my={"8px"} />
        <Text
          as="p"
          color={"auth.home.box2.cardSubHead"}
          fontSize="12px"
          lineHeight={"18px"}
          fontWeight={400}
        >
          {studio.membersCount} Members
        </Text>
      </Box>
    </LinkWithoutPrefetch>
  );
};

export default CommunityCard;
