import ApiClient from "../../commons/ApiClient";

import {
  NotificationsType,
  AcceptMergeRequestType,
  AcceptPublishRequestType,
  UpdateSettingsPayload,
} from "./types";

const NotificationService = {
  getNotifications: (
    payload: NotificationsType,
    skip: number = 0,
    filter: string = "",
    limit: number = 20
  ) =>
    ApiClient.get(
      `/notifications?skip=${skip}&limit=${limit}&type=${payload.type}${
        filter ? `&filter=${filter}` : ""
      }`
    ),
  getNotificationsCount: () => ApiClient.get("/notifications/count"),
  acceptMergeRequest: (payload: AcceptMergeRequestType) =>
    ApiClient.post(
      `/canvas-branch/${payload.canvasBranchID}/merge-request/${payload.mergeRequestID}/merge-accept`,
      payload.payload
    ),
  acceptPublishRequest: (payload: AcceptPublishRequestType) =>
    ApiClient.post(
      `/canvas-branch/${payload.canvasBranchID}/publish-request/${payload.publishRequestID}/manage`,
      { accept: true }
    ),
  getSettings: () => ApiClient.get("/user/settings"),
  updateSettings: (payload: UpdateSettingsPayload) =>
    ApiClient.patch("/user/settings", payload),
  handleAccessRequest: (
    canvasBranchId: string | number,
    accessRequestId: number,
    payload: any
  ) =>
    ApiClient.post(
      `/canvas-branch/${canvasBranchId}/access-request/${accessRequestId}/manage`,
      payload
    ),
};

export default NotificationService;
