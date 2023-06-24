import { BellIcon, PersonIcon, XIcon } from "@primer/octicons-react";
import {
  Box,
  Button,
  FormControl,
  Heading,
  IconButton,
  NavList,
  Text,
} from "@primer/react";
import { useState } from "react";
import StyledTextInput from "../../../components/StyledTextInput";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import NotificationSettingsView from "./NotificationSettingsView";

const NotificationSettings = ({ closeHandler }: any) => {
  const [selection, setSelction] = useState("Notifications");
  const { isTabletOrMobile } = useDeviceDimensions();

  return (
    <Box
      height={"600px"}
      width={"100%"}
      maxWidth={"800px"}
      display={"flex"}
      overflow={"hidden"}
    >
      <Box
        height={"600px"}
        width={"100%"}
        maxWidth={"800px"}
        display={"flex"}
        overflow={"hidden"}
      >
        <Box
          display={"flex"}
          flexDirection={"column"}
          padding={"16px 8px 8px 16px"}
          width={"200px!important"}
          maxWidth={"200px"}
          backgroundColor={"notifications.settings.box1.bg"}
          borderRight={"1px"}
          borderStyle={"solid"}
          borderColor={"notifications.settings.box1.border"}
          alignSelf={"stretch"}
        >
          <Heading
            as="h3"
            // id="workflows-heading"
            sx={{
              fontStyle: "normal",
              fontWeight: "600",
              fontSize: "12px",
              lineHeight: "18px",
              alignItems: "center",
              color: "notifications.settings.box1.heading",
              flex: "none",
              // flexGrow: 1,
            }}
          >
            Settings
          </Heading>
          <NavList
            sx={{
              marginTop: "20px",
              alignItems: "center",
              alignSelf: "stretch",
              position: "fixed",
            }}
            aria-labelledby="workflows-heading"
          >
            <NavList.Item
              sx={{
                maxWidth: "176px",
                height: "44px",
                borderRadius: "6px",
                // textAlign: "center",
                verticalAlign: "baseline",
                padding: "12px",
              }}
              onClick={() => {
                setSelction("Notifications");
              }}
              aria-current={selection === "Notifications"}
            >
              <BellIcon size={16} />
              {isTabletOrMobile ? null : (
                <Text
                  sx={{
                    // fontStyle: "normal"
                    marginLeft: "5px",
                    fontWeight: 600,
                    fontSize: "14px",
                    lineHeight: "20px",
                    color: "notifications.settings.box1.text",
                    alignSelf: "stretch",
                  }}
                >
                  Notifications
                </Text>
              )}
            </NavList.Item>
            {/* <NavList.Item
            sx={{
              width: "176px",
              height: "44px",
              borderRadius: "6px",
              // textAlign: "center",
              verticalAlign: "baseline",
              padding: "12px",
            }}
            onClick={() => {
              setSelction("Connect accounts");
            }}
            aria-current={selection === "Connect accounts"}
          >
            <PersonIcon size={16} />
            <Text
              sx={{
                // fontStyle: "normal"
                marginLeft: "5px",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "20px",
                color: "darkCyanBlue",
                alignSelf: "stretch",
              }}
            >
              Connect accounts
            </Text>
          </NavList.Item> */}
          </NavList>
        </Box>
        {selection === "Notifications" ? (
          <NotificationSettingsView closeHandler={closeHandler} />
        ) : (
          <Box
            // width={"888px"}
            alignContent={"center"}
            sx={{
              padding: "200px",
            }}
            // p={"200px"}
          >
            <Heading
              sx={{
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              Under Construction
            </Heading>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          // position: "absolute",
          marginTop: "15px",
          marginRight: "15px",
          float: "right",
        }}
        height={"15px"}
      >
        {isTabletOrMobile && closeHandler()}
        <IconButton
          onClick={closeHandler}
          size={"small"}
          icon={XIcon}
          variant="invisible"
          sx={{ zIndex: 1, color: "notifications.settings.box1.xIcon" }}
        />
      </Box>
      {/* <Button
        sx={{
          height: "3px",
        }}
        onClick={closeHandler}
      >
        X
      </Button> */}
    </Box>
  );
  //   alert("opening notification settings");
};
export default NotificationSettings;
