import { FC } from "react";
import { Text } from "@primer/react";
import BipRouteUtils from "../core/routeUtils";
import LinkWithoutPrefetch from "./LinkWithoutPrefetch";

interface IHandleProps {
  handle: string;
}

const Handle: FC<IHandleProps> = ({ handle }) => {
  return (
    <LinkWithoutPrefetch
      href={BipRouteUtils.getHandleRoute(handle)}
      sx={{
        textDecoration: "none!important",
      }}
    >
      <Text color={"text.muted"} fontWeight={"light"} fontSize="14px">
        @{handle}
      </Text>
    </LinkWithoutPrefetch>
  );
};

export default Handle;
