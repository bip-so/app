import { setCookie } from "cookies-next";
import { createContext, useContext, useEffect, useState } from "react";

import { ChildrenProps } from "../commons/types";
import { PermissionGroup } from "../modules/Permissions/types";
import { StudioType, NotificationCountType } from "../modules/Studio/types";
import { usePages } from "./pagesContext";
import { usePermissions } from "./permissionContext";

type StudioContextType = {
  studios: StudioType[];
  addStudio: (studio: StudioType) => void;
  deleteStudio: (studioId: number) => void;
  updateStudio: (studio: StudioType) => void;
  updateStudios: (studios: StudioType[]) => void;
  currentStudio: StudioType | null;
  saveCurrentStudio: (studio: StudioType) => void;
  notificationCount: NotificationCountType | null;
  saveNotificationCount: (notificationCount: any) => void;
  personalSpace: StudioType;
  clearCurrentStudio: () => void;
};

const INITIAL_VALUES = {
  studios: [],
  addStudio: () => null,
  deleteStudio: () => null,
  updateStudio: () => null,
  updateStudios: () => null,

  currentStudio: null,
  saveCurrentStudio: () => null,
  clearCurrentStudio: () => null,

  notificationCount: null,
  saveNotificationCount: () => null,
  personalSpace: null,
};

export const StudioContext = createContext<StudioContextType | null>(
  INITIAL_VALUES
);

export const StudioProvider = ({ children }: ChildrenProps) => {
  const {
    studios,
    addStudio,
    deleteStudio,
    updateStudio,
    updateStudios,

    currentStudio,
    saveCurrentStudio,
    clearCurrentStudio,

    notificationCount,
    saveNotificationCount,
    personalSpace,
  } = useProviderStudio();

  return (
    <StudioContext.Provider
      value={{
        studios,
        addStudio,
        deleteStudio,
        updateStudio,
        updateStudios,

        currentStudio,
        saveCurrentStudio,
        clearCurrentStudio,

        notificationCount,
        saveNotificationCount,
        personalSpace,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

const useProviderStudio = () => {
  const [studios, setStudios] = useState<StudioType[]>([]);

  const [currentStudio, setCurrentStudio] = useState<StudioType | null>(null);

  const { pagesLoaded, setPagesLoaded } = usePages();

  const [notificationCount, setNotificationsCount] =
    useState<NotificationCountType | null>();
  const [personalSpace, setPersonalSpace] = useState<
    StudioType | null | undefined
  >(null);

  const { schema } = usePermissions();

  const addStudio = (newStudio: StudioType) => {
    const updatedStudios = [newStudio, ...studios];
    // setPagesLoaded(false);
    updateStudios(updatedStudios);
  };

  const deleteStudio = (deletingStudioId: number) => {
    const updatedStudios = studios.filter(
      (studio: StudioType) => studio.id !== deletingStudioId
    );
    updateStudios(updatedStudios);
  };

  const updateStudio = (updatedStudio: StudioType) => {
    const tempStudios = [...studios];
    const studioIndex = studios.findIndex(
      (studio) => studio.id === updatedStudio.id
    );

    tempStudios[studioIndex] = updatedStudio;
    updateStudios(tempStudios);
  };

  const updateStudios = (newStudios: StudioType[]) => {
    localStorage.setItem("userStudios", JSON.stringify(newStudios));
    setStudios(newStudios);
  };

  const saveCurrentStudio = async (studio: StudioType) => {
    sessionStorage.setItem("currentStudio", JSON.stringify(studio));
    setCookie("bip-studio-id", studio.id);

    const localStudios = JSON.parse(
      window.localStorage.getItem("userStudios") || "[]"
    );
    if (localStudios) {
      const localStudioWithPermission = localStudios.find(
        (userStudio: StudioType) => userStudio.id === studio.id
      );
      if (localStudioWithPermission?.permissionGroup) {
        studio.permissionGroup = localStudioWithPermission.permissionGroup;
      }
    } else {
      const localPermissionsSchema = JSON.parse(
        window.localStorage.getItem("permissionsSchema") || "{}"
      );
      studio.permissionGroup =
        localPermissionsSchema?.studio?.permissionGroups.find(
          (permissionGroup: PermissionGroup) =>
            permissionGroup.systemName === studio.permission
        );
    }
    setCurrentStudio(studio);
  };

  const clearCurrentStudio = () => {
    sessionStorage.removeItem("currentStudio");
    setCurrentStudio(null);
  };

  const saveNotificationCount = async (
    notificationCount: NotificationCountType
  ) => {
    localStorage.setItem(
      "notificationCount",
      JSON.stringify(notificationCount)
    );
    setNotificationsCount(notificationCount);
  };

  useEffect(() => {
    const localStudios = JSON.parse(
      window.localStorage.getItem("userStudios") || "[]"
    );
    if (localStudios) {
      setStudios(localStudios);
    }
  }, []);

  useEffect(() => {
    const currentStudio = JSON.parse(
      window.sessionStorage.getItem("currentStudio") || "{}"
    );
    if (currentStudio) {
      setCurrentStudio(currentStudio);
    }
    const notificationCount = JSON.parse(
      window.localStorage.getItem("notificationCount") || "{}"
    );
    if (notificationCount) {
      setNotificationsCount(notificationCount);
    }
  }, []);

  useEffect(() => {
    if (studios) {
      setPersonalSpace(studios.find((studio) => studio.isPersonalSpace));
    }
  }, [studios]);

  return {
    studios,
    addStudio,
    deleteStudio,
    updateStudio,
    updateStudios,
    currentStudio,
    saveCurrentStudio,
    clearCurrentStudio,
    notificationCount,
    saveNotificationCount,
    personalSpace,
  };
};

export const useStudio = () => {
  return useContext(StudioContext) as StudioContextType;
};
