import { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";

export type BipPage = NextPage & {
  auth: boolean;
  getLayout?: (page: ReactElement, hideSidebar?: boolean) => ReactNode;
  provider?: any;
};

export type ChildrenProps = {
  children: ReactNode;
};

export interface IUserMini {
  username: string;
  fullName: string;
  permission?: "editor" | "commentor" | "moderator";
  avatarUrl: string;

  id?: number;
  uuid?: string;

  createdAt?: string;
  handle?: string;
  isFollowing?: boolean;
  objectID?: string;
  updatedAt?: string;
}
