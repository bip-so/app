import React, { useEffect, useState } from "react";
import {
  TextInput,
  Avatar,
  Button,
  Truncate,
  Box,
  IconButton,
  Tooltip,
} from "@primer/react";
import Link from "next/link";
import { PlusIcon, SearchIcon } from "@primer/styled-octicons";
import Modal from "../../../../components/Modal";
import CreateStudioModal from "../../../Studio/components/StudioModal";
import { useStudio } from "../../../../context/studioContext";
import ImageWithName from "../../../../components/ImageWithName";
import BipRouteUtils from "../../../../core/routeUtils";
import { useUser } from "../../../../context/userContext";
import { useRouter } from "next/router";
import { bipTheme } from "../../../../theming";
import segmentEvents from "../../../../insights/segment";
import { useLayout } from "../../../../context/layoutContext";
import useDeviceDimensions from "../../../../hooks/useDeviceDimensions";
import { XIcon } from "@primer/octicons-react";
import Colors from "../../../../utils/Colors";
import { StudioType } from "../../../Studio/types";
import LinkWithoutPrefetch from "../../../../components/LinkWithoutPrefetch";
import { t } from "@excalidraw/excalidraw/types/i18n";
import { useTranslation } from "next-i18next";

const StudioNav = () => {
  const router = useRouter();

  const { studios } = useStudio();
  const { isLoggedIn, user } = useUser();
  const { isTabletOrMobile } = useDeviceDimensions();
  const {
    setIsSideNavOpen,
    showCreateStudioContainer,
    setShowCreateStudioContainer,
  } = useLayout();

  const [searchInput, setSearchInput] = useState("");
  const [filteredStudios, setFilteredStudios] = useState<StudioType[]>([]);

  const { t } = useTranslation();

  useEffect(() => {
    if (!studios.length) return;
    const stds = studios?.filter((studio: StudioType) => {
      !studio?.handle && console.log(studio);
      return (
        (studio?.handle?.toLowerCase().includes(searchInput) ||
          studio?.displayName?.toLowerCase().includes(searchInput)) &&
        !studio.isPersonalSpace
      );
    });
    setFilteredStudios(stds);
  }, [studios, searchInput]);

  // const [showCreateStudioContainer, setShowCreateStudioContainer] = useState<boolean>(false);

  return (
    <div className="my-4">
      {isLoggedIn && (
        <Box
          sx={{
            position: "relative",
          }}
        >
          <TextInput
            sx={{
              border: "1px solid",
              borderColor: "border.subtle",
              boxShadow: "none",
              background: "transparent",
              width: "calc(100% - 0.5rem * 2)",
              margin: "0 0.5rem",
              boxSizing: "border-box",
              color: "text.grayUltraLight",
              "input::placeholder": { color: "text.gray" },
            }}
            leadingVisual={() => <SearchIcon color={"text.gray"} />}
            autoComplete="off"
            aria-label="Workspaces"
            name="Workspaces"
            placeholder="Search Workspaces"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value.toLowerCase())}
          />
          {searchInput && (
            <Box
              sx={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <Tooltip aria-label="Clear Search" wrap direction="nw">
                <IconButton
                  icon={XIcon}
                  sx={{
                    background: "unset",
                    border: "none",
                    borderRadius: "0px",
                    boxShadow: "unset",
                    ":hover:not([disabled])": {
                      background: "unset",
                    },
                    svg: {
                      fill: Colors.gray["400"],
                    },
                  }}
                  onClick={() => setSearchInput("")}
                />
              </Tooltip>
            </Box>
          )}
        </Box>
      )}
      <div className="my-4">
        {filteredStudios?.map((studio, i) => (
          <LinkWithoutPrefetch
            href={BipRouteUtils.getHandleRoute(studio.handle)}
            key={i}
            passHref
          >
            <div className="flex relative items-center px-3 py-1 my-2 cursor-pointer font-semibold before:absolute before:hidden hover:before:block before::content-[''] before: before:w-2  before:h-3 before:bg-green-500 before:rounded-xl before:-translate-y-2/4 before:-translate-x-2/4 before:top-2/4  before:left-0">
              <a className="flex items-center">
                <ImageWithName
                  src={studio?.imageUrl}
                  name={studio?.displayName}
                  sx={{
                    width: "28px",
                    height: "28px",
                    marginRight: "8px",
                  }}
                />
                <span className="text-sm font-normal">
                  <Truncate title={studio.displayName} inline={true}>
                    {studio.displayName}
                  </Truncate>
                </span>
              </a>
            </div>
          </LinkWithoutPrefetch>
        ))}
      </div>
      <div className="px-2 mb-5">
        <Button
          leadingIcon={PlusIcon}
          variant="invisible"
          sx={{
            color: "sidebar.studionav.textSecondary",
            paddingLeft: "8px",
            ":hover:not([disabled])": {
              color: "sidebar.studionav.buttonHover",
              bg: "sidebar.studionav.buttonHoverBg",
            },
          }}
          onClick={() => {
            if (isLoggedIn) {
              segmentEvents.newStudioClick(
                user?.id!,
                user?.email!,
                user?.username!
              );
              // isTabletOrMobile && setIsSideNavOpen(false);
              setShowCreateStudioContainer(true);
            } else {
              router.push(BipRouteUtils.getSignInRoute());
            }
          }}
        >
          {t("workspace.newWorkspace")}
        </Button>
      </div>

      {showCreateStudioContainer && (
        <Modal
          closeHandler={() => setShowCreateStudioContainer(false)}
          hideCloseButton
          sx={{ width: ["80%", "70%", "50%", "40%"], maxWidth: "600px" }}
        >
          <CreateStudioModal
            closeHandler={() => setShowCreateStudioContainer(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default StudioNav;
