import ApiClient from "../../../commons/ApiClient";
import { ICanvasBranchesPayload, ICanvasMovePayload } from "../interfaces";

const CanvasService = {
  getBranches: (payload: ICanvasBranchesPayload) =>
    ApiClient.post("/canvas-branch/branch-ops/nav/get-branches", payload),

  moveCanvas: (payload: ICanvasMovePayload) =>
    ApiClient.post("/canvas-repo/move", payload),
  createLangugagePage: (payload: any) =>
    ApiClient.post("/canvas-repo/create-language", payload),
};

export default CanvasService;
