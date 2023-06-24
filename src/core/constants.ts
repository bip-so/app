import { Avatar } from "@primer/react";
import {
  GearIcon,
  InfoIcon,
  RocketIcon,
  RssIcon,
} from "@primer/styled-octicons";
import { useUser } from "../context/userContext";
import { Icon } from "@primer/styled-octicons";

import {
  HomeIcon,
  BellIcon,
  HomeFillIcon,
  BellFillIcon,
} from "@primer/styled-octicons";
import { FiCompass } from "react-icons/fi";

import { NavIcon, StudioDetailNavItemType } from "./types";

export const NAV_ITEMS: NavIcon[] = [
  {
    type: "icon",
    title: "Home",
    path: "/",
    icon: HomeIcon,
    activeIcon: HomeFillIcon,
  },
  {
    type: "icon",
    title: "Explore",
    path: "/explore",
    icon: FiCompass as Icon,
    activeIcon: FiCompass as Icon,
  },
];

export const STUDIO_DETAIL_NAV_ITEMS: StudioDetailNavItemType[] = [
  {
    icon: RssIcon,
    title: "Timeline",
    path: "feed",
    isProtected: false,
  },
  {
    icon: GearIcon,
    title: "Settings",
    path: "settings",
    isProtected: true,
  },
  {
    icon: InfoIcon,
    title: "About",
    path: "about",
    isProtected: false,
  },
];

export const BIP_DATE_FORMAT = "DD MMM YYYY";
export const BIP_MONTH_FORMAT = "MMM YYYY";
export const BIP_TIME_FORMAT = "DD MMM YYYY HH:MM";

export const BIP_HANDLE_REGEX = "^[a-zA-Z0-9-]+$";

export const BIP_RESTRICTED_HANDLES = [
  "explore",
  "home",
  "auth",
  "api",
  "admin",
  "bip_so",
  "bip",
  "discord",
  "pricing",
];

export const BIP_PRIVACY_POLICY_URL =
  "https://bip.so/bip.so/privacy-policy-19921c";
export const BIP_TERMS_URL = "https://bip.so/bip.so/terms-of-use-19765c";
export const BIP_CAPTERRA_URL = "https://www.capterra.com/p/267271/bipso/";
