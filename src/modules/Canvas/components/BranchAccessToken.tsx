import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  IconButton,
  Text,
} from "@primer/react";
import { LinkIcon, XIcon } from "@primer/styled-octicons";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { useCanvas } from "../../../context/canvasContext";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import { canvasSlug } from "../../../core/routeUtils";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../hooks/useHasPermission";
import {
  CanvasPermissionEnum,
  CanvasPermissionGroupEnum,
} from "../../Permissions/enums";
import { PermissionGroup } from "../../Permissions/types";
import { IBranchAccessToken } from "../interfaces";
import CanvasBranchService from "../services/canvasBranch";
import CanvasPermissionMenu, { getCanvasPGIcon } from "./CanvasPermissionMenu";

export enum BranchAccessTokenModeEnum {
  CREATE = "create",
  EDIT = "edit",
}

interface IBranchAccessTokenProps {
  branchAccessToken: IBranchAccessToken;
  mode: BranchAccessTokenModeEnum;
  onCancel?: () => void;
}

const BranchAccessToken: FC<IBranchAccessTokenProps> = ({
  branchAccessToken,
  mode,
  onCancel,
}: IBranchAccessTokenProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { handle, repoKey } = router.query;

  const { user } = useUser();
  const { repo, branch, branchAccessTokens, setBranchAccessTokens } =
    useCanvas();
  const { currentStudio } = useStudio();
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();

  const canManagePermissions = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_MANAGE_PERMS,
    PermissionContextEnum.Canvas,
    branch?.permissionGroup?.permissions
  );

  const handleCreateBranchAccessToken = async (
    permissionGroup: PermissionGroup
  ) => {
    const payload = {
      permissionGroup: permissionGroup.systemName,
    };
    try {
      const { data: newBranchAccessTokenData } =
        await CanvasBranchService.createBranchAccessToken(branch?.id, payload);
      const newBranchAccessToken = {
        ...newBranchAccessTokenData,
        createdByID: user?.id,
      };

      setBranchAccessTokens([...branchAccessTokens, newBranchAccessToken]);
      onCancel && onCancel();
      const url = `${window.location.origin}/${handle}/canvas-invite-token/${
        newBranchAccessToken.inviteCode
      }?canvasTitle=${canvasSlug(repo?.name)}`;
      await navigator.clipboard.writeText(url);
      addToast("Created invite link and copied to clipboard.", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveLink = async () => {
    try {
      const deleteResp = await CanvasBranchService.deleteBranchAccessToken(
        branchAccessToken.inviteCode
      );
      const updatedAccessTokens = branchAccessTokens.filter(
        (accessToken: IBranchAccessToken) =>
          accessToken.inviteCode !== branchAccessToken.inviteCode
      );
      setBranchAccessTokens(updatedAccessTokens);
    } catch (error) {
      console.log("Can't delete");
    }
  };

  const copyLink = async () => {
    setLoading(true);
    try {
      const url = `${window.location.origin}/${handle}/canvas-invite-token/${
        branchAccessToken.inviteCode
      }?canvasTitle=${canvasSlug(repo?.name)}`;
      console.log(url);
      await navigator.clipboard.writeText(url);
      addToast("Copied link to clipboard.", {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              marginRight: "8px",
              borderRadius: "50%",
            }}
          >
            <LinkIcon />
          </Box>

          <Text fontSize={"14px"}>
            {mode === BranchAccessTokenModeEnum.CREATE
              ? t("rightrail.createInviteLink")
              : t("rightrail.inviteLink")}
          </Text>
          {mode !== BranchAccessTokenModeEnum.CREATE && (
            <Button
              disabled={loading}
              sx={{
                color: "selectedUsers.copyLink",
                ":hover": {
                  textDecoration: "underline",
                  bg: "transparent!important",
                },
              }}
              size={"small"}
              variant="invisible"
              onClick={copyLink}
            >
              Copy
            </Button>
          )}
        </Box>
      </div>
      {mode === BranchAccessTokenModeEnum.CREATE ? (
        <CanvasPermissionMenu
          open={true}
          pgSystemName={CanvasPermissionGroupEnum.NONE}
          onChange={handleCreateBranchAccessToken}
          extraActions={
            <ActionList.Item
              variant="danger"
              onSelect={() => onCancel && onCancel()}
            >
              <ActionList.LeadingVisual>
                <XIcon />
              </ActionList.LeadingVisual>
              Cancel
            </ActionList.Item>
          }
        />
      ) : (
        <ActionMenu>
          <ActionMenu.Button
            sx={{
              color: "text.muted",
              padding: "4px",
              display: "flex",
              alignItems: "center",
            }}
            size={"small"}
            variant="invisible"
          >
            {getCanvasPGIcon(branchAccessToken.permissionGroup)}
          </ActionMenu.Button>
          <ActionMenu.Overlay hidden={!canManagePermissions} align="end">
            <ActionList>
              <ActionList.Item variant="danger" onSelect={handleRemoveLink}>
                <ActionList.LeadingVisual>
                  <XIcon />
                </ActionList.LeadingVisual>
                {t("rightrail.removeLink")}
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )}
    </div>
  );
};

export default BranchAccessToken;
