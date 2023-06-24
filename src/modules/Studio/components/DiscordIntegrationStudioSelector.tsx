import { Box, Button, StyledOcticon, Text } from "@primer/react";
import { PlusCircleIcon, PlusIcon } from "@primer/styled-octicons";
import Link from "next/link";
import { useRouter } from "next/router";
import * as React from "react";
import { text } from "stream/consumers";
import { GITHUB_AVATAR_PLACEHOLDER } from "../../../commons/constants";
import ImageWithName from "../../../components/ImageWithName";
import { useLayout } from "../../../context/layoutContext";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import BipRouteUtils from "../../../core/routeUtils";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import { StudioPermissionEnum } from "../../Permissions/enums";
import { BipPermission } from "../../Permissions/types";
import segmentEvents from "../../../insights/segment";
import { StudioType } from "../types";
import { useTranslation } from "next-i18next";

interface IDiscordIntegrationStudioSelectorProps {
  closeHandler: Function;
}

const DiscordIntegrationStudioSelector: React.FunctionComponent<
  IDiscordIntegrationStudioSelectorProps
> = ({ closeHandler }) => {
  const { t } = useTranslation();
  const { studios } = useStudio();
  const { user } = useUser();

  const { isTabletOrMobile } = useDeviceDimensions();

  const router = useRouter();
  // Partner Integration
  const guildId = router.query.guildId as string;
  const partnerIntegrationId = router.query.partnerIntegrationId as string;

  const canManageStudioIntegrations = (studio: StudioType) => {
    const studioPermissions = studio?.permissionGroup?.permissions || [];
    return Boolean(
      studioPermissions.find?.(
        (permission: BipPermission) =>
          permission.key === StudioPermissionEnum.STUDIO_MANAGE_INTEGRATION
      )?.value === 1
    );
  };

  return (
    <Box width={"100%"}>
      <Text
        as="p"
        fontSize={"32px"}
        fontWeight={"600"}
        color={"editModal.heading"}
        marginBottom="15px"
        textAlign="center"
      >
        Integrate With Discord
      </Text>
      <Text
        as={"p"}
        fontSize={"20px"}
        textAlign="center"
        fontWeight={"300"}
        marginBottom="40px"
        color={"discordIntegration.description"}
      >
        {t("chooseWorkspace.discord")}
      </Text>
      <Box display="flex" overflowX="auto" p="16px" sx={{ gap: "24px" }}>
        <Box
          onClick={() => {
            window.location.href =
              BipRouteUtils.getDiscordStudioIntegrationRedirectRoute(
                user?.id!,
                0,
                guildId,
                partnerIntegrationId
              );
          }}
          sx={{
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            transition: ".1s",
            ":hover": {
              transform: "scale(1.1)",
            },
          }}
          borderRadius="12px"
          px={"16px"}
          py={"24px"}
          borderWidth="1px"
          borderColor={"discordIntegration.createCardBorder"}
          borderStyle="solid"
          textAlign={"center"}
          width={"180px"}
          flexShrink={0}
        >
          <Box height={80}>
            <StyledOcticon
              sx={{
                paddingTop: "10px",
              }}
              icon={PlusIcon}
              size={60}
              color={"text.default"}
            />
          </Box>
          <Text
            color={"studioCard.text.displayname"}
            fontSize="16px"
            lineHeight={"20px"}
            marginTop="24px"
            sx={{
              overflowWrap: "break-word",
            }}
            onClick={() => {
              segmentEvents.signUpCreateStudioSelected(
                user?.id!,
                user?.username!,
                "discord"
              );
            }}
          >
            {t("createWorkspaceForm.createNewWorkspace")}
          </Text>
        </Box>
        {studios
          ?.filter(
            (studio: StudioType) =>
              canManageStudioIntegrations(studio) &&
              studio?.id !== user?.defaultStudioID
          )
          ?.map((studio: StudioType) => {
            return (
              <Box
                key={studio.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                  transition: ".1s",
                  ":hover": {
                    transform: "scale(1.1)",
                  },
                }}
                borderRadius="12px"
                px={"16px"}
                py={"24px"}
                borderWidth="1px"
                borderColor={"studioCard.border"}
                borderStyle="solid"
                textAlign={"center"}
                flexShrink={0}
                width="180px"
                onClick={() => {
                  localStorage.removeItem("fromIntegration");
                  window.location.href =
                    BipRouteUtils.getDiscordStudioIntegrationRedirectRoute(
                      user?.id!,
                      studio?.id,
                      guildId,
                      partnerIntegrationId
                    );
                }}
              >
                <Box>
                  <ImageWithName
                    sx={{
                      height: "80px",
                      width: "80px",
                      color: "text.default",
                    }}
                    src={studio.imageUrl}
                    name={studio.displayName}
                  />
                </Box>
                <Text
                  color={"studioCard.text.displayname"}
                  fontSize="16px"
                  lineHeight={"20px"}
                  marginTop="24px"
                  sx={{
                    overflowWrap: "break-word",
                  }}
                >
                  {studio.displayName}
                </Text>

                {/* <Box marginTop={"10px"} marginX="auto">
                  <Button
                    variant="primary"
                    size="small"
                    sx={{
                      fontWeight: "300",
                      border: "none",
                      ":focus:not([disabled])": { boxShadow: "none" },
                    }}
                    onClick={() => {
                      localStorage.removeItem("fromIntegration");
                      window.location.href =
                        BipRouteUtils.getDiscordStudioIntegrationRedirectRoute(
                          user?.id!,
                          studio?.id
                        );
                    }}
                  >
                    Connect
                  </Button>
                </Box> */}
              </Box>
            );
          })}
      </Box>
      <Box marginTop={"40px"} display={"flex"} justifyContent={"center"}>
        <Button
          variant="invisible"
          sx={{
            color: "text.subtle",
            fontWeight: "300",
          }}
          size={"medium"}
          type={"button"}
          onClick={closeHandler}
        >
          I'll do this later
        </Button>
      </Box>
    </Box>
  );
};

export default DiscordIntegrationStudioSelector;
