import ApiClient from "../../commons/ApiClient";
import {
  AddEmojiIconType,
  CollectionDataType,
  CreateOrUpdatePermissionType,
  GetCanvasRepoPayloadType,
  ChangeVisibilityType,
  CreateReaction,
  IEditCollectionPayload,
  IEditCanvasPayload,
  MoveCollectionType,
  AttributionsType,
  IUpdateCollectionVisibilityPayload,
} from "./types";

const CollectionService = {
  getCollections: (isPublic: boolean = false) =>
    ApiClient.get(`collection/get?public=${isPublic}`),
  getCanvasRepo: (
    payload: GetCanvasRepoPayloadType,
    isPublic: boolean = false
  ) => ApiClient.post(`canvas-repo/get?public=${isPublic}`, payload),
  createCollection: (payload: any) =>
    ApiClient.post("collection/create", payload),
  deletePage: (collectionId: number) =>
    ApiClient.delete(`collection/delete/${collectionId}`),
  createCanvas: (payload: any) =>
    ApiClient.post("/canvas-repo/create", payload),
  deleteCanvas: (canvasRepoID: number) =>
    ApiClient.delete(`canvas-repo/${canvasRepoID}`),
  createSubCanvas: (payload: any) =>
    ApiClient.post("canvas-repo/create", payload),
  getCanvasByKey: (key: string) => ApiClient.get(`canvas-repo/?key=${key}`),
  getCollectionPermissions: (collection: string | number) =>
    ApiClient.get(`collectionpermission/${collection}`),
  getPermissionsSchema: () =>
    ApiClient.get(`/permissions-schema/collection/schema`),
  getCanvasPermissionsSchema: () =>
    ApiClient.get(`/permissions-schema/canvasBranch/schema`),
  createOrUpdatePermission: (
    payload: CreateOrUpdatePermissionType,
    inherit?: boolean
  ) =>
    ApiClient.post(
      `/collectionpermission/update${inherit ? "?inherit=true" : ""}`,
      payload
    ),
  deletePermission: (permissionId: number, inherit?: boolean) =>
    ApiClient.delete(
      `/collectionpermission/${permissionId}${inherit ? "?inherit=true" : ""}`
    ),
  editCollection: (payload: IEditCollectionPayload) =>
    ApiClient.put("collection/update", payload),
  updateCollectionPublicAccess: (
    collectionId: number,
    payload: IUpdateCollectionVisibilityPayload,
    inheritToCanvases: boolean
  ) =>
    ApiClient.post(
      `collection/${collectionId}/visibility${
        inheritToCanvases ? "?inherit=true" : ""
      }`,
      payload
    ),
  editCanvas: (canvasRepoID: number, payload: IEditCanvasPayload) =>
    ApiClient.patch(`canvas-repo/${canvasRepoID}`, payload),
  addEmojiIcon: (payload: AddEmojiIconType) =>
    ApiClient.patch(`canvas-repo/${payload.canvasRepoId}`, payload),
  changeVisibility: (
    payload: ChangeVisibilityType,
    inheritToSubCanvases?: boolean
  ) =>
    ApiClient.post(
      `/canvas-branch/branch-ops/${payload.canvasBranchId}/visibility${
        inheritToSubCanvases ? "?inherit=true" : ""
      }`,
      { visibility: payload.visibility }
    ),
  addReaction: (payload: CreateReaction) =>
    ApiClient.post("/reactions/create", payload),
  moveCollection: (payload: MoveCollectionType) =>
    ApiClient.post(`/collection/move`, payload),

  getAttributions: (payload: AttributionsType) =>
    ApiClient.get(`/canvas-branch/attributions/${payload.canvasBranchID}`),

  getNextPrevCollections: (collectionId: number | string) =>
    ApiClient.get(`/collection/next-prev/${collectionId}`),

  // User Permissions
  getUserCollectionsWithPG: (userId: number) =>
    ApiClient.get(`/collection/user/${userId}`),
  getUserCollectionCanvasesWithPG: (userId: number, payload: any) =>
    ApiClient.post(`/canvas-repo/user/${userId}`, payload),
  searchUserCollectionCanvasesWithPG: (userId: number, search: string) =>
    ApiClient.get(`/canvas-repo/search/user/${userId}?search=${search}`),

  // Role Permissions
  getRoleCollectionsWithPG: (roleId: number) =>
    ApiClient.get(`/collection/role/${roleId}`),
  getRoleCollectionCanvasesWithPG: (roleId: number, payload: any) =>
    ApiClient.post(`/canvas-repo/role/${roleId}`, payload),
  searchRoleCollectionCanvasesWithPG: (roleId: number, search: string) =>
    ApiClient.get(`/canvas-repo/search/role/${roleId}?search=${search}`),
};

export default CollectionService;
