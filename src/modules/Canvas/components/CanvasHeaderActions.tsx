import { FC, useEffect, useState, useRef } from "react";
import { useTranslation } from "next-i18next";
import { useToasts } from "react-toast-notifications";
import {
  ActionList,
  ActionMenu,
  Avatar,
  Box,
  Button,
  Popover,
  Text,
  Heading,
  TextInput,
  useOnOutsideClick,
  ButtonGroup,
  IconButton,
  Textarea,
} from "@primer/react";

import { useCanvas } from "../../../context/canvasContext";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../hooks/useHasPermission";
import {
  CanvasPermissionEnum,
  CanvasPermissionGroupEnum,
} from "../../Permissions/enums";
import CanvasBranchService from "../services/canvasBranch";
import { GitMergeIcon, TriangleDownIcon } from "@primer/styled-octicons";
import { AVATAR_PLACEHOLDER } from "../../../commons/constants";
import GitOpsService from "../services/gitOpsService";
import { useRouter } from "next/router";
import { useStudio } from "../../../context/studioContext";
import Link from "next/link";
import { useUser } from "../../../context/userContext";
import { usePermissions } from "../../../context/permissionContext";
import { usePages } from "../../../context/pagesContext";
import BipRouteUtils from "../../../core/routeUtils";
import { XIcon } from "@primer/octicons-react";
import { PermissionGroup } from "../../Permissions/types";
import { mutate } from "swr";
import BipLoader from "../../../components/BipLoader";
import segmentEvents from "../../../insights/segment";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import { IPublishRequestData } from "../interfaces";
import { BranchAccessEnum } from "../enums";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

interface ManageAcceptOrRejectPublishRequestButtonsProps {
  onAccept: (accept: boolean) => void;
  onReject: (accept: boolean) => void;
  disabled: boolean;
}

const ManageAcceptOrRejectPublishRequestButtons: FC<
  ManageAcceptOrRejectPublishRequestButtonsProps
> = ({ onAccept, onReject, disabled }) => {
  const { t } = useTranslation();

  return (
    <ButtonGroup>
      <Button
        disabled={disabled}
        id={"publish-accept-btn"}
        variant="primary"
        sx={{
          border: "none",
          fontSize: "12px",
        }}
        onClick={() => {
          onAccept(true);
        }}
        size="small"
      >
        {t("canvas.header.publish")}
      </Button>
      <ActionMenu>
        <ActionMenu.Anchor>
          <IconButton
            variant="primary"
            sx={{
              border: "none",
              borderLeft: "1px solid",
              borderColor: "canvasHeaderActions.buttonGroups.border",
              fontSize: "12px",
            }}
            icon={TriangleDownIcon}
            size="small"
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Item
              onSelect={() => {
                onReject(false);
              }}
              disabled={disabled}
            >
              {t("canvas.header.reject")}
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </ButtonGroup>
  );
};

interface ManageRequestedPublishButtonsProps {
  onCancel: () => void;
  disabled: boolean;
}

const ManageRequestedPublishButtons: FC<ManageRequestedPublishButtonsProps> = ({
  onCancel,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <Box display={"flex"} className="space-x-2">
      <Button
        size="small"
        variant="invisible"
        sx={{ color: "canvasHeaderActions.cancel" }}
        disabled={disabled}
        onClick={onCancel}
      >
        {t("canvas.header.cancel")}
      </Button>
      <Button
        disabled={true}
        variant="default"
        sx={{
          border: "none",
          fontSize: "12px",
        }}
        size="small"
      >
        {t("canvas.header.requested")}
      </Button>
    </Box>
  );
};

interface ManagePublishRequestButton {
  disabled: boolean;
  onClick?: (message: string) => void;
  text: string;
  canPublish: boolean;
}

const ManagePublishRequestButton: FC<ManagePublishRequestButton> = (props) => {
  const { disabled, onClick, text, canPublish } = props;
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  return (
    <>
      <Button
        disabled={disabled}
        id={canPublish && onClick ? "publish-btn" : "publish-request-start-btn"}
        variant="primary"
        sx={{
          border: "none",
          fontSize: "12px",
        }}
        onClick={() => {
          canPublish && onClick ? onClick("") : setOpen(true);
        }}
        size="small"
        ref={anchorRef}
      >
        {text}
      </Button>
      <ActionMenu open={open} onOpenChange={setOpen} anchorRef={anchorRef}>
        <ActionMenu.Overlay>
          <Box
            sx={{
              backgroundColor: "canvasHeaderActions.overlayBg",
              width: "250px",
              right: 0,
              top: "40px",
              boxShadow: "0 0 4px rgba(0,0,0,.16)",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <Text
                as="p"
                sx={{
                  fontSize: "12px",
                  lineHeight: "18px",
                  fontWeight: 600,
                  color: "canvasHeaderActions.lightText",
                }}
              >
                Publish New Canvas
              </Text>
              <IconButton
                variant="invisible"
                size="small"
                icon={XIcon}
                onClick={() => {
                  setOpen(false);
                }}
                sx={{ color: "canvasHeaderActions.lightText" }}
              />
            </div>
            <TextInput
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setOpen(false);
                  onClick && onClick(message.trim());
                }
              }}
              placeholder={"Message (optional)"}
              sx={{
                bg: "transparent",
                border: "1px solid",
                borderColor: "canvasHeaderActions.inputBorder",
                borderRadius: "6px",
                boxShadow: "none",
                px: "0px",
                width: "100%",
              }}
            />
            <div className="flex justify-end mt-4">
              <Button
                disabled={disabled}
                id="publish-request-final-btn"
                variant="primary"
                sx={{
                  border: "none",
                  fontSize: "12px",
                }}
                onClick={() => {
                  setOpen(false);
                  onClick && onClick(message.trim());
                }}
                size="small"
              >
                {text}
              </Button>
            </div>
          </Box>
        </ActionMenu.Overlay>
      </ActionMenu>
    </>
  );
};

interface ICanvasHeaderActionsProps {
  isMergeRequestScreen?: boolean;
  mergeRequest: any;
  conflicts: any;
  setShowPermissions: Function;
}

const CanvasHeaderActions: FC<ICanvasHeaderActionsProps> = ({
  isMergeRequestScreen,
  mergeRequest,
  conflicts,
  setShowPermissions,
}) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const [mergeRequests, setMergeRequests] = useState([]);
  const { currentStudio } = useStudio();
  const router = useRouter();
  const { user } = useUser();
  const handle = router.query.handle as string;
  const slug = router.query.slug as string;
  const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const {
    repo,
    setRepo,
    branch,
    setBranch,
    showDiffView,
    setShowDiffView,
    members,
    setBranches,
    branches,
    isSaving,
    pendingSave,
  } = useCanvas();
  const [popupMessage, setPopupMessage] = useState("");
  const [mergeType, setMergeType] = useState("");
  const { schema } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [publishRequestData, setPublishRequestData] = useState(
    (): IPublishRequestData | null => null
  );
  const { isTabletOrMobile } = useDeviceDimensions();

  const [showRequestMergeBtn, setShowRequestMergeBtn] = useState(false);
  const { updatePages, pages, deletePage, drafts, setDrafts } = usePages();
  const requestPopupRef = useRef(null);
  const canManageMergeRequests = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_MANAGE_MERGE_REQUESTS,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );

  useEffect(() => {
    try {
      if (repo?.isPublished) {
        const getMergeRequests = async () => {
          const resp = await GitOpsService.getMergeRequestsForBranch(branch.id);
          setMergeRequests(resp?.data?.data?.data || []);
        };
        branch?.id && getMergeRequests();
      }
    } catch (err) {}
  }, [branch?.id]);

  useEffect(() => {
    if (branch?.id) {
      CanvasBranchService.getPublishRequests(branch.id)
        .then((r) => {
          const data = r.data?.data?.Data || [];
          if (data.length) {
            setPublishRequestData(data[0]);
          }
        })
        .catch((err) => {});
    }
  }, [branch?.id]);

  useEffect(() => {
    const getParentMembers = async (branchId: number) => {
      try {
        const resp = await CanvasBranchService.getMembers(branchId);
        const users = resp.data.data;
        const roles = users.filter((member) => member?.type === "role");
        const members = users.filter((member) => member?.type === "member");
        let adminRoleMembersCount = 0,
          membersWithModPermCount = 0;
        roles.forEach((el) => {
          if (el.permissionGroup === CanvasPermissionGroupEnum.MODERATE) {
            adminRoleMembersCount += el.role.membersCount;
          }
        });

        members.forEach((el) => {
          if (el.permissionGroup === CanvasPermissionGroupEnum.MODERATE) {
            membersWithModPermCount += 1;
          }
        });

        if (adminRoleMembersCount > 1 || membersWithModPermCount > 1) {
          setShowRequestMergeBtn(true);
        }
      } catch (error) {
        throw error;
      }
    };
    if (branch) {
      const { roughFromBranchID, fromBranchID } = branch;
      const parentBranchId = roughFromBranchID || fromBranchID;
      parentBranchId && getParentMembers(parentBranchId);
    }
  }, [branch?.roughFromBranchID, branch?.fromBranchID]);

  // useEffect(() => {
  //   if (branch) {
  //     const { roughFromBranchID, fromBranchID } = branch;
  //     const parentBranchId = roughFromBranchID || fromBranchID;
  //     if (parentBranchId) {
  //       const getParentMembers = async () => {
  //         const resp = await CanvasBranchService.getMembers(parentBranchId);
  //       };

  //       getParentMembers();
  //     }
  //   }
  // }, [branch?.roughFromBranchID, branch?.fromBranchID]);

  const canManagePublishRequests = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_MANAGE_PUBLISH_REQUESTS,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );

  const canManageMergeRequestsOnParent = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_MANAGE_MERGE_REQUESTS,
    PermissionContextEnum.Canvas,

    schema?.canvas?.permissionGroups.find((pg: PermissionGroup) =>
      isMergeRequestScreen
        ? pg.systemName === mergeRequest?.canvasRepository?.permission
        : pg.systemName === repo?.defaultBranch?.permission
    )?.permissions
    // branch?.permissionGroup?.permissions
  );

  const canCreateMergeRequest = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_CREATE_MERGE_REQUEST,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );

  const canCreatePublishRequests = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_CREATE_PUBLISH_REQUEST,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );

  const closeRequestPopup = () => {
    setPopupMessage("");
    setShowRequestPopup(false);
    setMergeType("");
  };

  const handlePublish = async (msg: string) => {
    try {
      setLoading(true);
      const publishResponse =
        await CanvasBranchService.publishOrRequestToPublish(branch?.id, msg);
      addToast(
        publishResponse.data.published
          ? "Published successfully!"
          : publishResponse.data.message,
        {
          appearance: "success",
          autoDismiss: true,
        }
      );
      if (
        publishResponse.data.nudge &&
        publishResponse?.data.published &&
        branch?.publicAccess === BranchAccessEnum.PRIVATE
      ) {
        addToast(t("billing.limitExceededWarning"), {
          appearance: "warning",
          autoDismiss: false,
        });
      }
      let newRepo = {
        ...repo,
      };
      setDrafts(drafts.filter((draft) => draft.id !== repo?.defaultBranch.id));
      if (repo?.defaultBranch?.canPublish) {
        segmentEvents.canvasPublished(
          repo?.name,
          repo?.key,
          currentStudio?.handle!,
          true,
          user?.id!
        );
        newRepo = {
          ...newRepo,
          isPublished: true,
        };
        const tempPages = [...pages];
        const pageIndex = pages.findIndex((page) => page.id === repo.id);
        tempPages[pageIndex] = {
          ...tempPages[pageIndex],
          isPublished: true,
        };
        updatePages(tempPages);
        mutate([branchId, "members"]);
      } else {
        segmentEvents.canvasPublishRequested(
          repo?.name!,
          repo?.key!,
          currentStudio?.handle!,
          user?.id!
        );

        newRepo = {
          ...newRepo,
          defaultBranch: {
            ...repo?.defaultBranch,
            hasPublishRequest: true,
          },
        };
        if (publishResponse.data?.publishRequestId) {
          setPublishRequestData({
            canvasBranchID: branch?.id,
            canvasRepositoryID: repo?.id,
            createdAt: "",
            createdByID: 0,
            id: publishResponse.data.publishRequestId,
            message: "New request to publish",
            reviewedByUserID: 0,
            status: "PENDING",
            studioID: currentStudio?.id,
            updatedAt: "",
            uuid: "",
          });
        }
      }
      setRepo(newRepo);
      if (publishResponse.data.published)
        if (!isTabletOrMobile) {
          setShowPermissions(true);
        }

        router.push(
          BipRouteUtils.getCanvasRoute(
            currentStudio?.handle!,
            repo?.name,
            repo?.defaultBranchID,
          ),undefined, {shallow: true});

    } catch (error) {
      addToast("Pease try again later!", {
        appearance: "error",
        autoDismiss: true,
      });
    }
    setLoading(false);
  };

  const cancelPublishRequest = () => {
    if (publishRequestData && branch) {
      setLoading(true);
      CanvasBranchService.cancelPublichRequest(branch.id, publishRequestData.id)
        .then((r) => {
          if (repo) {
            const newRepo = {
              ...repo,
              defaultBranch: {
                ...repo.defaultBranch,
                hasPublishRequest: true,
              },
            };
            setRepo(newRepo);
            setPublishRequestData(null);
            addToast("Cancelled Publish request", {
              appearance: "success",
              autoDismiss: true,
            });
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          addToast("Pease try again later!", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  };

  const acceptOrRejectPublishRequest = (accept: boolean) => {
    console.log("canheader");
    if (publishRequestData && branch) {
      setLoading(true);
      if (accept) {
        segmentEvents.canvasPublished(
          repo?.name!,
          repo?.key!,
          currentStudio?.handle,
          false,
          user?.id
        );
      } else if (!accept) {
        segmentEvents.canvasPublishRejected(
          repo?.name!,
          repo?.key!,
          currentStudio?.handle,
          user?.id
        );
      }
      CanvasBranchService.acceptOrRejectPublishRequest(
        branch.id,
        publishRequestData.id,
        accept
      )
        .then((r) => {
          setPublishRequestData(null);
          if (repo) {
            const newRepo = {
              ...repo,
              isPublished: accept ? true : false,
            };
            setRepo(newRepo);
            addToast(`${accept ? "Accepted" : "Rejected"} Publish request`, {
              appearance: "success",
              autoDismiss: true,
            });
            if (r.data.nudge && r.data.accept) {
              addToast(t("billing.limitExceededWarning"), {
                appearance: "warning",
                autoDismiss: false,
              });
            }
            if (!accept) {
              const curPage = pages.find((page) => page.id === repo.id);
              deletePage(repo.id);
              const siblingCanvas = pages?.find(
                (page) =>
                  page.type === "CANVAS" &&
                  page.parent === curPage.parent &&
                  curPage.id !== page.id
              );

              const parentCanvas = pages?.find(
                (page) => page.type === "CANVAS" && page.id === curPage.parent
              );

              const differentCollectionCanvas = pages.find(
                (page) =>
                  page.type === "CANVAS" &&
                  curPage.collectionID !== page.collectionID
              );

              if (siblingCanvas) {
                router.push(
                  BipRouteUtils.getCanvasRoute(
                    currentStudio?.handle!,
                    siblingCanvas?.name,
                    siblingCanvas.defaultBranch?.id
                  )
                );
              } else if (parentCanvas) {
                router.push(
                  BipRouteUtils.getCanvasRoute(
                    currentStudio?.handle!,
                    parentCanvas?.name,
                    parentCanvas.defaultBranch?.id
                  )
                );
              } else if (differentCollectionCanvas) {
                router.push(
                  BipRouteUtils.getCanvasRoute(
                    currentStudio?.handle!,
                    differentCollectionCanvas?.name,
                    differentCollectionCanvas.defaultBranch?.id
                  )
                );
              } else {
                router.push(
                  BipRouteUtils.getStudioAboutRoute(currentStudio?.handle!)
                );
              }
            } else {
              setShowPermissions(true);
            }
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          addToast("Pease try again later!", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  };

  const redirectToBranch = (branchId: number, canvasRepo?: any) => {
    router.push(
      BipRouteUtils.getCanvasRoute(
        currentStudio?.handle!,
        canvasRepo?.name ?? repo?.name,
        branchId
      )
    );
  };

  const handleRequestToMerge = async () => {
    setLoading(true);
    segmentEvents.canvasMergeRequested(
      currentStudio?.handle,
      repo?.key,
      repo?.name,
      user?.id
    );
    try {
      const mergeResponse = await GitOpsService.createMergeRequest(
        branch?.id!,
        {
          commitMessage: popupMessage,
        }
      );
      addToast("Merge request sent.", {
        appearance: "success",
        autoDismiss: true,
      });
      setBranch({
        ...branch,
        mergeRequest: mergeResponse.data.merge_request_instance,
      });
      router.push({
        pathname: BipRouteUtils.getMergeRequestRoute(
          currentStudio?.handle!,
          repo?.name!,
          mergeResponse?.data.merge_request_instance.destinationBranchID,
          mergeResponse?.data.merge_request_instance.id
        ),
      });

      setShowRequestPopup(false);
      setPopupMessage("");
    } catch (error) {
      addToast("Pease try again later!", {
        appearance: "error",
        autoDismiss: true,
      });
    }
    setLoading(false);
  };

  const deleteBranchFromContext = () => {
    updatePages(pages.filter((page) => page.id !== branch?.id));
    setBranches(branches.filter((br) => br.id !== branch?.id));
    if (branch?.isDraft) {
      setDrafts(drafts.filter((draft: any) => draft.id !== branch?.id));
    }
  };

  const deleteBranch = async () => {
    try {
      await CanvasBranchService.deleteBranch(branch?.id!);
      addToast("Branch deleted successfully", {
        appearance: "success",
        autoDismiss: true,
      });
      deleteBranchFromContext();
      const { roughFromBranchID, fromBranchID } = branch;
      const parentBranchId = roughFromBranchID || fromBranchID;
      mutate([parentBranchId, "canvas-branch"]);
      router.push(
        BipRouteUtils.getCanvasRoute(
          currentStudio?.handle!,
          repo?.name!,
          repo?.defaultBranch?.id
        )
      );
    } catch (error) {
      addToast("Failed to delete branch, try again later", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const deleteMergeRequest = async () => {
    try {
      setLoading(true);
      await GitOpsService.deleteMergeRequest(
        mergeRequest ? mergeRequest.branch.id : branch?.id,
        mergeRequest ? mergeRequest.mergeRequest.id : branch?.mergeRequest?.id
      );
      addToast("Merge cancelled successfully", {
        appearance: "success",
        autoDismiss: true,
      });
      const newBranch = { ...branch };
      delete newBranch["mergeRequest"];
      setBranch(newBranch);
      router.push(
        BipRouteUtils.getCanvasRoute(
          currentStudio?.handle,
          repo?.name,
          branchId
        )
      );
      setLoading(false);
    } catch (error: any) {
      addToast(error?.data?.error ?? `Failed to delete merge request`, {
        appearance: "error",
        autoDismiss: true,
      });
      setTimeout(() => {
        router.push({
          pathname: BipRouteUtils.getCanvasSlugRoute(handle, slug),
        });
      }, 1000);
    }
  };

  const allUnchanged =
    isMergeRequestScreen &&
    conflicts.every((conflict) => conflict.status === "Unchanged");

  const changedCount =
    isMergeRequestScreen &&
    conflicts.reduce(
      (count, curValue) => (count += curValue.status !== "Unchanged"),
      0
    );
  const acceptedCount =
    isMergeRequestScreen &&
    conflicts.reduce(
      (count, curValue) => (count += curValue.status === "Accepted"),
      0
    );
  const totalConflicts = isMergeRequestScreen && conflicts.length;
  const allAccepted = acceptedCount === totalConflicts;
  const allRejected = changedCount === totalConflicts && acceptedCount === 0;

  const handlePartialMerge = () => {
    const allChanged = conflicts.every(
      (conflict) => conflict.status !== "Unchanged"
    );

    if (allChanged) {
      onMergeAction("PARTIALLY_ACCEPTED");
    } else {
      alert(
        `Total changes: ${totalConflicts}\nAccepted: ${acceptedCount}\nRejected: ${
          changedCount - acceptedCount
        }\n\nPlease act on the ${
          totalConflicts - changedCount
        } remaining changes before proceeding`
      );
    }
  };

  const onMergeAction = async (status: string) => {
    const MReq: any = mergeRequest;
    const payload = {
      status,
      mergeRequestId: MReq?.mergeRequest?.id,
      commitMessage: MReq?.mergeRequest?.commitMessage,
    };

    if (status === "PARTIALLY_ACCEPTED") {
      let changesAccepted = conflicts.reduce((previousValue, curValue) => {
        previousValue[curValue.blockUUID] = curValue.status === "Accepted";
        return previousValue;
      }, {});
      console.log("changesAccepted", changesAccepted);

      payload.changesAccepted = changesAccepted;
    }

    try {
      if (status === "PARTIALLY_ACCEPTED") {
        segmentEvents.canvasMerged(
          currentStudio?.handle!,
          repo?.key!,
          repo?.name!,
          user?.id!,
          false,
          payload
        );
      } else {
        segmentEvents.canvasMerged(
          currentStudio?.handle!,
          repo?.key!,
          repo?.name!,
          user?.id!,
          false,
          payload
        );
      }

      setLoading(true);

      await GitOpsService.acceptMergeRequest(
        MReq?.branch.id,
        MReq?.mergeRequest.id,
        payload
      );

      addToast(`${status} merge request successfully`, {
        appearance: "success",
        autoDismiss: true,
      });
      const { roughFromBranchID, fromBranchID } = mergeRequest?.branch;
      const parentBranchId = roughFromBranchID || fromBranchID;

      setLoading(false);
      redirectToBranch(parentBranchId, mergeRequest?.canvasRepository);
    } catch (error) {
      console.log(error);
      addToast(`Merge failed, please try again later`, {
        appearance: "error",
        autoDismiss: true,
      });
      setLoading(false);
    }
  };

  const onRejectMergeRequest = async () => {
    try {
      segmentEvents.canvasMergeRejected(
        currentStudio?.handle,
        repo?.key,
        repo?.name,
        user?.id,
        false,
        "rejected"
      );
      await GitOpsService.rejectMergeRequest(
        mergeRequest.branch.id,
        mergeRequest.mergeRequest.id
      );
      addToast("Merge rejected successfully", {
        appearance: "success",
        autoDismiss: true,
      });
      const { roughFromBranchID, fromBranchID } = mergeRequest?.branch;
      const parentBranchId = roughFromBranchID || fromBranchID;
      redirectToBranch(parentBranchId, mergeRequest?.canvasRepository);
    } catch (error) {
      addToast(`Failed to delete merge request`, {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleRequestAndMergeForMod = async () => {
    setLoading(true);
    segmentEvents.canvasMerged(
      currentStudio?.handle!,
      repo?.key!,
      repo?.name!,
      user?.id!,
      true,
      "merge by self"
    );
    try {
      await GitOpsService.createMergeRequest(
        branch?.id!,
        {
          commitMessage: popupMessage,
        },
        true
      );
      closeRequestPopup();
      addToast("Merged successfully", {
        appearance: "success",
        autoDismiss: true,
      });
      const { roughFromBranchID, fromBranchID } = branch;
      const parentBranchId = roughFromBranchID || fromBranchID;
      redirectToBranch(parentBranchId);
      mutate([parentBranchId, "canvas-branch"]);
      // setBranch({
      //   ...repo?.defaultBranch,
      //   id: parentBranchId,
      //   isDefault: repo?.defaultBranch === parentBranchId ? true : false,
      //   permissionGroup: schema?.canvas?.permissionGroups?.find(
      //     (permissionGroup: PermissionGroup) =>
      //       permissionGroup.systemName === repo?.defaultBranch?.permission
      //   ),
      // });
      deleteBranchFromContext(branch.id);
    } catch (error) {
      addToast(`Failed to merge`, {
        appearance: "error",
        autoDismiss: true,
      });
    }
    setLoading(false);
  };

  const MRUser = mergeRequest?.mergeRequest?.createdByUser;
  const isCreatedByCurUser = mergeRequest
    ? MRUser?.id === user?.id
    : branch?.mergeRequest?.createdByID === user.id;

  useOnOutsideClick({
    onClickOutside: () => {
      if (showRequestPopup) {
        closeRequestPopup();
      }
    },
    containerRef: requestPopupRef,
  });

  const isMergeClosed =
    mergeRequest && mergeRequest?.mergeRequest?.status !== "OPEN";
  const mergeRequestStatus =
    mergeRequest?.mergeRequest?.status || branch?.mergeRequest?.status;

  return (
    <div className="flex items-center space-x-2">
      {!isMergeRequestScreen && mergeRequests.length > 0 && (
        <Box>
          <ActionMenu>
            <ActionMenu.Button leadingIcon={GitMergeIcon} size="small">
              {mergeRequests.length}
            </ActionMenu.Button>
            <ActionMenu.Overlay align="center">
              <ActionList>
                {mergeRequests.map((mergeRequest) => (
                  <ActionList.Item
                    sx={{
                      marginBottom: "10px",
                    }}
                    key={mergeRequest.id}
                  >
                    <LinkWithoutPrefetch
                      href={BipRouteUtils.getMergeRequestRoute(
                        currentStudio?.handle!,
                        repo?.name!,
                        mergeRequest?.destinationBranchID,
                        mergeRequest?.id
                      )}
                      // href={`/@${currentStudio?.handle}/merge-request/${mergeRequest.id}`}
                    >
                      <div>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Avatar
                            size={24}
                            src={
                              mergeRequest.createdByUser.avatarUrl ||
                              AVATAR_PLACEHOLDER
                            }
                          />
                          <Text
                            sx={{ marginLeft: "5px" }}
                            color={"canvasHeaderActions.lightText"}
                          >
                            @{mergeRequest.createdByUser.username}
                          </Text>
                        </Box>
                        <Box sx={{ color: "canvasHeaderActions.message" }}>
                          {mergeRequest.commitMessage}
                        </Box>
                      </div>
                    </LinkWithoutPrefetch>
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </Box>
      )}
      {isMergeClosed ? (
        <div>
          <strong>{mergeRequestStatus}</strong>
        </div>
      ) : (
        <>
          {isCreatedByCurUser && mergeRequestStatus === "OPEN" && (
            <>
              <Text
                sx={{
                  color: "text.muted",
                  fontSize: "14px",
                  mx: "5px",
                }}
              >
                Pending request
              </Text>
              <Button
                disabled={loading}
                size="small"
                onClick={deleteMergeRequest}
              >
                Cancel
              </Button>
            </>
          )}
          {/* {branch?.isDefault ? null : null} */}
          {!branch?.isDefault || isMergeRequestScreen ? (
            showDiffView ? (
              <Button onClick={() => setShowDiffView(false)} size="small">
                Back
              </Button>
            ) : (
              ((!branch?.mergeRequest && !isMergeRequestScreen) ||
                (isMergeRequestScreen && canManageMergeRequestsOnParent)) &&
              (branch || isMergeRequestScreen) && (
                <Box position={"relative"}>
                  <ButtonGroup>
                    <Button
                      id={
                        isMergeRequestScreen
                          ? "merge-accept-btn"
                          : canManageMergeRequestsOnParent
                          ? "merge-self-start-btn"
                          : "merge-request-start-btn"
                      }
                      disabled={pendingSave || showRequestPopup || loading}
                      variant="primary"
                      sx={{
                        border: "none",
                        fontSize: "12px",
                      }}
                      size="small"
                      onClick={() => {
                        if (isMergeRequestScreen) {
                          if (allUnchanged || allAccepted) {
                            onMergeAction("ACCEPTED");
                          } else if (allRejected) {
                            onRejectMergeRequest();
                          } else {
                            handlePartialMerge();
                          }
                          return;
                        }
                        if (canManageMergeRequestsOnParent) {
                          setShowRequestPopup(true);
                          setMergeType("merge");
                        } else {
                          setShowRequestPopup(true);
                          setMergeType("reqToMerge");
                        }
                      }}
                    >
                      <Box display={"flex"} alignItems="center">
                        {canManageMergeRequestsOnParent
                          ? isMergeRequestScreen
                            ? allUnchanged || allAccepted
                              ? t("git.acceptAll")
                              : allRejected
                              ? t("git.rejectRequest")
                              : `${t(
                                  "git.merge"
                                )} ${changedCount}/${totalConflicts}`
                            : t("git.merge")
                          : t("git.requestToMerge")}
                        {loading && (
                          <BipLoader
                            sx={{
                              my: "0px",
                              ml: "8px",
                            }}
                          />
                        )}
                      </Box>
                    </Button>
                    <ActionMenu>
                      <ActionMenu.Anchor>
                        <IconButton
                          disabled={pendingSave}
                          variant="primary"
                          sx={{
                            border: "none",
                            fontSize: "12px",
                          }}
                          icon={TriangleDownIcon}
                          size="small"
                        />
                      </ActionMenu.Anchor>

                      <ActionMenu.Overlay
                        sx={{
                          zIndex: 100,
                          bg: "canvasHeaderActions.overlayBg",
                        }}
                      >
                        <ActionList>
                          {isMergeRequestScreen ? (
                            <>
                              {!allUnchanged && !allAccepted && (
                                <ActionList.Item
                                  onSelect={() => onMergeAction("ACCEPTED")}
                                >
                                  {t("git.acceptAll")}
                                </ActionList.Item>
                              )}
                              {!allRejected && (
                                <ActionList.Item
                                  onSelect={onRejectMergeRequest}
                                  variant="danger"
                                >
                                  {t("git.rejectRequest")}
                                </ActionList.Item>
                              )}
                            </>
                          ) : (
                            <>
                              {canManageMergeRequestsOnParent &&
                                showRequestMergeBtn && (
                                  <ActionList.Item
                                    onSelect={() => {
                                      setShowRequestPopup(true);
                                      setMergeType("reqToMerge");
                                    }}
                                  >
                                    {t("git.requestToMerge")}
                                  </ActionList.Item>
                                )}
                              <ActionList.Item
                                onSelect={() => setShowDiffView(true)}
                              >
                                {t("git.reviewChanges")}
                              </ActionList.Item>
                              <ActionList.Item onSelect={deleteBranch}>
                                {t("git.discardChanges")}
                              </ActionList.Item>
                            </>
                          )}
                        </ActionList>
                      </ActionMenu.Overlay>
                    </ActionMenu>
                  </ButtonGroup>

                  {showRequestPopup && (
                    <Box
                      ref={requestPopupRef}
                      position={"absolute"}
                      sx={{
                        backgroundColor: "canvasHeaderActions.overlayBg",
                        width: 200,
                        right: 0,
                        top: "40px",
                        boxShadow: "0 0 4px rgba(0,0,0,.16)",
                        padding: "10px",
                        borderRadius: "10px",
                      }}
                    >
                      <Heading sx={{ fontSize: 2 }}>
                        Message to Canvas Moderator
                      </Heading>
                      <Textarea
                        autoFocus
                        resize="none"
                        rows={2}
                        sx={{ margin: "10px 0", bg: "transparent" }}
                        placeholder="Add commit message (optional)"
                        value={popupMessage}
                        onChange={(e) => setPopupMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            canManageMergeRequestsOnParent &&
                            mergeType === "merge"
                              ? handleRequestAndMergeForMod()
                              : handleRequestToMerge();
                          }
                        }}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Button
                          disabled={loading}
                          id={
                            mergeType === "merge"
                              ? "merge-self-final-btn"
                              : "merge-request-final-btn"
                          }
                          variant="primary"
                          onClick={() => {
                            canManageMergeRequestsOnParent &&
                            mergeType === "merge"
                              ? handleRequestAndMergeForMod()
                              : handleRequestToMerge();
                          }}
                          size="small"
                          sx={{
                            border: "none",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <span>
                              {canManageMergeRequestsOnParent &&
                              mergeType === "merge"
                                ? loading
                                  ? "Merging"
                                  : "Merge"
                                : loading
                                ? "Requesting"
                                : "Request to merge"}
                            </span>

                            {loading && (
                              <Box ml={"8px"}>
                                <BipLoader
                                  sx={{
                                    my: "0px",
                                    // ml: "8px",
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )
            )
          ) : !repo?.isPublished ? (
            repo?.defaultBranch?.canPublish ? (
              repo?.defaultBranch?.hasPublishRequest ? (
                publishRequestData ? (
                  <ManageAcceptOrRejectPublishRequestButtons
                    disabled={loading}
                    onAccept={acceptOrRejectPublishRequest}
                    onReject={acceptOrRejectPublishRequest}
                  />
                ) : (
                  <Button
                    disabled={true}
                    variant="default"
                    sx={{
                      border: "none",
                      fontSize: "12px",
                      color: "canvasHeaderActions.cancel",
                      ":disabled": {
                        color: "canvasHeaderActions.cancel",
                      },
                    }}
                    size="small"
                  >
                    {t("canvas.header.rejected")}
                  </Button>
                )
              ) : (
                <ManagePublishRequestButton
                  disabled={loading || pendingSave}
                  onClick={handlePublish}
                  text={
                    repo?.defaultBranch?.canPublish
                      ? t("canvas.header.publish")
                      : t("canvas.header.requestToPublish")
                  }
                  canPublish={repo?.defaultBranch?.canPublish}
                />
              )
            ) : repo?.defaultBranch?.hasPublishRequest && publishRequestData ? (
              <ManageRequestedPublishButtons
                disabled={loading}
                onCancel={cancelPublishRequest}
              />
            ) : (
              <>
                {canCreatePublishRequests && (
                  <ManagePublishRequestButton
                    disabled={loading}
                    onClick={handlePublish}
                    text={t("canvas.header.requestToPublish")}
                    canPublish={repo?.defaultBranch?.canPublish}
                  />
                )}
              </>
            )
          ) : null}
        </>
      )}
    </div>
  );
};

export default CanvasHeaderActions;
