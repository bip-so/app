import ApiClient from "../../commons/ApiClient";

const HomeService = {
  getReelsFeed: (skip: number = 0, limit: number = 15) =>
    ApiClient.get(`/reels/feed?&skip=${skip}&limit=${limit}`),
};

export default HomeService;
