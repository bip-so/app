import React, { useEffect, useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  GearIcon,
  KebabHorizontalIcon,
  TrashIcon,
  PencilIcon,
} from "@primer/styled-octicons";
import { CollectionDataType, IEditCollectionPayload } from "../types";
import {
  ActionMenu,
  IconButton,
  Button,
  ActionList,
  ConfirmationDialog,
  Box,
  Text,
  Tooltip,
} from "@primer/react";
import CreateCollectionIcon from "../../../icons/CreateCollectionIcon";
import { useToasts } from "react-toast-notifications";
import CollectionService from "../services";
import { PageType, usePages } from "../../../context/pagesContext";
import { useDragOver } from "@minoru/react-dnd-treeview";
import Modal from "../../../components/Modal";
import CreateModal from "./CreateModal";
import { useRouter } from "next/router";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../hooks/useHasPermission";
import {
  CollectionPermissionEnum,
  StudioPermissionEnum,
} from "../../Permissions/enums";
import BipLoader from "../../../components/BipLoader";
import EditModal from "./EditModal";
import { CommentIcon, EyeIcon, LockIcon } from "@primer/octicons-react";
import CollectionPublicAccessOverlay from "../../Canvas/components/CollectionPublicAccessOverlay";
import { useLayout } from "../../../context/layoutContext";
import BipRouteUtils from "../../../core/routeUtils";
import { BranchAccessEnum } from "../../Canvas/enums";
import { useCanvas } from "../../../context/canvasContext";
import { useRightRail } from "../../../context/rightRailContext";
import { usePermissions } from "../../../context/permissionContext";
import { HttpStatusCode } from "../../../commons/enums";
import segmentEvents from "../../../insights/segment";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import { useTranslation } from "next-i18next";
import Link from "next/link";

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

const CollectionItem = (props: any) => {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const anchorRef = React.createRef<HTMLButtonElement>();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const { isTabletOrMobile } = useDeviceDimensions();
  const {
    addNewPages,
    pages,
    updatePages,
    updateCollection,
    deletePage,
    setDrafts,
    drafts,
    addCollection,
    openIds,
    setOpenIds,
    getCollectionCanvases,
  } = usePages();
  const { isPublicView, repo } = useCanvas();
  const { addToast } = useToasts();
  const router = useRouter();
  const { currentStudio } = useStudio();
  const [name, setName] = useState("");
  const { setIsPinned, setIsSideNavOpen } = useLayout();

  const { inheritDialogOpen } = usePermissions();

  const { node, depth, isOpen, onToggle, displayLanguage } = props;

  const getCanvasRoute = isPublicView
    ? BipRouteUtils.getPublicCanvasRoute
    : BipRouteUtils.getCanvasRoute;

  useEffect(() => {
    if (open) {
      setIsPinned(true);
    } else {
      setIsPinned(false);
    }
  }, [open]);

  const getCanvases = async () => {
    setLoading(true);
    await getCollectionCanvases(node, isPublicView);
    setLoading(false);
  };

  const handleToggle = (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isOpen) {
      setOpenIds([...openIds.filter((id) => node.id !== id)]);
    } else {
      setOpenIds([...openIds, node.id]);
    }
    !isOpen &&
      !node.areCanvasesFetched &&
      node.computedRootCanvasCount &&
      getCanvases();
    onToggle(node.id);
  };

  const isCollection = node.type === "COLLECTION";

  const indent = depth * 24;

  const closeModalHandler = () => {
    setShowModal(false);
    setModalType("");
  };

  const createCollection = async (data: any) => {
    const collectionCount = pages.filter(
      (page: any) => page?.type === "COLLECTION"
    )?.length;
    const resp = await CollectionService.createCollection({
      name: data.name,
      position: collectionCount + 1,
      publicAccess: "private",
    });

    const newCollection: CollectionDataType = resp.data.data;
    addCollection(newCollection);
    router.push(
      BipRouteUtils.getCollectionRoute(currentStudio?.handle, newCollection.id)
    );
    closeModalHandler();
  };

  const createCanvas = async () => {
    try {
      isTabletOrMobile && setIsSideNavOpen(false);
      segmentEvents.canvasCreated(
        currentStudio?.handle!,
        node.canvasRepoKey,
        user?.id!
      );
      const resp = await CollectionService.createCanvas({
        name: "New Canvas",
        collectionID: node.id,
        position: 1,
      });

      const newCanvasRepo = resp.data.data;

      await router.push(
        `${getCanvasRoute(
          currentStudio?.handle!,
          newCanvasRepo.name,
          newCanvasRepo.defaultBranch.id
        )}?isNew=true`
      );

      setDrafts([
        {
          ...newCanvasRepo.defaultBranch,
          parent: 1,
          canvasRepoKey: newCanvasRepo.key,
          canvasRepoName: newCanvasRepo.name,
          canvasRepositoryID: newCanvasRepo.id,
          canvasRepositoryId: newCanvasRepo.id,
        },
        ...drafts,
      ]);
      // if (newCanvasRepo.nudge) {
      //   addToast(t("billing.limitExceededWarning"), {
      //     appearance: "warning",
      //     autoDismiss: false,
      //   });
      // }
      if (
        isOpen ||
        (!isOpen && node.areCanvasesFetched) ||
        node.computedRootCanvasCount === 0
      ) {
        const newPage = {
          ...newCanvasRepo,
          parent: newCanvasRepo.collectionID,
        };
        const tempPages = [newPage, ...pages];
        const collectionIndex = tempPages.findIndex(
          (page) => page.id === node.id
        );
        const tempCollection = {
          ...tempPages[collectionIndex],
          computedRootCanvasCount: node.computedRootCanvasCount + 1,
        };
        tempPages[collectionIndex] = tempCollection;
        updatePages(tempPages);
        if (
          (!isOpen && node.areCanvasesFetched) ||
          node.computedRootCanvasCount === 0
        ) {
          handleToggle();
        }
      } else {
        const tempPages = [...pages];
        const collectionIndex = tempPages.findIndex(
          (page) => page.id === node.id
        );
        const tempCollection = {
          ...tempPages[collectionIndex],
          computedRootCanvasCount: node.computedRootCanvasCount + 1,
        };
        tempPages[collectionIndex] = tempCollection;
        updatePages(tempPages);
        handleToggle();
      }
      if (!isOpen) {
        onToggle(node.id);
      }

      closeModalHandler();
    } catch (error) {
      if (error.status === HttpStatusCode.FORBIDDEN) {
        addToast("You don't have permission to perform this action.", {
          appearance: "error",
          autoDismiss: true,
        });
        console.log(error);
      }
    }
  };

  const deleteCollection = async (gesture: string) => {
    if (gesture === "confirm") {
      try {
        await CollectionService.deletePage(node.id);
        deletePage(node.id);
        if (repo.collectionID === node.id) {
          const differentCollectionCanvas = pages.find(
            (page) => page.type === "CANVAS" && node.id !== page.collectionID
          );

          if (differentCollectionCanvas) {
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
        addToast("Collection deleted successfully", {
          appearance: "success",
          autoDismiss: true,
        });
      } catch (error) {}
    } else {
      closeModalHandler();
    }
  };

  const editCollection = async (data: string) => {
    setName(data.name);
    const payload = {
      id: node.id,
      name: data.name,
      computedAllCanvasCount: node.computedAllCanvasCount,
      computedRootCanvasCount: node.computedRootCanvasCount,
      icon: node.icon,
      publicAccess: node.publicAccess,
    };

    const resp = await CollectionService.editCollection(payload);
    addToast("Collection Renamed successfully", {
      appearance: "success",
      autoDismiss: true,
    });
    updateCollection({ ...node, name: data.name });
    closeModalHandler();
  };

  let onModalAction: any;
  switch (modalType) {
    case "Collection":
      onModalAction = createCollection;
      break;
    case "Edit":
      onModalAction = editCollection;
      break;
    case "Canvas":
      onModalAction = createCanvas;
      break;
    case "Delete":
      onModalAction = deleteCollection;
      break;
    default:
  }

  const { isLoggedIn, user } = useUser();
  const canCreateCollection =
    useHasPermission(
      StudioPermissionEnum.STUDIO_CREATE_COLLECTION,
      PermissionContextEnum.Studio
    ) && isLoggedIn;

  const canEditCollectionName =
    useHasPermission(
      CollectionPermissionEnum.COLLECTION_EDIT_NAME,
      PermissionContextEnum.Collection,
      node?.permissionGroup?.permissions
    ) && isLoggedIn;

  const canManagePermissions =
    useHasPermission(
      CollectionPermissionEnum.COLLECTION_MANAGE_PERMS,
      PermissionContextEnum.Collection,
      node?.permissionGroup?.permissions
    ) && isLoggedIn;

  const canDeleteCollection = useHasPermission(
    CollectionPermissionEnum.COLLECTION_DELETE,
    PermissionContextEnum.Collection,
    node?.permissionGroup?.permissions
  );

  const canViewMetaData = useHasPermission(
    CollectionPermissionEnum.COLLECTION_VIEW_METADATA,
    PermissionContextEnum.Collection,
    node?.permissionGroup?.permissions
  );

  const canChangePosition = useHasPermission(
    StudioPermissionEnum.STUDIO_CHANGE_CANVAS_COLLECTION_POSITION,
    PermissionContextEnum.Studio
  );

  const isOnlyCollection =
    pages.reduce((prev, cur) => {
      if (cur.type === "COLLECTION") {
        prev++;
      }

      return prev;
    }, 0) === 1;

  const getActionMenuData = () => {
    const ACTION_MENU_DATA = [];
    if (canCreateCollection) {
      ACTION_MENU_DATA.push({
        title: "Create Collection",
        icon: CreateCollectionIcon,
        clickHandler: () => {
          setShowModal(true);
          setModalType("Collection");
        },
      });
    }
    if (canEditCollectionName) {
      ACTION_MENU_DATA.push({
        title: "Edit Name",
        icon: PencilIcon,
        clickHandler: () => {
          setShowModal(true);
          setModalType("Edit");
        },
      });
    }
    if (canManagePermissions) {
      ACTION_MENU_DATA.push({
        title: "Public Access",
        icon: getPublicAccessIcon(node?.publicAccess),
        clickHandler: () => {
          setShowVisibilityMenu(true);
        },
      });
    }
    if (canDeleteCollection && !isOnlyCollection) {
      ACTION_MENU_DATA.push({
        title: "Delete Collection",
        icon: TrashIcon,
        clickHandler: () => {
          setShowModal(true);
          setModalType("Delete");
        },
      });
    }
    // needs discussion @CC
    if (canViewMetaData || node.publicAccess !== BranchAccessEnum.PRIVATE) {
      if (ACTION_MENU_DATA.length) {
        ACTION_MENU_DATA.push({
          type: "divider",
        });
      }
      ACTION_MENU_DATA.push({
        title: "Create Canvas",
        icon: FileIcon,
        clickHandler: () => {
          if (isLoggedIn) {
            createCanvas();
          } else {
            router.push(BipRouteUtils.getSignInRoute());
          }
        },
      });
    }
    return ACTION_MENU_DATA;
  };

  const dProps = useDragOver(node.id, isOpen, handleToggle);
  const dragOverProps = canChangePosition ? dProps : {};

  const getCollectionRoute = isPublicView
    ? BipRouteUtils.getPublicCollectionRoute
    : BipRouteUtils.getCollectionRoute;

  const colId = parseInt(router.query.collection as string);
  let hasLanguagesToShow;

  if (displayLanguage) {
    hasLanguagesToShow = pages.find(
      (page) =>
        page.language === displayLanguage &&
        page.isLanguageCanvas &&
        page.collectionID === node.id
    );
  }

  const isCurrentlySelected = colId && colId === node.id;

  return (
    <>
      <Box
        style={{ paddingInlineStart: indent }}
        sx={{
          color: "collectionItem.item",
          minHeight: "32px",
          ":hover": {
            bg: "collectionItem.itemHoverBg",
            ".truncated-text": {
              width:
                isPublicView || getActionMenuData()?.length === 0
                  ? "180px"
                  : "160px",
            },
          },
          bg: isCurrentlySelected ? "collectionItem.hoverBg" : "",
        }}
        className="group flex px-0.5 items-center cursor-pointer justify-between rounded"
        {...dragOverProps}
      >
        <div className="flex items-center">
          <div
            className={`flex items-center mx-1  ${
              node?.computedRootCanvasCount > 0 ? "visible" : "invisible"
            }`}
            onClick={handleToggle}
          >
            {isOpen ? (
              <ChevronDownIcon size={16} />
            ) : (
              <ChevronRightIcon size={16} />
            )}
          </div>
          <div className={`flex items-center mr-1 `}>
            {node.publicAccess === BranchAccessEnum.PRIVATE &&
            !node.hasPublicCanvas ? (
              <LockIcon size={14} />
            ) : null}
          </div>

          <Tooltip
            aria-label={node.name}
            noDelay
            sx={{
              "::after": {
                bg: "#fff",
                color: "#24292F",
                fontWeight: 600,
                maxWidth: `210px !important`,
                textAlign: "start",
              },
              "::before": {
                borderTopColor: "#fff !important",
                color: "#fff",
              },
            }}
            wrap={true}
          >
            <Link href={getCollectionRoute(currentStudio?.handle!, node.id)}>
              <Text
                onClick={handleToggle}
                as="p"
                className="text-xs uppercase truncated-text"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: open ? "160px" : "180px",
                  color: isCurrentlySelected
                    ? "collectionItem.selectedNodeName"
                    : "collectionItem.nodeName",
                }}
              >
                {node.name}
              </Text>
            </Link>
          </Tooltip>
        </div>
        {!isPublicView && getActionMenuData()?.length > 0 ? (
          <Button
            ref={anchorRef}
            aria-haspopup="true"
            sx={{
              backgroundColor: `${open ? "collectionItem.hoverBg" : "unset"}`,
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
                backgroundColor: "collectionItem.hoverBg",
                "& svg": {
                  color: "sidebar.collectionTree.kebabHoverGray",
                },
              },
              ":active:not([disabled])": {
                backgroundColor: "collectionItem.hoverBg",
              },
              "& svg": {
                color: "sidebar.collectionTree.kebabDefaultGray",
              },
              "&[aria-expanded=true]": {
                backgroundColor: "collectionItem.hoverBg",
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
            }}
          >
            <KebabHorizontalIcon size={12} />
          </Button>
        ) : (
          <Box height={"20px"} />
        )}
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
              {getActionMenuData().map((item, index) => {
                if (item?.type === "divider") {
                  return <ActionList.Divider key={index} />;
                }
                return (
                  <ActionList.Item
                    key={index}
                    onClick={(e) => {
                      if (item.disabled) {
                        return;
                      }
                      setOpen(false);
                      if (item.title === "Public Access") setOpen(true);
                      else {
                        setShowVisibilityMenu(false);
                      }
                      e.stopPropagation();
                      item.clickHandler();
                    }}
                    variant={item.variant === "danger" ? "danger" : "default"}
                    disabled={item.disabled}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <ActionList.LeadingVisual>
                      {item.icon && <item.icon />}
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
                        <ChevronRightIcon size={12} />
                      </ActionList.TrailingVisual>
                    ) : null}
                    {showVisibilityMenu && item.title === "Public Access" && (
                      <>
                        <Box
                          sx={{
                            position: "absolute",
                            right: "-155px",
                            top: "-5px",
                            zIndex: "100",
                            backgroundColor: "collectionPublicAccessOverlay.bg",
                            borderRadius: "12px",
                            boxShadow: "0px 8px 24px rgba(66, 74, 83, 0.12)",
                          }}
                        >
                          <CollectionPublicAccessOverlay
                            id={node.id}
                            name={node.name}
                            computedAllCanvasCount={node.computedAllCanvasCount}
                            computedRootCanvasCount={
                              node.computedRootCanvasCount
                            }
                            icon={node.icon}
                            showVisibilityMenu={setShowVisibilityMenu}
                            publicAccess={node.publicAccess}
                          />
                        </Box>
                      </>
                    )}
                  </ActionList.Item>
                );
              })}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </Box>
      {displayLanguage && !hasLanguagesToShow && isOpen && !loading && (
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
      {loading && <BipLoader />}
      {showModal ? (
        modalType === "Delete" ? (
          <ConfirmationDialog
            title="Are you sure?"
            onClose={(e) => onModalAction(e)}
            confirmButtonType="danger"
            confirmButtonContent="Delete"
          >
            You are going to delete collection <strong>{node.name}</strong>
          </ConfirmationDialog>
        ) : modalType === "Edit" ? (
          <Modal
            hideCloseButton
            closeHandler={closeModalHandler}
            sx={{
              width: ["80%", "60%", "60%", "25%"],
              padding: "0px",
              borderRadius: "14px",
            }}
          >
            <EditModal
              type={modalType}
              title={"Edit Collection"}
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

export default CollectionItem;
