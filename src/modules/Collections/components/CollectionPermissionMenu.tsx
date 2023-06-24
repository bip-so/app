import {
  CommentIcon,
  EyeClosedIcon,
  EyeIcon,
  PencilIcon,
} from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  Box,
  IconButton,
  Tooltip,
} from "@primer/react";
import { FC, ReactNode } from "react";
import { FaCrown } from "react-icons/fa";
import { usePermissions } from "../../../context/permissionContext";
import CrownIcon from "../../../icons/CrownIcon";
import { CollectionPermissionGroupEnum } from "../../Permissions/enums";
import { PermissionGroup } from "../../Permissions/types";

export const getCollectionPGIcon = (permissionGroupSystemName: string) => {
  switch (permissionGroupSystemName) {
    case CollectionPermissionGroupEnum.NONE:
      return <EyeClosedIcon />;
    case CollectionPermissionGroupEnum.VIEW:
      return <EyeIcon />;
    case CollectionPermissionGroupEnum.COMMENT:
      return <CommentIcon />;
    case CollectionPermissionGroupEnum.EDIT:
      return <PencilIcon />;
    case CollectionPermissionGroupEnum.MODERATE:
      return <CrownIcon />;
    default:
      return <EyeClosedIcon />;
  }
};

interface ICollectionPermissionMenuProps {
  pgSystemName: CollectionPermissionGroupEnum;
  onChange: (permissionGroup: PermissionGroup) => void;
  disabled?: boolean;
  extraActions?: ReactNode;
  tooltipText?: string;
}

const CollectionPermissionMenu: FC<ICollectionPermissionMenuProps> = ({
  pgSystemName,
  onChange,
  disabled,
  extraActions,
  tooltipText,
}) => {
  const { schema } = usePermissions();

  return disabled ? (
    tooltipText ? (
      <Tooltip aria-label={tooltipText} direction="nw">
        <Box sx={{ pr: "8px", color: "text.muted" }}>
          {getCollectionPGIcon(pgSystemName)}
        </Box>
      </Tooltip>
    ) : (
      <Box sx={{ pr: "8px", color: "text.muted" }}>
        {getCollectionPGIcon(pgSystemName)}
      </Box>
    )
  ) : (
    <span
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <ActionMenu>
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
          {getCollectionPGIcon(pgSystemName)}
        </ActionMenu.Button>
        <ActionMenu.Overlay hidden={disabled} align="end">
          <ActionList>
            {schema?.collection?.permissionGroups
              .filter(
                (pg: PermissionGroup) =>
                  pg.systemName !==
                    CollectionPermissionGroupEnum.VIEW_METADATA &&
                  pg.systemName !== CollectionPermissionGroupEnum.NONE
              )
              .map((permissionGroup: PermissionGroup) => {
                return (
                  <ActionList.Item
                    key={permissionGroup.systemName}
                    onSelect={(event) => onChange(permissionGroup)}
                  >
                    <ActionList.LeadingVisual>
                      {getCollectionPGIcon(permissionGroup.systemName)}
                    </ActionList.LeadingVisual>
                    {permissionGroup.displayName}
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

export default CollectionPermissionMenu;
