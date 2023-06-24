import React, {
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import { BipPage } from "../../../../src/commons/types";
import StudioLayout from "../../../../src/layouts/StudioLayout/StudioLayout";
import { useToasts } from "react-toast-notifications";
import CollectionService from "../../../../src/modules/Collections/services";
import {
  CanvasDataType,
  CollectionDataType,
} from "../../../../src/modules/Collections/types";
import { HandleWrapper } from "../../../../src/hooks/useHandle";
import CanvasLayout from "../../../../src/modules/Canvas/components/CanvasLayout";
import CollectionHeader from "../../../../src/modules/Collections/components/CollectionHeader";
import { PageType, usePages } from "../../../../src/context/pagesContext";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import BipLoader from "../../../../src/components/BipLoader";
import { Box } from "@primer/react";
import useRefDimensions from "../../../../src/hooks/useRefDimensions";
import {
  CanvasPermissionGroupEnum,
  CollectionPermissionGroupEnum,
} from "../../../../src/modules/Permissions/enums";
import { BranchAccessEnum } from "../../../../src/modules/Canvas/enums";
import Chip from "../../../../src/components/Chip";
import { FileIcon } from "@primer/styled-octicons";
import BipRouteUtils from "../../../../src/core/routeUtils";

const CollectionPermissionsPage: BipPage = () => {
  const router = useRouter();
  const { collection } = router.query;
  const handle = router.query.handle as string;
  const { pages, setPagesLoaded, updatePages, openIds, setOpenIds } =
    usePages();
  const containerRef = useRef(null);
  const { isXtraSmall, isSmall, isMedium, isLarge, isXtraLarge, dimensions } =
    useRefDimensions(containerRef);
  const [canvases, setCanvases] = useState((): CanvasDataType[] => []);
  const [loadingCanvases, setLoadingCanvases] = useState(false);
  const { addToast } = useToasts();

  const currentCollection = useMemo(() => {
    const colId = parseInt(collection as string);
    if (colId) {
      const col = pages.find(
        (page) => page.type === "COLLECTION" && page.id === colId
      );
      return col || null;
    }
    return null;
  }, [pages, collection]);

  useEffect(() => {
    const colId = parseInt(collection as string);
    if (pages.length) {
      const tempPages = pages.map((page: any) => {
        if (page.type === "COLLECTION") {
          return {
            ...page,
            open: colId === page.id ? true : false,
          };
        }
        return page;
      });
      // updatePages(tempPages);
    }
  }, [pages, collection]);

  const getCanvases = async () => {
    if (!currentCollection) return;
    setLoadingCanvases(true);
    try {
      const resp = await CollectionService.getCanvasRepo({
        parentCollectionID: currentCollection.id,
        parentCanvasRepositoryID: 0,
      });
      setCanvases(resp?.data?.data || []);

      const canvases = resp?.data?.data || [];
      if (canvases.length) {
        const pagesIds = pages.map((page) => page.id);
        const filteredCanvases = canvases.filter(
          (can: PageType) => !pagesIds.includes(can.id)
        );
        let tempPages = [...pages, ...filteredCanvases];
        const rootCanvasCount = tempPages.filter(
          (page) => page.collectionID && !page.parentCanvasRepositoryID
        ).length;
        tempPages = tempPages.map((el) =>
          el.id === currentCollection.id
            ? {
                ...el,
                computedRootCanvasCount: rootCanvasCount,
                areCanvasesFetched: true,
              }
            : el
        );
        updatePages(tempPages);
      }
      setOpenIds([...openIds, currentCollection.id]);
    } catch (err) {
      addToast("Something went wrong while fetching canvases.", {
        appearance: "error",
        autoDismiss: true,
      });
    }
    setLoadingCanvases(false);
  };

  const getCollectionAccessText = () => {
    if (currentCollection) {
      const { permission, publicAccess } =
        currentCollection as CollectionDataType;
      const isModerator =
        (currentCollection as CollectionDataType).permission ===
        CollectionPermissionGroupEnum.MODERATE;
      if (isModerator) {
        return "moderator";
      }
      const canEdit =
        permission === CollectionPermissionGroupEnum.EDIT ||
        publicAccess === BranchAccessEnum.EDIT;
      if (canEdit) {
        return "edit";
      }
      const canComment =
        permission === CollectionPermissionGroupEnum.COMMENT ||
        publicAccess === BranchAccessEnum.COMMENT;
      if (canComment) {
        return "comment";
      }
      const canView =
        permission === CollectionPermissionGroupEnum.VIEW ||
        publicAccess === BranchAccessEnum.VIEW;
      if (canView) {
        return "view";
      }
      return "no";
    }
    return "no";
  };

  useEffect(() => {
    if (currentCollection) {
      const subCanvases = pages.filter(
        (page) => page.parent === currentCollection.id
      );
      if (subCanvases?.length) {
        setCanvases(subCanvases as CanvasDataType[]);
      } else if (
        (currentCollection as CollectionDataType).computedRootCanvasCount > 0
      ) {
        getCanvases();
      } else {
        setCanvases([]);
      }
    } else {
      setCanvases([]);
    }
  }, [currentCollection, pages]);

  useEffect(() => {
    if (!currentCollection) {
      setPagesLoaded(false);
    }
  }, [currentCollection]);

  return (
    <HandleWrapper>
      <CanvasLayout
        header={
          <CollectionHeader
            key={currentCollection?.id}
            title={currentCollection?.name || "Collection"}
            currentCollection={currentCollection as CollectionDataType}
          />
        }
        content={
          currentCollection ? (
            <>
              <Box
                className={`flex justify-center w-full mt-24`}
                ref={containerRef}
              >
                <div
                  className="flex flex-1"
                  style={{
                    paddingLeft: isXtraSmall
                      ? "16px"
                      : isSmall
                      ? "32px"
                      : "96px",
                    paddingRight: isXtraSmall
                      ? "16px"
                      : isSmall
                      ? "32px"
                      : "96px",
                  }}
                >
                  <Box
                    className="relative flex-1 mx-auto mb-80"
                    sx={{
                      position: "relative",
                      left: isLarge || isXtraLarge ? "64px" : "0px",
                      maxWidth: isXtraLarge ? "800px" : "600px",
                    }}
                  >
                    <Box
                      id="pageTitle"
                      as={"h1"}
                      sx={{
                        width: "100%",
                        borderBottom: "1px solid",
                        borderColor: "canvasTitle.border",
                        fontSize: "40px",
                        color: "canvasTitle.title",
                        fontWeight: "700",
                        lineHeight: "50px",
                      }}
                      placeholder="Untitled"
                    >
                      {currentCollection.name}
                    </Box>
                    {/* {getCollectionAccessText() === "no" ? null : (
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Text color={"canvasTitle.hintMessage"} fontSize={12}>
                          You have{" "}
                          <Text fontWeight={600}>
                            {getCollectionAccessText()}
                          </Text>{" "}
                          access
                        </Text>
                      </Box>
                    )} */}
                    <Box className="flex flex-col mt-4">
                      {canvases
                        .filter((canvas) =>
                          !canvas.isLanguageCanvas &&
                          canvas.defaultBranch.publicAccess !==
                            BranchAccessEnum.PRIVATE
                            ? true
                            : !canvas.isLanguageCanvas &&
                              canvas.defaultBranch.permission !==
                                CanvasPermissionGroupEnum.NONE &&
                              canvas.defaultBranch.permission !==
                                CanvasPermissionGroupEnum.VIEW_METADATA &&
                              !canvas.defaultBranch?.actualRolePermsObject
                        )
                        .map((canvas) => (
                          <Box
                            sx={{
                              marginY: "5px",
                            }}
                            key={canvas.id}
                            as="a"
                            href={BipRouteUtils.getCanvasRoute(
                              handle,
                              canvas.name,
                              canvas.defaultBranch.id
                            )}
                            contentEditable={false}
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.preventDefault();
                              router.push({
                                pathname: BipRouteUtils.getCanvasRoute(
                                  handle,
                                  canvas.name,
                                  canvas.defaultBranch.id
                                ),
                              });
                            }}
                          >
                            <Box as={"span"}>
                              <Chip
                                contentEditable={false}
                                sx={{
                                  margin: "0px 1px",
                                  // borderColor: selected ? "accent.fg" : "transparent",
                                  cursor: "pointer",
                                  userSelect: "none",
                                }}
                                text={canvas?.name}
                                icon={<FileIcon color={"chip.icon"} />}
                              />
                            </Box>
                          </Box>
                        ))}
                    </Box>
                  </Box>
                  {isLarge || isXtraLarge ? (
                    <div
                      style={{
                        width: "280px",
                        marginLeft: "35px",
                      }}
                      className="relative flex flex-col flex-shrink-0 h-full px-4 py-1 space-y-2"
                      contentEditable={false}
                    ></div>
                  ) : null}
                </div>
              </Box>
            </>
          ) : (
            <Box className="flex justify-center mt-4">
              <BipLoader />
            </Box>
          )
        }
      />
    </HandleWrapper>
  );
};

CollectionPermissionsPage.getLayout = function getLayout(
  page: ReactElement,
  hideSidebar
) {
  return <StudioLayout whiteBg>{page}</StudioLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale || "en")),
    },
  };
};

CollectionPermissionsPage.auth = false;

export default CollectionPermissionsPage;
