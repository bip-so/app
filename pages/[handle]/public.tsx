import { Box } from "@primer/react";
import { Router, useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import { BipPage } from "../../src/commons/types";
import BipLoader from "../../src/components/BipLoader";
import { usePages } from "../../src/context/pagesContext";
import BipRouteUtils from "../../src/core/routeUtils";
import { HandleWrapper } from "../../src/hooks/useHandle";
import PublicLayout from "../../src/layouts/StudioLayout/PublicLayout";
import StudioLayout from "../../src/layouts/StudioLayout/StudioLayout";
import CollectionService from "../../src/modules/Collections/services";

const StudioPublicPage: BipPage = () => {
  const router = useRouter();

  const handle = router.query.handle as string;

  const { pages } = usePages();

  const canvasLink = (node: any) =>
    BipRouteUtils.getPublicCanvasRoute(handle, node.name, node.defaultBranchID);

  useEffect(() => {
    if (pages?.length) {
      const collections = pages.filter((page) => page.type === "COLLECTION");
      if (collections.length) {
        const collection = collections[0];
        const canvases: any[] = pages.filter(
          (page) =>
            page.type === "CANVAS" &&
            page.parent === collection.id &&
            !page.isLanguageCanvas
        );
        if (canvases.length) {
          router.push(canvasLink(canvases[0]));
        } else {
          CollectionService.getCanvasRepo(
            {
              parentCollectionID: collection.id,
              parentCanvasRepositoryID: 0,
            },
            true
          )
            .then((resp) => {
              const canvases = resp.data.data.filter(
                (canvas: any) => !canvas.isLanguageCanvas
              );
              if (canvases.length) {
                router.push(canvasLink(canvases[0]));
              } else {
                router.push(BipRouteUtils.getStudioAboutRoute(handle));
              }
            })
            .catch((err) => {
              router.push(BipRouteUtils.getStudioAboutRoute(handle));
            });
        }
      }
    }
  }, [pages]);

  return (
    <Box display={"flex"} justifyContent={"center"} mt={"36px"}>
      <BipLoader />
    </Box>
  );
};

StudioPublicPage.getLayout = function getLayout(
  page: ReactElement,
  hideSidebar
) {
  return (
    <HandleWrapper>
      <PublicLayout>{page}</PublicLayout>
    </HandleWrapper>
  );
};

StudioPublicPage.auth = false;
export default StudioPublicPage;
