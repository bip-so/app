import { RoleType } from "../../types/RoleType";
import { UserType } from "../../types/UserType";
import { IUserStudio } from "./IUserStudio";

export interface IUser {
  access: string;
  avatar_url: string;
  avatar_url_small: string;
  avatar_url_tiny: string;
  biography: string;
  created_at: Date;
  discord_id: string;
  email: string;
  email_verified: boolean;
  extras: string;
  followers_count: number;
  following_count: number;
  google_id: string;
  hasEmail: boolean;
  hasPassword: boolean;
  is_following: boolean;
  linkedin_url: string;
  location: string;
  nickname: string;
  products: IUserStudio[];
  role: RoleType;
  session_id: string;
  slack_ids: string[];
  twitter_handle: string;
  twitter_id: string;
  twitter_url: string;
  type: UserType;
  updated_at: Date;
  user_id: string;
  username: string;
  website: string;
}
