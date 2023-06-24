import { FC, ReactNode, useState } from "react";
import {
  ActionList,
  ActionMenu,
  Box,
  IconButton,
  Text,
  Tooltip,
} from "@primer/react";
import { FaCrown } from "react-icons/fa";

import { CanvasPermissionGroupEnum } from "../../Permissions/enums";
import {
  CommentIcon,
  EyeClosedIcon,
  EyeIcon,
  PencilIcon,
} from "@primer/styled-octicons";
import { PermissionGroup } from "../../Permissions/types";
import { usePermissions } from "../../../context/permissionContext";
import { useTranslation } from "next-i18next";
import CrownIcon from "../../../icons/CrownIcon";

export const getCanvasPGIcon = (permissionGroupSystemName: string) => {
  switch (permissionGroupSystemName) {
    case CanvasPermissionGroupEnum.NONE:
      return <EyeClosedIcon />;
    case CanvasPermissionGroupEnum.VIEW:
      return <EyeIcon />;
    case CanvasPermissionGroupEnum.COMMENT:
      return <CommentIcon />;
    case CanvasPermissionGroupEnum.EDIT:
      return <PencilIcon />;
    case CanvasPermissionGroupEnum.MODERATE:
      return <CrownIcon />;
    default:
      null;
  }
};
interface ICanvasPermissionMenuProps {
  pgSystemName: CanvasPermissionGroupEnum;
  onChange: (permissionGroup: PermissionGroup) => void;

  open?: boolean;
  extraActions?: ReactNode;
  disabled?: boolean;
  isModerator?: boolean;
  tooltipMsg?: string;
}

const CanvasPermissionMenu: FC<ICanvasPermissionMenuProps> = ({
  onChange,
  pgSystemName,
  open,
  extraActions,
  disabled,
  isModerator,
  tooltipMsg,
}) => {
  const { t } = useTranslation();
  const { schema } = usePermissions();

  return disabled ? (
    <Box sx={{ pr: "8px", color: "text.muted" }}>
      <Tooltip
        direction="nw"
        aria-label={
          tooltipMsg
            ? tooltipMsg
            : isModerator
            ? "Cannot update your own permission"
            : "Only moderator can update permission"
        }
      >
        {getCanvasPGIcon(pgSystemName)}
      </Tooltip>
    </Box>
  ) : (
    <span
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <ActionMenu open={open}>
        <ActionMenu.Button
          size={"small"}
          variant="invisible"
          sx={{
            color: "text.muted",
            padding: "4px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {getCanvasPGIcon(pgSystemName)}
        </ActionMenu.Button>
        <ActionMenu.Overlay hidden={disabled} align="end">
          <ActionList selectionVariant="single">
            {schema?.canvas?.permissionGroups
              .filter(
                (pg: PermissionGroup) =>
                  pg.systemName !== CanvasPermissionGroupEnum.VIEW_METADATA &&
                  pg.systemName !== CanvasPermissionGroupEnum.NONE
              )
              .map((permissionGroup: PermissionGroup) => {
                return (
                  <ActionList.Item
                    key={permissionGroup.systemName}
                    onSelect={(event) => onChange(permissionGroup)}
                    selected={pgSystemName === permissionGroup.systemName}
                    sx={{
                      color: "canvasPermissionMenu.item",
                      ":hover:not([aria-disabled])": {
                        color: "canvasPermissionMenu.item",
                      },
                      ":active:not([aria-disabled])": {
                        color: "canvasPermissionMenu.item",
                        background: "none",
                      },
                      ":focus:not([data-focus-visible-added])": {
                        color: "canvasPermissionMenu.item",
                        background: "none",
                      },
                    }}
                  >
                    <ActionList.LeadingVisual>
                      {getCanvasPGIcon(permissionGroup.systemName)}
                    </ActionList.LeadingVisual>
                    <Text as="p" sx={{ color: "canvasPermissionMenu.text" }}>
                      {permissionGroup.displayName}
                    </Text>
                  </ActionList.Item>
                );
              })}
            {extraActions && (
              <>
                <ActionList.Divider />
                {extraActions}
              </>
            )}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </span>
  );
};

export default CanvasPermissionMenu;
