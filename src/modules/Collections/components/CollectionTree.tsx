import React, {
  useEffect,
  useState,
  useRef,
  FC,
  useImperativeHandle,
} from "react";
import {
  Box,
  Button,
  IconButton,
  PageLayout,
  Select,
  Text,
  TextInput,
  Tooltip,
} from "@primer/react";
import {
  DragLayerMonitorProps,
  DropOptions,
  NodeModel,
  PlaceholderRenderParams,
  Tree,
} from "@minoru/react-dnd-treeview";
import { XIcon } from "@primer/octicons-react";
import { LANGUAGE_DATA } from "../../../utils/languagesData";

import CollectionService from "../services";
import { PageItem } from "./PageItem";
import { useStudio } from "../../../context/studioContext";
import { PageType, usePages } from "../../../context/pagesContext";
import { usePermissions } from "../../../context/permissionContext";
import { PermissionGroup } from "../../Permissions/types";
import BipLoader from "../../../components/BipLoader";
import CanvasDragPreview from "./CanvasDragPreview";
import DropPlaceholder from "./DropPlaceholder";
import CanvasService from "../../Canvas/services/canvasService";
import Modal from "../../../components/Modal";
import CanvasBranchService from "../../Canvas/services/canvasBranch";
import { useToasts } from "react-toast-notifications";
import { useCanvas } from "../../../context/canvasContext";
import useSWR from "swr";
import { ICanvasRepo } from "../../Canvas/interfaces";
import { useRouter } from "next/router";
import { CollectionDataType, CanvasDataType } from "../types";
import { SearchIcon } from "@primer/styled-octicons";
import { useTranslation } from "next-i18next";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../hooks/useHasPermission";
import { StudioPermissionEnum } from "../../Permissions/enums";
import segmentEvents from "../../../insights/segment";
import { sanitizeHandle } from "../../../utils/Common";
import useDebounce from "../../../hooks/useDebounce";
import Colors from "../../../utils/Colors";
import BipRouteUtils from "../../../core/routeUtils";
import DraftsTree from "../../../layouts/StudioLayout/components/DraftsTree";
import { useUser } from "../../../context/userContext";
import { CanvasRepoService } from "../../Canvas/services";

interface CollectionTreeProps {}

const CollectionTree: FC<CollectionTreeProps> = React.forwardRef(
  ({}: CollectionTreeProps, ref) => {
    const [showInheritPermDialog, setShowInheritPermDialog] = useState(false);
    const [currentDragSource, setCurrentDragSource] = useState((): any => null);
    const [availableLanguages, setAvailableLanguages] = useState([]);
    const { isLoggedIn } = useUser();
    const { addToast } = useToasts();
    const { t } = useTranslation();
    const router = useRouter();
    const handle = sanitizeHandle(router.query.handle as string);
    const slug = router.query.slug as string;
    const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);
    const { currentStudio } = useStudio();
    const {
      pages,
      updatePages,
      pagesLoaded,
      filteredPages,
      setFilteredPages,
      shouldFetchCollections,
      setShouldFetchCollections,
      displayLanguage,
      setDisplayLanguage,
      openIds,
      setOpenIds,
    } = usePages();

    const { schema } = usePermissions();
    const { repo, branch, isPublicView, setRepo, showNotFoundPage, isPrivate } =
      useCanvas();

    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");

    const debounceSearch = useDebounce(searchText, 700);
    const canChangePosition = useHasPermission(
      StudioPermissionEnum.STUDIO_CHANGE_CANVAS_COLLECTION_POSITION,
      PermissionContextEnum.Studio
    );

    useEffect(() => {
      if (debounceSearch?.length) {
        handleSearch()
          .then((r) => {
            setLoading(false);
          })
          .catch((err) => {
            setLoading(false);
          });
      }
    }, [debounceSearch]);

    useEffect(() => {
      const getDistinctLangs = async () => {
        if (!isPublicView) {
          return;
        }
        const resp = await CanvasRepoService.getDistinctLanguages();
        setAvailableLanguages(
          resp.data.languages.map((lang) => {
            if (lang === "en") {
              return {
                value: lang,
                label: "English",
              };
            }
            return {
              value: lang,
              label: LANGUAGE_DATA.find((language) => language.value === lang)
                ?.label,
            };
          })
        );
      };
      getDistinctLangs();
    }, [isPublicView]);

    useEffect(() => {
      if (repo && filteredPages.length > 0) {
        const repoPageIndex = filteredPages.findIndex(
          (page) => page.id === repo.id
        );
        const tempFilteredPages = [...filteredPages];
        if (repoPageIndex < 0) {
          return;
        }

        const repoPageItem = tempFilteredPages[repoPageIndex];
        const newPageItem = { ...repoPageItem, ...repo };

        tempFilteredPages[repoPageIndex] = newPageItem;
        setFilteredPages(tempFilteredPages);
      }
    }, [repo]);

    const fetchBranchCollections = async () => {
      setLoading(true);
      try {
      } catch (error) {}

      const { data: branchNavData } =
        await CanvasBranchService.getBranchNavData(branch?.id, isPublicView);

      let treeItems = branchNavData.data.map(
        (collection: CollectionDataType) => {
          return {
            ...collection,
            parent: 0,
            areCanvasesFetched: collection.hasBranch ? true : false,
            permissionGroup: schema?.collection?.permissionGroups.find(
              (permissionGroup: PermissionGroup) =>
                permissionGroup.systemName === collection.permission
            ),
          };
        }
      );

      const branchCollection = branchNavData.data.find(
        (collection: CollectionDataType) => collection.hasBranch
      );

      // Setting opened Items, needs discussion -> CC
      if (branchCollection) {
        let tempOpenIds: number[] = [branchCollection.id];
        if (branchCollection.repos) {
          let leafRepo = branchCollection.repos?.find(
            (repo: ICanvasRepo) => repo.hasBranch
          );
          if (leafRepo) {
            tempOpenIds = [...tempOpenIds, leafRepo.id];
            let runningRepo = leafRepo;

            while (runningRepo?.parentCanvasRepositoryID) {
              const parentRepo = branchCollection.repos.find(
                (repo: ICanvasRepo) =>
                  repo.id == runningRepo.parentCanvasRepositoryID
              );
              tempOpenIds = parentRepo
                ? [...tempOpenIds, parentRepo.id]
                : [...tempOpenIds];
              runningRepo = parentRepo;
            }
          }

          // areCanvasesFetched: true,
          const repoItems = branchCollection.repos.map((repo: ICanvasRepo) => {
            return {
              ...repo,
              parent: repo.parentCanvasRepositoryID
                ? repo.parentCanvasRepositoryID
                : branchCollection.id,
              type: "CANVAS",
              collectionID: branchCollection.id,
            };
          });

          treeItems = [...treeItems, ...repoItems];
        }
        setOpenIds(tempOpenIds);
      }

      updatePages(treeItems);
      setLoading(false);
    };

    const fetchAllCollections = async () => {
      setLoading(true);
      try {
        const resp = await CollectionService.getCollections(isPublicView);
        const treeItems = resp.data.data.map((page: any) => {
          return {
            ...page,
            permissionGroup: schema?.collection?.permissionGroups.find(
              (permissionGroup: PermissionGroup) =>
                permissionGroup.systemName === page.permission
            ),
            droppable: true,
          };
        });

        updatePages(treeItems);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error, "error");
      }
    };

    useEffect(() => {
      if (currentStudio?.id) {
        setFilteredPages([]);
      }
    }, [currentStudio?.id]);

    useEffect(() => {
      if (!router.isReady || pagesLoaded) return;
      if (branch) {
        fetchBranchCollections();
      }
    }, [branch, router.isReady]);

    useEffect(() => {
      if (
        !router.isReady ||
        pagesLoaded ||
        (router.query.slug && showNotFoundPage && isPrivate) ||
        router?.pathname?.split("/").length === 2 ||
        (branchId && !showNotFoundPage && !router.query.mergeId && !isPrivate)
      )
        return;
      if (currentStudio?.id && currentStudio?.handle === handle) {
        fetchAllCollections();
      }
    }, [router.isReady, currentStudio, pagesLoaded]);

    const handleSearch = async () => {
      let items = [];
      const payload = {
        query: searchText,
      };
      const { data: searchResult } =
        await CanvasBranchService.searchBranchNavData(payload, isPublicView);
      if (searchResult.collections.length) {
        const treeItems = searchResult.collections.map((page: any) => {
          return {
            ...page,
            parent: 0,
            type: "COLLECTION",
            computedRootCanvasCount: 1,
            permissionGroup: schema?.collection?.permissionGroups.find(
              (permissionGroup: PermissionGroup) =>
                permissionGroup.systemName === page.permission
            ),
          };
        });

        items = [...treeItems];

        const repoItems = searchResult.repos.map((repo: any) => {
          return {
            ...repo,
            parent: repo.parentCanvasRepositoryID ?? repo.collectionID,
            type: "CANVAS",
          };
        });

        const canvasItems = searchResult.branches.map((branch: any) => {
          return {
            ...branch,
            parent: branch.canvasRepositoryID,
            type: "BRANCH",
          };
        });

        items = [...items, ...repoItems, ...canvasItems];

        if (searchText !== "") {
          setFilteredPages(items);
        }
      } else {
        setFilteredPages([]);
      }

      setLoading(false);
    };

    const handleCollectionDrop = async (
      newTree: PageType[],
      {
        dragSourceId,
        dropTargetId,
        dragSource,
        dropTarget,
        destinationIndex,
      }: DropOptions<NodeModel>
    ) => {
      try {
        const collectionIndex = newTree.findIndex(
          (col) => col.id === dragSourceId
        );
        if (collectionIndex >= 0) {
          const moveResponse = await CollectionService.moveCollection({
            collectionId: dragSourceId,
            position: collectionIndex + 1,
          });
        }
      } catch (err) {
        console.log("error while moving collection");
      }
      updatePages(newTree);
    };

    const handleDrop = async (
      newTree: PageType[],
      {
        dragSourceId,
        dropTargetId,
        dragSource,
        dropTarget,
        destinationIndex,
      }: DropOptions<NodeModel>
    ) => {
      if (dragSource?.type === "COLLECTION") {
        handleCollectionDrop(newTree, {
          dragSourceId,
          dropTargetId,
          dragSource,
          dropTarget,
          destinationIndex,
        });
      } else {
        let position = 1;
        const targetChildren = newTree.filter(
          (item) => item.parent === dropTargetId
        );
        const sourceIndex = targetChildren.findIndex(
          (item) => item.id === dragSourceId
        );
        if (sourceIndex >= 0) {
          position = sourceIndex + 1;
        }
        try {
          segmentEvents.canvasMoved(
            currentStudio?.handle,
            repo?.key,
            repo?.name
          );
          console.log(dropTargetId, dragSource);
          const moveResponse = await CanvasService.moveCanvas({
            canvasRepoID: dragSourceId,
            futurePosition: position,
            toCollectionID:
              dropTarget?.type === "COLLECTION" &&
              dropTargetId !== dragSource?.collectionID
                ? dropTargetId
                : dropTarget?.type === "CANVAS"
                ? dropTarget?.collectionID !== dragSource?.collectionID
                  ? dropTarget?.collectionID
                  : 0
                : 0,
            toParentCanvasRepositoryID:
              dropTarget?.type === "CANVAS" ? dropTargetId : 0,
          });
          if (dragSource?.parent !== dropTargetId) {
            setCurrentDragSource(dragSource);
            setShowInheritPermDialog(true);
          }
          setRepo({
            ...repo,
            collectionID:
              dropTarget?.type === "COLLECTION"
                ? +dropTargetId
                : repo?.collectionID,
            parentCanvasRepositoryID:
              dropTarget.type === "CANVAS" ? +dropTargetId : null,
          });
          // Openning target collection
          // setOpenIds([...openIds, +dropTargetId]);
          const targetIndex = newTree.findIndex(
            (node) => node.id === dropTargetId
          );
          if (dropTarget?.type === "COLLECTION") {
            const prevTargetCollection = newTree[
              targetIndex
            ] as CollectionDataType;
            if (targetIndex !== -1) {
              const updatedTargetCollection = {
                ...prevTargetCollection,
                computedRootCanvasCount:
                  prevTargetCollection.computedRootCanvasCount + 1,
                computedAllCanvasCount:
                  prevTargetCollection.computedAllCanvasCount + 1,
              };
              newTree[targetIndex] = updatedTargetCollection;
              // updatePages(updatedPages);
            }
          } else {
            const prevTargetCanvas = newTree[targetIndex] as CanvasDataType;
            if (targetIndex !== -1) {
              const updatedTargetCanvas = {
                ...prevTargetCanvas,
                subCanvasCount: prevTargetCanvas.subCanvasCount + 1,
              };
              newTree[targetIndex] = updatedTargetCanvas;
              // updatePages(updatedPages);
            }
          }

          // source child count update @todo GM - lot of cleanup needed
        } catch (error) {
          console.log("error while moving canvas");
        }
        updatePages(newTree);
      }
    };

    const inheritCanvasPermissions = () => {
      setLoading(true);
      CanvasBranchService.inheritParentPermissions(
        currentDragSource?.defaultBranchID
      )
        .then((r) => {
          closeInheritDialog();
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          addToast("Something went wrong. Please try again", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    };

    const closeInheritDialog = () => {
      setShowInheritPermDialog(false);
      setCurrentDragSource(null);
    };

    const addOpenId = (id: number) => {
      setOpenIds([...openIds, id]);
    };

    useImperativeHandle(ref, () => ({ addOpenId }));

    const clearSearch = () => {
      setLoading(false);
      setFilteredPages([]);
      setSearchText("");
    };

    return (
      <Box height="100%" style={{ display: "contents" }}>
        <Box
          sx={{
            position: "relative",
          }}
        >
          <TextInput
            sx={{
              border: "1px solid",
              borderColor: "border.subtle",
              boxShadow: "none",
              background: "transparent",
              width: "100%",
              margin: "1.25rem 0",
              boxSizing: "border-box",
              color: "text.grayUltraLight",
              "input::placeholder": { color: "text.gray" },
            }}
            leadingVisual={() => <SearchIcon color={"text.gray"} />}
            aria-label="Canvases"
            name="Canvases"
            autoComplete="off"
            placeholder="Search Canvases"
            onChange={(e) => {
              if (e.target.value) {
                setLoading(true);
              } else {
                clearSearch();
              }
              setSearchText(e.target.value);
            }}
            value={searchText}
          />

          {searchText && (
            <Box
              sx={{
                position: "absolute",
                right: "0px",
                top: "40%",
                // transform: "translateY(-50%)",
              }}
            >
              <Tooltip aria-label="Clear Search" wrap direction="nw">
                <IconButton
                  icon={XIcon}
                  sx={{
                    background: "unset",
                    border: "none",
                    borderRadius: "0px",
                    boxShadow: "unset",
                    ":hover:not([disabled])": {
                      background: "unset",
                    },
                    svg: {
                      fill: Colors.gray["400"],
                    },
                  }}
                  onClick={clearSearch}
                />
              </Tooltip>
            </Box>
          )}
        </Box>
        {availableLanguages.length > 1 && isPublicView && (
          <Box
            sx={{
              marginBottom: "0.5rem",
              // display: "flex",
              // justifyContent: "flex-end",
            }}
          >
            <select
              defaultValue={"en"}
              className=" bg-gray-800 rounded p-1 w-full outline-0 border-none text-gray-500"
              onChange={(e) =>
                setDisplayLanguage(
                  e.target.value === "en" ? "" : e.target.value
                )
              }
            >
              {availableLanguages.map((availLang) => (
                <option key={availLang?.value} value={availLang.value}>
                  {availLang.label}
                </option>
              ))}
            </select>
          </Box>
        )}
        {loading ? (
          <BipLoader />
        ) : (
          <>
            {searchText !== "" && filteredPages.length === 0 ? (
              <Text
                fontSize={"14px"}
                color="sidebar.studionav.textSecondary"
                sx={{
                  textAlign: "center",
                }}
              >
                {t("pages.noresults")}
              </Text>
            ) : (
              <Box
                height="100%"
                sx={{
                  overscrollBehavior: "contain",
                  overflow: "scroll",
                  scrollbarWidth: "thin",
                }}
              >
                <Tree
                  tree={
                    filteredPages.length
                      ? (filteredPages as NodeModel[])
                      : (pages as NodeModel[])
                  }
                  rootId={0}
                  render={(node: any, { depth, isOpen, onToggle }: any) => {
                    return (
                      <PageItem
                        node={node}
                        depth={depth}
                        isOpen={isOpen}
                        onToggle={onToggle}
                        pages={pages}
                        updatePages={updatePages}
                        displayLanguage={
                          displayLanguage === "en" ? "" : displayLanguage
                        }
                      />
                    );
                  }}
                  dragPreviewRender={(monitorProps: any) => (
                    <CanvasDragPreview
                      monitorProps={monitorProps}
                      canChangePosition={canChangePosition}
                    />
                  )}
                  onDrop={isPublicView ? null : handleDrop}
                  canDrop={(
                    tree: NodeModel<PageType>,
                    {
                      dragSource,
                      dropTargetId,
                      dropTarget,
                      destinationIndex,
                      dragSourceId,
                    }: DropOptions<PageType>
                  ) => {
                    if (!canChangePosition) {
                      return false;
                    }
                    if (dragSourceId === dropTargetId) {
                      return false;
                    }
                    if (dragSource?.type === "COLLECTION") {
                      if (dropTargetId === 0) {
                        return true;
                      }
                    } else {
                      if (dragSource?.type === "CANVAS") {
                        if (
                          dropTarget?.type === "COLLECTION" ||
                          dropTarget?.type === "CANVAS"
                        ) {
                          return true;
                        }
                        return false;
                      }
                    }
                    return false;
                  }}
                  canDrag={(node) =>
                    ((node?.type === "CANVAS" && !node?.isLanguageCanvas) ||
                      node?.type === "COLLECTION") &&
                    !isPublicView
                  }
                  classes={{
                    draggingSource: "opacity-30",
                    placeholder: "relative",
                    dropTarget: "bg-white03",
                    root: "my-collectionTree-root",
                    container: "my-collectionTree-container",
                  }}
                  sort={false}
                  insertDroppableFirst={false}
                  dropTargetOffset={5}
                  placeholderRender={(
                    node: NodeModel<PageType>,
                    { depth }: PlaceholderRenderParams
                  ) => <DropPlaceholder node={node} depth={depth} />}
                  initialOpen={
                    filteredPages.length
                      ? filteredPages
                          .filter(
                            (page) =>
                              filteredPages.some(
                                (filPage) =>
                                  filPage.parentCanvasRepositoryID === page.id
                              ) || page.type === "COLLECTION"
                          )
                          .map((page) => page.id)
                      : openIds
                  }
                />
                {isLoggedIn && !isPublicView ? (
                  <DraftsTree displayLanguage={displayLanguage} />
                ) : null}
              </Box>
            )}
          </>
        )}

        {/* <div className="px-2 py-1">
        <Button
          size="small"
          leadingIcon={PlusIcon}
          hoverBg="sidebar.addStudio.hoverBg"
          sx={{
            textTransform: "uppercase",
            fontWeight: "300",
            backgroundColor: "sidebar.addStudio.bg",
            color: "sidebar.addStudio.text",
            width: "100%",
            ":hover": {
              color: "sidebar.addStudio.hoverText",
            },
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => console.log("New Canvas created")}
        >
          New Canvas
        </Button>
      </div> */}
        {showInheritPermDialog && currentDragSource ? (
          <Modal
            closeHandler={closeInheritDialog}
            sx={{ maxWidth: "350px" }}
            hideCloseButton
          >
            <div className="flex flex-col space-y-2">
              <Text as="p">Inherit permissions from New Parent?</Text>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant="invisible"
                  sx={{ color: "sidebar.collectionTree.no" }}
                  onClick={closeInheritDialog}
                  disabled={loading}
                >
                  No
                </Button>
                <Button
                  disabled={loading}
                  variant="invisible"
                  sx={{ color: "sidebar.collectionTree.apply" }}
                  onClick={inheritCanvasPermissions}
                >
                  Apply
                </Button>
              </div>
            </div>
          </Modal>
        ) : null}
      </Box>
    );
  }
);

CollectionTree.displayName = "CollectionTree";

export default CollectionTree;
