import { convertValueToCoords } from "@floating-ui/core/src/middleware/offset";
import { boolean, number } from "yup";
import { string } from "yup/lib/locale";

export type TabType = {
  isSelected: boolean;
  name: string;
  onClick: () => void;
};

export type StudioType = {
  id: number;
  uuid: string;
  displayName: string;
  handle: string;
  imageUrl: string;
  description: string;
  website: string;
  followerCount: number;
  createdAt: string;
  updatedAt: string;
  isFollowing: boolean;
  membersCount: number;
  allowPublicMembership: boolean;
  isRequested: boolean;
};

export type UserType = {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  hasEmail: boolean;
  isSuperUser: boolean;
  isSetupDone: boolean;
  isEmailVerified: boolean;
  avatarUrl: string;
  followers: number;
  following: number;
  isFollowing: boolean;
  userProfile: {
    bio: string;
    location: string;
    twitterUrl: string;
    userId: number;
    website: string;
  };
  // bio: string;
  // twitter_url: string;
  // website: string;
  // location: string;
  created_at: Date;
  updated_at: Date;
  handle?: string;
};

export interface IUserFollowPayload {
  userId: number;
}

export interface IStudioFollowPayload {
  userId: number;
}

export interface ISearchKeyword {
  keyWord: string;
}

// archivedAt: string;
// archivedByID: number;
// canvasBranchID: number;
// canvasRepository: any;
// canvasRepositoryID: number;
// commentCount: number;
// contextData: any;
// createdAt: string
// createdByID: number
// highlightedText: string
// id: number;
// isArchived: boolean;
// isStudioMember: boolean;
// isUserFollower: boolean;
// mentions: any;
// rangeEnd: any;
// rangeStart: any;
// reactions: null
// selectedBlocks: {blockUUIDs: ["6cad1818-40ed-4e40-be7a-72d8f14c2ad6", "fa88d4aa-06cd-48ad-a108-c1d9c002b8fd"],…}
// startBlockID: 13952
// startBlockUUID: "6cad1818-40ed-4e40-be7a-72d8f14c2ad6"
// studio: {id: 101, uuid: "c7b09e2e-0151-419b-b0af-e37cfd90c5ad", displayName: "Studio Follower test",…}
// studioID: 101
// textRangeEnd: 0
// textRangeStart: 0
// updatedAt: "2022-08-12T15:02:22.405795Z"
// updatedByID: 5
// user: {id: 5, uuid: "ae210113-49ce-40a0-af62-a3afc9921346", fullName: "Elon Musk", username: "Elon_",…}
// uuid: "a8e2605d-2613-477b-bc3d-b98f7c43624e"
