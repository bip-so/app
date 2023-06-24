import { Box, IconButton, PageLayout, Text } from "@primer/react";
import React, { FC, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@primer/styled-octicons";

import { useStudio } from "../../context/studioContext";
import { useUser } from "../../context/userContext";

import { LayoutProps } from "../../commons/interfaces";
import UserMenu from "../../modules/Sidebar/components/UserMenu";
import CollectionTree from "../../modules/Collections/components/CollectionTree";
import ImageWithName from "../../components/ImageWithName";
import { useLayout } from "../../context/layoutContext";
import { DndProvider } from "react-dnd";
import { getBackendOptions, MultiBackend } from "@minoru/react-dnd-treeview";
import useDeviceDimensions from "../../hooks/useDeviceDimensions";
import LayoutFAB from "../../components/LayoutFAB";
import { useCanvas } from "../../context/canvasContext";

const TRANSITION_DELAY = "0.2s";

const PublicLayout: FC<LayoutProps> = ({ children, ...props }) => {
  const { isLoggedIn } = useUser();
  const { isSideNavOpen, setIsSideNavOpen, isPinned } = useLayout();

  const { currentStudio } = useStudio();

  const { setIsPublicView } = useCanvas();

  useEffect(() => {
    setIsPublicView(true);
  }, []);
  const { isTabletOrMobile } = useDeviceDimensions();

  return (
    <>
      <DndProvider backend={MultiBackend} options={getBackendOptions()}>
        <PageLayout columnGap="none" containerWidth="full" padding="none">
          <Box
            position={"fixed"}
            display="flex"
            sx={{
              top: isSideNavOpen ? 0 : "70px",
              zIndex: 100,
              height: isSideNavOpen ? "unset" : "calc(100vh - 70px)",
              transition: TRANSITION_DELAY,
              left: isSideNavOpen || isPinned ? "0px" : "-260px",
              paddingRight: isTabletOrMobile
                ? "0px"
                : isSideNavOpen || isPinned
                ? "0px"
                : "100px",
              ":hover": {
                left: "0px",
                paddingRight: "0px",
              },
            }}
          >
            <PageLayout.Pane
              position="start"
              sx={{
                width: "240px!important",
                bg: "sidebar.bg",
                borderTopRightRadius: isSideNavOpen ? "0px" : "12px",
                borderBottomRightRadius: isSideNavOpen ? "0px" : "12px",
                height: isSideNavOpen ? "100vh" : "60vh",
                transition: TRANSITION_DELAY,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: isSideNavOpen ? "100vh" : "60vh",
                  transition: TRANSITION_DELAY,
                }}
              >
                <Box
                  display="flex"
                  flex={1}
                  flexDirection={"column"}
                  padding={"12px"}
                  sx={{
                    overscrollBehavior: "contain",
                    overflow: "hidden",
                    ":hover": {
                      overflow: "auto",
                    },
                  }}
                >
                  <Box
                    display={"flex"}
                    justifyContent="space-between"
                    alignItems={"center"}
                  >
                    <Box display={"flex"}>
                      <ImageWithName
                        src={currentStudio?.imageUrl}
                        name={currentStudio?.displayName}
                        key={currentStudio?.id}
                        sx={{
                          width: 28,
                          height: 28,
                        }}
                      />
                      <Text
                        color={"sidebar.text"}
                        fontSize="16px"
                        paddingLeft={"8px"}
                      >
                        {currentStudio?.displayName}
                      </Text>
                    </Box>
                    <IconButton
                      icon={isSideNavOpen ? ChevronLeftIcon : ChevronRightIcon}
                      sx={{
                        color: "sidebar.text",
                        ":hover:not([disabled])": {
                          bg: "sidebar.arrowIconsHoverBg",
                        },
                        "&[aria-expanded='true']": {
                          bg: "sidebar.arrowIconsHoverBg",
                        },
                      }}
                      size={"small"}
                      variant="invisible"
                      onClick={(e: any) => {
                        setIsSideNavOpen(!isSideNavOpen);
                      }}
                    />
                    {/* <
                    sx={{
                      cursor: "pointer",
                    }}
                  /> */}
                  </Box>

                  <CollectionTree />
                  {/* <DraftsTree /> */}
                </Box>
                {/* {isLoggedIn ? <UserMenu /> : null} */}
              </Box>
            </PageLayout.Pane>
          </Box>
          <PageLayout.Content
            width="full"
            sx={{
              marginLeft: isTabletOrMobile
                ? "0px"
                : isSideNavOpen
                ? "240px"
                : "0px",
              transition: `margin-left ${TRANSITION_DELAY}`,
              bg: "studioLayout.white",
            }}
          >
            <Box
              id="studio-layout-content"
              width={"100%"}
              sx={{
                height: "100vh",
                overflow: "auto",
              }}
            >
              {children}
            </Box>
          </PageLayout.Content>
        </PageLayout>

        {isTabletOrMobile ? (
          <LayoutFAB
            opened={isSideNavOpen}
            onClick={() => {
              setIsSideNavOpen(!isSideNavOpen);
            }}
          />
        ) : null}
      </DndProvider>
    </>
  );
};

export default PublicLayout;
