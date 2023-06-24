import { FC } from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";

import { Avatar, Box, Button } from "@primer/react";
import BipRouteUtils from "../../../core/routeUtils";
import segmentEvents from "../../../insights/segment";
import ThemeToggle from "./ThemeToggle";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

interface HeaderProps {}

const Header: FC<HeaderProps> = ({}) => {
  const { t } = useTranslation();

  const goToExplore = () => {
    const element = document.getElementById("explore");
    if (element) {
      window?.scrollTo({ top: element?.offsetTop, behavior: "smooth" });
    }
  };

  const goToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      window?.scrollTo({ top: element?.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <Box
      position={"fixed"}
      padding={"8px"}
      bg={"auth.header.bg"}
      top={"0px"}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"space-between"}
      zIndex={100}
      boxShadow={"0px 4px 27px rgba(0, 0, 0, 0.04)"}
      width={"100%"}
    >
      <Avatar src="favicon.ico" size={32} sx={{ ml: "10px" }} />
      <div className="flex items-center gap-8">
        <Box sx={{ display: "flex", gap: "8px" }}>
          <ThemeToggle />
          <Button
            variant="invisible"
            size="small"
            sx={{
              color: "auth.header.text",
              fontWeight: 600,
              ":hover:not([disabled])": {
                bg: "unset",
              },
            }}
            onClick={goToExplore}
          >
            {t("app.explore")}
          </Button>
          <Button
            variant="invisible"
            size="small"
            sx={{
              color: "auth.header.text",
              fontWeight: 600,
              ":hover:not([disabled])": {
                bg: "unset",
              },
            }}
            onClick={goToFeatures}
          >
            {t("app.features")}
          </Button>
          <LinkWithoutPrefetch href={BipRouteUtils.getPricingRoute()} passHref>
            <Button
              variant="invisible"
              size="small"
              sx={{
                color: "auth.header.text",
                fontWeight: 600,
                ":hover:not([disabled])": {
                  bg: "unset",
                },
              }}
            >
              {t("app.pricing")}
            </Button>
          </LinkWithoutPrefetch>
        </Box>
        <LinkWithoutPrefetch href={BipRouteUtils.getSignInRoute()} passHref>
          <Button
            variant="primary"
            size="small"
            onClick={segmentEvents.loginPopupOpened}
            sx={{
              border: "none",
              ":focus:not([disabled])": { boxShadow: "none" },
            }}
          >
            {t("auth.loginOrSignup")}
          </Button>
        </LinkWithoutPrefetch>
      </div>
    </Box>
  );
};

export default Header;
