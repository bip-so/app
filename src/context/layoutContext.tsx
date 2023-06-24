import { createContext, useContext, useEffect, useState } from "react";
import { ChildrenProps } from "../commons/types";
import useDeviceDimensions from "../hooks/useDeviceDimensions";
import useLocalStorage from "../hooks/useLocalStorage";

type LayoutContextType = {
  isSideNavOpen: boolean;
  setIsSideNavOpen: (isOpen: boolean) => void;
  isPinned: boolean;
  setIsPinned: (isPinned: boolean) => void;

  showNotificationContainer: boolean;
  setShowNotificationContainer: (show: boolean) => void;

  showCreateStudioContainer: boolean;
  setShowCreateStudioContainer: (show: boolean) => void;

  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;

  showLandingPageVideo: boolean;
  setShowLandingPageVideo: (show: boolean) => void;
};

const INITIAL_DATA: LayoutContextType = {
  isSideNavOpen: true,
  setIsSideNavOpen: () => null,
  isPinned: false,
  setIsPinned: () => null,

  showNotificationContainer: false,
  setShowNotificationContainer: () => null,

  showCreateStudioContainer: false,
  setShowCreateStudioContainer: () => null,

  showUserMenu: false,
  setShowUserMenu: () => null,

  showLandingPageVideo: false,
  setShowLandingPageVideo: () => null,
};

export const LayoutContext = createContext<LayoutContextType>(INITIAL_DATA);

export const LayoutProvider = ({ children }: ChildrenProps) => {
  const {
    isSideNavOpen,
    setIsSideNavOpen,
    isPinned,
    setIsPinned,
    showNotificationContainer,
    setShowNotificationContainer,
    showCreateStudioContainer,
    setShowCreateStudioContainer,
    showUserMenu,
    setShowUserMenu,
    showLandingPageVideo,
    setShowLandingPageVideo,
  } = useProviderLayout();
  return (
    <LayoutContext.Provider
      value={{
        isSideNavOpen,
        setIsSideNavOpen,
        isPinned,
        setIsPinned,
        showNotificationContainer,
        setShowNotificationContainer,
        showCreateStudioContainer,
        setShowCreateStudioContainer,
        showUserMenu,
        setShowUserMenu,
        showLandingPageVideo,
        setShowLandingPageVideo,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

const useProviderLayout = () => {
  // const [userSidebarPreference, setUserSidebarPreference] = useLocalStorage(
  //   "userSidebarPreference",
  //   true
  // );
  // const { isLargeDevice } = useDeviceDimensions();
  const { isTabletOrMobile } = useDeviceDimensions();
  const [isSideNavOpen, setIsSideNavOpen] = useState<boolean>(
    !isTabletOrMobile
  );
  const [showNotificationContainer, setShowNotificationContainer] =
    useState<boolean>(false);

  const [showCreateStudioContainer, setShowCreateStudioContainer] =
    useState<boolean>(false);

  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const [showLandingPageVideo, setShowLandingPageVideo] =
    useState<boolean>(false);

  // useEffect(() => {
  //   setUserSidebarPreference(isSideNavOpen);
  // }, [isSideNavOpen, setUserSidebarPreference]);

  const [isPinned, setIsPinned] = useState<boolean>(false);
  // isTabletOrMobile ? setIsSideNavOpen(false) : setIsSideNavOpen(true);
  return {
    isSideNavOpen,
    setIsSideNavOpen,
    isPinned,
    setIsPinned,
    showNotificationContainer,
    setShowNotificationContainer,
    showCreateStudioContainer,
    setShowCreateStudioContainer,
    showUserMenu,
    setShowUserMenu,
    showLandingPageVideo,
    setShowLandingPageVideo,
  };
};

export const useLayout = () => {
  return useContext(LayoutContext) as LayoutContextType;
};
