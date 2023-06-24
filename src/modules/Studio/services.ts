import ApiClient from "../../commons/ApiClient";
import { PermissionSchema } from "../Permissions/types";
import {
  AddMembersType,
  CreateRoleType,
  CreateStudioPermissionType,
  CreateStudioType,
  DeleteRoleType,
  EditRoleType,
  UpdateRoleMembershipType,
  UpdateStudioType,
  BanUserPayload,
  InviteViaEmailPayload,
} from "./types";

const StudioService = {
  createStudio: (payload: CreateStudioType) =>
    ApiClient.post(`/studio/create`, payload),
  updateStudio: (payload: UpdateStudioType) =>
    ApiClient.post(`/studio/edit`, payload),
  uploadStudioImage: (payload: FormData) =>
    ApiClient.post(`/studio/image`, payload),
  checkHandle: (handle: string) =>
    ApiClient.get(`/global/check-handle?handle=${handle}`),
  getStudioRoles: () => ApiClient.get(`/studio/roles`),
  getStudioMembers: (skip: number | string = 0) =>
    ApiClient.get(`/studio/members?skip=${skip}`),
  getStudioIntegrations: () =>
    ApiClient.get(`integrations/settings
  `),
  updateDiscordDMNotifsStatus: (status: boolean) =>
    ApiClient.put(`/integrations/discord`, {
      status,
    }),
  updateSlackDMNotifsStatus: (status: boolean) =>
    ApiClient.put(`/integrations/slack`, {
      status,
    }),
  deleteIntegration: (type: string) =>
    ApiClient.delete(`integrations?type=${type}`),
  createRole: (payload: CreateRoleType) =>
    ApiClient.post(`/role/create`, payload),
  deleteRole: (role_id: string | number) =>
    ApiClient.delete(`/role/${role_id}`),
  editRole: (payload: EditRoleType) => ApiClient.post(`/role/edit`, payload),
  updateRoleMembership: (payload: UpdateRoleMembershipType) =>
    ApiClient.post(`/role/membership`, payload),
  getStudioPermissions: () => ApiClient.get(`/studiopermission/getAll`),
  addMembers: (payload: AddMembersType) =>
    ApiClient.post(`/studio/join/bulk`, payload),
  getStudioPermissionsSchema: () =>
    ApiClient.get<PermissionSchema>(`/permissions-schema/studio/schema`),
  createStudioPermission: (payload: CreateStudioPermissionType) =>
    ApiClient.post(`/studiopermission/update`, payload),
  deleteStudio: (studioId: number) => ApiClient.delete(`/studio/${studioId}`),
  getDetails: (studioId: number) => ApiClient.get(`/studio/${studioId}`),
  getMembers: (skip: number = 0) =>
    ApiClient.get(`/studio/members?skip=${skip}`),
  getFollowersCount: () => ApiClient.get("follow/studio/follower"),
  getMembersCount: () => ApiClient.post("studio/memberCount"),
  getMemberRoles: (memberId: number) =>
    ApiClient.get(`/role/member/${memberId}`),
  searchStudioMembers: (query: string) =>
    ApiClient.get(`/member/search?search=${query}`),
  getReels: () => ApiClient.get(`/reels/`),
  getReel: (reelId: number) => ApiClient.get(`/reels/${reelId}`),
  getReelsFeed: (page: number = 0, limit: number = 15) =>
    ApiClient.get(`/reels/feed?filter=studio&skip=${page}&limit=${limit}`),
  removeMembers: (studioId: number) =>
    ApiClient.post(`/member/leave-studio/${studioId}`),
  banMembers: (payload: BanUserPayload) =>
    ApiClient.post(`/studio/ban`, payload),
  joinStudio: (studioId: number) => ApiClient.post(`/studio/${studioId}/join`),
  leaveStudio: (studioId: number) =>
    ApiClient.post(`/member/leave-studio/${studioId}`),
  getAdmins: () => ApiClient.get(`/studio/admins`),
  inviteViaEmail: (payload: InviteViaEmailPayload) =>
    ApiClient.post(`/studio/invite-via-email`, payload),
  importNotion: (payload: FormData) =>
    ApiClient.post(`/parser/import-notion`, payload),
  importFromFile: (payload: FormData) =>
    ApiClient.post(`/parser/import-file`, payload),
  requestToJoin: (studioId: number) =>
    ApiClient.post(`/studio/${studioId}/membership-request/new`, {}),
  acceptJoinRequest: (studioId: number, requestId: number) =>
    ApiClient.post(
      `/studio/${studioId}/membership-request/${requestId}/accept`,
      {}
    ),
  rejectJoinRequest: (studioId: number, requestId: number) =>
    ApiClient.post(
      `/studio/${studioId}/membership-request/${requestId}/reject`,
      {}
    ),
  getJoinRequests: (studioId: number) =>
    ApiClient.get(`/studio/${studioId}/membership-request/list`),
  toggleStudioPublicMembership: () =>
    ApiClient.get(`/studio/toggle-membership`),

  getBillingPortalLink: (studioId: number, url?: string) =>
    ApiClient.get(`/studio/${studioId}/customer-portal-session?url=${url}`),

  getCheckoutLink: (studioId: number, url?: string) =>
    ApiClient.get(`/studio/${studioId}/customer-payment-session?url=${url}`),
};

export default StudioService;
