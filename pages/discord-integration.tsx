import { GetServerSideProps } from "next";
import { signIn, signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

import { BipPage } from "../src/commons/types";
import { SocialAuthProvidersEnum } from "../src/core/enums";
import BipRouteUtils from "../src/core/routeUtils";
import { useEffect, useLayoutEffect } from "react";
import BipLoader from "../src/components/BipLoader";
import { useUser } from "../src/context/userContext";
import AuthService from "../src/modules/Auth/services";
import { isEmpty } from "../src/utils/Common";
import { useStudio } from "../src/context/studioContext";
import { Box } from "@primer/react";
import DiscordIntegrationStudioSelector from "../src/modules/Studio/components/DiscordIntegrationStudioSelector";
import { BipPermission } from "../src/modules/Permissions/types";
import { StudioType } from "../src/modules/Studio/types";
import { StudioPermissionEnum } from "../src/modules/Permissions/enums";
import BipIcon from "../src/icons/BipIcon";

const DiscordIntegrationPage: BipPage = () => {
  const router = useRouter();

  const returnUrl = router.query.returnUrl as string;

  // Partner Integration
  const guildId = router.query.guildId as string;
  const partnerIntegrationId = router.query.partnerIntegrationId as string;

  const { isLoggedIn, user, logout } = useUser();
  const { studios } = useStudio();

  const handleDiscordIntegration = async () => {
    const localUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (localUser && !isEmpty(localUser)) {
      // window.location.href =
      //   BipRouteUtils.getDiscordStudioIntegrationRedirectRoute(localUser?.id!);
    } else {
      signIn(SocialAuthProvidersEnum.DISCORD, {
        callbackUrl: BipRouteUtils.getSocialRedirectRoute(
          SocialAuthProvidersEnum.DISCORD,
          returnUrl,
          true
        ),
      });
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    signOut().then(async (r) => {
      await logout(true);
    });
  };

  const canManageStudioIntegrations = (studio: StudioType) => {
    const studioPermissions = studio?.permissionGroup?.permissions || [];
    return Boolean(
      studioPermissions.find?.(
        (permission: BipPermission) =>
          permission.key === StudioPermissionEnum.STUDIO_MANAGE_INTEGRATION
      )?.value === 1
    );
  };

  const handleSkipIntegration = () => {
    localStorage.removeItem("fromIntegration");
    router.push({
      pathname: BipRouteUtils.getHomeRoute(),
    });
  };

  useEffect(() => {
    if (isLoggedIn) {
      const integrationStudios = studios?.filter(
        (studio: StudioType) =>
          canManageStudioIntegrations(studio) &&
          studio?.id !== user?.defaultStudioID
      );
      if (!integrationStudios.length) {
        window.location.href =
          BipRouteUtils.getDiscordStudioIntegrationRedirectRoute(
            user?.id!,
            0,
            guildId,
            partnerIntegrationId
          );
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!router.isReady) return;
    handleDiscordIntegration();
  }, [studios]);

  return (
    <>
      {isLoggedIn ? (
        <Box
          display={"flex"}
          alignItems={"center"}
          backgroundColor={"auth.bg"}
          width={"full"}
          height={"100vh"}
        >
          <Box
            display={"flex"}
            flexDirection="column"
            width={"20rem"}
            padding={"2rem"}
            borderRadius={"12px"}
            mx={"auto"}
            bg={"auth.signin.bg"}
            sx={{
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "auth.signin.border",
              width: ["90%", "80%", "80%", "80%"],
              maxWidth: "900px",
            }}
          >
            <DiscordIntegrationStudioSelector
              closeHandler={handleSkipIntegration}
            />
          </Box>
        </Box>
      ) : (
        <BipLoader />
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale || "en")),
    },
  };
};

DiscordIntegrationPage.auth = false;
export default DiscordIntegrationPage;
