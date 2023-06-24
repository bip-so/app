import React from "react";
import { useRouter } from "next/router";
import { FiCompass } from "react-icons/fi";
import {
  HomeIcon,
  BellIcon,
  HomeFillIcon,
  BellFillIcon,
} from "@primer/octicons-react";
import NavItem from "../NavItem";
import { useUser } from "../../../../context/userContext";
import BipRouteUtils from "../../../../core/routeUtils";
import { NAV_ITEMS } from "../../../../core/constants";
import { useStudio } from "../../../../context/studioContext";
import ImageWithName from "../../../../components/ImageWithName";

const TopNav = () => {
  const { pathname } = useRouter();

  const { isLoggedIn } = useUser();

  const { personalSpace } = useStudio();

  const finalNavItems = [...NAV_ITEMS];

  if (isLoggedIn && personalSpace) {
    finalNavItems.push({
      type: "icon",
      title: "Personal Space",
      path: BipRouteUtils.getHandleRoute(personalSpace.handle),
      icon: (props) => (
        <ImageWithName
          src={personalSpace.imageUrl}
          name={personalSpace.displayName}
          sx={{
            width: "18px",
            height: "18px",
            border: "1.5px solid",
          }}
          {...props}
        />
      ),
      activeIcon: (props) => (
        <ImageWithName
          src={personalSpace.imageUrl}
          name={personalSpace.displayName}
          sx={{
            width: "18px",
            height: "18px",
            border: "1.5px solid",
          }}
          {...props}
        />
      ),
    });
  }

  return (
    <div className="my-1">
      {finalNavItems.map((navItem) => (
        <NavItem key={navItem.title} navItem={navItem} />
      ))}
    </div>
  );
};

export default TopNav;
