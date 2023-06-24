import { MailIcon } from "@primer/octicons-react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  FormControl,
  Text,
} from "@primer/react";
import { useEffect, useState } from "react";
import BipIcon from "../../../icons/BipIcon";
import DiscordIcon from "../../../icons/DiscordIcon";
import EmailIcon from "../../../icons/EmailIcon";
import NotificationService from "../services";
import { useToasts } from "react-toast-notifications";
import SlackIcon from "../../../icons/SlackIcon";

const NOTIFICATION_SETTINGS = {
  "All comments": "allComments",
  "Replies to me": "repliesToMe",
  Mentions: "mentions",
  Reactions: "reactions",
  "Invite to canvas": "invite",
  "Followed me": "followedMe",
  "Followed my Workspace": "followedMyStudio",
  //"Followed my workapce": "followedMyWorkspace",
  "Publish / Merge requests": "publishAndMergeRequests",
  "Responses to my requests": "responseToMyRequests",
  "System notifications": "systemNotifications",
  // "Dark Mode": "darkMode",
};

interface INotificationSettingsViewProps {}

const NotificationSettingsView: React.FunctionComponent<
  INotificationSettingsViewProps
> = ({ closeHandler }: any) => {
  const [titleList, setTitleList] = useState([]);
  const [settings, setSettings] = useState({
    app: {},
    discord: {},
    email: {},
    slack: {},
  });
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [change, setChange] = useState(false);
  const { addToast } = useToasts();

  const saveHandler = async () => {
    const data = settings;
    const finalarr = [
      settings.app,
      settings.discord,
      settings.email,
      settings.slack,
    ];
    const payload = { data: finalarr };

    setIsLoading(true);
    try {
      if (!loading) {
        await NotificationService.updateSettings(payload);
        addToast(`Notification Settings saved sucessfully`, {
          appearance: "success",
          autoDismiss: true,
        });
      }
    } catch (error) {
      addToast(`Unable to save. Please try again after some time!`, {
        appearance: "error",
        autoDismiss: true,
      });
    }
    setIsLoading(false);
    setChange(false);
  };

  useEffect(() => {
    setLoading(true);
    NotificationService.getSettings()
      .then((resp) => {
        const { data: final } = resp;
        const obj = {
          app: final.data.app,
          discord: final.data.discord,
          email: final.data.email,
          slack: final.data.slack,
        };
        setSettings(obj);
        console.log(obj);
      })

      .catch((err) => {});
    setLoading(false);
  }, []);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      alignItems={"flex-start"}
      paddingX={"32px"}
      paddingY={"40px"}
      maxWidth={"600px"}
      width={"100%"}
      minWidth={"312px"}
      height={"588px"}
      order={2}
    >
      {/* <form onSubmit={saveHandler}> */}
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"flex-start"}
        maxWidth={"500px!important"}
        width={"100%!important"}
        // width={"536px"}
        height={"344px"}
      >
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          // alignItems={"center"}
          maxWidth={"500px!important"}
          width={"100%!important"}
          // sx={{ gap: "10%" }}
          height={"24px"}
          alignSelf={"stretch"}
        >
          <Text
            sx={{
              fontStyle: "normal",
              fontWeight: "600",
              fontSize: "14px",
              lineHeight: "20px",
              display: "flex",
              alignItems: "center",
              color: "notifications.settings.box2.platform",
            }}
          >
            Platform
          </Text>
          <Box
            display={"inline-flex"}
            flexWrap={"wrap"}
            sx={{
              marginRight: "5px",
              gap: "37px",
            }}
            height={"24px"}
          >
            {settings?.app.id !== 0 ? <BipIcon /> : null}
            {settings?.discord.id !== 0 ? <DiscordIcon /> : null}
            {settings?.email.id !== 0 ? <EmailIcon /> : null}
            {settings?.slack.id !== 0 ? <SlackIcon /> : null}
          </Box>
        </Box>
        <Box
          maxWidth={"500px"}
          width={"100%!important"}
          borderTop={"2px"}
          borderStyle={"solid"}
          borderColor={"notifications.settings.box2.border"}
          marginTop={"8px"}
        />
        <Box maxWidth={"500px"} width={"100%"}>
          {Object.keys(NOTIFICATION_SETTINGS).map((option, i) => {
            return (
              <Box
                key={i}
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                height={"24px"}
                alignSelf={"stretch"}
                marginTop={"8px"}
              >
                <Text
                  sx={{
                    fontStyle: "normal",
                    fontWeight: "400",
                    fontSize: "14px",
                    lineHeight: "20px",
                    display: "flex",
                    alignItems: "center",
                    color: "text.black",
                  }}
                >
                  {option}
                </Text>
                <Box marginRight={"10px"} height={"24px"}>
                  <form className="inline-flex flex-wrap gap-12">
                    {settings?.app.id !== 0 ? (
                      <FormControl
                        sx={
                          {
                            // marginRight: "30px",
                          }
                        }
                      >
                        <FormControl.Label visuallyHidden></FormControl.Label>
                        <Checkbox
                          checked={settings?.app[NOTIFICATION_SETTINGS[option]]}
                          onChange={(value) => {
                            setChange(true);
                            settings.app[NOTIFICATION_SETTINGS[option]] =
                              value.target.checked;
                            setSettings({ ...settings });
                          }}
                        />
                      </FormControl>
                    ) : null}
                    {settings?.discord.id !== 0 ? (
                      <FormControl
                        sx={
                          {
                            // marginRight: "30px",
                          }
                        }
                      >
                        <FormControl.Label visuallyHidden></FormControl.Label>
                        <Checkbox
                          checked={
                            settings?.discord[NOTIFICATION_SETTINGS[option]]
                          }
                          onChange={(value) => {
                            setChange(true);
                            settings.discord[NOTIFICATION_SETTINGS[option]] =
                              value.target.checked;
                            setSettings({ ...settings });
                          }}
                        />
                      </FormControl>
                    ) : null}
                    {settings?.email.id !== 0 ? (
                      <FormControl>
                        <FormControl.Label visuallyHidden></FormControl.Label>
                        <Checkbox
                          checked={
                            settings?.email[NOTIFICATION_SETTINGS[option]]
                          }
                          onChange={(value) => {
                            setChange(true);
                            settings.email[NOTIFICATION_SETTINGS[option]] =
                              value.target.checked;
                            setSettings({ ...settings });
                          }}
                        />
                      </FormControl>
                    ) : null}
                    {settings?.slack.id !== 0 ? (
                      <FormControl>
                        <FormControl.Label visuallyHidden></FormControl.Label>
                        <Checkbox
                          checked={
                            settings?.slack[NOTIFICATION_SETTINGS[option]]
                          }
                          onChange={(value) => {
                            setChange(true);
                            settings.slack[NOTIFICATION_SETTINGS[option]] =
                              value.target.checked;
                            setSettings({ ...settings });
                          }}
                        />
                      </FormControl>
                    ) : null}
                  </form>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box
          maxWidth={"500px"}
          width={"100%"}
          borderTop={"2px"}
          borderStyle={"solid"}
          borderColor={"notifications.settings.box2.border"}
          marginTop={"8px"}
        />
        <Box
          display={"flex"}
          justifyContent={"right"}
          alignItems={"center"}
          maxWidth={"500px"}
          width={"100%"}
          height={"24px"}
          // alignSelf={"stretch"}
          marginTop={"20px"}
          // position={"absolute"}
          // top={"600px"}
          // right={"500px"}
        >
          <Button
            size={"medium"}
            type={"button"}
            sx={{
              ":focus:not([disabled])": { boxShadow: "none" },
              border: "none",
              boxShadow: "none",
              bg: "none",
            }}
            onClick={closeHandler}
          >
            Cancel
          </Button>
          <Button
            disabled={!change}
            size={"medium"}
            type={"submit"}
            // disabled={!isValid}
            sx={{
              ml: "16px",
              ":focus:not([disabled])": { boxShadow: "none" },
              border: "none",
            }}
            onClick={saveHandler}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
      {/* </form> */}
    </Box>
  );
};

export default NotificationSettingsView;
