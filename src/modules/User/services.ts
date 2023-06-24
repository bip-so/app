import ApiClient from "../../commons/ApiClient";
import { UpdateUserType } from "./types";

const UserService = {
  updateUser: (payload: FormData) => ApiClient.put(`/user/update`, payload),
  setupUser: (payload: FormData) => ApiClient.post(`/user/setup`, payload),
  getUserInfo: (userId: number) =>
    ApiClient.get(`/user/info?user_id=${userId}`),

  getBootstrap: (userId: number) =>
    ApiClient.get(`/bootstrap/get?userId=${userId}`),
  getHandleDetails: (handle: string) =>
    ApiClient.get(`/bootstrap/handle/${handle}`),
  getUsers: (name: string, skip: number = 0) =>
    ApiClient.get(`/global/search?query=${name}&&skip=${skip}&&type=users`),

  getUserStudiosPermissions: () => ApiClient.get(`/permission/studio`),
  getBipMarks: () => ApiClient.get(`/message/get`),
  deleteBipMark: (messageId: number) =>
    ApiClient.delete(`/message/${messageId}`),

  getFollowers: (userId: number) =>
    ApiClient.get(`/user/followers-list?userId=${userId}`),
  getFollowings: (userId: number) =>
    ApiClient.get(`/user/following-list?userId=${userId}`),
};

export default UserService;
