import { Box } from "@primer/react";
import { FileIcon } from "@primer/styled-octicons";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { BipPage } from "../../../../src/commons/types";
import BipLoader from "../../../../src/components/BipLoader";
import Chip from "../../../../src/components/Chip";
import PrevNextButtons from "../../../../src/components/PrevNextButtons";
import { PageType, usePages } from "../../../../src/context/pagesContext";
import { useStudio } from "../../../../src/context/studioContext";
import BipRouteUtils from "../../../../src/core/routeUtils";
import { HandleWrapper } from "../../../../src/hooks/useHandle";
import useRefDimensions from "../../../../src/hooks/useRefDimensions";
import PublicLayout from "../../../../src/layouts/StudioLayout/PublicLayout";
import CanvasLayout from "../../../../src/modules/Canvas/components/CanvasLayout";
import { BranchAccessEnum } from "../../../../src/modules/Canvas/enums";
import CollectionHeader from "../../../../src/modules/Collections/components/CollectionHeader";
import CollectionService from "../../../../src/modules/Collections/services";
import {
  CanvasDataType,
  CollectionDataType,
} from "../../../../src/modules/Collections/types";

const PublicCollectionPage: BipPage = () => {
  const router = useRouter();
  const { collection } = router.query;
  const handle = router.query.handle as string;
  const {
    pages,
    setPagesLoaded,
    openIds,
    setOpenIds,
    updatePages,
    displayLanguage,
  } = usePages();
  const containerRef = useRef(null);
  const { isXtraSmall, isSmall, isMedium, isLarge, isXtraLarge, dimensions } =
    useRefDimensions(containerRef);
  const [canvases, setCanvases] = useState((): CanvasDataType[] => []);
  const { addToast } = useToasts();
  const { currentStudio } = useStudio();
  const [loadingPrevNext, setLoadingPrevNext] = useState(false);
  const [nextCollection, setNextCollection] = useState(
    (): CollectionDataType | null => null
  );
  const [prevCollection, setPrevCollection] = useState(
    (): CollectionDataType | null => null
  );

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

  const getCanvases = async () => {
    if (!currentCollection) return;
    try {
      const resp = await CollectionService.getCanvasRepo(
        {
          parentCollectionID: currentCollection.id,
          parentCanvasRepositoryID: 0,
        },
        true
      );
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

  useEffect(() => {
    if (
      currentStudio?.id &&
      currentStudio.handle === handle &&
      currentCollection?.id
    ) {
      setLoadingPrevNext(true);
      CollectionService.getNextPrevCollections(currentCollection.id)
        .then((r) => {
          setNextCollection(r.data.next);
          setPrevCollection(r.data.prev);
          setLoadingPrevNext(false);
        })
        .catch((err) => {
          setNextCollection(null);
          setPrevCollection(null);
          setLoadingPrevNext(false);
        });
    }
  }, [currentCollection, currentStudio]);

  // const filteredCanvases  = canvases
  // .filter((canvas) => {
  //   const isPublic =
  //     !canvas.isLanguageCanvas &&
  //     canvas.defaultBranch.publicAccess !==
  //       BranchAccessEnum.PRIVATE;

  //   if (displayLanguage && displayLanguage !== "en") {
  //     return (
  //       isPublic &&
  //       canvas.defaultLanguageCanvasRepoId === canvas.id &&
  //       canvas.language === displayLanguage
  //     );
  //   }
  //   return isPublic;
  // })

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
                    <Box className="flex flex-col mt-4">
                      {canvases
                        .filter((canvas) => {
                          const isPublic =
                            !canvas.isLanguageCanvas &&
                            canvas.defaultBranch.publicAccess !==
                              BranchAccessEnum.PRIVATE;

                          return isPublic;
                        })
                        .map((canvas) => {
                          const languagePagesForRepo = pages.filter(
                            (page) =>
                              page.defaultLanguageCanvasRepoId === canvas.id
                          );

                          const displayLanguageToShow =
                            languagePagesForRepo.find(
                              (langPage) =>
                                langPage.language === displayLanguage
                            );

                          if (
                            displayLanguage &&
                            displayLanguage !== "en" &&
                            !displayLanguageToShow
                          ) {
                            return <></>;
                          }
                          const tmpCanvas =
                            displayLanguage &&
                            displayLanguage !== "en" &&
                            displayLanguageToShow
                              ? displayLanguageToShow
                              : canvas;
                          return (
                            <Box
                              sx={{
                                marginY: "5px",
                              }}
                              key={tmpCanvas.id}
                              as="a"
                              href={BipRouteUtils.getCanvasRoute(
                                handle,
                                tmpCanvas.name,
                                tmpCanvas.defaultBranch.id
                              )}
                              contentEditable={false}
                              style={{ cursor: "pointer" }}
                              onClick={(e) => {
                                e.preventDefault();
                                router.push({
                                  pathname: BipRouteUtils.getCanvasRoute(
                                    handle,
                                    tmpCanvas.name,
                                    tmpCanvas.defaultBranch.id
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
                                  text={tmpCanvas?.name}
                                  icon={<FileIcon color={"chip.icon"} />}
                                />
                              </Box>
                            </Box>
                          );
                        })}
                      {!loadingPrevNext && (
                        <PrevNextButtons
                          context="collection"
                          prev={prevCollection as CollectionDataType}
                          next={nextCollection as CollectionDataType}
                        />
                      )}
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

PublicCollectionPage.getLayout = function getLayout(
  page: ReactElement,
  hideSidebar
) {
  return <PublicLayout>{page}</PublicLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale || "en")),
    },
  };
};

PublicCollectionPage.auth = false;
export default PublicCollectionPage;
