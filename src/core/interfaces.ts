import { StudioType } from "../modules/Studio/types";
import { HandleEnum } from "./enums";

export interface IUserHandleData {
  avatarUrl: string;
  createdAt: string;
  followers: number;
  following: number;
  hasEmail: boolean;
  id: number;
  isEmailVerified: boolean;
  isFollowing: boolean;
  isSetupDone: boolean;
  isSuperuser: boolean;
  updatedAt: string;
  fullName: string;
  userProfile: {
    userId: number;
    bio: string;
    website: string;
    twitterUrl: string;
    location: string;
  };
  username: string;
  uuid: string;
}

export interface IStudioHandleData {
  avatarUrl: string;
  createdAt: string;
  description: string;
  displayName: string;
  followerCount: number;
  handle: string;
  id: number;
  imageUrl: string;
  isJoined: boolean;
  fullName: string;
  isFollowing: boolean;
  topics: {
    createdAt: string;
    id: number;
    name: string;
    studios: any[];
    uuid: string;
    updatedAt: string;
  }[];
  userProfile: {
    userId: number;
    bio: string;
    website: string;
    twitterUrl: string;
    location: string;
  };
  updatedAt: string;
  uuid: string;
  website: string;
}

export interface IHandleData {
  handle: string;
  context: HandleEnum;
  data: IUserHandleData | IStudioHandleData;
}
