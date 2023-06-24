import { FC, useState } from "react";
import { DndProvider } from "react-dnd";
import {
  getBackendOptions,
  MultiBackend,
  Tree,
} from "@minoru/react-dnd-treeview";
import useSWR, { mutate } from "swr";
import CanvasBranchService from "../../../modules/Canvas/services/canvasBranch";
import BipLoader from "../../../components/BipLoader";
import Link from "next/link";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  XIcon,
} from "@primer/styled-octicons";
import { Button, Box, Text, Truncate, ConfirmationDialog } from "@primer/react";
import BipRouteUtils from "../../../core/routeUtils";
import { useStudio } from "../../../context/studioContext";
import DraftIcon from "../../../icons/DraftIcon";
import { useCanvas } from "../../../context/canvasContext";
import { useUser } from "../../../context/userContext";
import { isEmpty } from "../../../utils/Common";
import { usePages } from "../../../context/pagesContext";
import FileLockIcon from "../../../icons/FileLockIcon";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";
import { useRouter } from "next/router";
import { useToasts } from "react-toast-notifications";
import CollectionService from "../../../modules/Collections/services";

interface IDraftsTreeProps {
  displayLanguage: String;
}

const DraftsTree: FC<IDraftsTreeProps> = ({ displayLanguage }) => {
  const [open, setOpen] = useState(false);
  const { currentStudio } = useStudio();
  const { branch, setBranches, branches, repo, isPublicView } = useCanvas();
  const { addToast } = useToasts();

  const { isLoggedIn } = useUser();
  const router = useRouter();
  const slug = router.query.slug as string;
  const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);

  const { drafts, setDrafts, updatePages, pages, deletePage } = usePages();

  const [curNode, setCurNode] = useState((): any => null);

  const getCanvasRoute = isPublicView
    ? BipRouteUtils.getPublicCanvasRoute
    : BipRouteUtils.getCanvasRoute;

  const deleteBranch = async () => {
    const node = curNode;
    try {
      const deleteResponse = await CanvasBranchService.deleteBranch(node.id);
      const tempPages = pages.filter((page: any) => page.id !== node.id);
      updatePages(tempPages);

      // Drafts
      const updatedDrafts = drafts.filter((draft: any) => draft.id !== node.id);
      setDrafts(updatedDrafts);
      setBranches(branches.filter((branch) => branch.id !== node.id));
      if (branch?.id === node.id) {
        if (+router.query?.roughBranchId === node.id) {
          mutate([+branchId, "canvas-branch"]);
        }
        router.push(
          BipRouteUtils.getCanvasRoute(
            currentStudio?.handle!,
            repo?.name,
            repo?.defaultBranch?.id
          )
        );
      }
      setOpen(false);
      setCurNode(null);
      addToast("Draft deleted successfully", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      console.log(error);
      addToast("Can't delete draft", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const deleteCanvas = async () => {
    let node = curNode;
    try {
      await CollectionService.deleteCanvas(node.canvasRepositoryId);
      deletePage(node.canvasRepositoryId);
      setDrafts(drafts.filter((draft) => draft.id !== node?.id));
      if (
        node.canvasRepositoryId === repo?.id ||
        repo?.parentCanvasRepositoryID === node.canvasRepositoryId
      ) {
        node = {
          ...node,
          collectionID: repo?.collectionID,
          parent: repo?.collectionID,
        };
        const siblingCanvas = pages?.find(
          (page) =>
            page.type === "CANVAS" &&
            page.parent === node.parent &&
            node.canvasRepositoryId !== page.id
        );

        const parentCanvas = pages?.find(
          (page) => page.type === "CANVAS" && page.id === node.parent
        );

        const differentCollectionCanvas = pages.find(
          (page) =>
            page.type === "CANVAS" && node.collectionID !== page.collectionID
        );

        if (siblingCanvas) {
          router.push(
            getCanvasRoute(
              currentStudio?.handle!,
              // siblingCanvas.key,
              siblingCanvas.name,
              siblingCanvas.defaultBranch?.id
            )
          );
        } else if (parentCanvas) {
          router.push(
            getCanvasRoute(
              currentStudio?.handle!,
              // parentCanvas.key,
              parentCanvas.name,
              parentCanvas.defaultBranch?.id
            )
          );
        } else if (differentCollectionCanvas) {
          router.push(
            getCanvasRoute(
              currentStudio?.handle!,
              // differentCollectionCanvas.key,
              differentCollectionCanvas.name,
              differentCollectionCanvas.defaultBranch?.id
            )
          );
        } else {
          router.push(
            BipRouteUtils.getStudioAboutRoute(currentStudio?.handle!)
          );
        }
      }
      setOpen(false);
      setCurNode(null);
      addToast("Canvas deleted successfully", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      setCurNode(null);
    }
  };

  const handleConfirm = (type: string) => {
    if (type === "confirm") {
      if (curNode?.name === "main") {
        deleteCanvas();
      } else {
        deleteBranch();
      }
    } else {
      setOpen(false);
      setCurNode(null);
    }
  };

  const fetchDrafts = async () => {
    try {
      const { data: draftsResponse } = await CanvasBranchService.getDrafts();
      const draftBranches = [
        {
          id: 1,
          parent: 0,
          text: "Drafts",
          isOpen: true,
        },
        ...draftsResponse?.data.map((draft: any) => {
          return { ...draft, parent: 1 };
        }),
      ];
      setDrafts(draftBranches);
      return draftBranches;
    } catch (error) {
      console.log(error);
    }
  };

  const { data: draftsData, error } = useSWR(
    !isEmpty(currentStudio) ? ["drafts", currentStudio?.id] : null,
    fetchDrafts
  );
  const isLoading = !drafts && !error;

  const isCurrentlySelected = (node: any) => branch && branch?.id === node?.id;

  if (drafts.length <= 1) {
    return null;
  }

  return (
    <Box sx={{ color: "sidebar.draftsTree.bg" }}>
      {isLoading ? (
        <BipLoader />
      ) : (
        <Tree
          tree={drafts}
          classes={{
            root: "my-root-classname",
            container: "my-container-classname",
          }}
          rootId={0}
          onDrop={() => {}}
          render={(node, { depth, isOpen, onToggle }) => {
            const isMain = node?.name === "main";
            return (
              <>
                {node.id === 1 ? (
                  <Box
                    onClick={onToggle}
                    sx={{
                      color: "canvasItem.text",
                      ":hover": {
                        bg: "canvasItem.hoverBg",
                      },
                    }}
                    className="group flex p-0.5 py-1.5 items-center cursor-pointer justify-between rounded"
                  >
                    <div className="flex items-center">
                      {drafts.length > 1 ? (
                        <div className={`flex items-center mx-1`}>
                          {isOpen ? (
                            <ChevronDownIcon size={16} />
                          ) : (
                            <ChevronRightIcon size={16} />
                          )}
                        </div>
                      ) : null}

                      <DraftIcon />

                      <Text
                        className="ml-1 overflow-hidden text-xs uppercase whitespace-nowrap text-ellipsis"
                        style={{
                          width: 158,
                        }}
                        sx={{
                          color: "canvasItem.nodeName",
                        }}
                      >
                        {node.text}
                      </Text>
                    </div>
                  </Box>
                ) : (
                  <Box
                    marginLeft={"32px!important"}
                    sx={{
                      margin: "2px 0",
                      borderRadius: "6px",
                      color: "canvasItem.text",
                      ":hover": {
                        bg: "canvasItem.hoverBg",
                      },
                      bg: isCurrentlySelected(node) ? "canvasItem.hoverBg" : "",
                    }}
                    className="group flex p-0.5 py-1 items-center cursor-pointer justify-between"
                  >
                    <LinkWithoutPrefetch
                      href={{
                        pathname: BipRouteUtils.getCanvasRoute(
                          currentStudio?.handle!,
                          node?.canvasRepoName,
                          node?.id
                        ),
                      }}
                    >
                      <div className="flex items-center grow justify-between">
                        <span>
                          <div className={`flex items-center text-base grow`}>
                            <Box
                              className="flex items-center justify-center"
                              onClick={(e) => e.stopPropagation()}
                              sx={{
                                position: "relative",
                                marginRight: "5px",
                                height: "24px",
                                width: "24px",
                                borderRadius: "4px",
                              }}
                            >
                              {isMain ? <FileLockIcon /> : <DraftIcon />}
                            </Box>

                            <Text
                              className={`overflow-hidden text-sm  whitespace-nowrap text-ellipsis ${
                                isMain ? "italic" : ""
                              }`}
                              sx={
                                {
                                  // color: isCurrentlySelected
                                  //   ? "canvasItem.selectedNodeName"
                                  //   : "canvasItem.nodeName",
                                }
                              }
                            >
                              <Truncate title={node.text} inline={true}>
                                {node?.canvasRepoName ||
                                  `Draft-${node?.canvasRepoKey}`}
                              </Truncate>
                            </Text>
                          </div>
                        </span>
                        <Button
                          aria-haspopup="true"
                          sx={{
                            bg: `${open ? "brachItem.hoverBg" : "unset"}`,
                            boxShadow: "unset",
                            padding: "0",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "4px",
                            visibility: "hidden",
                            "& > span": {
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            },
                            ":hover:not([disabled])": {
                              bg: "brachItem.hoverBg",
                              "& svg": {
                                color: "sidebar.collectionTree.kebabHoverGray",
                              },
                            },
                            ":active:not([disabled])": {
                              backgroundColor: "brachItem.hoverBg",
                            },
                            "& svg": {
                              color: "sidebar.collectionTree.kebabDefaultGray",
                            },
                            "&[aria-expanded=true]": {
                              bg: "brachItem.hoverBg",
                              "& svg": {
                                color: "sidebar.collectionTree.kebabHoverGray",
                              },
                            },
                          }}
                          className="group-hover:visible"
                          aria-expanded={open}
                          onClick={(e: any) => {
                            setCurNode(node);
                            setOpen(true);
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <XIcon size={12} />
                        </Button>
                      </div>
                    </LinkWithoutPrefetch>
                  </Box>
                )}
              </>
              //   <div style={{ marginLeft: depth * 10 }}>
              //   {node.droppable && (
              //     <span onClick={onToggle}>{isOpen ? "[-]" : "[+]"}</span>
              //   )}
              //     {node.id}
              //   </div>
            );
          }}
        />
      )}
      {open ? (
        <ConfirmationDialog
          title="Are you sure?"
          onClose={handleConfirm}
          confirmButtonType="danger"
          confirmButtonContent="Delete"
        >
          You are going to delete the draft{" "}
          {curNode?.canvasRepoName || `Draft-${curNode?.canvasRepoKey}`}
        </ConfirmationDialog>
      ) : null}
    </Box>
  );
};

export default DraftsTree;
