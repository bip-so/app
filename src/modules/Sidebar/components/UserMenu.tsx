import { FC, useEffect, useRef, useState } from "react";
import { KebabHorizontalIcon } from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  Box,
  CounterLabel,
  IconButton,
  Text,
  ToggleSwitch,
  Truncate,
  useTheme,
} from "@primer/react";
import {
  BellIcon,
  GearIcon,
  MoonIcon,
  SignOutIcon,
  SunIcon,
} from "@primer/styled-octicons";
import { signOut } from "next-auth/react";

import { useUser } from "../../../context/userContext";
import Modal from "../../../components/Modal";
import NotificationSettings from "../../Notifications/Components/NotificationSettings";
import AvatarWithPlaceholder from "../../../components/AvatarWithPlaceholder";
import NotificationService from "../../Notifications/services";
import Link from "next/link";
import BipRouteUtils from "../../../core/routeUtils";
import NotificationsAndBipmarks from "../../Notifications/Container";
import { useStudio } from "../../../../src/context/studioContext";
import { useLayout } from "../../../context/layoutContext";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import segmentEvents from "../../../insights/segment";
import AuthService from "../../Auth/services";
import { DEFAULT_USER_PLACEHOLDER } from "../../../commons/constants";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

interface IUserMenuProps {}

const UserMenu: FC<IUserMenuProps> = (props) => {
  const { user, logout, isLoggedIn } = useUser();
  const [showNotiSettings, setShowNotiSettings] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState<number>(0);
  const notificationIconRef = useRef<HTMLElement>();
  const { saveNotificationCount } = useStudio();
  const { colorMode, setColorMode } = useTheme();
  const {
    setIsPinned,
    setIsSideNavOpen,
    showNotificationContainer,
    setShowNotificationContainer,
    showUserMenu,
    setShowUserMenu,
  } = useLayout();
  const { isTabletOrMobile } = useDeviceDimensions();

  useEffect(() => {
    isLoggedIn &&
      (async () => {
        try {
          const resp = await NotificationService.getNotificationsCount();
          setNotificationsCount(Number(resp.data.data.all));
          saveNotificationCount(resp.data.data);
        } catch (err) {
          console.log(err);
        }
      })();
  }, []);

  const closeModalHandler = () => {
    setShowNotiSettings(false);
  };

  return (
    <Box
      className="flex items-center justify-between px-2 py-3 shadow-lg"
      zIndex={50}
    >
      <div className="flex items-center">
        <LinkWithoutPrefetch href={BipRouteUtils.getHandleRoute(user.username)}>
          <Box
            onClick={() => isTabletOrMobile && setIsSideNavOpen(false)}
            as="span"
            sx={{
              color: "white",
              ":hover:not([disabled])": {
                backgroundColor: "layout.user.hoverBg",
              },
              ":active:not([disabled])": {
                backgroundColor: "layout.user.hoverBg",
              },
              "&[aria-expanded='true']": {
                backgroundColor: "layout.user.hoverBg",
              },
              px: 2,
              py: 1,
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <span className="flex items-center">
              <AvatarWithPlaceholder
                src={user?.avatarUrl}
                sx={{ width: "32px", height: "32px" }}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = DEFAULT_USER_PLACEHOLDER;
                }}
              />
              <Text
                padding={2}
                color="layout.user.text"
                sx={{
                  overflow: "hidden",
                  width: "140px",
                  flex: 1,
                }}
              >
                <Truncate title={user?.username || ""}>
                  {user?.username}
                </Truncate>
              </Text>
            </span>
          </Box>
        </LinkWithoutPrefetch>
      </div>
      <div className="relative flex space-x-1">
        <>
          <IconButton
            ref={notificationIconRef}
            icon={BellIcon}
            variant="invisible"
            sx={{
              color: "white",
              ":hover:not([disabled])": {
                backgroundColor: "layout.user.hoverBg",
              },
              ":active:not([disabled])": {
                backgroundColor: "layout.user.hoverBg",
              },
              "&[aria-expanded='true']": {
                backgroundColor: "layout.user.hoverBg",
              },
            }}
            aria-label="Open User settings"
            onClick={async () => {
              segmentEvents.notificationTrayOpened(
                user?.id!,
                user?.email!,
                user?.username!,
                "0" //unread_notifications REQUIRED
              );
              isTabletOrMobile && setIsSideNavOpen(false);
              setShowNotificationContainer((prevState) => !prevState);
            }}
          />
          {notificationsCount > 0 ? (
            <CounterLabel
              sx={{
                position: "absolute",
                left: "12px",
                color: "layout.user.text",
                backgroundColor: "layout.user.notificationCountBg",
              }}
            >
              {notificationsCount}
            </CounterLabel>
          ) : null}
        </>
        <ActionMenu
          open={showNotificationContainer}
          onOpenChange={setShowNotificationContainer}
          anchorRef={notificationIconRef}
        >
          <ActionMenu.Overlay
            top={0.2 * window.innerHeight - 52} //hardcoded based on 80vh height of container and container bottom being 44px from bottom
            sx={{ position: "fixed", zIndex: 1002 }}
            onClickOutside={() => {
              if (!showNotiSettings) {
                setShowNotificationContainer(false);
              }
            }}
          >
            <NotificationsAndBipmarks
              closeNotificationsContainer={() =>
                setShowNotificationContainer(false)
              }
              markNotificationsAsRead={setNotificationsCount}
              onClickSettings={() => {
                setShowNotiSettings(true);
              }}
            />
          </ActionMenu.Overlay>
        </ActionMenu>
        <ActionMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
          <ActionMenu.Anchor>
            <IconButton
              icon={KebabHorizontalIcon}
              variant="invisible"
              id="three-dot-user-menu-btn"
              sx={{
                color: "white",
                transform: "rotate(90deg)",
                ":hover:not([disabled])": {
                  bg: "layout.user.hoverBg",
                },
                ":active:not([disabled])": {
                  bg: "layout.user.hoverBg",
                },
                "&[aria-expanded='true']": {
                  bg: "layout.user.hoverBg",
                },
              }}
              aria-label="Open User settings"
            />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay
            align="center"
            top={window.innerHeight - 148} //hardcoded based on 96px height of container and container bottom being 44px from bottom
            sx={{ position: "fixed", zIndex: 1003 }}
          >
            <ActionList>
              {!isTabletOrMobile && (
                <ActionList.Item
                  onSelect={() => {
                    setShowNotiSettings(true);
                  }}
                >
                  <ActionList.LeadingVisual>
                    <GearIcon />
                  </ActionList.LeadingVisual>
                  Notification Settings
                </ActionList.Item>
              )}
              <ActionList.Item
                onSelect={() => {
                  if (colorMode === "day") {
                    setColorMode("night");
                    localStorage.setItem("app-theme", "night");
                  } else {
                    setColorMode("day");
                    localStorage.setItem("app-theme", "day");
                  }
                }}
              >
                <ActionList.LeadingVisual>
                  {colorMode === "day" ? (
                    <SunIcon size={16} />
                  ) : (
                    <MoonIcon size={16} />
                  )}
                </ActionList.LeadingVisual>
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Text>Dark Mode</Text>
                  <ToggleSwitch
                    aria-labelledby="theme-label"
                    checked={colorMode === "night"}
                    sx={{
                      "> span": {
                        display: "none",
                      },
                      "> button": {
                        width: "40px",
                        height: "20px",
                        bg: "toggleSwitch.bg",
                        borderColor: "toggleSwitch.border",
                        ":hover": {
                          bg: "toggleSwitch.bg",
                        },
                        ".Toggle-knob": {
                          bg: "toggleSwitch.knobBg",
                          borderColor: "toggleSwitch.knobBorder",
                        },
                      },
                    }}
                    size="small"
                  />
                </Box>
              </ActionList.Item>
              <ActionList.Divider />
              <ActionList.Item
                variant="danger"
                onSelect={() => {
                  AuthService.logout();
                  signOut().then(async (r) => {
                    segmentEvents.loggedOut(
                      user?.id!,
                      user?.email!,
                      user?.username!
                    );
                    await logout();
                  });
                }}
              >
                <ActionList.LeadingVisual>
                  <SignOutIcon />
                </ActionList.LeadingVisual>
                Logout
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>
      {showNotiSettings ? (
        <Modal
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "800px",
            height: "588px",
            padding: "0px",
          }}
          hideCloseButton
          closeHandler={closeModalHandler}
        >
          <NotificationSettings closeHandler={closeModalHandler} />
        </Modal>
      ) : null}
    </Box>
  );
};

export default UserMenu;
