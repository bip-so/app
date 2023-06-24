import ApiClient from "../../../commons/ApiClient";
import {
  ICanvasBranchNavPayload,
  ICreateBranchPayload,
  ICreateBranchAccessTokenPayload,
  ICreateRoughBranchPayload,
  IPGUpdatePayload,
  InviteViaEmailsPayload,
  ICanvasBranchResponse,
} from "../interfaces";

const CanvasBranchService = {
  getMembers: (branchId: number, inviteCode?: string) =>
    ApiClient.get(
      `/member/canvas-branch/${branchId}${
        inviteCode ? "?inviteCode=" + inviteCode : ""
      }`
    ),

  updateMemberPG: (payload: IPGUpdatePayload, inherit?: boolean) =>
    ApiClient.post(
      `/canvasbranchpermission/update${inherit ? "?inherit=true" : ""}`,
      payload
    ),

  inviteUsers: (payload: IPGUpdatePayload[], inheritToSubCanvases: boolean) =>
    ApiClient.post(
      `/canvasbranchpermission/bulk-update${
        inheritToSubCanvases ? "?inherit=true" : ""
      }`,
      payload
    ),

  inviteViaEmails: (branchId: number, payload: InviteViaEmailsPayload) =>
    ApiClient.post(
      `/canvas-branch/branch-ops/${branchId}/invite-via-emails`,
      payload
    ),
  removeMember: (id: number) =>
    ApiClient.delete(`/canvasbranchpermission/${id}`),

  getPublishRequests: (branchId: number) =>
    ApiClient.get(`/canvas-branch/${branchId}/publish-request/list`),

  publishOrRequestToPublish: (branchId: number, message?: string) =>
    ApiClient.post(`/canvas-branch/${branchId}/publish-request/init`, {
      message: message || " ",
    }),

  cancelPublichRequest: (branchId: number, requestId: number) =>
    ApiClient.delete(
      `/canvas-branch/${branchId}/publish-request/${requestId}/delete`
    ),

  acceptOrRejectPublishRequest: (
    branchId: number,
    requestId: number,
    accept: boolean
  ) =>
    ApiClient.post(
      `/canvas-branch/${branchId}/publish-request/${requestId}/manage`,
      { accept: accept }
    ),

  getDrafts: () => ApiClient.get(`/canvas-branch/branch-ops/drafts`),

  // getBranch: (branchId: number) => ApiClient.get(`/canvas-branch/${branchId}`),
  // "?inviteCode=" + inviteCode : "" BE logic from /canvas-branch/${branchId}
  getBranch: (branchId: number, inviteCode?: string) =>
    ApiClient.get<ICanvasBranchResponse>(
      `/canvas-branch/repo/${branchId}${
        inviteCode ? "?inviteCode=" + inviteCode : ""
      }`
    ),

  createBranch: (payload: ICreateBranchPayload) =>
    ApiClient.post("/canvas-branch/create", payload),

  deleteBranch: (branchId: number) =>
    ApiClient.delete(`/canvas-branch/${branchId}`),

  createRoughBranch: (branchId: number, payload: ICreateRoughBranchPayload) =>
    ApiClient.post(
      `/canvas-branch/branch-ops/${branchId}/rough-branch`,
      payload
    ),

  createAccessRequest: (branchId: number, payload: any) =>
    ApiClient.post(`/canvas-branch/${branchId}/access-request/create`, payload),
  getAccessRequest: (canvasBranchID: number) =>
    ApiClient.get(`/canvas-branch/:${canvasBranchID}/access-request/list`),
  inheritParentPermissions: (branchId: number | string) =>
    ApiClient.post(`/canvasbranchpermission/inherit/${branchId}`),

  getBranchNavData: (branchId: number, isPublic: boolean = false) =>
    ApiClient.get(
      `/canvas-branch/branch-ops/nav/${branchId}/root?public=${isPublic}`
    ),

  searchBranchNavData: (searchQuery: any, isPublic: boolean = false) =>
    ApiClient.post(
      `/canvas-branch/branch-ops/nav/search?public=${isPublic}`,
      searchQuery
    ),
  getCommitsHistory: (branchId: number | string) =>
    ApiClient.get(`/canvas-branch/branch-ops/${branchId}/history`),

  getCommitBlocks: (branchId: number | string, commitID: string) =>
    ApiClient.get(
      `/canvas-branch/${branchId}/blocks/${commitID}/blocks-history`
    ),

  createBranchAccessToken: (
    branchId: number,
    payload: ICreateBranchAccessTokenPayload
  ) =>
    ApiClient.post(
      `/canvas-branch/branch-ops/${branchId}/create-access-token`,
      payload
    ),

  getBranchAccessTokenDetail: (code: string) =>
    ApiClient.get(`/canvas-branch/branch-ops/get-access-token-detail/${code}`),

  deleteBranchAccessToken: (code: string) =>
    ApiClient.delete(`/canvas-branch/branch-ops/delete-token/${code}`),

  getLastUpdated: (canvasBranchId: number) =>
    ApiClient.get(`/canvas-branch/${canvasBranchId}/last-updated`),
};

export default CanvasBranchService;
