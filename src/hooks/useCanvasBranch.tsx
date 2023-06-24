import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { AxiosError } from "axios";

import { useCanvas } from "../context/canvasContext";
import { usePermissions } from "../context/permissionContext";
import { CanvasBranchService, CanvasService } from "../modules/Canvas/services";
import { HttpStatusCode } from "../commons/enums";
import BipRouteUtils from "../core/routeUtils";
import { ChildrenProps } from "../commons/types";
import BipLoader from "../components/BipLoader";
import RequestAccess from "../components/RequestAccess";
import { PermissionGroup } from "../modules/Permissions/types";
import { sanitizeHandle } from "../utils/Common";
import CanvasNotFound from "../components/CanvasNotFound";
import { useLayout } from "../context/layoutContext";
import { usePages } from "../context/pagesContext";
import {
  ICanvasBranch,
  ICanvasBranchResponse,
} from "../modules/Canvas/interfaces";
import segmentEvents from "../insights/segment";
import { useStudio } from "../context/studioContext";
import { useUser } from "../context/userContext";
import useDeviceDimensions from "./useDeviceDimensions";

export const useCanvasBranch = (branchId: number) => {
  const router = useRouter();

  const { pages, setPagesLoaded, setShouldFetchCollections } = usePages();
  const { currentStudio } = useStudio();
  const { isLoggedIn } = useUser();

  const { showNotFoundPage, setShowNotFoundPage } = useCanvas();

  const handle = router.query.handle as string;
  const isRough = Boolean(router.query.isRough as string);
  const inviteCode = router.query.inviteCode as string;
  const [hasExistingRequest, setHasExistingRequest] = useState<boolean>(false);
  const { setIsSideNavOpen } = useLayout();

  const {
    repo,
    setRepo,
    setBranch,
    setBranchAccessTokens,
    branch,
    setShowDiffView,
    setBranches,
  } = useCanvas();
  const { schema: lSchema } = usePermissions();
  const { isTabletOrMobile } = useDeviceDimensions();

  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  const fetchCanvasBranch = async (id: number) => {
    if (branchId !== id) {
      console.log("invalid");
      return;
    }
    try {
      if (isTabletOrMobile) {
        setIsSideNavOpen(false);
      }
      const { data: branchData } = await CanvasBranchService.getBranch(
        id,
        inviteCode
      );
      const canvasRepo = branchData.canvasRepo;
      const defaultBranch = canvasRepo.defaultBranch;
      let schema = lSchema;
      const localSchema = localStorage.getItem("permissionsSchema");
      if (localSchema) {
        const parsedSchema = JSON.parse(localSchema);
        schema = lSchema || parsedSchema;
      }
      const { data: branchesData } = await CanvasService.getBranches({
        canvasId: canvasRepo.id,
        collectionId: canvasRepo.collectionID,
        parentCanvasId: canvasRepo.parentCanvasRepositoryID ?? 0,
      });
      setBranch({
        ...branchData.canvasBranch,
        permissionGroup: schema?.canvas?.permissionGroups?.find(
          (permissionGroup: PermissionGroup) =>
            permissionGroup.systemName === defaultBranch?.permission
        ),
      });

      if (branchesData.data) {
        const repoBranches = branchesData.data.map(
          (branch: ICanvasBranch, index: number) => {
            return {
              ...branch,
              parent: canvasRepo.id,
              position: (canvasRepo.subCanvasCount ?? 0) + index + 1,
              type: "BRANCH",
            };
          }
        );

        setBranches(repoBranches);
      }
      if (!pages.find((page) => page.id === canvasRepo.id)) {
        setPagesLoaded(false);
      }

      setRepo(canvasRepo);

      if (branchData.canvasBranchErr) {
        //branch error
        const err = error as AxiosError;
        setIsSideNavOpen(true);
        setShouldFetchCollections(true);
        if (err.status) {
          const apiStatus = parseInt(err.status);
          if (apiStatus === HttpStatusCode.FORBIDDEN) {
            setHasExistingRequest(error.data.access_requested);
            setIsPrivate(true);
          } else if (apiStatus === HttpStatusCode.NOT_FOUND) {
            if (canvasRepo.defaultBranchID === branchId) {
              setShowNotFoundPage(true);
            } else {
              router.push({
                pathname: BipRouteUtils.getCanvasRoute(
                  sanitizeHandle(handle),
                  canvasRepo.name!,
                  canvasRepo.defaultBranchID
                ),
              });
            }
          }
        }
      } else {
        const canvasBranch = branchData.canvasBranch;
        setBranch({
          ...canvasBranch,
          permissionGroup: schema?.canvas?.permissionGroups?.find(
            (permissionGroup: PermissionGroup) =>
              permissionGroup.systemName === defaultBranch?.permission
          ),
        });

        setBranchAccessTokens(canvasBranch?.branchAccessTokens || []);

        if (!id) {
          router.push(
            {
              pathname: BipRouteUtils.getCanvasRoute(
                sanitizeHandle(handle),
                canvasRepo?.name!,
                branchId
              ),
            },
            undefined,
            { shallow: true }
          );
        }
        setHasExistingRequest(false);
        setIsPrivate(false);
        setShowNotFoundPage(false);
        setShowDiffView(false);

        segmentEvents.canvasViewed(
          currentStudio?.handle!,
          canvasRepo.key,
          canvasRepo.name,
          canvasBranch.contributorsList?.length!
        );
      }

      return branchData;
    } catch (error) {
      // handle repo error here
      const err = error as AxiosError;
      console.log(err);
      setIsSideNavOpen(true);
      setPagesLoaded(true);
      if (err.status) {
        const apiStatus = parseInt(err.status);
        if (apiStatus === HttpStatusCode.FORBIDDEN) {
          setHasExistingRequest(error.data.access_requested);
          setIsPrivate(true);
          setRepo(null);
          setBranch(null);
          setBranches([]);
        } else if (
          apiStatus === HttpStatusCode.BAD_REQUEST ||
          apiStatus === HttpStatusCode.NOT_FOUND
        ) {
          console.log("Invalid repokey");
          setShowNotFoundPage(true);
        }
      }
      throw error;
      // return {};
    }
  };

  // const { data, error } = useSWR<ICanvasBranchResponse>(
  //   branchId && router.isReady && (isLoggedIn ? lSchema : true)
  //     ? [branchId, "canvas-branch"]
  //     : null,
  //   fetchCanvasBranch,
  //   {
  //     revalidateOnFocus: false,
  //   }
  // );
  // const fetchingBranch = !data && !error;

  useEffect(() => {
    if (data) {
      if (error) {
        if (error.status === HttpStatusCode.FORBIDDEN) {
          setIsPrivate(true);
        } else if (error.status === HttpStatusCode.BAD_REQUEST) {
          if (handle) {
            router.push({
              pathname: BipRouteUtils.getHandleRoute(sanitizeHandle(handle)),
            });
          }
        }
      }
    }
  }, [data]);

  return {
    loading: fetchingBranch,
    isPrivate,
    data,
    hasExistingRequest,
    setHasExistingRequest,
    showNotFoundPage,
  };
};

export const CanvasBranchWrapper = ({ children }: ChildrenProps) => {
  const router = useRouter();

  const slug = router.query.slug as string;

  const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);

  const {
    repo,
    setBranch,
    setBlocks,
    showNotFoundPage,
    isPrivate,
    hasExistingRequest,
    setHasExistingRequest,
    isLoading,
  } = useCanvas();

  const { setPagesLoaded } = usePages();

  const { handle } = router.query;
  useEffect(() => {
    if (!branchId && slug) {
      router.push(
        BipRouteUtils.getHandleRoute(sanitizeHandle(handle as string))
      );
    }
    return () => {
      setBranch(null);
      setBlocks(null);
    };
  }, [setBranch, setBlocks]);

  // console.log("BranchID", branchId);
  // console.log("Loading", isLoading, isPrivate, hasExistingRequest);

  useEffect(() => {
    if (isPrivate || showNotFoundPage) {
      setPagesLoaded(false);
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <BipLoader />
      ) : showNotFoundPage ? (
        <CanvasNotFound />
      ) : isPrivate ? (
        <RequestAccess
          branchId={branchId || repo?.defaultBranch.id!}
          hasExistingRequest={hasExistingRequest}
          setHasExistingRequest={setHasExistingRequest}
        />
      ) : repo ? (
        <>{children}</>
      ) : null}
    </>
  );
};
