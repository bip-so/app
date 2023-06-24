import { Icon } from "@primer/styled-octicons";

export type NavIcon = {
  type: "icon" | "avatar";
  title: string;
  path: string;
  icon: Icon | null;
  activeIcon: Icon | null;
};

export type StudioDetailNavItemType = {
  icon: Icon;
  title: string;
  path: string;
  isProtected: boolean;
};
