import { Avatar, Box, Button, Text } from "@primer/react";
import Link from "next/link";

import React from "react";
import { useUser } from "../../context/userContext";
import BipRouteUtils from "../../core/routeUtils";
import segmentEvents from "../../insights/segment";
import Colors from "../../utils/Colors";
import LinkWithoutPrefetch from "../LinkWithoutPrefetch";

interface HeaderProps {
  hideBoxShadow?: boolean;
}

const Header = (props: HeaderProps) => {
  const { isLoggedIn } = useUser();
  const goToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      window?.scrollTo({ top: element?.offsetTop, behavior: "smooth" });
    }
  };

  const goToExplore = () => {
    const element = document.getElementById("explore");
    if (element) {
      window?.scrollTo({ top: element?.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <Box
      position={"fixed"}
      padding={"10px 20px"}
      bg={"transparent"}
      top={"0px"}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"space-between"}
      zIndex={100}
      // boxShadow={props.hideBoxShadow ? "" : "0px 4px 27px rgba(0, 0, 0, 0.04)"}
      width={"100%"}
      background="white"
    >
      <Box
        className="flex items-center justify-center md:mx-8"
        sx={{
          gap: ["1.2rem", "1.2rem", "2rem", "2rem"],
        }}
      >
        <LinkWithoutPrefetch href="/">
          <div
            className="cursor-pointer"
            style={{
              width: "52px",
            }}
          >
            <Avatar
              src="favicon.ico"
              size={52}
              sx={{ ml: ["0px", "0px", "10px", "10px"] }}
            />
          </div>
        </LinkWithoutPrefetch>
        <Box
          className="flex items-center justify-center gap-8"
          // sx={{ display: ["none", "none", "flex", "flex"] }}
        >
          {/* <Text className="text-gray-500">Explore</Text> */}
          <Text
            sx={{ display: ["none", "none", "flex", "flex"], fontSize: "14px" }}
            onClick={goToFeatures}
            className="text-gray-700 cursor-pointer hover:text-black"
          >
            Features
          </Text>
          <LinkWithoutPrefetch href="/pricing">
            <Text
              sx={{
                fontSize: "14px",
              }}
              className="text-base text-gray-700 cursor-pointer hover:text-black"
            >
              Pricing
            </Text>
          </LinkWithoutPrefetch>
          <LinkWithoutPrefetch href="/authExplore">
          <Text
            sx={{
              fontSize: "14px",
            }}
            onClick={goToExplore}
            className="text-base text-gray-700 cursor-pointer hover:text-black"
          >
            Explore
          </Text>
          </LinkWithoutPrefetch>
        </Box>
      </Box>
      <Box className="flex items-center justify-center gap-8 mx-8">
        {isLoggedIn ? null : (
          <LinkWithoutPrefetch href={BipRouteUtils.getSignInRoute()}>
            <Button
              variant="invisible"
              sx={{
                color: Colors.gray["700"],
                border: "2px solid",
                borderColor: Colors.gray["700"],
                ":hover:not([disabled])": {
                  color: Colors.gray["700"],
                  bg: Colors.gray["0"],
                },
              }}
              onClick={() => {
                segmentEvents.signUpLoginClicked("top-right");
              }}
            >
              Login/ Sign Up
            </Button>
          </LinkWithoutPrefetch>
        )}
      </Box>
    </Box>
  );
};

export default Header;
