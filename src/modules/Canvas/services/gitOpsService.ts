import ApiClient from "../../../commons/ApiClient";
import { ICommitMessagePayload, IAcceptMergePayload } from "../interfaces";

const GitOpsService = {
  getMergeRequestsForBranch: (branchId: number) =>
    ApiClient.get(`/canvas-branch/${branchId}/merge-request/list`),
  getMergeRequestById: (mergeRequestId: number) =>
    ApiClient.get(`/canvas-branch/merge-request/${mergeRequestId}/response`),
  createMergeRequest: (branchId: number, payload: any, shouldMerge?: boolean) =>
    ApiClient.post(
      `/canvas-branch/${branchId}/merge-request/create?merge=${shouldMerge}`,
      payload
    ),
  rejectMergeRequest: (branchId: number, mergeRequestId: number) =>
    ApiClient.post(
      `/canvas-branch/${branchId}/merge-request/${mergeRequestId}/reject`
    ),
  acceptMergeRequest: (
    branchId: number,
    mergeRequestId: number,
    payload: IAcceptMergePayload
  ) =>
    ApiClient.post(
      `/canvas-branch/${branchId}/merge-request/${mergeRequestId}/merge-accept`,
      payload
    ),
  deleteMergeRequest: (branchId: number, mergeRequestId: number) =>
    ApiClient.post(
      `/canvas-branch/${branchId}/merge-request/${mergeRequestId}/delete`
    ),
  getToAndFromBlocksBeforeMerge: (branchId: number) =>
    ApiClient.get(`/canvas-branch/${branchId}/diffblocks`),
};

export default GitOpsService;
