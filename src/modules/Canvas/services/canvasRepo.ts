import ApiClient from "../../../commons/ApiClient";
import { IEditCanvasPayload } from "../interfaces";

const CanvasRepoService = {
  getRepo: (key: string, inviteCode?: string) =>
    ApiClient.get(
      `canvas-repo/?key=${key}${inviteCode ? "&inviteCode=" + inviteCode : ""}`
    ),
  editCanvas: (canvasRepoID: number, payload: IEditCanvasPayload) => {
    return ApiClient.patch(`canvas-repo/${canvasRepoID}`, payload);
  },
  uploadCover: (payload: FormData) =>
    ApiClient.post(`/global/upload-file`, payload),
  getNextPrevCanvases: (repoId: number | string) =>
    ApiClient.get(`/canvas-repo/next-prev/${repoId}`),
  getDistinctLanguages: () => ApiClient.get("/canvas-repo/distinct-languages"),
  getLanguageNextPrevCanvases: (repoId: number | string, language: string) =>
    ApiClient.get(`canvas-repo/lang-next-prev/${repoId}?language=${language}`),
};

export default CanvasRepoService;
