import { IUserMini } from "../../commons/types";
import { PermissionGroup } from "../Permissions/types";
import { IBipUser } from "../User/interfaces/IUser";
export type CreateStudioType = {
  name: string;
  handle: string;
  description: string;
  // imageUrl: string;
  // temporary: boolean;
  topics: string[];
  // website: string;
};

export type UpdateStudioType = {
  id: number | undefined;
  name: string;
  handle: string;
  description: string;
  // imageUrl: string;
  // temporary: boolean;
  topics: string[];
  website: string;
};

export type StudioFormType = {
  name: string;
  handle: string;
  description: string;
  // imageUrl: string;
  // temporary: boolean;
  topics: string;
  website: string;
};

export type StudioType = {
  id: number;
  uuid: string;
  displayName: string;
  handle: string;
  imageUrl: string;
  description: string;
  website: string;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
  createdById: number;
  isJoined?: boolean;
  topics: { id: number; name: string }[];
  permissionGroup?: PermissionGroup;
  isPersonalSpace?: boolean;
  permission?: string;
  defaultCanvasBranchId: number;
  allowPublicMembership: boolean;
  isRequested: boolean;

  // Billing Info
  isEarlyAdopter: boolean; // if true lifetime full access
  isNonProfit: boolean; // NGO's
  stripeCustomerID: string;
  stripePriceID: string;
  stripePriceUnit: number;
  stripeProductID: string;
  stripeSubscriptionsID: string;
};

export type NotificationCountType = {
  id: number;
  userId: number;
  all: number;
  personal: number;
  studio: [
    {
      count: number;
      studio: {
        type: string;
        id: number;
        displayName: string;
        handle: string;
        imageUrl: string;
      };
    }
  ];
};

export type CreateRoleType = {
  color: string;
  icon: string;
  name: string;
};

export type DeleteRoleType = {
  role_id: string;
};

export type EditRoleType = {
  roleId: string | number;
  name: string;
};

export type UpdateRoleMembershipType = {
  membersRemoved?: string[] | number[];
  membersAdded?: string[] | number[];
  roleId: string | number;
};

export type AddMembersType = {
  usersAdded?: string[] | number[];
};

export type CreateStudioPermissionType = {
  permsGroup: string;
  memberId?: string | number | null;
  roleId?: string | number | null;
  isOverriddenFlag: boolean;
};

export type Member = {
  id: number;
  isRemoved: boolean;
  studioID: number;
  user: IUserMini;
  userID: number;
  uuid: string;
};

export type BanUserPayload = {
  banReason: string;
  userId: number;
};

export type InviteViaEmailPayload = {
  email: string;
  roles: number[];
}[];

export type RequestType = {
  id: number;
  userId: number;
  user: {
    id: number;
    uuid: string;
    fullName: string;
    username: string;
    avatarUrl: string;
  };
  action: "Pending" | "Accepted" | "Rejected";
  studioID: number;
};
