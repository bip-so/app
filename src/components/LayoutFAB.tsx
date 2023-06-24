import { Box } from "@primer/react";
import { ThreeBarsIcon, XIcon } from "@primer/styled-octicons";
import React, { FC } from "react";

interface LayoutFABProps {
  onClick: () => void;
  opened: boolean;
}

const LayoutFAB: FC<LayoutFABProps> = (props) => {
  const { onClick, opened } = props;
  return (
    <Box
      sx={{
        position: "fixed",
        right: "16px",
        bottom: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        boxShadow:
          "0px 1px 3px rgba(0, 0, 0, 0.12), 0px 8px 24px rgba(149, 157, 165, 0.2)",
        bg: "layoutFAB.bg",
        transition: "all 0.5s",
        zIndex: 100,
      }}
      onClick={onClick}
    >
      {opened ? (
        <XIcon color="layputFAB.color" />
      ) : (
        <ThreeBarsIcon color="layputFAB.color" />
      )}
    </Box>
  );
};

export default LayoutFAB;
