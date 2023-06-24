import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { useToasts } from "react-toast-notifications";

import { ChildrenProps } from "../commons/types";
import { useStudio } from "../context/studioContext";
import { getHandleDetails, sanitizeHandle } from "../utils/Common";
import { HandleEnum } from "../core/enums";
import BipLoader from "../components/BipLoader";
import BipRouteUtils from "../core/routeUtils";
import { PagesContext, usePages } from "../context/pagesContext";
import { useCanvas } from "../context/canvasContext";
import { usePermissions } from "../context/permissionContext";
import { PermissionGroup } from "../modules/Permissions/types";
import { useLayout } from "../context/layoutContext";
import { StudioType } from "../modules/Studio/types";
import segmentEvents from "../insights/segment";
import { useUser } from "../context/userContext";

export const useHandle = () => {
  const router = useRouter();
  const handle = sanitizeHandle(router.query.handle as string);
  const { addToast } = useToasts();
  const { schema } = usePermissions();
  const { saveCurrentStudio } = useStudio();
  const { pagesLoaded, setPagesLoaded } = usePages();
  const { setIsSideNavOpen } = useLayout();
  const { setBranch, setRepo } = useCanvas();
  const { user: currentUser } = useUser();

  const fetchHandle = async (handle: string) => {
    const currentStudio: StudioType = JSON.parse(
      sessionStorage.getItem("currentStudio") || "{}"
    );
    if (currentStudio && currentStudio?.handle === handle) {
      return currentStudio;
    } else {
      return await getHandleDetails(handle);
    }
  };

  const { data, error } = useSWR(
    router.isReady ? [handle, "handle"] : null,
    fetchHandle
  );
  const isLoading = !data && !error;
  useEffect(() => {
    if (!router.isReady) return;
    const currentStudio: StudioType = JSON.parse(
      sessionStorage.getItem("currentStudio") || "{}"
    );
    if (data) {
      if (!error) {
        if (data.context === HandleEnum.Studio) {
          if (
            router?.pathname?.split("/").length === 2 &&
            !router?.query?.slug
          ) {
            setIsSideNavOpen(true);
            if (data.defaultCanvasBranchId) {
              router.push(
                BipRouteUtils.getCanvasRoute(
                  data.handle,
                  data.defaultCanvasRepoName,
                  data.defaultCanvasBranchId
                )
              );
            } else {
              router.push(BipRouteUtils.getStudioAboutRoute(data.handle));
            }
          }
          saveCurrentStudio(data);
          if (currentStudio && currentStudio?.handle !== handle) {
            setPagesLoaded(false);
          }
          // setBranch(null);
          // setRepo(null);
        }
      } else {
        addToast(error?.message, {
          appearance: "warning",
          autoDismiss: true,
        });
        router.push({
          pathname: BipRouteUtils.getHomeRoute(),
        });
      }
    }
  }, [data]);

  return {
    loading: isLoading,
    data,
  };
};

export const HandleWrapper = ({ children }: ChildrenProps) => {
  const { loading, data } = useHandle();

  return <>{loading ? <BipLoader /> : data ? <>{children}</> : null}</>;
};
