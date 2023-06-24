import { FC, useState } from "react";
import { ActionList, Box, Button, Text } from "@primer/react";
import {
  CheckIcon,
  CommentIcon,
  EyeIcon,
  LockIcon,
  PencilIcon,
} from "@primer/styled-octicons";
import { useToasts } from "react-toast-notifications";
import { useTranslation } from "next-i18next";

import { CanvasDataType } from "../../Collections/types";
import { ICanvasBranch } from "../interfaces";
import { BranchAccessEnum } from "../enums";

import { useCanvas } from "../../../context/canvasContext";
import { usePages } from "../../../context/pagesContext";
import CollectionService from "../../Collections/services";
import Modal from "../../../components/Modal";
import { useRightRail } from "../../../context/rightRailContext";
import { usePermissions } from "../../../context/permissionContext";

export const getPublicAccessIcon = (publicAccess: BranchAccessEnum) => {
  switch (publicAccess) {
    case BranchAccessEnum.PRIVATE:
      return <LockIcon />;
    case BranchAccessEnum.VIEW:
      return <EyeIcon />;
    case BranchAccessEnum.COMMENT:
      return <CommentIcon />;
    case BranchAccessEnum.EDIT:
      return <PencilIcon />;
    default:
      null;
  }
};

interface ICollectionPublicAccessOverlayProps {
  id: number;
  name: string;
  computedAllCanvasCount?: number;
  computedRootCanvasCount: number;
  icon?: string;
  publicAccess: string;
  // branch: ICanvasBranch;
  showVisibilityMenu?: (visibility: boolean) => void;
  onUpdate?: (publicAccess: BranchAccessEnum) => void;
}

const CollectionPublicAccessOverlay: FC<
  ICollectionPublicAccessOverlayProps
> = ({
  id,
  name,
  computedAllCanvasCount,
  computedRootCanvasCount,
  icon,
  publicAccess,
  showVisibilityMenu,
  onUpdate,
}: ICollectionPublicAccessOverlayProps) => {
  // const CollectionPublicAccessOverlay = (props: any) => {
  const { t } = useTranslation();
  const { addToast } = useToasts();
  const { branch: contextBranch, setBranch } = useCanvas();
  const { pages, updatePages } = usePages();

  const { inheritDialogOpen, setInheritDialogOpen } = usePermissions();

  const [visibility, setVisibility] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChangeCollectionPublicAccess = async (
    inheritToCanvases: boolean,
    newVisibility
  ) => {
    const payload = {
      publicAccess: newVisibility,
    };
    setLoading(true);

    try {
      const res = await CollectionService.updateCollectionPublicAccess(
        id,
        payload,
        inheritToCanvases
      );
      addToast("Public Access changed!", {
        appearance: "success",
        autoDismiss: true,
      });
      const tempPages = pages.map((page) => {
        if (page.type === "COLLECTION") {
          if (page.id === id) return { ...page, publicAccess: newVisibility };
        } else {
          if (
            inheritToCanvases &&
            (page.collectionID === id || page.collectionId === id)
          ) {
            return {
              ...page,
              defaultBranch: {
                ...page.defaultBranch,
                publicAccess: newVisibility,
              },
            };
          }
        }
        return page;
      });
      updatePages(tempPages);
      onUpdate && onUpdate(newVisibility);
    } catch (err) {
      addToast("Unable to change Pubic Access!", {
        appearance: "error",
        autoDismiss: true,
      });
      console.log(err);
    }
    if (showVisibilityMenu) showVisibilityMenu(false);
    setInheritDialogOpen(false);

    setLoading(false);
  };

  return (
    <Box>
      <ActionList selectionVariant="single">
        {Object.keys(BranchAccessEnum).map((key) => {
          const branchAccess =
            BranchAccessEnum[key as keyof typeof BranchAccessEnum];
          const selected = branchAccess === publicAccess;
          return (
            <>
              {branchAccess === BranchAccessEnum.PRIVATE ? (
                <ActionList.Divider />
              ) : null}
              <ActionList.Item
                key={key}
                onClick={() => {
                  setVisibility(branchAccess);
                  if (computedRootCanvasCount) {
                    setInheritDialogOpen(true);
                  } else {
                    handleChangeCollectionPublicAccess(false, branchAccess);
                  }
                }}
                selected={selected}
                sx={{
                  color: "collectionPublicAccessOverlay.item",
                  ":hover:not([aria-disabled])": {
                    color: "collectionPublicAccessOverlay.item",
                  },
                  ":active:not([aria-disabled])": {
                    color: "collectionPublicAccessOverlay.item",
                    background: "none",
                  },
                  ":focus:not([data-focus-visible-added])": {
                    color: "collectionPublicAccessOverlay.item",
                    background: "none",
                  },
                }}
              >
                <ActionList.LeadingVisual>
                  {getPublicAccessIcon(branchAccess)}
                </ActionList.LeadingVisual>
                <Text
                  as="p"
                  sx={{ color: "collectionPublicAccessOverlay.text" }}
                >
                  {t(`permission.publicAccess.${branchAccess}`)}
                </Text>
              </ActionList.Item>
            </>
          );
        })}
      </ActionList>
      {inheritDialogOpen ? (
        <Modal
          closeHandler={() => {
            setInheritDialogOpen(false);
          }}
          sx={{ maxWidth: "350px" }}
          hideCloseButton
        >
          <div
            className="flex flex-col space-y-2"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <Text as="p">Set permissions for canvases?</Text>
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="invisible"
                sx={{ color: "collectionPublicAccessOverlay.cancel" }}
                onClick={() => {
                  handleChangeCollectionPublicAccess(false, visibility);
                }}
              >
                No
              </Button>
              <Button
                disabled={loading}
                variant="invisible"
                sx={{ color: "collectionPublicAccessOverlay.apply" }}
                onClick={() => {
                  handleChangeCollectionPublicAccess(true, visibility);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </Box>
  );
};

export default CollectionPublicAccessOverlay;
