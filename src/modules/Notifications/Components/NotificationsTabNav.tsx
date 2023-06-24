import { Box, TabNav, IconButton, Text } from "@primer/react";
import { GearIcon, XIcon } from "@primer/octicons-react";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";

interface INotificationTabsProps {
  selectedTabNav: string;
  setSelectedTabNav: (tab: string) => void;
  closeNotificationsContainer: any;
  onClickSettings: () => void;
}

const NotificationTabs: React.FunctionComponent<INotificationTabsProps> = (
  props
) => {
  const { isTabletOrMobile } = useDeviceDimensions();
  const selectedStyle = {
    color: "notifications.tabNav.selected.text",
    ":hover": {
      cursor: "pointer",
    },
    // paddingTop: props.selectedTabNav === "notifications" ? "2px" : "7px",
    // paddingBottom: props.selectedTabNav === "notifications" ? "5px" : "8px",

    marginX:
      props.selectedTabNav === "notifications"
        ? "0px"
        : isTabletOrMobile
        ? "-30px"
        : "0px",
  };
  const unselectedStyle = {
    color: "notifications.tabNav.unSelected.text",
    ":hover": {
      cursor: "pointer",
      color: "notifications.tabNav.unSelected.text",
    },
    paddingTop: "8px",
    paddingBottom: "5px",
    marginX: props.selectedTabNav === "notifications" ? "-10px" : "10px",
  };

  return (
    <Box
      sx={{
        bg: "notifications.tabNav.bg",
        padding: "12px 0px 0px 6px",
        marginBottom: "8px",
        // borderRadius: "12px 12px 0px 0px",
      }}
    >
      <TabNav aria-label="Notifications">
        <TabNav.Link
          selected={props.selectedTabNav === "notifications"}
          onClick={() => props.setSelectedTabNav("notifications")}
          sx={
            props.selectedTabNav === "notifications"
              ? {
                  ...selectedStyle,
                  display: "flex",
                  alignItems: "center",
                  bg: "transparent !important",
                  padding: 0,
                }
              : { ...unselectedStyle, paddingX: 0 }
          }
        >
          <Box
            paddingX={isTabletOrMobile ? "35px" : "32px"}
            display={"flex"}
            alignItems={"center"}
            height={"100%"}
            borderRadius={"6px 6px 0px 0px"}
            bg={
              props.selectedTabNav === "notifications"
                ? "notifications.tabNav.selected.bg"
                : "none"
            }
          >
            <span>Notifications</span>
            {props.selectedTabNav === "notifications" && !isTabletOrMobile ? (
              <IconButton
                aria-label="settings"
                icon={GearIcon}
                onClick={() => {
                  props.onClickSettings();
                }}
                sx={{
                  ":hover": {},
                  background: "none",
                  border: "none",
                  boxShadow: "none",
                }}
              />
            ) : null}
          </Box>
        </TabNav.Link>
        <TabNav.Link
          selected={props.selectedTabNav === "bipmarks"}
          onClick={() => props.setSelectedTabNav("bipmarks")}
          sx={
            props.selectedTabNav === "bipmarks"
              ? { ...selectedStyle, bg: "transparent !important", padding: 0 }
              : { ...unselectedStyle, paddingX: 0 }
          }
        >
          <Box
            paddingX={"52px"}
            height={"100%"}
            display={"flex"}
            alignItems={"center"}
            borderRadius={"6px 6px 0px 0px"}
            bg={
              props.selectedTabNav === "bipmarks"
                ? "notifications.tabNav.selected.bg"
                : "none"
            }
          >
            bipMarks
          </Box>
        </TabNav.Link>
        <Box
          width={"5px"}
          height={"5px"}
          marginLeft={"330px"}
          marginTop={isTabletOrMobile ? "2px" : "-5px"}
          position={"fixed"}
          sx={{ float: "right" }}
        >
          <IconButton
            onClick={props.closeNotificationsContainer}
            icon={XIcon}
            variant="invisible"
            size="small"
            sx={{
              color: "notifications.settings.box1.xIcon",
            }}
          />
        </Box>
      </TabNav>
    </Box>
  );
};

export default NotificationTabs;
