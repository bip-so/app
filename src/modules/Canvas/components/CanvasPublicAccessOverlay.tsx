import React, { FC, Fragment, useImperativeHandle, useState } from "react";
import { ActionList, Button, Text } from "@primer/react";
import {
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
import segmentEvents from "../../../insights/segment";
import { useStudio } from "../../../context/studioContext";

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

export const getPublicAccessDescription = (publicAccess: BranchAccessEnum) => {
  switch (publicAccess) {
    case BranchAccessEnum.PRIVATE:
      return "rightrail.anyonePrivateDescription";
    case BranchAccessEnum.COMMENT:
      return "rightrail.anyoneCommentDescription";
    case BranchAccessEnum.EDIT:
      return "rightrail.anyoneEditDescription";
    default:
      return "rightrail.anyoneViewDescription";
  }
};

interface ICanvasPublicAccessOverlayProps {
  node?: any;
  branch: ICanvasBranch;
  subCanvasCount?: number;
  showVisibilityMenu?: (visibility: boolean) => void;
}

const CanvasPublicAccessOverlay: FC<ICanvasPublicAccessOverlayProps> =
  React.forwardRef(
    (
      {
        node,
        branch,
        subCanvasCount,
        showVisibilityMenu,
      }: ICanvasPublicAccessOverlayProps,
      ref
    ) => {
      const { t } = useTranslation();
      const { addToast } = useToasts();
      const { branch: contextBranch, setBranch, repo } = useCanvas();
      const { pages, updatePages, updateCollection } = usePages();
      const { inheritDialogOpen, setInheritDialogOpen } = usePermissions();
      const { currentStudio } = useStudio();

      const [visibility, setVisibility] = useState<any>("");
      const [loading, setLoading] = useState<boolean>(false);

      const handleChangeBranchPublicAccess = async (
        inheritToSubCanvases: boolean,
        newVisibility
      ) => {
        setLoading(true);
        try {
          segmentEvents.canvasAccessChanged(
            currentStudio?.handle!,
            repo?.key,
            repo?.name,
            branch.publicAccess,
            newVisibility
          );
          const res = await CollectionService.changeVisibility(
            {
              canvasBranchId: branch.id,
              visibility: newVisibility,
            },
            inheritToSubCanvases
          );
          addToast("Public Access changed!", {
            appearance: "success",
            autoDismiss: true,
          });
          if (res.data?.nudge && newVisibility === BranchAccessEnum.PRIVATE) {
            addToast(t("billing.limitExceededWarning"), {
              appearance: "warning",
              autoDismiss: false,
            });
          }
          setBranch({
            ...contextBranch!,
            publicAccess: newVisibility,
          });
          let tempPages = pages.map((page: any) =>
            page.defaultBranchID === branch.id ||
            (inheritToSubCanvases &&
              (page.parent === branch?.canvasRepositoryID ||
                page.parent === branch?.CanvasRepositoryId))
              ? {
                  ...page,
                  defaultBranch: {
                    ...page.defaultBranch,
                    publicAccess: newVisibility,
                  },
                }
              : page
          );
          const index = pages.findIndex(
            (ele) => ele?.id === node?.collectionID
          );
          if (
            (newVisibility === BranchAccessEnum.PRIVATE &&
              tempPages
                .filter(
                  (page) =>
                    page.type === "CANVAS" &&
                    page.collectionID === node?.collectionID
                )
                .some(
                  (ele) =>
                    ele.defaultBranch?.publicAccess === BranchAccessEnum.EDIT ||
                    ele.defaultBranch?.publicAccess ===
                      BranchAccessEnum.COMMENT ||
                    ele.defaultBranch?.publicAccess === BranchAccessEnum.VIEW
                )) ||
            newVisibility !== BranchAccessEnum.PRIVATE
          ) {
            tempPages[index].hasPublicCanvas = true;
          } else {
            tempPages[index].hasPublicCanvas = false;
          }

          updatePages(tempPages);
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

      const isInheritDialogOpened = () => {
        return inheritDialogOpen;
      };

      useImperativeHandle(ref, () => ({ isInheritDialogOpened }));

      return (
        <>
          <ActionList selectionVariant="single">
            {Object.keys(BranchAccessEnum).map((key, index) => {
              const branchAccess =
                BranchAccessEnum[key as keyof typeof BranchAccessEnum];
              const selected = branchAccess === branch?.publicAccess;
              return (
                <Fragment key={index}>
                  {branchAccess === BranchAccessEnum.PRIVATE ? (
                    <ActionList.Divider />
                  ) : null}
                  <ActionList.Item
                    onClick={() => {
                      setVisibility(branchAccess);
                      if (subCanvasCount) {
                        setInheritDialogOpen(true);
                      } else {
                        handleChangeBranchPublicAccess(false, branchAccess);
                      }
                    }}
                    selected={selected}
                    sx={{
                      color: "canvasPublicAccessOverlay.item",
                      ":hover:not([aria-disabled])": {
                        color: "canvasPublicAccessOverlay.item",
                      },
                      ":active:not([aria-disabled])": {
                        color: "canvasPublicAccessOverlay.item",
                        background: "none",
                      },
                      ":focus:not([data-focus-visible-added])": {
                        color: "canvasPublicAccessOverlay.item",
                        background: "none",
                      },
                    }}
                  >
                    <ActionList.LeadingVisual>
                      {getPublicAccessIcon(branchAccess)}
                    </ActionList.LeadingVisual>
                    <Text
                      as="p"
                      sx={{ color: "canvasPublicAccessOverlay.text" }}
                    >
                      {t(`permission.publicAccess.${branchAccess}`)}
                    </Text>
                  </ActionList.Item>
                </Fragment>
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
              <div className="flex flex-col space-y-2">
                <Text as="p">Set permissions for sub canvases?</Text>
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="invisible"
                    sx={{ color: "canvasPublicAccessOverlay.cancel" }}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      handleChangeBranchPublicAccess(false, visibility);
                    }}
                    disabled={loading}
                  >
                    No
                  </Button>
                  <Button
                    disabled={loading}
                    variant="invisible"
                    sx={{ color: "canvasPublicAccessOverlay.apply" }}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      handleChangeBranchPublicAccess(true, visibility);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </Modal>
          ) : null}
        </>
      );
    }
  );

export default CanvasPublicAccessOverlay;
