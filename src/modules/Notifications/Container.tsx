import { useState } from "react";
import { Box } from "@primer/react";

import NotificationTabs from "./Components/NotificationsTabNav";
import NotificationContainer from "./Components/NotificationContainer";
import BipMarkContainer from "./Components/BipMarks/BipmarkContainer";
import useDeviceDimensions from "../../hooks/useDeviceDimensions";

interface IContainerProps {
  closeNotificationsContainer: () => void;
  markNotificationsAsRead: (val: number) => void;
  onClickSettings: () => void;
}

const NotificationsAndBipmarks: React.FunctionComponent<IContainerProps> = (
  props
) => {
  const [selectedTabNav, setSelectedTabNav] = useState("notifications");
  props.markNotificationsAsRead(0);
  const { isTabletOrMobile } = useDeviceDimensions();

  return (
    <Box
      sx={{
        height: "80vh",
        width: "370px",
        padding: "0px 0px 62px",
        backgroundColor: "notifications.bg",
        overflow: "hidden",
      }}
    >
      {!isTabletOrMobile && (
        <NotificationTabs
          selectedTabNav={selectedTabNav}
          setSelectedTabNav={setSelectedTabNav}
          closeNotificationsContainer={props.closeNotificationsContainer}
          onClickSettings={props.onClickSettings}
        />
      )}
      {selectedTabNav === "notifications" ? (
        <NotificationContainer
          closeNotificationsContainer={props.closeNotificationsContainer}
        />
      ) : (
        <BipMarkContainer />
      )}
      {isTabletOrMobile && (
        <NotificationTabs
          selectedTabNav={selectedTabNav}
          setSelectedTabNav={setSelectedTabNav}
          closeNotificationsContainer={props.closeNotificationsContainer}
          onClickSettings={props.onClickSettings}
        />
      )}
    </Box>
  );
};

export default NotificationsAndBipmarks;
