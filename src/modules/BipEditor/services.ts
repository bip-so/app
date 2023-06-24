import ApiClient from "../../commons/ApiClient";
import {
  CreateBlockThreadCommentType,
  CreateBlockThreadType,
  CreateMentionType,
  CreateReactionType,
} from "./types";

const BlocksService = {
  getBlocks: (branchId: number) =>
    ApiClient.get(`canvas-branch/${branchId}/blocks/`),
  saveBlocks: (branchId: number, payload: any) =>
    ApiClient.post(`canvas-branch/${branchId}/blocks/`, payload),
  saveBlockAssociations: (branchId: number, payload: any) =>
    ApiClient.post(`canvas-branch/${branchId}/blocks/associations`, payload),
  getBlockReels: (blockUUID: string) =>
    ApiClient.get(`/reels/?blockUUID=${blockUUID}`),
  createReel: (payload: any) => ApiClient.post(`/reels/`, payload),
  getReelComments: (reelId: number, parentId: string | number = 0) =>
    ApiClient.get(
      `/reels/${reelId}/comments/${parentId ? "?parentId=" + parentId : ""}`
    ),
  addReelComment: (reelId: number, payload: any) =>
    ApiClient.post(`/reels/${reelId}/comments/`, payload),
  deleteReelComment: (reelId: number, commentId: number) =>
    ApiClient.delete(`/reels/${reelId}/comments/${commentId}`),
  createBlockThread: (payload: CreateBlockThreadType) =>
    ApiClient.post(`/block-thread/`, payload),
  getBranchBlockThreads: (
    branchId: number,
    resolved: boolean = false,
    inviteCode?: string
  ) =>
    ApiClient.get(
      `/block-thread/branch/${branchId}?resolved=${resolved}${
        inviteCode ? "&inviteCode=" + inviteCode : ""
      }`
    ),
  deleteBlockThread: (threadId: number) =>
    ApiClient.delete(`/block-thread/${threadId}`),
  createThreadComment: (payload: CreateBlockThreadCommentType) =>
    ApiClient.post(`/block-thread-comment/`, payload),
  getBlockThreadComments: (threadId: number) =>
    ApiClient.get(`/block-thread-comment/${threadId}`),
  deleteBlockThreadComment: (commentId: number) =>
    ApiClient.delete(`/block-thread-comment/${commentId}`),
  createReaction: (payload: CreateReactionType) =>
    ApiClient.post(`/reactions/create`, payload),
  removeReaction: (payload: CreateReactionType) =>
    ApiClient.post(`/reactions/remove`, payload),
  blockFileUpload: (payload: FormData) =>
    ApiClient.post(`/global/upload-file`, payload),
  resolveThread: (threadId: number) =>
    ApiClient.post(`/block-thread/${threadId}/resolve`, {}),
  deleteReel: (reelId: number) => ApiClient.delete(`/reels/${reelId}`),

  getBranchReels: (branchId: number) =>
    ApiClient.get(`/reels/?canvasBranchID=${branchId}`),
  mentionUsers: (payload: CreateMentionType) =>
    ApiClient.post(`/mentions/`, payload),
};

export default BlocksService;
