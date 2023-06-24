import { Session } from "next-auth";

export interface IBipUser {
  id?: number;
  email?: string;
  uuid?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  refreshToken?: string;
  accessToken?: string;
  accessTokenId?: string;
  refreshTokenId?: string;
  isSocialLogin?: boolean;
  lastLogin?: Date;
  userProfile?: string;
  isSetupDone?: boolean;
  isEmailVerified?: boolean;
  avatarUrl?: string;
  iat?: number;
  exp?: number;
  jti?: string;
  defaultStudioID?: number;
  isNewUser?: boolean;
}

export declare type IUser = Session & IBipUser;
