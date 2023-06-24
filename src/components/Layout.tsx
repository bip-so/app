import { Box, PageLayout } from "@primer/react";
import { relative } from "path";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";

import { LayoutProps } from "../commons/interfaces";
import Sidebar from "../modules/Sidebar/index";
import Container from "../modules/Notifications/Container";
import { DesktopContainer, MobileContainer } from "../utils/Common";
import LayoutFAB from "./LayoutFAB";
import { useLayout } from "../context/layoutContext";
import useDeviceDimensions from "../hooks/useDeviceDimensions";
import Head from "next/head";
import { DndProvider } from "react-dnd";
import { getBackendOptions, MultiBackend } from "@minoru/react-dnd-treeview";
import { useStudio } from "../context/studioContext";
import { usePages } from "../context/pagesContext";

const Layout: FC<LayoutProps> = ({ children, ...props }) => {
  // const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1224px)" });
  const {
    isSideNavOpen,
    setIsSideNavOpen,
    isPinned,
    showNotificationContainer,
    showCreateStudioContainer,
    showUserMenu,
  } = useLayout();
  const { clearCurrentStudio } = useStudio();
  const { updatePages } = usePages();

  const { isTabletOrMobile } = useDeviceDimensions();

  const options = {
    touch: {
      scrollAngleRanges: [
        { start: 30, end: 150 },
        { start: 210, end: 330 },
      ],
    },
  };

  useEffect(() => {
    clearCurrentStudio();
    updatePages([]);
  }, []);

  return (
    <>
      <Head>
        <link rel="icon" type="image/x-icon" href={"/favicon.ico"} />
      </Head>
      {/* <MobileContainer>
        {showSidebar ? true : false}
        <div className="w-10/12 mx-auto">{children}</div>
      </MobileContainer> */}
      {/* <DesktopContainer> */}
      <PageLayout
        columnGap="none"
        containerWidth="full"
        padding="none"
        sx={{
          overflow: "hidden",
        }}
      >
        {/* {isTabletOrMobile ? setIsSideNavOpen(false) : setIsSideNavOpen(true)} */}
        {isTabletOrMobile ? (
          <LayoutFAB
            opened={isSideNavOpen}
            onClick={() => {
              setIsSideNavOpen(!isSideNavOpen);
            }}
          />
        ) : null}
        {isSideNavOpen ||
        showNotificationContainer ||
        showCreateStudioContainer ? (
          <Box
            sx={
              isTabletOrMobile
                ? {
                    position: "fixed",
                    zIndex: 1001,
                    display: "flex",
                    left:
                      showNotificationContainer ||
                      showCreateStudioContainer ||
                      showUserMenu
                        ? "-240px"
                        : "0px",
                  }
                : {}
            }
          >
            <PageLayout.Pane
              position="start"
              sx={{
                width: "240px!important",
                height: "100vh",
                backgroundColor: "layout.sidebar.bg",
                flexDirection: "unset",
                overflow: "hidden",
              }}
            >
              <Sidebar />
            </PageLayout.Pane>
          </Box>
        ) : null}
        <PageLayout.Content width="full" sx={{ bg: "layout.bg" }}>
          <Box
            width={"100%"}
            sx={{
              height: "100vh",
              overflow: "auto",
              scrollbarWidth: "thin",
            }}
            id="home-layout-content"
          >
            <DndProvider
              backend={MultiBackend}
              options={getBackendOptions(options)}
            >
              {children}
            </DndProvider>
            {/* <div className="w-10/12"> */}
            {/* </div> */}
          </Box>
          {/* <Container /> */}
        </PageLayout.Content>
      </PageLayout>
      {/* </DesktopContainer> */}
    </>
  );
};

export default Layout;
