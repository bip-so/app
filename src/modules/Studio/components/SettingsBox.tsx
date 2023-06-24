import React, { FC, MouseEventHandler, useEffect, useState } from "react";
import { Box, Text, useTheme } from "@primer/react";
import PeopleIcon from "../icons/PeopleIcon";
import MemberIcon from "../icons/MemberIcon";
import IntegrationsIcon from "../icons/IntegrationsIcon";
import GeneralIcon from "../icons/GeneralIcon";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../hooks/useHasPermission";
import { StudioPermissionEnum } from "../../Permissions/enums";
import {
  LinkExternalIcon,
  PersonAddIcon,
  CreditCardIcon,
  FileDirectoryIcon,
} from "@primer/styled-octicons";
import useSWR from "swr";
import StudioService from "../services";
import Link from "next/link";
import segmentEvents from "../../../insights/segment";
import { useRouter } from "next/router";
import { t } from "@excalidraw/excalidraw/types/i18n";
import { useTranslation } from "next-i18next";
import { tabs, SETTINGS_TABS } from "../constants";

interface TabProps {
  isSelected: boolean;
  onClick: MouseEventHandler<HTMLDivElement> | undefined;
  name: string;
  membersCount: number;
}

const renderIcon = (tab: string) => {
  const { colorMode } = useTheme();
  const color = colorMode === "day" ? "#21262D" : "#C9D1D9";

  switch (tab) {
    case SETTINGS_TABS.roles:
      return <PeopleIcon color={color} />;
    case SETTINGS_TABS.members:
      return <MemberIcon color={color} />;
    case SETTINGS_TABS.collections:
      return <FileDirectoryIcon color={color} />;
    case SETTINGS_TABS.integrations:
      return <IntegrationsIcon color={color} />;
    case SETTINGS_TABS.general:
      return <GeneralIcon color={color} />;
    case SETTINGS_TABS["pending requests"]:
      return <PersonAddIcon color={color} />;
    case SETTINGS_TABS.billing:
      return <CreditCardIcon color={color} />;
    case "billing-link":
      return <LinkExternalIcon color={color} />;
    default:
      return null;
  }
};

interface IManageBillingTabProps {}

const ManageBillingTab: React.FunctionComponent<IManageBillingTabProps> = (
  props
) => {
  const router = useRouter();
  const { currentStudio, studios } = useStudio();
  const { user } = useUser();

  const [loading, setLoading] = useState<boolean>(false);
  const [billingLink, setBillingLink] = useState<string>("");

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  const [personalStudio, setPersonalStudio] = useState<boolean | undefined>(
    true
  );

  useEffect(() => {
    studios.map((std, index) => {
      if (currentStudio?.id === std?.id) {
        setPersonalStudio(std?.isPersonalSpace);
      }
    });
  }, []);

  const callBackUrl = `${origin}${router.asPath}`;

  useEffect(() => {
    const billingPortalLink = async () => {
      setLoading(true);
      const resp =
        currentStudio?.stripeCustomerID === "na"
          ? await StudioService.getCheckoutLink(currentStudio?.id!, callBackUrl)
          : await StudioService.getBillingPortalLink(
              currentStudio?.id!,
              callBackUrl
            );

      setBillingLink(resp.data.url);

      setLoading(false);
    };
    billingPortalLink();
    return () => {};
  }, []);

  return (
    <>
      {loading
        ? null
        : !personalStudio && (
            <Box
              sx={{
                ":hover": {
                  textDecoration: "underline",
                },
              }}
            >
              <a
                target={"_blank"}
                href={billingLink}
                onClick={() => {
                  currentStudio?.stripeCustomerID === "na"
                    ? segmentEvents.upgradeInitiated(
                        currentStudio?.handle,
                        user?.id!,
                        user?.username!,
                        "settings"
                      )
                    : segmentEvents.viewedCustomerPortal(user?.id!);
                }}
              >
                <Box display={"flex"}>
                  <Box width={"18px"} marginRight="10px">
                    {renderIcon(SETTINGS_TABS.billing)}
                  </Box>
                  <Text as="p">
                    {currentStudio?.stripeCustomerID === "na"
                      ? "Upgrade"
                      : "Manage Billing"}
                  </Text>
                  <Box width={"18px"} marginLeft="10px">
                    {renderIcon("billing-link")}
                  </Box>
                </Box>
              </a>
            </Box>
          )}
    </>
  );
};

const Tab: FC<TabProps> = (props) => {
  return (
    <Box
      p={"12px 16px"}
      borderRadius={"6px"}
      bg={props.isSelected ? "studioSettings.tab.selectedBg" : "none"}
      sx={{
        cursor: "pointer",
        textTransform: "capitalize",
        fontSize: "14px",
        lineHeight: "20px",
        display: "flex",
        alignItems: "center",
        color: "studioSettings.tab.name",
      }}
      onClick={props.name === SETTINGS_TABS.billing ? null : props.onClick}
      className="space-x-2"
    >
      {props.name === SETTINGS_TABS.billing ? (
        <ManageBillingTab />
      ) : (
        <>
          <Box width={"18px"}>{renderIcon(props.name)}</Box>
          <Text as="p">{props.name}</Text>
          {props.name === SETTINGS_TABS.members ? (
            <Text
              as="p"
              sx={{
                padding: "1px 8px",
                bg: "studioSettings.tab.countBg",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: "18px",
              }}
            >
              {props.membersCount || 0}
            </Text>
          ) : null}
        </>
      )}
    </Box>
  );
};

interface SettingsProps {
  onClickTab: (tab: string) => void;
  selectedTab: string;
  membersCount: number;
}

const SettingsBox: FC<SettingsProps> = (props) => {
  const { currentStudio } = useStudio();
  const { user } = useUser();

  const isPersonalStudio = currentStudio?.id === user?.defaultStudioID;

  const canManageIntegrations = useHasPermission(
    StudioPermissionEnum.STUDIO_MANAGE_INTEGRATION,
    PermissionContextEnum.Studio
  );

  const canManageBilling = useHasPermission(
    StudioPermissionEnum.CAN_MANAGE_BILLING,
    PermissionContextEnum.Studio
  );

  const { onClickTab, selectedTab, membersCount } = props;

  const { t } = useTranslation();
  return (
    <>
      <Text
        as="p"
        sx={{
          fontSize: "12px",
          lineHeight: "18px",
          fontWeight: 600,
          mb: "16px",
          color: "studioSettings.settingsHeading",
        }}
      >
        {t("workspace.workspaceSettings")}
      </Text>
      <Box>
        {tabs
          .filter(
            (tab: string) =>
              tab === SETTINGS_TABS.roles
                ? !isPersonalStudio
                : tab === SETTINGS_TABS.general
                ? !isPersonalStudio
                : tab === SETTINGS_TABS.integrations
                ? !isPersonalStudio && canManageIntegrations
                : tab === SETTINGS_TABS["pending requests"]
                ? !isPersonalStudio && !currentStudio?.allowPublicMembership
                : tab === SETTINGS_TABS.billing
                ? canManageBilling
                : true

            // tab !== "general" || (tab === "general" && !isPersonalStudio)
          )
          .map((tab) => (
            <Tab
              name={tab}
              isSelected={selectedTab === tab}
              onClick={(e) => {
                onClickTab(tab);
              }}
              key={tab}
              membersCount={membersCount}
            />
          ))}
      </Box>
    </>
  );
};

export default SettingsBox;
