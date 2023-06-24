import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  ConfirmationDialog,
  Text,
  Truncate,
} from "@primer/react";
import {
  GitBranchIcon,
  KebabHorizontalIcon,
  TrashIcon,
  XIcon,
} from "@primer/styled-octicons";
import Link from "next/link";
import { useRouter } from "next/router";
import { createRef, FC, useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { mutate } from "swr";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";
import { useCanvas } from "../../../context/canvasContext";
import { useLayout } from "../../../context/layoutContext";
import { usePages } from "../../../context/pagesContext";
import { useStudio } from "../../../context/studioContext";
import BipRouteUtils from "../../../core/routeUtils";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import DraftIcon from "../../../icons/DraftIcon";
import CanvasBranchService from "../../Canvas/services/canvasBranch";

const BranchItem: FC = (props: any) => {
  const { addToast } = useToasts();
  const { branch, repo, setIsLoading, setBranches, branches } = useCanvas();
  const { setIsPinned, setIsSideNavOpen } = useLayout();
  const { isTabletOrMobile } = useDeviceDimensions();
  const { currentStudio } = useStudio();
  const { pages, updatePages, drafts, setDrafts } = usePages();
  const router = useRouter();

  const slug = router.query.slug as string;
  const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);

  const { node, depth, canDrag } = props;

  const anchorRef = createRef<HTMLButtonElement>();
  const [open, setOpen] = useState(false);

  // const branchLink = `/@${currentStudio?.handle}/${node.name}`;
  const branchLink = BipRouteUtils.getCanvasRoute(
    currentStudio?.handle!,
    repo?.name!,
    node.id,
    false,
    node.isDraft
  );

  const indent = depth * 24;

  useEffect(() => {
    if (open) {
      setIsPinned(true);
    } else {
      setIsPinned(false);
    }
  }, [open]);

  const deleteBranch = async () => {
    try {
      const deleteResponse = await CanvasBranchService.deleteBranch(node.id);
      const tempPages = pages.filter((page: any) => page.id !== node.id);
      updatePages(tempPages);

      // Drafts
      const updatedDrafts = drafts.filter((draft: any) => draft.id !== node.id);
      setDrafts(updatedDrafts);
      setBranches(branches.filter((branch) => branch.id !== node.id));
      if (branch.id === node.id) {
        if (+router.query.roughBranchId === node.id) {
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
      addToast("Branch deleted successfully", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      addToast("Can't delete branch", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleConfirm = (type: string) => {
    if (type === "confirm") {
      deleteBranch();
    } else {
      setOpen(false);
    }
  };

  const ACTION_MENU_DATA = [
    {
      title: "Delete Branch",
      icon: TrashIcon,
      clickHandler: () => {
        deleteBranch();
      },
    },
  ];

  const isCurrentlySelected = branch?.id === node.id;
  const ConditionalLink = isCurrentlySelected ? Box : LinkWithoutPrefetch;

  return (
    <Box
      sx={{
        ":hover": {
          bg: "brachItem.hoverBg",
        },
        borderTopRightRadius: "6px",
        borderBottomRightRadius: "6px",
        bg: isCurrentlySelected ? "brachItem.hoverBg" : "",
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
          pathname: branchLink,
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
          <Box
            id={"branch-selector-btn"}
            className="group flex py-1.5 items-center cursor-pointer justify-between"
            sx={{ color: "brachItem.text" }}
          >
            <div className="flex items-center pl-2">
              <div className={`flex items-center text-sm`}>
                {node.isRoughBranch ? (
                  <Box
                    as={"span"}
                    className="mr-1"
                    sx={{ color: "brachItem.text" }}
                  >
                    <DraftIcon />{" "}
                  </Box>
                ) : (
                  <GitBranchIcon className="mr-1" />
                )}
                <Text
                  className={`text-sm overflow-hidden whitespace-nowrap text-ellipsis`}
                  sx={{
                    color: isCurrentlySelected
                      ? "brachItem.selectedNodeName"
                      : "brachItem.text",
                    width: 145 - indent,
                  }}
                >
                  {node.isRoughBranch && branch?.mergeRequest
                    ? "Draft Under Review"
                    : node.isRoughBranch
                    ? "Draft"
                    : "Branch"}
                </Text>
              </div>
            </div>
            <Button
              ref={anchorRef}
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
                visibility: open ? "visible" : "hidden",
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
                setOpen(true);
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <XIcon size={12} />
            </Button>
          </Box>
        </a>
      </ConditionalLink>
      {open ? (
        <ConfirmationDialog
          title="Are you sure?"
          onClose={handleConfirm}
          confirmButtonType="danger"
          confirmButtonContent="Delete"
        >
          You are going to delete the {node.isRoughBranch ? "draft" : "branch"}
        </ConfirmationDialog>
      ) : null}
      {/* <ActionMenu open={open} onOpenChange={setOpen} anchorRef={anchorRef}>
        <ActionMenu.Overlay align="end">
          <ActionList>
            {ACTION_MENU_DATA.map((item) => (
              <ActionList.Item
                key={item.title}
                onClick={(e) => {
                  setOpen(false);
                  e.stopPropagation();
                  item.clickHandler();
                }}
                variant={item.variant === "danger" ? "danger" : "default"}
              >
                <ActionList.LeadingVisual>
                  <item.icon />
                </ActionList.LeadingVisual>
                {item.title}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu> */}
    </Box>
  );
};

export default BranchItem;
