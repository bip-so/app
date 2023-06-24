import { Box, Button, IconButton, Truncate } from "@primer/react";
import { ThreeBarsIcon } from "@primer/styled-octicons";
import React, { FC, useRef, useState } from "react";
import { useCanvas } from "../../../context/canvasContext";
import { useLayout } from "../../../context/layoutContext";
import { usePages } from "../../../context/pagesContext";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import BipRouteUtils from "../../../core/routeUtils";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import { CollectionPermissionGroupEnum } from "../../Permissions/enums";
import { CollectionDataType } from "../types";
import CollectionPermissionRightRail from "./CollectionPermissionsRightRail";

interface CollectionHeaderProps {
  title: string;
  currentCollection: CollectionDataType | null;
}

const CollectionHeader: FC<CollectionHeaderProps> = (props) => {
  const { title, currentCollection } = props;
  const { isTabletOrMobile } = useDeviceDimensions();
  const { isSideNavOpen, setIsSideNavOpen } = useLayout();
  const { isPublicView } = useCanvas();

  const { currentStudio } = useStudio();

  const [showPermissions, setShowPermissions] = useState<boolean>(
    isPublicView ? false : true
  );
  const shareBtnRef = useRef(null);
  const { isLoggedIn } = useUser();

  return (
    <>
      <Box
        className={`flex flex-col ${
          isTabletOrMobile ? "" : "hide-on-key-down"
        }`}
        backgroundColor="canvasHeader.bg"
        style={{ transition: "all 0.5s ease-out 0s" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 8px",
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
                  setIsSideNavOpen(true);
                }}
              />
            ) : null}
            <Truncate
              title={title || "Collection"}
              maxWidth={"300px"}
              sx={{ display: "inline" }}
            >
              {title || "Collection"}
            </Truncate>
          </div>
          {isPublicView && (
            <Button
              variant="invisible"
              sx={{
                color: "text.muted",
              }}
              onClick={() => {
                window.location.pathname = BipRouteUtils.getCollectionRoute(
                  currentStudio?.handle!,
                  currentCollection?.id!
                );
              }}
              // sx={{ float: "right" }}
            >
              Click to Edit
            </Button>
          )}
          {!isPublicView &&
          currentCollection?.permission !==
            CollectionPermissionGroupEnum.NONE &&
          isLoggedIn ? (
            <Button
              variant="invisible"
              sx={{
                color: "text.muted",
                fontWeight: 500,
              }}
              size={"small"}
              onClick={(e: any) => {
                setShowPermissions((prev) => !prev);
              }}
              ref={shareBtnRef}
            >
              Share
            </Button>
          ) : null}
        </Box>
      </Box>
      {showPermissions &&
      currentCollection &&
      currentCollection.permission !== CollectionPermissionGroupEnum.NONE ? (
        <CollectionPermissionRightRail
          closeHandler={() => setShowPermissions(false)}
          ignoredRefs={[shareBtnRef]}
          currentCollection={currentCollection}
        />
      ) : null}
    </>
  );
};

export default CollectionHeader;
