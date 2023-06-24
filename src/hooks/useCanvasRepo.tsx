import { AxiosError } from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { HttpStatusCode } from "../commons/enums";

import { ChildrenProps } from "../commons/types";
import BipLoader from "../components/BipLoader";
import CanvasNotFound from "../components/CanvasNotFound";
import RequestAccess from "../components/RequestAccess";
import { useCanvas } from "../context/canvasContext";
import { useLayout } from "../context/layoutContext";
import { usePages } from "../context/pagesContext";
import { useStudio } from "../context/studioContext";
import BipRouteUtils from "../core/routeUtils";
import segmentEvents from "../insights/segment";
import { ICanvasBranch, ICanvasRepo } from "../modules/Canvas/interfaces";
import { CanvasRepoService, CanvasService } from "../modules/Canvas/services";
import { sanitizeHandle } from "../utils/Common";
import useDeviceDimensions from "./useDeviceDimensions";

export const useCanvasRepo = (repoKey: string) => {
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [hasExistingRequest, setHasExistingRequest] = useState<boolean>(false);
  const [showNotFoundPage, setShowNotFoundPage] = useState(false);
  const { pages, setShouldFetchCollections, setPagesLoaded } = usePages();

  const { setIsSideNavOpen } = useLayout();
  const handle = router.query.handle as string;

  const slug = router.query.slug as string;
  const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);

  const isPublic = Boolean(router.query.isPublic as string);
  const inviteCode = router.query.inviteCode as string;
  const { currentStudio } = useStudio();

  const { isTabletOrMobile } = useDeviceDimensions();
  const { repo, setRepo, setBranches, setShowDiffView, branch } = useCanvas();

  const fetchCanvasRepo = async (key: string) => {
    try {
      isTabletOrMobile && setIsSideNavOpen(false);
      const { data: repoData } = await CanvasRepoService.getRepo(
        key,
        inviteCode
      );

      const { data: branchesData } = await CanvasService.getBranches({
        canvasId: repoData.data.id,
        collectionId: repoData.data.collectionID,
        parentCanvasId: repoData?.data?.parentCanvasRepositoryID ?? 0,
      });

      segmentEvents.canvasViewed(
        currentStudio?.handle!,
        repo?.key!,
        repo?.name!,
        branch?.contributorsList?.length!
      );
      if (branchesData.data) {
        const repoBranches = branchesData.data.map(
          (branch: ICanvasBranch, index: number) => {
            return {
              ...branch,
              parent: repoData.data.id,
              position: (repoData.data.subCanvasCount ?? 0) + index + 1,
              type: "BRANCH",
            };
          }
        );

        setBranches(repoBranches);
      }
      if (!pages.find((page) => page.id === repoData.data.id)) {
        setPagesLoaded(false);
      }
      setRepo({ ...repoData.data, branches: branchesData.data });
      setHasExistingRequest(false);
      setIsPrivate(false);
      setShowNotFoundPage(false);
      return { ...repoData.data, branches: branchesData.data };
    } catch (error) {
      const err = error as AxiosError;
      setIsSideNavOpen(true);
      setPagesLoaded(false);
      if (err.status) {
        const apiStatus = parseInt(err.status);
        if (apiStatus === HttpStatusCode.FORBIDDEN) {
          setHasExistingRequest(error.data.access_requested);
          setIsPrivate(true);
        } else if (
          apiStatus === HttpStatusCode.BAD_REQUEST ||
          apiStatus === HttpStatusCode.NOT_FOUND
        ) {
          console.log("Invalid repokey");
          setShowNotFoundPage(true);
        }
      }
      throw error;
    }
  };

  const { data, error } = useSWR(
    repoKey ? [repoKey, "canvas-repo"] : null,
    fetchCanvasRepo,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
  const fetchingRepo = !data && !error;

  useEffect(() => {
    if (data) {
      const repoData = data as ICanvasRepo;
      if (error) {
        const err = error as AxiosError;
        if (err.status) {
          const apiStatus = parseInt(err.status);
          if (apiStatus === HttpStatusCode.BAD_REQUEST) {
            if (handle) {
              router.push({
                pathname: BipRouteUtils.getHandleRoute(handle),
              });
            }
          }
        }
      } else {
        if (!branchId) {
          console.log(
            "BB",
            BipRouteUtils.getCanvasRoute(
              sanitizeHandle(handle),
              repoData?.name,
              repoData?.defaultBranch?.id
            )
          );
          if (isPublic) {
            router.push({
              pathname: BipRouteUtils.getPublicCanvasRoute(
                sanitizeHandle(handle),
                repoData?.name,
                repoData?.defaultBranch?.id!
              ),
            });
          } else {
            router.push({
              pathname: BipRouteUtils.getCanvasRoute(
                sanitizeHandle(handle),
                repoData?.name,
                repoData?.defaultBranch?.id
              ),
            });
          }
        }
      }
    }
  }, [data]);

  if (data && !repo) {
    setRepo(data);
  }

  return {
    loading: fetchingRepo,
    data,
    isPrivate,
    hasExistingRequest,
    setHasExistingRequest,
    showNotFoundPage,
  };
};

export const CanvasRepoWrapper = ({ children }: ChildrenProps) => {
  const router = useRouter();
  const { query } = useRouter();

  const { currentStudio } = useStudio();

  const repoKey = query.repoKey as string;
  const canvasTitle = query.title as string;
  const {
    loading,
    data,
    isPrivate,
    hasExistingRequest,
    setHasExistingRequest,
    showNotFoundPage,
  } = useCanvasRepo(repoKey);
  const { repo, setRepo } = useCanvas();
  const slug = router.query.slug as string;
  const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);
  const isRough = Boolean(router.query.isRough as string);
  const roughBranchId = parseInt(router.query.roughBranchId as string);
  const handle = router.query.handle as string;

  useEffect(() => {
    if (data) {
      router.push(
        BipRouteUtils.getCanvasRoute(
          currentStudio?.handle!,
          canvasTitle,
          repo?.defaultBranch.id!
        )
      );
    }
  }, [data]);

  useEffect(() => {
    if (!router.isReady) return;
    if (isRough && roughBranchId) {
      router.push(
        BipRouteUtils.getCanvasRoute(
          handle!,
          canvasTitle,
          roughBranchId,
          false,
          true
        )
      );
    }
  }, [router.isReady]);

  return (
    <>
      {loading ? (
        <BipLoader />
      ) : showNotFoundPage ? (
        <CanvasNotFound />
      ) : isPrivate ? (
        <RequestAccess
          branchId={branchId || repo?.defaultBranch.id!}
          hasExistingRequest={hasExistingRequest}
          setHasExistingRequest={setHasExistingRequest}
        />
      ) : data ? (
        <>{children}</>
      ) : null}
    </>
  );
};
