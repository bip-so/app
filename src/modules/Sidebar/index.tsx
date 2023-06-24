import React from "react";
import { Box, Heading } from "@primer/react";

import TopNav from "./components/TopNav";
import StudioNav from "./components/StudioNav";
import { useUser } from "../../context/userContext";
import UserMenu from "./components/UserMenu";
import { isEmpty } from "../../utils/Common";
import { useRouter } from "next/router";
import LoginButton from "../User/components/LoginButton";
import Crisp from "../../insights/crisp";
import useDeviceDimensions from "../../hooks/useDeviceDimensions";

const Sidebar = () => {
  const { isLoggedIn } = useUser();
  const router = useRouter();

  const { isTabletOrMobile } = useDeviceDimensions();
  return (
    <Box
      className="relative flex flex-col h-full"
      sx={{ color: "layout.sidebar.text" }}
    >
      <div className="flex flex-col flex-1 overflow-auto">
        <Heading sx={{ fontSize: 4, my: 3, px: 2 }}>bip.so</Heading>
        <TopNav />
        <StudioNav />
      </div>
      {isLoggedIn ? (
        <UserMenu />
      ) : (
        <Box className="flex mx-2 mb-3">
          <LoginButton returnUrl={router.asPath} sx={{ flex: 1 }} />
        </Box>
      )}
      <Crisp />
      {isTabletOrMobile ? <Box paddingBottom={"70px"}></Box> : null}
    </Box>
  );
};

export default Sidebar;
