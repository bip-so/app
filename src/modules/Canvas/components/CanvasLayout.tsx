import { PageLayout } from "@primer/react";
import { FC, ReactNode } from "react";
import { useCanvas } from "../../../context/canvasContext";
import { useLayout } from "../../../context/layoutContext";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";

interface ICanvasLayoutProps {
  header: ReactNode;
  content: ReactNode;
}

const CanvasLayout: FC<ICanvasLayoutProps> = ({ header, content }) => {
  const { isSideNavOpen } = useLayout();

  const { isTabletOrMobile } = useDeviceDimensions();

  const { isPublicView } = useCanvas();

  const sidebarWidth = isPublicView ? "240px" : "250px";

  return (
    <PageLayout
      sx={{
        position: "relative",
      }}
      columnGap="none"
      containerWidth="full"
      padding="none"
    >
      <PageLayout.Header
        sx={{
          height: "40px!important",
          marginBottom: "none!important",
          position: "fixed",
          zIndex: 99,
          width: isTabletOrMobile
            ? "100%"
            : isSideNavOpen
            ? `calc(100% - ${sidebarWidth})`
            : "100%",
        }}
      >
        {header}
      </PageLayout.Header>

      <PageLayout.Content
        sx={{
          display: "flex",
          marginTop: "40px",
          width: "100%",
          justifyContent: "center",
          marginX: "auto",
          paddingLeft: "auto",
          paddingRight: "auto",
          zIndex: 98,
        }}
      >
        {content}
      </PageLayout.Content>
    </PageLayout>
  );
};

export default CanvasLayout;
