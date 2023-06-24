import {
  BellIcon,
  BookmarkIcon,
  CheckIcon,
  PeopleIcon,
  PersonIcon,
  ProjectIcon,
  RepoForkedIcon,
  RocketIcon,
  RssIcon,
  SyncIcon,
  TelescopeIcon,
} from "@primer/octicons-react";
import { Avatar, Box, Button, Text } from "@primer/react";
import { useTranslation } from "next-i18next";
import { FC, ReactElement, useEffect, useMemo, useState } from "react";
// import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

import CommunityCard from "../../../components/CommunityCard";
import Footer from "./Footer";
import Header from "./Header";
import Link from "next/link";
import Image from "next/image";
import { BookIcon, HeartFillIcon, Icon } from "@primer/styled-octicons";
import { Feedback, USER_FEEDBACKS } from "../../../core/feedbacks";
import { AVATAR_PLACEHOLDER } from "../../../commons/constants";
import BipRouteUtils from "../../../core/routeUtils";
import { StudioType } from "../../Explore/types";
import ExploreService from "../../Explore/services";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import { HOME_STUDIOS } from "../constants";
import Discord from "next-auth/providers/discord";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

interface UserFeedbackBoxProps {
  feedback: Feedback;
}

const UserFeedbackBox: FC<UserFeedbackBoxProps> = ({
  feedback,
}: UserFeedbackBoxProps) => (
  <Box
    width="17.75rem"
    borderRadius={"0.75rem"}
    mx={"1rem"}
    mb={"2rem"}
    boxShadow={"0px 0px 4px rgba(0, 0, 0, 0.16)"}
    bg={"auth.home.box5.cardBg"}
    p={"1rem"}
  >
    <Box display={"flex"} flexShrink={0}>
      <Avatar src={feedback.avatarUrl || AVATAR_PLACEHOLDER} size={50} square />
      <Box display={"flex"} flexDirection="column" ml={"0.625rem"}>
        <Text
          as="p"
          fontWeight={400}
          fontSize={["14px", "14px", "14px", "16px"]}
          lineHeight={["20px", "20px", "20px", "24px"]}
          color="auth.home.box5.name"
        >
          {feedback.name}
        </Text>
        <Text
          as="p"
          fontWeight={400}
          fontSize={["13px", "13px", "13px", "14px"]}
          lineHeight={["18px", "18px", "18px", "20px"]}
          color="auth.home.box5.company"
        >
          {feedback.company}
        </Text>
      </Box>
    </Box>
    <Text
      as="p"
      fontWeight={400}
      fontSize={["14px", "14px", "14px", "16px"]}
      lineHeight={["20px", "20px", "20px", "24px"]}
      color="auth.home.box5.feedback"
      mt={"0.75rem"}
    >
      {feedback.feedback}
    </Text>
  </Box>
);

interface WhoIsBipForCardProps {
  bg: string;
  title: string;
  description: string;
  icon: Icon;
}

const WhoIsBipForCard: FC<WhoIsBipForCardProps> = (props) => (
  <Box
    display={"flex"}
    flexDirection="column"
    width={"20.25rem"}
    mx={"1.063rem"}
    mb="2rem"
  >
    <Box
      height={"9.625rem"}
      borderRadius={"0.375rem"}
      display={"flex"}
      flexDirection="column"
      justifyContent={"center"}
      bg={props.bg}
      pl={"0.75rem"}
    >
      <props.icon size={24} />
      <Text
        as="p"
        fontWeight={400}
        fontSize={["22px", "22px", "22px", "24px"]}
        lineHeight={["32px", "32px", "32px", "36px"]}
        mt={"7px"}
        color={"auth.home.box4.title"}
      >
        {props.title}
      </Text>
    </Box>
    <Box display={"flex"} mt="2.25rem">
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        flexShrink={0}
        width={"2rem"}
        height={"2rem"}
        borderRadius={"50%"}
        bg={props.bg}
      >
        <CheckIcon />
      </Box>
      <Text
        as="p"
        fontWeight={400}
        fontSize={["18px", "18px", "18px", "20px"]}
        lineHeight={["26px", "26px", "26px", "30px"]}
        ml={16}
        color="auth.home.box4.description"
      >
        {props.description}
      </Text>
    </Box>
  </Box>
);

interface TextProps {
  text: string;
  ml?: string;
  mt?: string;
  color?: string;
}

const LargeText: FC<TextProps> = (props) => (
  <Text
    as="p"
    fontWeight={400}
    fontSize={"32px"}
    lineHeight={"48px"}
    color="auth.home.box3.head"
  >
    {props.text}
  </Text>
);

const MediumText: FC<TextProps> = (props) => (
  <Text
    as="p"
    fontWeight={400}
    fontSize={"20px"}
    lineHeight={"30px"}
    mt={props.mt || "7px"}
    color={props.color || "auth.home.box3.subHead"}
  >
    {props.text}
  </Text>
);

const SmallText: FC<TextProps> = (props) => (
  <Text
    as="p"
    fontWeight={400}
    fontSize={["13px", "13px", "13px", "18px"]}
    lineHeight={["18px", "18px", "18px", "30px"]}
    ml={props.ml || "0.75rem"}
    color="auth.home.box3.points"
  >
    {props.text}
  </Text>
);

interface AquaSpringBoxProps {
  children?: ReactElement;
}

const AquaSpringBox: FC<AquaSpringBoxProps> = (props) => (
  <Box
    style={{ height: "58px", width: "58px", flexShrink: 0 }}
    display={"flex"}
    alignItems={"center"}
    justifyContent={"center"}
    borderRadius={"50%"}
    width={"3.625rem"}
    height={"3.625rem"}
    bg={"auth.home.box3.iconBg"}
  >
    {props.children}
  </Box>
);

interface AuthHomeProps {}

interface IDiscordIntegrationFeatureProps {
  context: "auth" | "discord-integration";
}

export const DiscordIntegrationFeature: FC<IDiscordIntegrationFeatureProps> = ({
  context,
}) => {
  const { t } = useTranslation();

  const { isTabletOrMobile } = useDeviceDimensions();

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      flexDirection={["column", "column", "column", "row"]}
    >
      <Box
        display={"flex"}
        flex={1}
        order={[2, 2, 2, 1]}
        mt={["3rem", "3rem", "3rem", "0rem"]}
      >
        <Image
          src="/discord-integration.png"
          alt="discord-integration"
          width={"600px"}
          height="596px"
          style={{ objectFit: "contain" }}
        />
      </Box>
      <Box
        display={"flex"}
        flex={1}
        flexDirection={"column"}
        ml={["0rem", "0rem", "0rem", "2.5rem"]}
        justifyContent={"center"}
        order={[1, 1, 1, 2]}
      >
        <LargeText text={t("auth.deepIntegrationWithDiscord")} />
        <MediumText text={t("auth.onboard")} />
        <Box display={"flex"} alignItems={"center"} mt={"2rem"}>
          <AquaSpringBox>
            <SyncIcon
              size={isTabletOrMobile ? 16 : 24}
              fill="#44B244"
              className="rotate-45"
            />
          </AquaSpringBox>
          <SmallText text={t("auth.autoSyncRoles")} />
        </Box>
        <Box display={"flex"} alignItems={"center"} mt={"2rem"}>
          <AquaSpringBox>
            <BookmarkIcon size={isTabletOrMobile ? 16 : 24} fill="#44B244" />
          </AquaSpringBox>
          <SmallText text={t("auth.captureImportant")} />
        </Box>
        <Box display={"flex"} alignItems={"center"} mt={"2rem"}>
          <AquaSpringBox>
            {/* <GetNotifiedIcon /> */}
            <BellIcon size={isTabletOrMobile ? 16 : 24} fill="#44B244" />
          </AquaSpringBox>
          <SmallText text={t("auth.getNotified")} />
        </Box>
        {context === "discord-integration" ? null : (
          <div>
            <LinkWithoutPrefetch
              href={BipRouteUtils.getDiscordIntegrationRoute()}
              passHref
            >
              <Button
                size="large"
                sx={{
                  bg: "auth.home.box3.buttonBg",
                  mt: "2rem",
                  color: "auth.home.box3.buttonText",
                  ":hover:not([disabled])": {
                    bg: "unset",
                  },
                }}
              >
                {t("auth.connectYourDiscordCommunity")}
              </Button>
            </LinkWithoutPrefetch>
          </div>
        )}
      </Box>
    </Box>
  );
};

const AuthHome: FC<AuthHomeProps> = ({}) => {
  const [currentCount, setCurrentCount] = useState(0);
  const { t } = useTranslation();
  const { isTabletOrMobile } = useDeviceDimensions();

  // const [studios, setStudios] = useState<StudioType[]>([]);

  // const getStudios = () => {
  //   ExploreService.getStudios()
  //     .then((resp) => {
  //       const { data: s } = resp;
  //       setStudios(s.data);
  //     })
  //     .catch((err) => {});
  // };

  const Nouns = [
    t("auth.dao"),
    t("auth.community"),
    t("auth.defiProject"),
    t("auth.openSourceTool"),
    t("auth.buildInPublic"),
  ];

  const incrementCurrentCount = () => {
    setCurrentCount((currentCount) => currentCount + 1);
  };

  useEffect(() => {
    // getStudios();
    const interval = setInterval(incrementCurrentCount, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // const filteredStudios = useMemo(() => {
  //   return studios.filter((stu, index) => index <= 5);
  // }, [studios]);

  return (
    <>
      <Header />
      <Box
        sx={{
          height: "calc(100vh - 48px)",
          marginTop: "48px",
          marginLeft: "auto",
          marginRight: "auto",
          bg: "auth.home.bg",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box display="flex" flexDirection={"column"} flexBasis={"480px"}>
          <Text
            as="p"
            color={"auth.home.box1.heading"}
            fontWeight={600}
            fontSize={["32px", "32px", "32px", "40px"]}
            lineHeight={"60px"}
            textAlign={["center", "center", "center", "start"]}
          >
            {t("auth.theOpenWorkspace")}
            <br />
            {t("auth.for")}{" "}
            {Nouns[currentCount % Nouns.length] !== t("auth.buildInPublic")
              ? t("auth.your") + " "
              : ""}
            <Text as="span" color={"auth.home.box1.defiProject"}>
              {Nouns[currentCount % Nouns.length]}
            </Text>
          </Text>
          <Text
            as="p"
            marginTop={16}
            color={"auth.home.box1.subHeading"}
            fontWeight={400}
            fontSize={["22px", "22px", "22px", "24px"]}
            lineHeight={"33px"}
            textAlign={["center", "center", "center", "start"]}
          >
            {t("auth.showcase")}
            <br />
            {t("auth.social")}
          </Text>
          <Box
            display={"flex"}
            alignItems="center"
            justifyContent={["center", "center", "center", "start"]}
            mt={"1.75rem"}
          >
            <LinkWithoutPrefetch
              href={BipRouteUtils.getExploreRoute()}
              passHref
            >
              <Button
                variant="primary"
                size="small"
                sx={{
                  mr: "16px",
                  border: "none",
                  ":focus:not([disabled])": { boxShadow: "none" },
                }}
              >
                {t("auth.exploreWorkspace")}
              </Button>
            </LinkWithoutPrefetch>
          </Box>
        </Box>
        <Box display={["none", "none", "none", "block"]}>
          <Image
            src="/manifesto.png"
            alt="manifesto"
            width={"600px"}
            height={"450px"}
            style={{ objectFit: "contain" }}
          />
        </Box>
      </Box>
      <Box
        position={"relative"}
        padding={"48px"}
        backgroundColor={"auth.home.box2.bg"}
        display="flex"
        flexDirection="column"
        alignItems="center"
        id="explore"
        backgroundImage={'url("community-section-bg.png")'}
        backgroundRepeat={"no-repeat"}
        backgroundPosition={"5% 0%"}
      >
        <Text
          as="p"
          fontWeight={400}
          fontSize={["26px", "26px", "26px", "32px"]}
          lineHeight={"45px"}
          color="auth.home.box2.heading"
        >
          {t("auth.discoverWorkspaces")}
        </Text>
        <Box
          display={"flex"}
          justifyContent="center"
          flexWrap={"wrap"}
          mx={"10rem"}
          marginTop={"63px"}
          maxWidth={"900px"}
        >
          {HOME_STUDIOS.map((studio) => (
            <CommunityCard key={studio.id} studio={studio} />
          ))}
        </Box>
        <LinkWithoutPrefetch href={BipRouteUtils.getExploreRoute()} passHref>
          <Text
            as="button"
            fontWeight={400}
            fontSize={["14px", "14px", "14px", "16px"]}
            lineHeight={["20px", "20px", "20px", "24px"]}
            color="auth.home.box2.link"
            marginTop={"31px"}
            sx={{
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "auth.home.box2.linkBorder",
            }}
          >
            {t("authWorkspace.explores")}
          </Text>
        </LinkWithoutPrefetch>
      </Box>
      <Box
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        pt={"4rem"}
        px={["2rem", "2rem", "2rem", "8.625rem"]}
        bg={"auth.home.box3.bg"}
        id={"features"}
      >
        <DiscordIntegrationFeature context="auth" />
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          flexDirection={["column", "column", "column", "row"]}
          mt={"8rem"}
        >
          <Box
            display={"flex"}
            flex={1}
            flexDirection={"column"}
            justifyContent={"center"}
          >
            <LargeText text={t("auth.createAndCollaborate")} />
            <MediumText text={t("auth.nonDevelopers")} />
            <Box display={"flex"} alignItems={"center"} mt={"2rem"}>
              <AquaSpringBox>
                <RepoForkedIcon
                  size={isTabletOrMobile ? 16 : 24}
                  fill="#44B244"
                />
              </AquaSpringBox>
              <SmallText text={t("auth.allowAnyone")} />
            </Box>
            <Box display={"flex"} alignItems={"center"} mt={"2rem"}>
              <AquaSpringBox>
                <PersonIcon size={isTabletOrMobile ? 16 : 24} fill="#44B244" />
              </AquaSpringBox>
              <SmallText text={t("auth.everyContribution")} />
            </Box>
          </Box>
          <Box
            display={"flex"}
            flex={1}
            ml={["0rem", "0rem", "0rem", "2.5rem"]}
            mt={["3rem", "3rem", "3rem", "0rem"]}
            justifyContent={"center"}
          >
            <Image
              src="/create-collaborate.png"
              alt="create-collaborate"
              width={"600px"}
              height="450px"
              style={{ objectFit: "contain" }}
            />
          </Box>
        </Box>
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          flexDirection={["column", "column", "column", "row"]}
          mt={"8rem"}
        >
          <Box
            display={"flex"}
            flex={1}
            order={[2, 2, 2, 1]}
            mt={["3rem", "3rem", "3rem", "0rem"]}
          >
            <Image
              src="/leaderboards.png"
              alt="leaderboards"
              height={"549px"}
              width={"487px"}
              style={{ objectFit: "contain" }}
            />
          </Box>
          <Box
            display={"flex"}
            flex={1}
            flexDirection={"column"}
            ml={["0rem", "0rem", "0rem", "2.5rem"]}
            justifyContent={"center"}
            order={[1, 1, 1, 2]}
          >
            <LargeText text={t("auth.engageYourFans")} />
            <MediumText text={t("auth.writingAndReading")} />
            <Box display={"flex"} alignItems={"center"} mt={"2rem"}>
              <AquaSpringBox>
                <ProjectIcon size={isTabletOrMobile ? 16 : 24} fill="#44B244" />
              </AquaSpringBox>
              <SmallText text={t("auth.leaderboardToMotivate")} />
            </Box>
            <Box display={"flex"} alignItems={"center"} mt={"2rem"}>
              <AquaSpringBox>
                <RssIcon size={isTabletOrMobile ? 16 : 24} fill="#44B244" />
              </AquaSpringBox>
              <SmallText text={t("auth.shareImportant")} />
            </Box>
            <Box display={"flex"} alignItems={"center"} mt={"2rem"}>
              <AquaSpringBox>
                <PeopleIcon size={isTabletOrMobile ? 16 : 24} fill="#44B244" />
              </AquaSpringBox>
              <SmallText text={t("auth.publicView")} />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        pt="6.25rem"
        display="flex"
        flexDirection="column"
        alignItems="center"
        bg={"auth.home.box4.bg"}
      >
        <Text
          as="p"
          fontWeight={400}
          fontSize={"1.75rem"}
          lineHeight={"2.813rem"}
          color="auth.home.box4.heading"
        >
          {t("auth.whoIsBipFor")}
        </Text>
        <Box
          display={"flex"}
          justifyContent="center"
          flexWrap={"wrap"}
          mt={"2.875rem"}
          mb={"6rem"}
        >
          <WhoIsBipForCard
            bg={"auth.home.box4.card1"}
            title={t("auth.daos")}
            description={t("auth.daosDesc")}
            icon={RocketIcon}
          />
          <WhoIsBipForCard
            bg={"auth.home.box4.card2"}
            title={t("auth.nicheCommunities")}
            description={t("auth.nicheCommunitiesDesc")}
            icon={BookIcon}
          />
          <WhoIsBipForCard
            bg={"auth.home.box4.card3"}
            title={t("auth.learning")}
            description={t("auth.learningDesc")}
            icon={TelescopeIcon}
          />
        </Box>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        pt={"2rem"}
        pb={"4rem"}
        bg={"auth.home.box5.bg"}
        px={"2rem"}
      >
        <Box display={"flex"} alignItems={"center"} sx={{ gap: "8px" }}>
          <Text
            as="p"
            fontWeight={400}
            fontSize={"1.75rem"}
            lineHeight={"2.813rem"}
            color="auth.home.box5.heading"
          >
            {t("auth.userLove")}
          </Text>
          <HeartFillIcon size={24} color={"auth.home.box5.heading"} />
        </Box>
        <Box
          display={"flex"}
          justifyContent="center"
          flexWrap={"wrap"}
          mt="3.875rem"
        >
          <Box>
            <UserFeedbackBox feedback={USER_FEEDBACKS[0]} />
            <UserFeedbackBox feedback={USER_FEEDBACKS[4]} />
          </Box>
          <Box>
            <UserFeedbackBox feedback={USER_FEEDBACKS[2]} />
            <UserFeedbackBox feedback={USER_FEEDBACKS[3]} />
          </Box>
          <Box>
            <UserFeedbackBox feedback={USER_FEEDBACKS[1]} />
            <UserFeedbackBox feedback={USER_FEEDBACKS[5]} />
          </Box>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default AuthHome;
