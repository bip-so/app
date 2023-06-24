import { Avatar, Box, Tooltip } from "@primer/react";
import Link from "next/link";
import { FC } from "react";
import { HomeIcon } from "@primer/styled-octicons";
import { NavIcon } from "../../../core/types";
import { useUser } from "../../../context/userContext";
import { useStudio } from "../../../context/studioContext";
import { useRouter } from "next/router";
import AvatarWithPlaceholder from "../../../components/AvatarWithPlaceholder";
import ImageWithName from "../../../components/ImageWithName";
import BipRouteUtils from "../../../core/routeUtils";
import segmentEvents from "../../../insights/segment";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

interface INavIconLinkProps {
  navIcon: NavIcon;
}

const NavIconLink: FC<INavIconLinkProps> = ({ navIcon }) => {
  const router = useRouter();
  const { user } = useUser();

  return (
    <LinkWithoutPrefetch href={navIcon.path} passHref>
      <a
        onClick={() => {
          if (navIcon.title === "Home")
            segmentEvents.homePageViewed(
              user?.id!,
              user?.email!,
              user?.username!
            );
          if (navIcon.title === "Explore")
            segmentEvents.explorePageViewed(
              user?.id!,
              user?.email!,
              user?.username!
            );
        }}
      >
        {router.pathname === navIcon.path ? (
          <navIcon.activeIcon
            size="32"
            className="text-white hover:bg-gray-700 p-1.5 rounded"
          />
        ) : (
          <navIcon.icon
            size="32"
            className="text-gray-300 hover:bg-gray-700 p-1.5 rounded"
          />
        )}
      </a>
    </LinkWithoutPrefetch>
  );
};

export default NavIconLink;
