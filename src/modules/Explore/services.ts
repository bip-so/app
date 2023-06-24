import ApiClient from "../../commons/ApiClient";
import {
  IUserFollowPayload,
  IStudioFollowPayload,
  ISearchKeyword,
} from "./types";

const ExploreService = {
  getStudios: (skip: number = 0) =>
    ApiClient.get(`/studio/popular?skip=${skip}`),
  getPeople: (skip: number = 0) => ApiClient.get(`/user/popular?skip=${skip}`),
  getSearch: (keyWord: string, skip: number = 0) =>
    ApiClient.get(`/global/search?query=${keyWord}&skip=${skip}`),
  followUser: (payload: IUserFollowPayload) =>
    ApiClient.post(`/follow/user/follow`, payload),
  unfollowUser: (payload: IUserFollowPayload) =>
    ApiClient.post(`/follow/user/unfollow`, payload),
  followStudio: (studioId: number) =>
    ApiClient.post(`/studio/${studioId}/join`),
  unfollowStudio: (studioId: number) =>
    ApiClient.post(`member/leave-studio/${studioId}`),
  getPopularReels: (skip: number = 0) =>
    ApiClient.get(`/reels/popular?skip=${skip}`),
};

export default ExploreService;
