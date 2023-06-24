import { Box, IconButton, Text } from "@primer/react";
import { ChevronRightIcon, ThreeBarsIcon } from "@primer/styled-octicons";
import { ReactNode } from "react";
import { useCanvas } from "../../../context/canvasContext";

import { useLayout } from "../../../context/layoutContext";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import segmentEvents from "../../../insights/segment";

interface IStudioHeaderProps {
  children: ReactNode;
}

const StudioHeader: React.FunctionComponent<IStudioHeaderProps> = ({
  children,
}) => {
  const { isSideNavOpen, setIsSideNavOpen } = useLayout();
  const { currentStudio } = useStudio();
  const { isTabletOrMobile } = useDeviceDimensions();
  const { repo } = useCanvas();
  const { user: currentUser } = useUser();

  return (
    <>
      <div className="flex flex-col">
        {!isSideNavOpen ? (
          <>
            <Box
              sx={{
                height: "40px!important",
                bg: "studioLayout.headerBg",
                marginBottom: "none!important",
                position: "fixed",
                zIndex: 99,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px",
                }}
              >
                <div className="flex items-center space-x-2">
                  {isTabletOrMobile ? null : !isSideNavOpen ? (
                    <IconButton
                      icon={ThreeBarsIcon}
                      sx={{
                        color: "text.subtle",
                      }}
                      size={"small"}
                      variant="invisible"
                      onClick={(e: any) => {
                        segmentEvents.leftRailOpened(
                          currentStudio?.handle,
                          repo?.key,
                          repo?.name,
                          currentUser?.id
                        );
                        setIsSideNavOpen(true);
                      }}
                    />
                  ) : null}
                  {isTabletOrMobile ? null : (
                    <Text fontWeight={400} color={"text.muted"}>
                      {currentStudio?.displayName}
                    </Text>
                  )}
                </div>
              </Box>
            </Box>
          </>
        ) : null}
        <Box
          sx={{
            marginTop: !isSideNavOpen ? "40px!important" : "none",
          }}
        ></Box>
        {children}
      </div>
    </>
  );
};

export default StudioHeader;
