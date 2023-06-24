import { useContext, createContext, useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { RealtimeChannel } from "@supabase/supabase-js";

import UserService from "../modules/User/services";
import { ChildrenProps } from "../commons/types";
import { IUser } from "../modules/User/interfaces/IUser";
import { useStudio } from "./studioContext";
import { isEmpty } from "../utils/Common";
import StudioService from "../modules/Studio/services";
import CollectionService from "../modules/Collections/services";
import { usePermissions } from "./permissionContext";
import { StudioType } from "../modules/Studio/types";
import {
  PermissionGroup,
  PermissionSchema,
} from "../modules/Permissions/types";
import { useRouter } from "next/router";
import BipRouteUtils from "../core/routeUtils";
import bipChannels from "../realtime/channels";
import { supabase } from "../utils/supabaseClient";
import { HandleEnum } from "../core/enums";
import segmentEvents from "../insights/segment";
import { deleteCookie, setCookie } from "cookies-next";

type UserContextType = {
  user: IUser | null;
  saveUser: (user: IUser | null) => Promise<void>;
  isLoggedIn: boolean;
  logout: (redirect?: boolean) => void;
  initUserStudios: (user: IUser) => void;
};

export const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: ChildrenProps) => {
  const { user, saveUser, isLoggedIn, logout, initUserStudios } =
    useProviderUser();
  return (
    <UserContext.Provider
      value={{ user, saveUser, isLoggedIn, logout, initUserStudios }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useProviderUser = () => {
  const router = useRouter();

  const [user, setUser] = useState<IUser | null>(null);
  const { updateStudios, currentStudio, saveCurrentStudio } = useStudio();

  const { savePermissionsSchema, schema } = usePermissions();

  const initUserStudios = async (
    user: IUser,
    permissionSchema?: PermissionSchema,
    navigateToAdminStudio?: boolean
  ) => {
    try {
      // const { data: bootstrapData } = await UserService.getBootstrap(user?.id!);
      // const { data: userStudioPermissions } =
      //   await UserService.getUserStudiosPermissions();
      const bootstrapPromise = UserService.getBootstrap(user?.id!);
      const userStudioPermissionsPromise =
        UserService.getUserStudiosPermissions();
      await Promise.all([bootstrapPromise, userStudioPermissionsPromise]).then(
        (responses) => {
          const bootstrapData = responses[0].data;
          const userStudioPermissions = responses[1].data;
          const studioSchema: PermissionSchema | undefined =
            permissionSchema || schema?.studio;
          const userStudios = bootstrapData.data.userStudios.map(
            (userStudio: StudioType) => {
              return {
                ...userStudio,
                context: HandleEnum.Studio,
                isPersonalSpace: user.defaultStudioID === userStudio.id,
                permission: userStudioPermissions?.data[userStudio.id],
                permissionGroup: studioSchema?.permissionGroups.find(
                  (permissionGroup: PermissionGroup) =>
                    permissionGroup.systemName ===
                    userStudioPermissions?.data[userStudio.id]
                ),
              };
            }
          );
          updateStudios(userStudios);
          const updatedCurrentStudio = userStudios.find(
            (std: any) => std.id === currentStudio?.id
          );
          if (
            updatedCurrentStudio &&
            currentStudio &&
            currentStudio?.permissionGroup !==
              updatedCurrentStudio.permissionGroup
          ) {
            saveCurrentStudio(updatedCurrentStudio);
          }
          const isOnboarding = Boolean(
            localStorage.getItem("onboardingSchema")
          );
          if (
            navigateToAdminStudio &&
            user?.isSetupDone &&
            !isOnboarding &&
            !router.query.returnUrl
          ) {
            const adminStudio = userStudios.find(
              (studio: any) =>
                studio?.permission === "pg_studio_admin" &&
                !studio.isPersonalSpace
            );
            const normalStudio = userStudios.find(
              (studio: any) =>
                studio?.permission !== "pg_studio_admin" &&
                !studio.isPersonalSpace
            );
            if (adminStudio) {
              // router/js is aborting route change so added settimeout
              setTimeout(() => {
                router.push(BipRouteUtils.getHandleRoute(adminStudio.handle));
              }, 0);
            } else if (normalStudio) {
              setTimeout(() => {
                router.push(BipRouteUtils.getHandleRoute(normalStudio.handle));
              }, 0);
            } else {
              const personalStudio = userStudios.find(
                (studio: any) => studio.isPersonalSpace
              );
              if (personalStudio) {
                setTimeout(() => {
                  router.push(
                    BipRouteUtils.getHandleRoute(personalStudio.handle)
                  );
                }, 0);
              }
            }
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  const saveBootstrap = async (user) => {
    const studioSchemaPromise = StudioService.getStudioPermissionsSchema();
    const collectionSchemaPromise = CollectionService.getPermissionsSchema();
    const canvasSchemaPromise = CollectionService.getCanvasPermissionsSchema();
    let studioSchema: PermissionSchema | null = null;
    await Promise.all([
      studioSchemaPromise,
      collectionSchemaPromise,
      canvasSchemaPromise,
    ])
      .then((responses) => {
        studioSchema = responses[0]?.data;
        savePermissionsSchema({
          studio: responses[0]?.data,
          collection: responses[1]?.data,
          canvas: responses[2]?.data,
        });
      })
      .catch((err) => {
        console.log("Error fetching schema(s)", err);
      });

    await initUserStudios(user, studioSchema, true);
  };

  const saveUser = async (user: IUser | null) => {
    localStorage.setItem("user", JSON.stringify(user));
    if (user) {
      setCookie("access-token", user.accessToken);
    }
    setUser(user);
    //the save bootstrap was moved below the two lines above since
    //ApiClient was using localstorage to check if user was logged in and then added
    //Auth header. The APIs in saveBootsrap fail if this is moved above with an await
    await saveBootstrap(user);
    // if (user) {
    segmentEvents.identify(user?.id?.toString()!, {
      name: user?.fullName,
      email: user?.email,
    });
    // }
  };

  const isLoggedIn: boolean = !!(user && !isEmpty(user));

  const logout = (redirect?: boolean) => {
    setUser(null);
    const localTheme = localStorage.getItem("app-theme");
    window.localStorage.clear();
    window.sessionStorage.clear();
    deleteCookie("bip-studio-id");
    deleteCookie("access-token");
    if (localTheme) {
      localStorage.setItem("app-theme", localTheme);
    }
    if (redirect) {
      window.location.replace(
        `${BipRouteUtils.getSignInRoute()}?returnUrl=${router.asPath}`
      );
    } else {
      window.location.replace("/");
    }
  };

  useEffect(() => {
    try {
      const localUser = JSON.parse(window.localStorage.getItem("user") || "{}");
      if (localUser) {
        setUser(localUser);
      }
    } catch (err) {
      signOut().then((r) => {
        logout();
      });
    }
  }, []);

  return {
    user,
    saveUser,
    isLoggedIn,
    logout,
    initUserStudios,
  };
};

export const useUser = () => {
  return useContext(UserContext) as UserContextType;
};
