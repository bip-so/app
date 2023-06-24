import { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";

import { useToasts } from "react-toast-notifications";
import useSWR from "swr";

import { Box, Button, ButtonGroup, useTheme } from "@primer/react";

import { useCanvas } from "../../../src/context/canvasContext";
import { CanvasBranchWrapper } from "../../../src/hooks/useCanvasBranch";
import useDeviceDimensions from "../../../src/hooks/useDeviceDimensions";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../src/hooks/useHasPermission";
import { DefaultSeo, NextSeo } from "next-seo";

import { useStudio } from "../../../src/context/studioContext";
import { useUser } from "../../../src/context/userContext";

import BipLoader from "../../../src/components/BipLoader";
import CanvasHeader from "../../../src/modules/Canvas/components/CanvasHeader";
import CanvasLayout from "../../../src/modules/Canvas/components/CanvasLayout";
import DiffEditor from "../../../src/modules/BipEditor/components/DiffEditor";
import { HandleWrapper } from "../../../src/hooks/useHandle";
import StudioLayout from "../../../src/layouts/StudioLayout/StudioLayout";

import BlocksService from "../../../src/modules/BipEditor/services";
import {
  CanvasBranchService,
  CanvasRepoService,
  CanvasService,
} from "../../../src/modules/Canvas/services";

import { BipPage } from "../../../src/commons/types";
import {
  CanvasPermissionEnum,
  CanvasPermissionGroupEnum,
} from "../../../src/modules/Permissions/enums";
import { getPageMeta, sanitizeHandle } from "../../../src/utils/Common";
import { ImageIcon, TrashIcon } from "@primer/styled-octicons";
import { ReelType, ThreadType } from "../../../src/modules/BipEditor/types";
import BipRouteUtils from "../../../src/core/routeUtils";
import { BranchAccessEnum } from "../../../src/modules/Canvas/enums";
import { usePages } from "../../../src/context/pagesContext";
import {
  ICanvasBranch,
  ICanvasBranchResponse,
} from "../../../src/modules/Canvas/interfaces";
import GitOpsService from "../../../src/modules/Canvas/services/gitOpsService";
import SlateEditor from "../../../src/modules/BipEditor/components/SlateEditor";
import { usePreviewEditor } from "../../../src/context/previewEditorContext";
import PreviewEditor from "../../../src/modules/BipEditor/components/PreviewEditor";
import { AxiosError } from "axios";
import { HttpStatusCode } from "../../../src/commons/enums";
import { getCookie } from "cookies-next";
import ApiClient from "../../../src/commons/ApiClient";
import { useLayout } from "../../../src/context/layoutContext";
import { usePermissions } from "../../../src/context/permissionContext";
import { PermissionGroup } from "../../../src/modules/Permissions/types";
import segmentEvents from "../../../src/insights/segment";

const CanvasPage: BipPage = (props: any) => {
  const branchData = props.branchData as ICanvasBranchResponse;
  const canvasRepo = branchData?.canvasRepo;
  const canvasBranch = branchData?.canvasBranch;

  const {
    // branchData,
    isPrivate = false,
    hasPendingRequest = false,
    isNotFound = false,
    blocks: blocksData,
    description = "This canvas is private or doesn't exist!",
    image,
    titleSeo,
  } = props;

  // Meta SEO
  const [ogDescription, setOgDescription] = useState<string>(description);
  const [ogImage, setOgImage] = useState<string>(image);

  const [refetchingBlocks, setRefetchingBlocks] = useState<boolean>(false);

  const {
    branch,
    setMembers,
    repo,
    setRepo,
    blocks,
    setBlocks,
    setResolvedThreads,
    setThreads,
    setIsSaving,
    setLastSaved,
    showDiffView,
    setShowDiffView,
    setReels,
    setBranch,
    setBranches,
    setBranchAccessTokens,
    setHasExistingRequest,
    setIsPrivate,
    setShowNotFoundPage,
    setIsLoading,
  } = useCanvas();

  const { schema: lSchema } = usePermissions();

  const fetchBranches = async () => {
    const { data: branchesData } = await CanvasService.getBranches({
      canvasId: canvasRepo.id,
      collectionId: canvasRepo.collectionID,
      parentCanvasId: canvasRepo.parentCanvasRepositoryID ?? 0,
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
  };

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

      if (
        !pages.find((page) => page.id === canvasRepo.id) &&
        (!router?.query?.isNew as boolean)
      ) {
        setPagesLoaded(false);
      }
      fetchBranches();

      setBranch({
        ...canvasBranch,
        permissionGroup: schema?.canvas?.permissionGroups?.find(
          (permissionGroup: PermissionGroup) =>
            permissionGroup.systemName === defaultBranch?.permission
        ),
      });

      setBranchAccessTokens(canvasBranch?.branchAccessTokens || []);

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
    };
    if (branchData) {
      initCanvas();
      CanvasBranchService.getLastUpdated(branchData?.canvasBranch?.id).then(
        (resp) => {
          if (resp.data.lastUpdatedAt !== canvasBranch.updatedAt) {
            setRefetchingBlocks(true);
            router.replace(router.asPath);
            setRefetchingBlocks(false);
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

  useEffect(() => {
    setHasExistingRequest(hasPendingRequest);
  }, [hasPendingRequest]);

  useEffect(() => {
    if (isTabletOrMobile) {
      setIsSideNavOpen(false);
    }
  }, []);

  useEffect(() => {
    setShowNotFoundPage(isNotFound);
  }, [isNotFound]);

  useEffect(() => {
    setIsPrivate(isPrivate);
  }, [isPrivate]);

  const { setIsSideNavOpen } = useLayout();

  const router = useRouter();
  const { addToast } = useToasts();
  const handle = router.query.handle as string;
  const slug = router.query.slug as string;

  // Rough branch
  const isRough = Boolean(router.query.isRough as string);
  const roughBranchId = parseInt(router.query.roughBranchId as string);

  const slugTokens = slug.split("-");
  const canvasTitle = slugTokens.slice(0, -1).join("-");

  const { currentStudio } = useStudio();
  const { previewEditorData, setPreviewEditorData } = usePreviewEditor();
  const { colorMode } = useTheme();

  const {
    pages,
    pagesLoaded,
    updatePages,
    setPagesLoaded,
    setShouldFetchCollections,
  } = usePages();
  const { isLoggedIn } = useUser();

  const { isTabletOrMobile } = useDeviceDimensions();

  // Permissions
  const hasEditPerm = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_EDIT,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );
  const canEditBranch = isLoggedIn && hasEditPerm;
  const canEditBranchName = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_EDIT_NAME,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );

  // Canvas
  const [fetchingBlocks, setFetchingBlocks] = useState(false);
  const [initialBlocks, setInitialBlocks] = useState([]);
  const editorContainerRef = useRef(null);
  const [blockReels, setBlockReels] = useState((): ReelType[] => []);

  // Review Changes
  const [conflicts, setConflicts] = useState([]);
  const [diffBlocks, setDiffBlocks] = useState(null);

  const inputFile = useRef(null);

  // TMP - nov 15
  // useEffect(() => {
  //   setInitialBlocks([]);
  // }, [branchId]);

  const openFiles = () => {
    if (inputFile) {
      //@ts-ignore
      inputFile.current.value = null;
      //@ts-ignore
      inputFile.current.click();
    }
  };

  const handleRemoveCover = async () => {
    try {
      await CanvasRepoService.editCanvas(repo!?.id, {
        coverUrl: "",
        icon: repo?.icon,
        name: repo?.name,
        canvasRepoId: repo?.id,
      });

      setRepo({
        ...repo!,
        coverUrl: "",
      });
    } catch (error) {
      console.log(error);
      addToast("Something went wrong while removing cover", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      try {
        const data = new FormData();
        data.append("file", files[0]);
        data.append("model", "canvasRepoCover");
        data.append("uuid", repo!?.uuid);
        data.append("repoID", repo!?.id.toString());
        const { data: imageResponse } = await CanvasRepoService.uploadCover(
          data
        );
        const coverUrl = imageResponse.data;
        await CanvasRepoService.editCanvas(repo!?.id, {
          coverUrl,
          icon: repo?.icon,
          name: repo?.name,
          canvasRepoId: repo!?.id,
        });
        setRepo({
          ...repo!,
          coverUrl,
        });
      } catch (error) {
        console.log(error);
        addToast("Something went wrong while uploading cover", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }
  };

  const getMembers = async (branchId: number) => {
    try {
      const resp = await CanvasBranchService.getMembers(branchId);
      const mems = resp?.data?.data || [];
      let members: any = [];
      if (mems?.length) {
        const moderatePerms = mems.filter(
          (mem: any) =>
            mem.permissionGroup === CanvasPermissionGroupEnum.MODERATE
        );
        const editPerms = mems.filter(
          (mem: any) => mem.permissionGroup === CanvasPermissionGroupEnum.EDIT
        );
        const commentPerms = mems.filter(
          (mem: any) =>
            mem.permissionGroup === CanvasPermissionGroupEnum.COMMENT
        );
        const viewPerms = mems.filter(
          (mem: any) => mem.permissionGroup === CanvasPermissionGroupEnum.VIEW
        );
        const otherPerms = mems.filter(
          (mem: any) =>
            mem.permissionGroup !== CanvasPermissionGroupEnum.VIEW &&
            mem.permissionGroup !== CanvasPermissionGroupEnum.COMMENT &&
            mem.permissionGroup !== CanvasPermissionGroupEnum.EDIT &&
            mem.permissionGroup !== CanvasPermissionGroupEnum.MODERATE
        );
        members = [
          ...moderatePerms,
          ...editPerms,
          ...commentPerms,
          ...viewPerms,
          ...otherPerms,
        ];
        setMembers(members);
      }
      return members;
    } catch (error) {
      throw error;
    }
  };

  const { data } = useSWR(branch ? [branch.id, "members"] : null, getMembers);

  const getBlocks = async (branchId: number) => {
    try {
      const resp = await BlocksService.getBlocks(branchId);
      return resp.data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchBlocks = async () => {
    setIsSaving(false);
    setLastSaved(null);
    setFetchingBlocks(true);
    try {
      const blocksData = await getBlocks(branch?.id!);
      setInitialBlocks(blocksData);
      setBlocks(blocksData);
      const { description, imageUrl } = getPageMeta(
        blocksData,
        repo?.coverUrl!
      );
      setOgDescription(description);
      setOgImage(imageUrl);
    } catch (error) {
      console.log(error);
    }
    setFetchingBlocks(false);
  };

  const fetchThreads = async () => {
    try {
      const { data: threadsData } = await BlocksService.getBranchBlockThreads(
        branch?.id!,
        true
      );
      setThreads(
        threadsData.data.filter(
          (thread: ThreadType) => !thread.isArchived && !thread.isResolved
        )
      );
      setResolvedThreads(
        threadsData.data.filter(
          (thread: ThreadType) => !thread.isArchived && thread.isResolved
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const { data: threadsData, error: isThreadsError } = useSWR(
    branch ? [branch.id, "threads"] : null,
    fetchThreads
  );

  const fetchReels = async () => {
    try {
      const { data: reelsData } = await BlocksService.getBranchReels(
        branch?.id!
      );
      setReels(Array.isArray(reelsData.data) ? reelsData.data : []);
    } catch (error) {
      console.log(error);
    }
  };

  const { data: reelsData, error: isReelsError } = useSWR(
    branch ? [branch.id, "reels"] : null,
    fetchReels
  );

  const addReel = (reel: ReelType): void => {
    setBlockReels([reel, ...blockReels]);
  };

  useEffect(() => {
    if (!router.isReady || !currentStudio) return;
    if (isRough && roughBranchId) {
      router.push(
        BipRouteUtils.getCanvasRoute(
          currentStudio?.handle!,
          canvasTitle,
          roughBranchId,
          false,
          true
        )
      );
    }
  }, [router.isReady, currentStudio]);

  const isReadOnly = useMemo(() => {
    if (
      isLoggedIn &&
      (canEditBranch || branch?.publicAccess === BranchAccessEnum.EDIT)
    ) {
      return false;
    }
    return true;
  }, [canEditBranch, branch, isLoggedIn]);

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
    const getBlocksBeforeMerge = async () => {
      try {
        const resp = await GitOpsService.getToAndFromBlocksBeforeMerge(
          branch?.id!
        );
        setDiffBlocks(resp.data.data);
      } catch (error) {
        addToast(
          "Something went wrong while reviewing changes, please try again!",
          {
            appearance: "error",
            autoDismiss: true,
          }
        );
        setShowDiffView(false);
      }
    };
    if (showDiffView) {
      fetchBlocks();
      getBlocksBeforeMerge();
    }
  }, [showDiffView, branch]);

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
          {/* 
        <Head>
          <title>{`${repo?.name}-${currentStudio?.displayName}`}</title>
          <meta property="og:title" content={repo?.name} />
          <meta property="og:description" content={ogDescription} />
          {Boolean(ogImage) ? (
            <meta property="og:image" content={ogImage} />
          ) : null}
        </Head> */}
          <CanvasLayout
            header={
              <CanvasHeader
                title={repo?.name?.toString() || ""}
                showLeftArrow={false}
                readOnly={false}
                editorContainerRef={editorContainerRef}
              />
            }
            content={
              <Box>
                {repo?.coverUrl && (
                  <Box
                    sx={{
                      // width: "100vw",
                      position: "relative",
                    }}
                    className="group"
                  >
                    <input
                      ref={inputFile}
                      type="file"
                      accept={"image/*"}
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                      id="studio-image-file"
                    />
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
                    {canEditBranchName && (
                      <ButtonGroup
                        sx={{
                          position: "absolute",
                          right: isTabletOrMobile ? "20px" : "150px",
                          bottom: "20px",
                          display: "none",
                        }}
                        className="group-hover:inline-flex"
                      >
                        <Button
                          sx={{
                            color: "text.muted",
                          }}
                          leadingIcon={ImageIcon}
                          onClick={openFiles}
                          size="small"
                        >
                          Change Cover
                        </Button>

                        <Button
                          sx={{
                            color: "text.muted",
                          }}
                          leadingIcon={TrashIcon}
                          onClick={handleRemoveCover}
                          size="small"
                        >
                          Remove Cover
                        </Button>
                      </ButtonGroup>
                    )}
                  </Box>
                )}
                <Box
                  className={`flex justify-center w-full  ${
                    repo?.icon
                      ? repo?.coverUrl
                        ? "mt-3"
                        : "mt-20"
                      : repo?.coverUrl
                      ? "mt-3"
                      : "mt-20"
                  } `}
                  ref={editorContainerRef}
                  onFocus={() => {
                    previewEditorData && setPreviewEditorData(null);
                  }}
                >
                  {fetchingBlocks ? (
                    <BipLoader />
                  ) : (
                    <Box className="flex-1">
                      {showDiffView ? (
                        <DiffEditor
                          data={{
                            readOnly: true,
                            isMergeRequest: true,
                            isDiff: true,
                          }}
                          conflicts={conflicts}
                          setConflicts={setConflicts}
                          blocks={diffBlocks}
                          withCanvasTitle={true}
                        />
                      ) : (
                        <>
                          {blocksData?.length > 0 && (
                            <SlateEditor
                              isReadOnly={isReadOnly || refetchingBlocks}
                              addReel={addReel}
                              initialBlocks={
                                initialBlocks.length
                                  ? initialBlocks
                                  : blocksData
                              }
                              parentRef={editorContainerRef}
                            />
                          )}
                        </>
                      )}
                    </Box>
                  )}
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

CanvasPage.getLayout = function getLayout(page: ReactElement) {
  return <StudioLayout whiteBg>{page}</StudioLayout>;
};

const fetchCanvasBranch = async (
  branchId: number,
  inviteCode: string | undefined
) => {
  const { data: branchData } = await CanvasBranchService.getBranch(
    branchId,
    inviteCode
  );

  return {
    branch: branchData,
  };
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
    propsToSend.hasPendingRequest = false;
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
        propsToSend.hasPendingRequest = err?.data?.access_requested
          ? true
          : false;
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

CanvasPage.auth = false;
export default CanvasPage;
