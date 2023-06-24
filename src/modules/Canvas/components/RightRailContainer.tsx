import { Box, useOnOutsideClick } from "@primer/react";
import { FC, useEffect, useLayoutEffect, useRef } from "react";
import { ChildrenProps } from "../../../commons/types";
import { useRightRail } from "../../../context/rightRailContext";

interface RightRailContainerProps extends ChildrenProps {
  sx?: object;
  onClickOutSideRightRail?: () => void;
  ignoredRefs?: any[];
}

const RightRailContainer: FC<RightRailContainerProps> = ({
  children,
  sx,
  onClickOutSideRightRail,
  ignoredRefs,
}: RightRailContainerProps) => {
  const containerRef = useRef(null);
  const { pinned } = useRightRail();

  onClickOutSideRightRail &&
    useOnOutsideClick({
      onClickOutside: () => {
        if (!pinned) {
          onClickOutSideRightRail && onClickOutSideRightRail();
        }
      },
      containerRef: containerRef,
      ignoreClickRefs: ignoredRefs,
    });

  return (
    <Box
      width="360px!important"
      position="fixed"
      sx={{
        height: "calc(100% - 40px)",
        right: "0px",
        top: "80px",
        marginTop: "-40px",
        transition: "all 0.2s ease-out 0s",
        bg: "rightRailContainer.bg",
        borderLeft: "1px solid",
        borderLeftColor: "border.default",
        ...(sx ? sx : {}),
      }}
      ref={containerRef}
    >
      <div
        className="flex flex-col flex-1 h-full space-y-2 overflow-y-auto"
        style={{ overflow: "visible" }}
      >
        {children}
      </div>
    </Box>
  );
};

export default RightRailContainer;
