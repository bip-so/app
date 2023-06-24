import React, { useEffect, useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
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
  Text,
  Tooltip,
} from "@primer/react";
import { FaLock } from "react-icons/fa";
import Link from "next/link";
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
import { CanvasPermissionEnum } from "../../Permissions/enums";
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
import LanguagesIcon from "../../../icons/LanguagesIcon";
import { LANGUAGE_DATA } from "../../../utils/languagesData";
import { getPublicAccessIcon } from "./CanvasItem";
import { useUser } from "../../../context/userContext";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";

const LanguageItem = (props: any) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const anchorRef = React.createRef<HTMLButtonElement>();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [canvasVisibility, setCanvasVisibility] = useState("");
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const {
    addNewPages,
    pages,

    updatePages,
    updateCollection,
    deletePage,
  } = usePages();
  const { currentStudio } = useStudio();
  const { addToast } = useToasts();
  const { node, depth, isOpen, onToggle } = props;
  const { schema } = usePermissions();

  const { repo, branch, branches, setBranches, isPublicView, setIsLoading } =
    useCanvas();
  const { setIsPinned, setIsSideNavOpen } = useLayout();
  const { isTabletOrMobile } = useDeviceDimensions();
  const { user, isLoggedIn } = useUser();

  const getCanvasRoute = isPublicView
    ? BipRouteUtils.getPublicCanvasRoute
    : BipRouteUtils.getCanvasRoute;

  const showCurrentRepoBranches =
    (node?.id === repo?.id && node.id === branches[0]?.canvasRepositoryId) ||
    branch?.canvasRepositoryId === node.id;

  const indent = depth === 1 ? 18 : 18 + (depth - 1) * 22;

  useEffect(() => {
    if (open) {
      setIsPinned(true);
    } else {
      setIsPinned(false);
    }
  }, [open]);

  const getSubCanvasesAndBranches = async () => {
    setLoading(true);
    // const branchesPromise = CanvasService.getBranches({
    // canvasId: node.id,
    // collectionId: node.collectionID,
    // parentCanvasId: 0,
    // });
    const subCanvasesPromise = CollectionService.getCanvasRepo({
      parentCollectionID: node.collectionID,
      parentCanvasRepositoryID: node.id,
    });
    await Promise.all([subCanvasesPromise])
      .then((responses) => {
        // const branches = responses[0]?.data;
        const subCanvases = responses[0]?.data;
        let tempPages = [...pages];
        const pagesIds = pages.map((page) => page.id);
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
        updatePages(tempPages);
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
      const resp = await CollectionService.getCanvasRepo({
        parentCollectionID: node.collectionID,
        parentCanvasRepositoryID: node.id,
      });
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
    if (e) {
      e.stopPropagation();
    }
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
      if (repo?.id === node.id) {
        const newBranch = resp.data.data;
        const tempPages = [...pages, { ...newBranch, parent: node.id }];
        addToast("Branch Created! Please refresh once!", {
          appearance: "success",
          autoDismiss: true,
        });
        // let tempPages = [...pages, { ...newBranch, parent: node.id }];
        // const tmpBranch = {
        //   ...newBranch,
        //   permissionGroup: schema?.canvas.permissionGroups.find(
        //     (permissionGroup: PermissionGroup) =>
        //       permissionGroup.systemName === newBranch.permission
        //   ),
        // };

        // tempPages = [
        //   ...tempPages,
        //   {
        //     ...tmpBranch,
        //     parent: tmpBranch?.canvasRepositoryId,
        //   },
        // ];

        // setBranches([...branches, tmpBranch]);
        // setBranches(tmpBranch);
        // updatePages(tempPages);
        // onToggle(node.id);

        updatePages(tempPages);
      } else {
        if (!node.areChildrenFetched) {
          getSubCanvas();
          onToggle(node.id);
        }
      }
      closeModalHandler();
    } catch (error) {}
  };

  const createSubCanvas = async () => {
    try {
      const siblingsCount = pages.filter(
        (page) => page.parent === node.id
      ).length;
      const resp = await CollectionService.createSubCanvas({
        name: "Untitled",
        collectionID: node.collectionID,
        parentCanvasRepositoryID: node.id,
        position: siblingsCount + 1,
      });
      const newCanvas = resp.data.data;
      if (isOpen || (!isOpen && node.areChildrenFetched)) {
        const tempPages = [
          ...pages,
          { ...newCanvas, parent: node.id, parentCanvasRepositoryID: node.id },
        ];
        const index = tempPages.findIndex((page) => page.id === node.id);
        const canvasRepo = {
          ...tempPages[index],
          subCanvasCount: node.subCanvasCount + 1,
        };

        tempPages[index] = canvasRepo;

        updatePages(tempPages);
      } else {
        if (!node.areChildrenFetched) {
          getSubCanvas();
          onToggle(node.id);
        }
      }
      router.push(
        BipRouteUtils.getCanvasRoute(
          currentStudio?.handle!,
          newCanvas.name,
          newCanvas.defaultBranch.id
        )
      );

      closeModalHandler();
    } catch (error) {}
  };

  const deleteHandler = async (gesture: string) => {
    if (gesture === "confirm") {
      try {
        await CollectionService.deleteCanvas(node.id);
        deletePage(node.id);
        setDrafts(drafts.filter((draft) => draft.id !== node.defaultBranch.id));
        if (repo.key === node.key) {
          const parentPage = pages.find(
            (page) => page.id === node.defaultLanguageCanvasRepoId
          );
          router.push(
            getCanvasRoute(
              currentStudio?.handle!,
              // parentPage?.key,
              parentPage?.name,
              parentPage?.defaultBranch?.id
            )
          );
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
      });
      updateCollection(newPage);
    } catch (err) {
      console.log(err);
    }
  };
  const editCanvas = async (data: string) => {
    const payload = {
      icon: node.icon,
      name: data.name,
      publicAccess: node.publicAccess,
      coverUrl: node.coverUrl,
    };
    const canvasRepoID: number = node.id;
    console.log(payload);

    const resp = await CollectionService.editCanvas(canvasRepoID, payload);
    addToast("Canvas Renamed successfully", {
      appearance: "success",
      autoDismiss: true,
    });
    updateCollection({ ...node, name: data.name });
    closeModalHandler();
  };

  const canvasPermissionGroup = schema?.canvas?.permissionGroups?.find(
    (permissionGroup: PermissionGroup) =>
      permissionGroup?.systemName === node?.defaultBranch?.permission
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

  const getActionMenuData = () => {
    let ACTION_MENU_DATA = [];

    if (canEditBranch || node?.defaultBranch?.publicAccess === "edit") {
    }
    if (node?.isPublished) {
      ACTION_MENU_DATA = [
        {
          title: "Create Branch",
          icon: GitBranchIcon,
          clickHandler: () => {
            if (isLoggedIn) {
              createBranch();
            } else {
              router.push(BipRouteUtils.getSignInRoute());
            }
          },
        },
      ];

      if (canManagePermissions) {
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

  const parentPage = pages.find(
    (page) => page.id === node.defaultLanguageCanvasRepoId
  );

  const canvasLink = BipRouteUtils.getCanvasRoute(
    currentStudio?.handle!,
    parentPage?.name,
    node.defaultBranch?.id
  );

  const isCurrentlySelected = branch && branch?.id === node?.defaultBranch?.id;
  const ConditionalLink = isCurrentlySelected ? Box : LinkWithoutPrefetch;

  const language = LANGUAGE_DATA.find(
    (lang) => lang.value === node.language
  )?.label;

  return (
    <Box
      sx={{
        margin: "2px 0",
        boxSizing: "border-box",
        borderTopRightRadius: "6px",
        borderBottomRightRadius: "6px",
        ":hover": {
          bg: "languageItem.hoverBg",
        },
        bg: isCurrentlySelected ? "languageItem.hoverBg" : "",
      }}
    >
      <Tooltip text={language}>
        <Box
          className="flex items-center justify-between py-1 cursor-pointer group"
          sx={{
            color: "languageItem.text",
          }}
        >
          <div
            className="flex items-center grow"
            onClick={() => {
              if (isTabletOrMobile) {
                setIsSideNavOpen(false);
              }
            }}
          >
            <ConditionalLink
              prefetch={isCurrentlySelected ? false : true}
              href={{
                pathname: canvasLink,
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
                <div className={` flex items-center text-base grow`}>
                  <Box
                    className="flex items-center"
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      position: "relative",
                      marginRight: "5px",
                      height: "24px",
                      borderRadius: "4px",
                    }}
                  >
                    <Box className=" p-0.5 pl-2 ">
                      <LanguagesIcon />
                    </Box>
                    {node.defaultBranch?.publicAccess ===
                      BranchAccessEnum.PRIVATE && node.icon ? (
                      <div
                        style={{
                          position: "absolute",
                          right: "1px",
                          bottom: "1px",
                        }}
                      >
                        <FaLock size={8} />
                      </div>
                    ) : null}
                  </Box>

                  <Text
                    className={`overflow-hidden text-sm whitespace-nowrap text-ellipsis`}
                    sx={{
                      color: isCurrentlySelected
                        ? "languageItem.selectedNodeName"
                        : "languageItem.nodeName",
                    }}
                    style={{
                      width: 140 - indent,
                    }}
                  >
                    {node.name}
                  </Text>
                </div>
              </a>
            </ConditionalLink>
          </div>
          {!isPublicView && getActionMenuData()?.length > 0 && (
            <Button
              ref={anchorRef}
              aria-haspopup="true"
              sx={{
                backgroundColor: `${open ? "languageItem.hoverBg" : "unset"}`,
                boxShadow: "unset",
                padding: "0",
                width: "20px",
                height: "20px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: "4px",
                visibility: open ? "visible" : "hidden",
                "& > span": {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                },
                "&:hover:not([disabled])": {
                  backgroundColor: "languageItem.hoverBg",
                  "& svg": {
                    color: "sidebar.collectionTree.kebabHoverGray",
                  },
                },
                ":active:not([disabled])": {
                  backgroundColor: "languageItem.hoverBg",
                },
                "& svg": {
                  color: "sidebar.collectionTree.kebabDefaultGray",
                },
                "&[aria-expanded=true]": {
                  backgroundColor: "languageItem.hoverBg",
                  "& svg": {
                    color: "sidebar.collectionTree.kebabHoverGray",
                  },
                },
              }}
              className="group-hover:visible"
              aria-expanded={open}
              onClick={(e: any) => {
                setOpen(!open);
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <KebabHorizontalIcon size={12} />
            </Button>
          )}
        </Box>
      </Tooltip>
      {!isPublicView && (
        <Box
          sx={{
            marginLeft: indent,
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
        </Box>
      )}

      <ActionMenu open={open} onOpenChange={setOpen} anchorRef={anchorRef}>
        <ActionMenu.Overlay align="end">
          <ActionList
            sx={{
              position: "relative",
            }}
          >
            {getActionMenuData()?.map((item) => (
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
                    <ChevronRightIcon size={12} />
                  </ActionList.TrailingVisual>
                ) : null}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      {showVisibilityMenu ? (
        <>
          <Box
            sx={{
              position: "fixed",
              left: "242px",
              zIndex: "100",
              backgroundColor: "canvasPublicAccessOverlay.bg",
              borderRadius: "12px",
              boxShadow: "0px 8px 24px rgba(66, 74, 83, 0.12)",
            }}
          >
            <CanvasPublicAccessOverlay
              node={node}
              branch={node.defaultBranch}
              showVisibilityMenu={setShowVisibilityMenu}
            />
          </Box>
          <Box
            sx={{
              width: "100%",
              height: "100%",
              zIndex: "2",
              position: "fixed",
              top: "0px",
            }}
            onClick={() => setShowVisibilityMenu(false)}
          />
        </>
      ) : null}

      {loading && <BipLoader />}
      {showModal ? (
        modalType === "Delete" ? (
          <ConfirmationDialog
            title="Are you sure?"
            onClose={(e) => onModalAction(e)}
            confirmButtonType="danger"
            confirmButtonContent="Delete"
          >
            You are going to delete canvas <strong>{node.name}</strong>
          </ConfirmationDialog>
        ) : modalType === "EditCanvas" ? (
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
    </Box>
  );
};

export default LanguageItem;
