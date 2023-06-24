import {
  Box,
  Text,
  Button,
  Token,
  Tooltip,
} from "@primer/react";
import { useState } from "react";

import * as React from "react";
import { StudioType } from "../../Studio/types";
import { useToasts } from "react-toast-notifications";
import { useStudio } from "../../../context/studioContext";
import BipRouteUtils from "../../../core/routeUtils";
import { useUser } from "../../../context/userContext";
import { useRouter } from "next/router";
import ImageWithName from "../../../components/ImageWithName";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import segmentEvents from "../../../insights/segment";
import ExploreService from "../../Explore/services";
import StudioService from "../../Studio/services";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

interface IStudioCardProps {
  studio: StudioType;
}

const OnboardingStudioCard: React.FunctionComponent<IStudioCardProps> = ({
  studio,
}) => {
  const [isJoined, setIsJoined] = useState(studio.isJoined);
  const [isRequested, setIsRequested] = useState(studio.isRequested);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, user } = useUser();
  const router = useRouter();
  const { isTabletOrMobile } = useDeviceDimensions();

  const { addStudio, deleteStudio, currentStudio, saveCurrentStudio } =
    useStudio();

  const { addToast } = useToasts();

  const handleJoin = async () => {
    const studioId = studio.id;

    setIsLoading(true);
    try {
      if (isJoined) {
        await ExploreService.unfollowStudio(studioId);
        deleteStudio(studio.id);
      } else {
        await ExploreService.followStudio(studioId);
        addStudio(studio);
      }

      if (currentStudio) {
        saveCurrentStudio({
          ...currentStudio,
          isJoined: !currentStudio?.isJoined,
          membersCount: isJoined
            ? currentStudio.membersCount - 1
            : currentStudio.membersCount + 1,
        });
      }

      setIsJoined(!isJoined);
      addToast(`${isJoined ? "Left" : "Joined"} ${studio.displayName}`, {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      addToast(
        `Unable to ${
          isJoined ? "Leave" : "Join"
        }. Please try again after some time!`,
        {
          appearance: "error",
          autoDismiss: true,
        }
      );
    }
    setIsLoading(false);
  };

  const requestToJoin = () => {
    setIsLoading(true);
    StudioService.requestToJoin(studio.id)
      .then((r) => {
        setIsRequested(true);
        addToast(`Requested to join ${studio?.displayName}`, {
          appearance: "success",
          autoDismiss: true,
        });
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        addToast(`Something went wrong. Please try again after some time!`, {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  const joinHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoggedIn) {
      if (isJoined || studio.allowPublicMembership) {
        handleJoin();
      } else if (!isRequested) {
        requestToJoin();
      }
    } else logout();
  };

  const logout = () => {
    window.location.replace(
      `${BipRouteUtils.getSignInRoute()}?returnUrl=${router.asPath}`
    );
  };

  // const tagArray: string[] = ["Collaboration", "Build In Public", "DAO"];

  return (
    <>
      <LinkWithoutPrefetch
        href={BipRouteUtils.getHandleRoute(studio.handle)}
        muted
        hoverColor="none"
      >
        <Box //default-card
          sx={{
            // ":hover": {
            boxShadow: "0 3px 6px rgba(140,149,159,.15)",
            cursor: "pointer",
            // },
          }}
          backgroundColor={"studioCard.bg"}
          display={"flex"}
          flexDirection="column"
          alignItems="center"
          position={"relative"}
          width={"236px !important"}
          borderRadius="12px"
          borderWidth="1px"
          height={"356px"}
          justifyContent={"space-between"}
          borderColor={"studioCard.border"}
          borderStyle="solid"
          alignSelf={"stretch"}
        >
          <Box
            display={"flex"}
            flexDirection="column"
            padding={"12px 12px 0px"}
            justifyContent={"space-between"}
            width={"100%"}
            height={"144px"}
            alignItems={"flex-start"}
          >
            <Box display={"flex"} flexDirection={"row"} width={"100%"}>
              <Box
                display={"flex"}
                alignItems={"flex-start"}
                flexDirection="column"
                height={"84px"}
                justifyContent="space-between"
                flex={1}
              >
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"space-between"}
                  width={"100%"}
                >
                  <ImageWithName
                    sx={{
                      height: "48px",
                      width: "48px",
                      color: "text.default",
                    }}
                    src={studio.imageUrl}
                    name={studio.displayName}
                  />
                  <Box
                    display={"flex"}
                    alignItems={"flex-start"}
                    flexDirection="row"
                  >
                    <Button
                      disabled={isLoading}
                      id={"explore-studio-join-btn"}
                      onClick={joinHandler}
                      sx={{
                        border: 0,
                        paddingX: "10px",
                        bg: "unset",
                        color: !isJoined
                          ? "collectionItem.nodeName"
                          : "studioCard.text.joinedButton",
                        fontWeight: 600,
                        ml: isJoined ? "-75px" : "-56px",
                      }}
                    >
                      {isJoined
                        ? "Joined"
                        : studio.allowPublicMembership
                        ? "Join"
                        : isRequested
                        ? "Requested"
                        : "Request to Join"}
                    </Button>
                    {/* <Button
                      sx={{
                        paddingX: "10px",
                        bg: "unset",
                        border: 0,
                      }}
                    >
                      ...
                    </Button> */}
                  </Box>
                </Box>
                {/* <Tooltip
                  aria-label={studio.displayName}
                  noDelay
                  sx={{
                    display: "content",
                    "::after": {
                      bg: "rgba(0, 0, 0, 0.65)",
                      color: "#fff",
                      fontWeight: 600,
                      maxWidth: `210px !important`,
                      textAlign: "start",
                    },
                    "::before": {
                      borderTopColor: "rgba(0, 0, 0, 0.65) !important",
                      color: "rgba(0, 0, 0, 0.65)",
                    },
                  }}
                  wrap
                  direction="n"
                > */}
                {/* <Truncate maxWidth={150} title={studio.displayName}> */}
                  <Text
                    color={"studioCard.text.displayname"}
                    fontWeight={600}
                    fontSize="16px"
                    lineHeight={"24px"}
                    sx={{
                    textOverflow: "ellipsis",
                      overflow: "hidden",
                      width: "150px",
                      whiteSpace: "nowrap",
                      overflowWrap: "break-word",
                    }}
                  >
                    {studio.displayName}
                  </Text>
                {/* </Truncate> */}
                {/* </Tooltip> */}
              </Box>
            </Box>
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent="space-between"
              padding="2px"
            >
              <Text
                fontStyle={"normal"}
                fontWeight={400}
                fontSize="14px"
                lineHeight={"20px"}
                sx={
                  {
                    // height: "14px",
                  }
                }
              >
                {studio.membersCount}
              </Text>
              <Text
                fontWeight={400}
                fontSize="14px"
                lineHeight={"20px"}
                sx={{
                  pl: "6px",
                  color: "studioCard.text.members",
                  // width: "63px",
                  // height: "14px",
                }}
              >
                Members
              </Text>
            </Box>
          </Box>
          <Box
            display={"flex"}
            justifyContent="space-between"
            alignItems={"center"}
            flexDirection={"column"}
            borderRadius="12px"
            bg={"auth.bg"}
            minHeight={"188px"}
            padding="12px 12px 20px"
            alignSelf="stretch"
          >
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent="space-between"
              padding="2px"
            >
              <Tooltip
                aria-label={studio.description}
                noDelay
                sx={{
                  display: "content",
                  "::after": {
                    bg: "#30363D",
                    color: "#fff",
                    fontWeight: 600,
                    maxWidth: `210px !important`,
                    textAlign: "start",
                  },
                  "::before": {
                    borderTopColor: "#30363D !important",
                    color: "rgba(0, 0, 0, 0.65)",
                  },
                }}
                wrap
                direction="n"
              >
                <Text
                  fontStyle={"normal"}
                  fontWeight={400}
                  fontSize="14px"
                  lineHeight={"20px"}
                  style={{
                    display: "-webkit-Box",
                    overflow: "hidden",
                    WebkitLineClamp: "3",
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {studio.description}
                </Text>
              </Tooltip>
            </Box>
            <Box display={"flex"} padding="2px" flexWrap={"wrap"}>
              {studio.topics?.map((tag, i) =>
                tag.name && i <= 5 ? (
                  <Token
                    size="large"
                    key={i}
                    sx={{
                      fontWeight: 400,
                      fontSize: "12px",
                      mx: 1,
                      bg: "none",
                      padding: "1px 12px",
                      color: "auth.signin.heading",
                      border: "1px solid",
                      borderColor: "setup.avatarBorder",
                      my: "2px",
                    }}
                    text={tag.name}
                  />
                ) : null
              )}
            </Box>
          </Box>
        </Box>
      </LinkWithoutPrefetch>
    </>
  );
};

export default OnboardingStudioCard;
