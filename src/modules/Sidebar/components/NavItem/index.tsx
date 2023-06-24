import React from "react";
import { useRouter } from "next/router";
import { Avatar, Box } from "@primer/react";
import Link from "next/link";
import { useStudio } from "../../../../context/studioContext";
import { useUser } from "../../../../context/userContext";
import { DEFAULT_USER_PLACEHOLDER } from "../../../../commons/constants";
import ImageWithName from "../../../../components/ImageWithName";
import BipRouteUtils from "../../../../core/routeUtils";
import segmentEvents from "../../../../insights/segment";
import LinkWithoutPrefetch from "../../../../components/LinkWithoutPrefetch";

const NavItem = ({ navItem }: any) => {
  const { pathname, query } = useRouter();
  const handleSplit = query?.handle?.split("@");
  const { user } = useUser();

  let handle;
  if (handleSplit) {
    handle = handleSplit?.length === 1 ? handleSplit[0] : handleSplit[1];
  }

  return (
    <Box>
      <LinkWithoutPrefetch href={navItem.path}>
        <a
          onClick={() => {
            if (navItem.title === "Home")
              segmentEvents.homePageViewed(
                user?.id!,
                user?.email!,
                user?.username!
              );
            if (navItem.title === "Explore")
              segmentEvents.explorePageViewed(
                user?.id!,
                user?.email!,
                user?.username!
              );
          }}
        >
          <div
            className={`flex items-center relative py-2 px-3 cursor-pointer text-normal text-gray-300 before:absolute before::content-[''] before:bg-green-500 before:left-0 before:rounded-xl before:-translate-x-2/4 before:top-2/4 before:-translate-y-2/4 before:w-2 ${
              pathname === navItem.path
                ? `font-semibold text-white before:h-full `
                : `hover:before:block before:hidden before:h-3`
            }`}
          >
            {
              <Box
                display={"flex"}
                alignItems={"center"}
                id={
                  navItem.title === "Personal Space"
                    ? "personal-space-layout-btn"
                    : ""
                }
              >
                <navItem.icon size="18" className="mr-2" />
                {navItem.title}
              </Box>
            }
          </div>
        </a>
      </LinkWithoutPrefetch>
    </Box>
  );
};

export default NavItem;
