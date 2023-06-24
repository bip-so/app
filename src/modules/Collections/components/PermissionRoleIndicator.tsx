import { Box } from "@primer/react";
import { FC } from "react";

interface IPermissionRoleIndicatorProps {}

const PermissionRoleIndicator: FC<IPermissionRoleIndicatorProps> = (props) => {
  return (
    <Box
      ml="8px"
      height="8px"
      width="8px"
      bg="studioSettings.role.indicatorBg"
      borderRadius="50%"
      display="inline-block"
    ></Box>
  );
};

export default PermissionRoleIndicator;
