import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { ReactElement, useEffect, useRef, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { BipPage } from "../../../src/commons/types";
import { useCanvas } from "../../../src/context/canvasContext";
import { usePages } from "../../../src/context/pagesContext";
import { CanvasBranchWrapper } from "../../../src/hooks/useCanvasBranch";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../src/hooks/useHasPermission";
import BlocksService from "../../../src/modules/BipEditor/services";
import CanvasHeader from "../../../src/modules/Canvas/components/CanvasHeader";
import {
  ICanvasBranch,
  ICanvasBranchResponse,
  ICanvasRepo,
} from "../../../src/modules/Canvas/interfaces";
import {
  CanvasBranchService,
  CanvasRepoService,
} from "../../../src/modules/Canvas/services";
import { CanvasPermissionEnum } from "../../../src/modules/Permissions/enums";
import { HandleWrapper } from "../../../src/hooks/useHandle";
import CanvasLayout from "../../../src/modules/Canvas/components/CanvasLayout";
import { Box, Text, useTheme } from "@primer/react";
import ViewOnlyEditor from "../../../src/modules/BipEditor/components/ViewOnlyEditor";
import PublicLayout from "../../../src/layouts/StudioLayout/PublicLayout";
import { getPageMeta } from "../../../src/utils/Common";
import { useStudio } from "../../../src/context/studioContext";
import BipRouteUtils from "../../../src/core/routeUtils";
import PreviewEditor from "../../../src/modules/BipEditor/components/PreviewEditor";
import { usePreviewEditor } from "../../../src/context/previewEditorContext";
import useDeviceDimensions from "../../../src/hooks/useDeviceDimensions";
import { getCookie } from "cookies-next";
import ApiClient from "../../../src/commons/ApiClient";
import { AxiosError } from "axios";
import { HttpStatusCode } from "../../../src/commons/enums";
import { usePermissions } from "../../../src/context/permissionContext";
import segmentEvents from "../../../src/insights/segment";
import { PermissionGroup } from "../../../src/modules/Permissions/types";
import PrevNextButtons from "../../../src/components/PrevNextButtons";
import { NextSeo } from "next-seo";
import Head from "next/head";

const PublicCanvasBranchPage: BipPage = (props: any) => {
  const branchData = props.branchData as ICanvasBranchResponse;
  const canvasRepo = branchData?.canvasRepo;
  const canvasBranch = branchData?.canvasBranch;

  const {
    isPrivate = false,
    hasPendingRequest = false,
    isNotFound = false,
    blocks: blocksData,
    description = "This canvas is private or doesn't exist!",
    image,
    titleSeo,
  } = props;

  const [initialBlocks, setInitialBlocks] = useState([]);
  const editorContainerRef = useRef(null);

  const inputFile = useRef(null);
  const {
    branch,
    repo,
    setIsSaving,
    setLastSaved,
    setBlocks,
    setRepo,
    setBranch,
    setIsLoading,
  } = useCanvas();
  const { pages, updatePages, pagesLoaded, displayLanguage } = usePages();
  const canEditBranchName = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_EDIT_NAME,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );
  const { schema: lSchema } = usePermissions();

  const [nextRepo, setNextRepo] = useState((): ICanvasRepo | null => null);
  const [prevRepo, setPrevRepo] = useState((): ICanvasRepo | null => null);
  const [loadingPrevNext, setLoadingPrevNext] = useState(false);
  const { currentStudio } = useStudio();
  const { previewEditorData, setPreviewEditorData } = usePreviewEditor();
  const { isTabletOrMobile } = useDeviceDimensions();

  const router = useRouter();
  const handle = router.query.handle as string;

  // Meta
  const [ogDescription, setOgDescription] = useState<string>(description);
  const [ogImage, setOgImage] = useState<string>(image);

  const { colorMode } = useTheme();

  useEffect(() => {
    const initCanvas = async () => {
      const defaultBranch = canvasRepo.defaultBranch;
      let schema = lSchema;
      const localSchema = localStorage.getItem("permissionsSchema");
      if (localSchema) {
        const parsedSchema = JSON.parse(localSchema);
        schema = lSchema || parsedSchema;
      }
      setRepo(canvasRepo);
      setBranch({
        ...canvasBranch,
        permissionGroup: schema?.canvas?.permissionGroups?.find(
          (permissionGroup: PermissionGroup) =>
            permissionGroup.systemName === defaultBranch?.permission
        ),
      });

      setBranch({
        ...canvasBranch,
        permissionGroup: schema?.canvas?.permissionGroups?.find(
          (permissionGroup: PermissionGroup) =>
            permissionGroup.systemName === defaultBranch?.permission
        ),
      });

      segmentEvents.canvasViewed(
        currentStudio?.handle!,
        canvasRepo.key,
        canvasRepo.name,
        canvasBranch.contributorsList?.length!
      );
    };
    if (branchData) {
      initCanvas();
      CanvasBranchService.getLastUpdated(branchData?.canvasBranch?.id).then(
        (resp) => {
          if (resp.data.lastUpdatedAt !== canvasBranch.updatedAt) {
            router.replace(router.asPath);
          }
        }
      );
    } else {
      setBranch(null);
      setRepo(null);
    }
  }, [branchData]);

  useEffect(() => {
    if (!isPrivate && !isNotFound && !hasPendingRequest) {
      setInitialBlocks(blocksData);
      setBlocks(blocksData);
    }
    setIsLoading(false);
  }, [blocksData, isPrivate, hasPendingRequest, isNotFound]);

  // Wait for pages to load and then append current branches
  useEffect(() => {
    if (repo?.branches && pagesLoaded) {
      const branchNodes = repo?.branches
        .filter((branch: ICanvasBranch) => !branch.isDefault)
        .map((branch: ICanvasBranch, index: number) => {
          return {
            ...branch,
            parent: repo?.id,
            position: repo?.subCanvasCount + index + 1,
          };
        });

      const tempPages = pages
        .map((page: any) => {
          if (page.type === "COLLECTION") {
            return {
              ...page,
              open: repo?.collectionID === page.id ? true : false,
            };
          }
          return page;
        })
        .filter(
          (page: any) =>
            (page.parent !== repo.id && page.type !== "BRANCH") ||
            page.type === "CANVAS"
        );
      updatePages([...tempPages, ...branchNodes]);
    }
  }, [pagesLoaded, repo]);

  useEffect(() => {
    if (currentStudio?.id && currentStudio.handle === handle && repo?.id) {
      setLoadingPrevNext(true);
      if (displayLanguage && displayLanguage !== "en") {
        CanvasRepoService.getLanguageNextPrevCanvases(
          repo.defaultLanguageCanvasRepoId,
          displayLanguage
        )
          .then((r) => {
            setNextRepo(r.data.next);
            setPrevRepo(r.data.prev);
            setLoadingPrevNext(false);
          })
          .catch((err) => {
            setNextRepo(null);
            setPrevRepo(null);
            setLoadingPrevNext(false);
          });
      } else {
        CanvasRepoService.getNextPrevCanvases(repo.id)
          .then((r) => {
            setNextRepo(r.data.next);
            setPrevRepo(r.data.prev);
            setLoadingPrevNext(false);
          })
          .catch((err) => {
            setNextRepo(null);
            setPrevRepo(null);
            setLoadingPrevNext(false);
          });
      }
    }
  }, [repo, currentStudio, displayLanguage]);

  const canvasLink = (node: ICanvasRepo) =>
    BipRouteUtils.getPublicCanvasRoute(handle, node.name, node.defaultBranchID);

  const getPrevNextButtons = () => {
    return loadingPrevNext ? (
      <></>
    ) : (
      <PrevNextButtons
        context="repo"
        prev={prevRepo as ICanvasRepo}
        next={nextRepo as ICanvasRepo}
      />
    );
  };

  const userCanViewPage = !isNotFound && !isPrivate;
  return (
    <>
      {userCanViewPage ? (
        branchData?.canvasBranch?.publicAccess === "private" ? (
          <Head>
            <>
              <title>{titleSeo}</title>
              <meta property="og:title" content={titleSeo} />
            </>
          </Head>
        ) : (
          <NextSeo
            title={titleSeo}
            description={ogDescription}
            openGraph={{
              type: "website",
              siteName: "bip.so",
              title: titleSeo,
              description: ogDescription,
              images: [
                {
                  url: (ogImage || currentStudio?.imageUrl) ?? "/favicon.ico",
                },
              ],
            }}
          />
        )
      ) : null}

      <HandleWrapper>
        <CanvasBranchWrapper>
          <CanvasLayout
            header={
              <CanvasHeader
                title={repo?.name?.toString() || ""}
                showLeftArrow={false}
                readOnly={true}
                editorContainerRef={editorContainerRef}
              />
            }
            content={
              <Box>
                {repo?.coverUrl && (
                  <Box
                    sx={{
                      width: "100%",
                      position: "relative",
                    }}
                    className="group"
                  >
                    <img
                      src={repo?.coverUrl}
                      alt="cover"
                      style={{
                        height: "30vh",
                        objectPosition: "center 50%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                )}
                <Box
                  className={`flex justify-center w-full ${
                    repo?.icon
                      ? repo?.coverUrl
                        ? "mt-3"
                        : "mt-20"
                      : repo?.coverUrl
                      ? "mt-3"
                      : "mt-20"
                  } `}
                  ref={editorContainerRef}
                >
                  <Box
                    className="flex-1"
                    onFocus={() => {
                      previewEditorData && setPreviewEditorData(null);
                    }}
                  >
                    {
                      <>
                        {initialBlocks?.length > 0 && (
                          <ViewOnlyEditor
                            blocks={initialBlocks}
                            parentRef={editorContainerRef}
                            shouldShowTOC={true}
                            withCanvasTitle={true}
                            renderActions={getPrevNextButtons}
                          />
                        )}
                      </>
                    }
                  </Box>
                </Box>
                {!isTabletOrMobile && (
                  <Box
                    sx={{
                      position: "fixed",
                      bottom: previewEditorData ? "0px" : "-600px",
                      right: "80px",
                      width: "480px",
                      background: "previewEditor.bg",
                      boxShadow:
                        colorMode === "day"
                          ? "0px 1px 3px rgba(0, 0, 0, 0.12), 0px 8px 24px rgba(149, 157, 165, 0.2), inset 0px 1px 2px rgba(27, 31, 35, 0.075)"
                          : "0 0 0 1px rgb(255 255 255 / 10%)",
                      zIndex: 100000,
                      transition: "all 0.5s",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                    }}
                  >
                    {previewEditorData && (
                      <PreviewEditor
                        repoId={previewEditorData.repoId}
                        repoName={previewEditorData.repoName}
                        branchId={previewEditorData.branchId}
                        url={previewEditorData.url}
                      />
                    )}
                  </Box>
                )}
              </Box>
            }
          />
        </CanvasBranchWrapper>
      </HandleWrapper>
    </>
  );
};

PublicCanvasBranchPage.getLayout = function getLayout(
  page: ReactElement,
  hideSidebar
) {
  return <PublicLayout>{page}</PublicLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale, params, req, res } = context;
  const propsToSend = {} as any;

  const accessToken = getCookie("access-token", {
    req,
    res,
  });

  if (accessToken) {
    ApiClient.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${accessToken}`;
  }

  try {
    const { data: branchRes } = await CanvasBranchService.getBranch(
      BipRouteUtils.getBranchIdFromCanvasSlug(params?.slug as string)!
    );

    if (branchRes?.canvasBranchErr) {
      throw { status: "403", data: branchRes.canvasBranchErr };
    }

    const blocksRes = await BlocksService.getBlocks(
      BipRouteUtils.getBranchIdFromCanvasSlug(params?.slug as string)!
    );
    propsToSend.branchData = branchRes;
    propsToSend.blocks = blocksRes.data.data;
    const { description, imageUrl } = getPageMeta(
      blocksRes?.data?.data,
      branchRes?.canvasRepo?.coverUrl!
    );

    propsToSend.description = description;
    propsToSend.image = imageUrl;
    const { handle, slug } = params;
    const titleSeo = `${slug
      .split("-")
      .slice(0, slug.split("-").length - 1)
      .slice(0, 2)
      .join(" ")} - ${handle}`;
    propsToSend.titleSeo = titleSeo;
  } catch (error) {
    const err = error as AxiosError;
    if (err?.status) {
      propsToSend.branchData = null;
      propsToSend.blocks = [];
      const apiStatus = parseInt(err.status);
      if (apiStatus === HttpStatusCode.FORBIDDEN) {
        propsToSend.hasPendingRequest = err?.data.access_requested;
        propsToSend.isPrivate = true;
      } else if (
        apiStatus === HttpStatusCode.BAD_REQUEST ||
        apiStatus === HttpStatusCode.NOT_FOUND
      ) {
        propsToSend.isNotFound = true;
      }
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale || "en")),
      ...propsToSend,
    },
  };
};

PublicCanvasBranchPage.auth = false;
export default PublicCanvasBranchPage;
