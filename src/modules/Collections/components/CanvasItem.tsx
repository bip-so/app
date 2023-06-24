import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  LinkExternalIcon,
  KebabHorizontalIcon,
  TrashIcon,
  LockIcon,
  ArrowRightIcon,
  PencilIcon,
  EyeIcon,
  CommentIcon,
  GitBranchIcon,
} from "@primer/styled-octicons";
import EditModal from "./EditModal";
import {
  ActionMenu,
  ConfirmationDialog,
  IconButton,
  Button,
  ActionList,
  Box,
  useOnOutsideClick,
  Text,
  Truncate,
  Tooltip,
} from "@primer/react";
import { FaLock } from "react-icons/fa";
import Link from "next/link";
import { useDragOver } from "@minoru/react-dnd-treeview";
import CollectionService from "../services";
import { PageType, usePages } from "../../../context/pagesContext";
import Modal from "../../../components/Modal";
import CreateModal from "./CreateModal";
import EmojiPicker from "../../../components/EmojiPicker";
import { useToasts } from "react-toast-notifications";
import { useStudio } from "../../../context/studioContext";
import CanvasPublicAccessOverlay from "../../Canvas/components/CanvasPublicAccessOverlay";
import BipLoader from "../../../components/BipLoader";
import CanvasService from "../../Canvas/services/canvasService";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../hooks/useHasPermission";
import {
  CanvasPermissionEnum,
  StudioPermissionEnum,
} from "../../Permissions/enums";
import { useCanvas } from "../../../context/canvasContext";
import CanvasBranchService from "../../Canvas/services/canvasBranch";
import BranchItem from "./BranchItem";
import { BranchAccessEnum } from "../../Canvas/enums";
import { useLayout } from "../../../context/layoutContext";
import BipRouteUtils from "../../../core/routeUtils";
import { useRouter } from "next/router";
import FileLockIcon from "../../../icons/FileLockIcon";
import { usePermissions } from "../../../context/permissionContext";
import { PermissionGroup } from "../../Permissions/types";
import LanguageItem from "./LanguageItem";
import { useRightRail } from "../../../context/rightRailContext";
import { useUser } from "../../../context/userContext";
import { mutate } from "swr";
import SmallLockIcon from "../../../icons/SmallLockIcon";
import segmentEvents from "../../../insights/segment";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import TranslateModal from "./TranslateModal";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

export const getPublicAccessIcon = (publicAccess: BranchAccessEnum) => {
  switch (publicAccess) {
    case BranchAccessEnum.PRIVATE:
      return LockIcon;
    case BranchAccessEnum.VIEW:
      return EyeIcon;
    case BranchAccessEnum.COMMENT:
      return CommentIcon;
    case BranchAccessEnum.EDIT:
      return PencilIcon;
    default:
      null;
  }
};

const CanvasItem = (props: any) => {
  const router = useRouter();

  const slug = router.query.slug as string;
  const branchId = slug
    ? BipRouteUtils.getBranchIdFromCanvasSlug(slug)
    : undefined;

  const { user, isLoggedIn } = useUser();

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const anchorRef = React.createRef<HTMLButtonElement>();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const { inheritDialogOpen } = usePermissions();
  const {
    addNewPages,
    pages,
    filteredPages,
    setFilteredPages,
    updatePages,
    updateCollection,
    drafts,
    setDrafts,
    deletePage,
  } = usePages();
  const { currentStudio } = useStudio();
  const { addToast } = useToasts();
  const { node, depth, isOpen, onToggle, displayLanguage } = props;
  const { isTabletOrMobile } = useDeviceDimensions();
  const { schema } = usePermissions();
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const isSearching = filteredPages.length;

  const {
    repo,
    setRepo,
    branch,
    branches,
    setBranches,
    isPublicView,
    setIsLoading,
  } = useCanvas();
  const { setIsPinned, setIsSideNavOpen } = useLayout();

  const getCanvasRoute = isPublicView
    ? BipRouteUtils.getPublicCanvasRoute
    : BipRouteUtils.getCanvasRoute;

  const indent = depth === 1 ? 18 : 18 + (depth - 1) * 22;

  useEffect(() => {
    if (open) {
      setIsPinned(true);
    } else {
      setIsPinned(false);
    }
  }, [open]);

  const closeOverlay = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const getSubCanvasesAndBranches = async () => {
    setLoading(true);
    // const branchesPromise = CanvasService.getBranches({
    // canvasId: node.id,
    // collectionId: node.collectionID,
    // parentCanvasId: 0,
    // });
    const subCanvasesPromise = CollectionService.getCanvasRepo(
      {
        parentCollectionID: node.collectionID,
        parentCanvasRepositoryID: node.id,
      },
      isPublicView
    );
    await Promise.all([subCanvasesPromise])
      .then((responses) => {
        // const branches = responses[0]?.data;
        const subCanvases = responses[0]?.data;
        let tempPages = isSearching ? [...filteredPages] : [...pages];
        const pagesIds = tempPages.map((page) => page.id);
        if (subCanvases.data) {
          const filteredCanvases = subCanvases.data.filter(
            (can: PageType) => !pagesIds.includes(can.id)
          );
          tempPages = [...tempPages, ...filteredCanvases];
          tempPages = tempPages.map((el) =>
            el.id === node.id
              ? {
                  ...node,
                  areChildrenFetched: true,
                  subCanvasCount: subCanvases.data.length,
                }
              : el
          );
        }
        // if (branches.data) {
        //   tempPages = [
        //     ...tempPages,
        //     ...branches.data.map((branch: any, index: number) => {
        //       return {
        //         ...branch,
        //         parent: node.id,
        //         position: subCanvases.data.length + index + 1,
        //         type: "BRANCH",
        //       };
        //     }),
        //   ];
        // }

        if (isSearching) {
          setFilteredPages(tempPages);
        } else {
          updatePages(tempPages);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching branches,subcanvases");
        setLoading(false);
      });
  };

  const getSubCanvas = async () => {
    try {
      setLoading(true);
      const resp = await CollectionService.getCanvasRepo(
        {
          parentCollectionID: node.collectionID,
          parentCanvasRepositoryID: node.id,
        },
        isPublicView
      );
      if (!resp.data.data) {
        setLoading(false);
        return;
      }
      let tempPages = [...pages, ...resp.data.data];
      tempPages = tempPages.map((el) =>
        el.id === node.id
          ? {
              ...node,
              areChildrenFetched: true,
              childrenCount: resp.data.data.length,
            }
          : el
      );
      updatePages(tempPages);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggle = async (
    e?: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    !isOpen &&
      !node.areChildrenFetched &&
      node.subCanvasCount &&
      (await getSubCanvasesAndBranches());
    onToggle(node.id);
  };

  const closeModalHandler = () => {
    setShowModal(false);
    setModalType("");
  };

  const createBranch = async () => {
    try {
      const resp = await CanvasBranchService.createBranch({
        canvasRepoId: node.id,
        collectionId: node.collectionID,
        fromCanvasBranchId: node.defaultBranch.id,
        parentCanvasRepoId: node.parentCanvasRepositoryID || 0,
      });
      const newBranch = { ...resp.data.data, parent: node.id };
      const tempPages = [...pages, { ...newBranch, parent: node.id }];
      addToast("Branch Created!", {
        appearance: "success",
        autoDismiss: true,
      });

      updatePages(tempPages);
      const branchLink = BipRouteUtils.getCanvasRoute(
        currentStudio?.handle!,
        node.name,
        newBranch.id
      );
      setBranches([...branches, newBranch]);
      router.push(branchLink);

      closeModalHandler();
    } catch (error) {}
  };

  const createSubCanvas = async () => {
    try {
      isTabletOrMobile && setIsSideNavOpen(false);
      const siblingsCount = pages.filter(
        (page) => page.parent === node.id
      ).length;
      const resp = await CollectionService.createSubCanvas({
        name: "New Canvas",
        collectionID: node.collectionID,
        parentCanvasRepositoryID: node.id,
        position: 1,
      });
      const newCanvas = resp.data.data;

      await router.push(
        `${getCanvasRoute(
          currentStudio?.handle!,
          // newCanvas.key,
          newCanvas?.name,
          newCanvas.defaultBranch.id
        )}?isNew=true`
      );

      setDrafts([
        {
          ...newCanvas.defaultBranch,
          parent: 1,
          canvasRepoKey: newCanvas.key,
          canvasRepoName: newCanvas.name,
          canvasRepositoryID: newCanvas.id,
          canvasRepositoryId: newCanvas.id,
        },
        ...drafts,
      ]);
      if (isOpen || (!isOpen && node.areChildrenFetched)) {
        const tempPages = [
          { ...newCanvas, parent: node.id, parentCanvasRepositoryID: node.id },
          ...pages,
        ];
        const index = tempPages.findIndex((page) => page.id === node.id);
        const canvasRepo = {
          ...tempPages[index],
          subCanvasCount: node.subCanvasCount + 1,
        };

        tempPages[index] = canvasRepo;

        updatePages(tempPages);
      } else {
        if (!node.areChildrenFetched && !isOpen) {
          getSubCanvas();
        }
      }

      if (!isOpen) {
        onToggle(node.id);
      }

      closeModalHandler();
    } catch (error) {}
  };

  const deleteHandler = async (gesture: string) => {
    if (gesture === "confirm") {
      try {
        segmentEvents.canvasDeleted(
          currentStudio?.handle!,
          node?.canvasRepoKey,
          node?.name,
          user?.id!
        );
        await CollectionService.deleteCanvas(node.id);
        deletePage(node.id);
        setDrafts(drafts.filter((draft) => draft.id !== node.defaultBranch.id));
        if (
          node.id === repo?.id ||
          repo?.parentCanvasRepositoryID === node.id
        ) {
          const siblingCanvas = pages?.find(
            (page) =>
              page.type === "CANVAS" &&
              page.parent === node.parent &&
              node.id !== page.id
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
        addToast("Canvas deleted successfully", {
          appearance: "success",
          autoDismiss: true,
        });
      } catch (error) {}
    } else {
      closeModalHandler();
    }
  };

  const addEmojiIconHandler = async (emoji: string) => {
    try {
      const newPage = { ...node };
      newPage.icon = emoji;
      const resp = await CollectionService.addEmojiIcon({
        canvasRepoId: node.id,
        icon: emoji,
        name: node.name,
        coverUrl: node.coverUrl,
      });
      updateCollection(newPage);
      if (node.id === repo?.id) {
        setRepo({
          ...repo!,
          icon: emoji,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const editCanvas = async (data: any) => {
    const payload = {
      icon: node.icon,
      name: data.name,
      publicAccess: node.publicAccess,
      coverUrl: node.coverUrl,
    };
    const canvasRepoID: number = node.id;

    const resp = await CollectionService.editCanvas(canvasRepoID, payload);
    addToast("Canvas Renamed successfully", {
      appearance: "success",
      autoDismiss: true,
    });
    if (canvasRepoID === repo?.id) {
      setRepo({
        ...repo,
        icon: node.icon,
        name: data.name,
      });
    }
    updateCollection({ ...node, name: data.name });
    closeModalHandler();
  };

  const canChangePosition = useHasPermission(
    StudioPermissionEnum.STUDIO_CHANGE_CANVAS_COLLECTION_POSITION,
    PermissionContextEnum.Studio
  );

  const canvasPermissionGroup = schema?.canvas?.permissionGroups?.find(
    (permissionGroup: PermissionGroup) =>
      permissionGroup?.systemName === node?.defaultBranch?.permission
  );

  const canEditBranchName = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_EDIT_NAME,
    PermissionContextEnum.Canvas,
    canvasPermissionGroup?.permissions
  );

  const canEditBranch = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_EDIT,
    PermissionContextEnum.Canvas,
    canvasPermissionGroup?.permissions
  );

  const canManagePermissions = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_MANAGE_PERMS,
    PermissionContextEnum.Canvas,
    canvasPermissionGroup?.permissions
  );

  const canDeleteBranch = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_DELETE,
    PermissionContextEnum.Canvas,
    canvasPermissionGroup?.permissions
  );

  const canManageMergeRequests = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_MANAGE_MERGE_REQUESTS,
    PermissionContextEnum.Canvas,
    canvasPermissionGroup?.permissions
  );

  const getActionMenuData = () => {
    const ACTION_MENU_DATA = [];
    if (canEditBranch || node?.defaultBranch?.publicAccess === "edit") {
      ACTION_MENU_DATA.push({
        title: "Create Sub-Canvas",
        icon: FileIcon,
        clickHandler: () => {
          if (isLoggedIn) {
            createSubCanvas();
          } else {
            router.push(BipRouteUtils.getSignInRoute());
          }
        },
      });

      ACTION_MENU_DATA.push({
        title: "Translate Canvas",
        icon: FileIcon,
        clickHandler: () => {
          if (isLoggedIn) {
            setShowTranslateModal(true);
          } else {
            router.push(BipRouteUtils.getSignInRoute());
          }
        },
      });
      if (node?.isPublished) {
        ACTION_MENU_DATA.push({
          title: "Create Branch",
          icon: GitBranchIcon,
          clickHandler: () => {
            if (isLoggedIn) {
              createBranch();
            } else {
              router.push(BipRouteUtils.getSignInRoute());
            }
          },
        });
      }
      if (node?.isPublished && canManagePermissions) {
        ACTION_MENU_DATA.push({
          title: "Public Access",
          icon: getPublicAccessIcon(node?.defaultBranch.publicAccess),
          clickHandler: () => {
            setShowVisibilityMenu(true);
          },
        });
      }
    }
    if (canDeleteBranch || node.createdByID === user?.id) {
      ACTION_MENU_DATA.push({
        title: "Delete Canvas",
        icon: TrashIcon,
        clickHandler: () => {
          setShowModal(true);
          setModalType("Delete");
        },
      });
    }
    // ACTION_MENU_DATA.push({
    //   title: "Open in new tab",
    //   icon: LinkExternalIcon,
    //   clickHandler: () => {
    //     window.open(canvasLink);
    //   },
    // });
    return ACTION_MENU_DATA;
  };

  let onModalAction: any;
  switch (modalType) {
    case "Branch":
      onModalAction = createBranch;
      break;
    case "Sub-Canvas":
      onModalAction = createSubCanvas;
      break;
    case "EditCanvas":
      onModalAction = editCanvas;
      break;
    case "Delete":
      onModalAction = deleteHandler;
      break;
    default:
  }

  const subCanvasCount = node.subCanvasCount;

  const languagePagesForRepo = pages.filter(
    (page) => page.defaultLanguageCanvasRepoId === node.id
  );

  const displayLanguageToShow = languagePagesForRepo.find(
    (langPage) => langPage.language === displayLanguage
  );

  let styles = {};
  styles.marginLeft = indent;

  const showLanguagePages =
    (languagePagesForRepo.length > 0 && node.id === repo?.id) ||
    repo?.defaultLanguageCanvasRepoId === node.id;

  const showCurrentRepoBranches =
    (node?.id === repo?.id && node.id === branches[0]?.canvasRepositoryId) ||
    branch?.canvasRepositoryId === node.id;

  let selectedStyles = {};

  const canvas =
    isPublicView && displayLanguage && displayLanguageToShow
      ? displayLanguageToShow
      : node;

  const canvasTitle = canvas.name;

  const isCurrentlySelected = branch
    ? branch?.id === canvas?.defaultBranch?.id
    : branchId === canvas?.defaultBranch?.id;

  if (isCurrentlySelected) {
    selectedStyles = {
      bg: "rgba(255, 255, 255, 0.07)",
    };
  }

  let nodeTextStyles = {};

  if (!node.isPublished) {
    nodeTextStyles = {
      fontStyle: "italic",
    };
    if (node?.createdByID !== user?.id && canDeleteBranch) {
      nodeTextStyles = {
        fontStyle: "italic",
        fontWeight: "bold",
      };
    }
  } else if (node?.mergeRequestCount && canManageMergeRequests) {
    nodeTextStyles = {
      fontWeight: "bold",
    };
  }

  const CanvasEmoji = () => {
    return node.icon ? (
      node.icon
    ) : node.defaultBranch?.publicAccess === BranchAccessEnum.PRIVATE ? (
      <Box className="mr-0.5 pl-0.5">
        <FileLockIcon />
      </Box>
    ) : (
      <Box
        className=" p-0.5 pl-1  mr-0.5"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "& span": {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <FileIcon />
      </Box>
    );
  };

  const dProps = useDragOver(node.id, isOpen, handleToggle);
  const dragOverProps = canChangePosition ? dProps : {};

  const canvasLink = (node: any) => {
    const canvas = displayLanguage ? displayLanguageToShow : node;

    return getCanvasRoute(
      currentStudio?.handle!,
      // node.key,
      canvas.name,
      canvas.defaultBranchID
    );
  };

  const ConditionalLink = isCurrentlySelected ? Box : LinkWithoutPrefetch;

  if (displayLanguage && !displayLanguageToShow) {
    return null;
  }

  let hasSubCanvasLanguages;

  if (displayLanguage) {
    hasSubCanvasLanguages = pages.find(
      (page) =>
        page.parentCanvasRepositoryID === node.id &&
        pages.some((page1) => page1.defaultLanguageCanvasRepoId === page.id)
    );
  }

  return (
    <>
      <Box
        sx={{
          margin: "2px 0",
          borderRadius: "6px",
          color: "canvasItem.text",
          opacity: isSearching && !node.match && !isCurrentlySelected ? 0.5 : 1,
          ":hover": {
            bg: "canvasItem.hoverBg",
            ".truncated-text": {
              width:
                isPublicView || getActionMenuData()?.length === 0
                  ? 165 - indent
                  : 145 - indent,
            },
          },
          bg: isCurrentlySelected ? "canvasItem.hoverBg" : "",
        }}
        style={styles}
        className="group flex p-0.5 py-1 items-center cursor-pointer justify-between"
        {...dragOverProps}
      >
        <div className="flex items-center grow">
          {subCanvasCount > 0 && (
            <div className="flex items-center mx-1" onClick={handleToggle}>
              {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </div>
          )}
          <span
            onMouseDown={() => {
              if (branchId !== branch?.id) mutate([branchId, "canvas-branch"]);
            }}
            onClick={() => {
              if (isTabletOrMobile) {
                setIsSideNavOpen(false);
              }
            }}
          >
            <ConditionalLink
              prefetch={isCurrentlySelected ? false : true}
              href={{
                pathname: canvasLink(node),
              }}
              passHref
              as={isCurrentlySelected ? "span" : ""}
            >
              <a
                onClick={
                  isCurrentlySelected
                    ? () => {}
                    : () => {
                        setIsLoading(true);
                      }
                }
              >
                <div className={`flex items-center text-base grow`}>
                  <Box
                    className="flex items-center justify-center"
                    onClick={(e) => !isTabletOrMobile && e.stopPropagation()}
                    sx={{
                      position: "relative",
                      marginRight: "5px",
                      height: "24px",
                      width: "24px",
                      borderRadius: "4px",
                      "&:hover": {
                        backgroundColor: isTabletOrMobile
                          ? ""
                          : "canvasItem.hoverBg",
                      },
                      marginLeft: subCanvasCount === 0 ? "24px" : "0px",
                    }}
                  >
                    {!isTabletOrMobile && canEditBranchName ? (
                      <EmojiPicker
                        onEmojiPicked={addEmojiIconHandler}
                        emoji={<CanvasEmoji />}
                        onOpen={() => {
                          setIsPinned(true);
                        }}
                        onClose={() => {
                          setIsPinned(false);
                        }}
                      />
                    ) : (
                      <CanvasEmoji />
                    )}
                    {node.defaultBranch?.publicAccess ===
                      BranchAccessEnum.PRIVATE && node.icon ? (
                      <div
                        style={{
                          position: "absolute",
                          right: "1px",
                          bottom: "1px",
                        }}
                      >
                        <SmallLockIcon />
                      </div>
                    ) : null}
                  </Box>
                  <Tooltip
                    aria-label={canvasTitle}
                    noDelay
                    sx={{
                      "::after": {
                        bg: "#fff",
                        color: "#24292F",
                        fontWeight: 600,
                        maxWidth: `${200 - indent}px !important`,
                        textAlign: "start",
                      },
                      "::before": {
                        borderTopColor: "#fff !important",
                        color: "#fff",
                      },
                    }}
                    wrap={true}
                  >
                    <Text
                      as="p"
                      className={`text-sm truncated-text`}
                      sx={{
                        color: isCurrentlySelected
                          ? "canvasItem.selectedNodeName"
                          : "canvasItem.nodeName",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        width: open ? 145 - indent : 165 - indent,
                      }}
                      style={{
                        ...nodeTextStyles,
                      }}
                    >
                      {canvasTitle}
                    </Text>
                  </Tooltip>
                </div>
              </a>
            </ConditionalLink>
          </span>
        </div>
        {!isPublicView && getActionMenuData()?.length > 0 && (
          <Button
            ref={anchorRef}
            aria-haspopup="true"
            sx={{
              backgroundColor: `${open ? "canvasItem.hoverBg" : "unset"}`,
              boxShadow: "unset",
              padding: "0",
              width: "20px",
              height: "20px",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "4px",
              display: open ? "flex" : "none",
              "& > span": {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
              ":hover:not([disabled])": {
                backgroundColor: "canvasItem.hoverBg",
                "& svg": {
                  color: "sidebar.collectionTree.kebabHoverGray",
                },
              },
              ":active:not([disabled])": {
                backgroundColor: "canvasItem.hoverBg",
              },
              "& svg": {
                color: "sidebar.collectionTree.kebabDefaultGray",
              },
              "&[aria-expanded=true]": {
                backgroundColor: "canvasItem.hoverBg",
                "& svg": {
                  color: "sidebar.collectionTree.kebabHoverGray",
                },
              },
            }}
            className="group-hover:flex"
            aria-expanded={open}
            onClick={(e: any) => {
              if (!open) {
                setShowVisibilityMenu(false);
              }
              setOpen(!open);
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <KebabHorizontalIcon size={12} />
          </Button>
        )}
      </Box>

      {displayLanguage && !hasSubCanvasLanguages && isOpen && !loading && (
        <Text
          as="p"
          sx={{
            fontSize: "14px",
            color: "text.subtle",
            textAlign: "center",
            marginLeft: "30px",
            marginY: 2,
          }}
        >
          No matching language canvases found
        </Text>
      )}
      {!isPublicView && (
        <Box
          sx={{
            marginLeft: 32 + indent,
            borderLeft: "1px solid",
            borderColor: "canvasItem.border",
          }}
        >
          {showCurrentRepoBranches &&
            branches
              .filter((branch: any) => branch.name !== "main")
              .map((branch) => {
                return (
                  <BranchItem key={branch.id} node={branch} depth={depth} />
                );
              })}
          {showLanguagePages &&
            !displayLanguage &&
            languagePagesForRepo.map((langPage) => (
              <LanguageItem key={langPage.id} node={langPage} depth={depth} />
            ))}
        </Box>
      )}

      {!isPublicView && (
        <ActionMenu open={open} onOpenChange={setOpen} anchorRef={anchorRef}>
          <ActionMenu.Overlay
            align="end"
            sx={{
              overflow: "visible",
            }}
            onClickOutside={() => {
              if (!inheritDialogOpen) {
                setOpen(false);
              }
            }}
          >
            <ActionList>
              {getActionMenuData().map((item) => (
                <ActionList.Item
                  key={item.title}
                  onClick={(e) => {
                    setOpen(false);
                    if (item.title === "Public Access") setOpen(true);
                    else {
                      setShowVisibilityMenu(false);
                    }
                    e.stopPropagation();
                    item.clickHandler();
                  }}
                  sx={{
                    position: "relative",
                  }}
                  variant={item.variant === "danger" ? "danger" : "default"}
                >
                  <ActionList.LeadingVisual>
                    <item.icon />
                  </ActionList.LeadingVisual>
                  {item.title}
                  {item.title === "Public Access" ? (
                    <ActionList.TrailingVisual
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <ChevronRightIcon size="12" />
                    </ActionList.TrailingVisual>
                  ) : null}
                  {showVisibilityMenu && item.title === "Public Access" && (
                    <>
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        sx={{
                          position: "absolute",
                          right: "-155px",
                          top: "-5px",
                          zIndex: "100",
                          bg: "canvasPublicAccessOverlay.bg",
                          borderRadius: "12px",
                          boxShadow: "0px 8px 24px rgba(66, 74, 83, 0.12)",
                        }}
                      >
                        <CanvasPublicAccessOverlay
                          node={node}
                          branch={node.defaultBranch}
                          subCanvasCount={node.subCanvasCount}
                          showVisibilityMenu={setShowVisibilityMenu}
                        />
                      </Box>
                    </>
                  )}
                </ActionList.Item>
              ))}
              <ActionList.Item
                key={"Open in new tab"}
                onClick={(e) => {
                  setOpen(false);
                  if (showVisibilityMenu) {
                    setShowVisibilityMenu(false);
                  }
                  e.stopPropagation();
                  window.open(canvasLink(node));
                }}
                sx={{
                  position: "relative",
                }}
              >
                <ActionList.LeadingVisual>
                  <LinkExternalIcon />
                </ActionList.LeadingVisual>
                {"Open in new tab"}
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )}

      {loading && <BipLoader />}
      {showTranslateModal && (
        <Modal
          hideCloseButton
          closeHandler={() => setShowTranslateModal(false)}
          sx={{
            width: ["80%", "60%", "60%", "35%"],
            borderRadius: "14px",
            padding: 0,
          }}
          zIndex={100}
        >
          <TranslateModal
            closeHandler={() => setShowTranslateModal(false)}
            canvasRepo={node}
          />
        </Modal>
      )}
      {showModal ? (
        modalType === "Delete" ? (
          <ConfirmationDialog
            title="Are you sure?"
            onClose={(e) => onModalAction(e)}
            confirmButtonType="danger"
            confirmButtonContent="Delete"
          >
            You are going to delete canvas <strong>{canvasTitle}</strong>
          </ConfirmationDialog>
        ) : modalType === "EditCanvas" ? (
          <Modal
            closeHandler={closeModalHandler}
            sx={{
              width: ["80%", "60%", "60%", "25%"],
              padding: "0px",
              borderRadius: "14px",
            }}
          >
            <EditModal
              type={modalType}
              title={"Edit Canvas"}
              node={node}
              closeHandler={closeModalHandler}
              isOpen={isOpen}
              toggle={handleToggle}
              onEdit={onModalAction}
            />
          </Modal>
        ) : (
          <Modal
            hideCloseButton
            closeHandler={closeModalHandler}
            sx={{
              width: ["80%", "60%", "60%", "25%"],
            }}
          >
            <CreateModal
              type={modalType}
              node={node}
              closeHandler={closeModalHandler}
              isOpen={isOpen}
              toggle={handleToggle}
              onCreate={onModalAction}
            />
          </Modal>
        )
      ) : null}
    </>
  );
};

export default CanvasItem;
