import { FC } from "react";
import { useTranslation } from "next-i18next";
import { Box, Button, Text } from "@primer/react";
import Image from "next/image";

import { FaDiscord } from "react-icons/fa";
import { useUser } from "../../../context/userContext";
import BipRouteUtils from "../../../core/routeUtils";
import Router, { useRouter } from "next/router";
import { OnboardingStepEnum } from "../enums";
import { useOnboarding } from "../../../context/onboardingContext";
import SlackIcon from "../../../icons/SlackIcon";
import { useStudio } from "../../../context/studioContext";
import SetupHeader from "../../../components/SetupHeader";

interface IOnboardingLandingStepProps {}

const OnboardingLandingStep: FC<IOnboardingLandingStepProps> = (props) => {
  const router = useRouter();
  const { t } = useTranslation();

  // Partner Integration
  const guildId = router.query.guildId as string;
  const partnerIntegrationId = router.query.partnerIntegrationId as string;

  const { studios } = useStudio();

  const { clearOnboardingSchema } = useOnboarding();

  const handleSkipOnboarding = () => {
    clearOnboardingSchema();
    if (studios.length) {
      const personalStudio = studios?.find((studio) => studio.isPersonalSpace);
      if (personalStudio) {
        router.push(BipRouteUtils.getHandleRoute(personalStudio.handle));
      } else {
        router.push(BipRouteUtils.getHandleRoute(studios[0].handle));
      }
    } else {
      router.push(BipRouteUtils.getHomeRoute());
    }
  };

  const { user } = useUser();

  const initDiscordConnect = () => {
    clearOnboardingSchema();
    window.location.href =
      BipRouteUtils.getDiscordStudioIntegrationRedirectRoute(
        user?.id!,
        0,
        guildId,
        partnerIntegrationId
      );
  };

  // const initSlackConnect = () => {
  //   window.location.href =
  //     BipRouteUtils.getDiscordStudioIntegrationRedirectRoute(user?.id!);
  // };

  const gotoStudioCreation = () => {
    router.push({
      pathname: router.pathname,
      query: {
        step: OnboardingStepEnum.STUDIOCREATE,
      },
    });
  };

  return (
    <Box
      sx={{
        bg: "auth.bg",
        // width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="w-11/12 mx-auto lg:w-5/12 md:w-11/12 sm:w-11/12 "
    >
      <Box
        display={"flex"}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width={"648px"}
        height={"802px"}
        padding={"1rem"}
        borderRadius={"12px"}
        border={"1px solid"}
        borderColor={"auth.setup.border"}
        mx={"auto"}
        bg={"auth.setup.bg"}
      >
        <Box display={"flex"} width={"90%"}>
          <SetupHeader progressNumber={100} />
        </Box>
        <Box
          display="flex"
          width={"90%"}
          flexDirection="column"
          alignItems="center"
          height="600px"
        >
          <Text
            fontSize="1.25rem"
            fontWeight={600}
            lineHeight={"48px"}
            marginBottom="12px"
            as="h1"
          >
            {t("onboarding.createYourWorkspace")}
          </Text>
          <Box
            borderRadius={"12px"}
            backgroundColor="auth.onboarding.bg"
            height={"360px"}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src="/landing-graphic.svg"
              alt="leaderboards"
              height={"280px"}
              width={"500px"}
              style={{
                objectFit: "contain",
              }}
            />
          </Box>
          <Text
            fontWeight={400}
            fontSize="14px"
            lineHeight={"24px"}
            sx={{
              margin: "12px 0",
            }}
            color="auth.onboarding.description"
          >
            {t("onboarding.workspaceDescription")}
          </Text>

          <Box
            display={"flex"}
            flexDirection={"column"}
            marginLeft={"auto"}
            marginRight={"auto"}
            height={"116px"}
            // marginTop="20px"
          >
            {/* <Button
            size="medium"
            sx={{
              border: "1px solid",
              borderColor: "auth.signin.discordBorder",
              color: "auth.signin.discordText",
              bg: "auth.signin.slackButton",
              ":hover:not([disabled])": {
                bg: "auth.signin.slackButton",
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "240px",
              margin: "6px 0",
            }}
              leadingIcon={SlackIcon}
              onClick={initSlackConnect}
            >
              {t("onboarding.connectSlackWorkspace")}
            </Button> */}
            <Button
              size="medium"
              sx={{
                bg: "auth.signin.discordButton",
                border: "1px solid",
                borderColor: "auth.signin.discordBorder",
                color: "auth.signin.discordText",
                ":hover:not([disabled])": {
                  bg: "auth.signin.discordButton",
                  boxShadow: "0px 0px 0px 3px rgba(88, 101, 242, 0.4)",
                },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "240px",
                margin: "6px 0",
              }}
              leadingIcon={FaDiscord}
              onClick={initDiscordConnect}
            >
              {t("onboarding.connectDiscordServer")}
            </Button>
            <Box height={"5px"}></Box>
            {/* <Button
              size="medium"
              sx={{
                bg: "auth.signin.slackButton",
                border: "1px solid",
                borderColor: "auth.signin.slackBorder",
                color: "auth.signin.slackText",
                ":hover:not([disabled])": {
                  bg: "auth.signin.slackButton",
                  boxShadow: "0px 0px 0px 3px rgba(74,21,75, 0.4)",
                },
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                width: "240px",
              }}
              leadingIcon={SlackIcon}
              onClick={() => {}}
            >
              {t("onboarding.connectSlackWorkspace")}
            </Button>
            <Box height={"5px"}></Box> */}
            <Button
              size="medium"
              sx={{
                border: "1px solid",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                width: "240px",
                margin: "6px 0",
              }}
              onClick={gotoStudioCreation}
            >
              {t("onboarding.createWorkspaceManually")}
            </Button>
            <Box height={"5px"}></Box>
            <Button
              variant="invisible"
              sx={{
                color: "auth.header.text",
                fontWeight: 600,
                ":hover:not([disabled])": {
                  bg: "unset",
                },
              }}
              onClick={handleSkipOnboarding}
            >
              {t("onboarding.doItLater")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingLandingStep;
