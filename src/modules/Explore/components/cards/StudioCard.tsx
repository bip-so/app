import { Box, Avatar, Text, Button, Token } from "@primer/react";
import { useState } from "react";

import * as React from "react";
import { StudioType } from "../../../Studio/types";
import ExploreService from "../../services";
import { useToasts } from "react-toast-notifications";
import { useStudio } from "../../../../context/studioContext";
import BipRouteUtils from "../../../../core/routeUtils";
import { useUser } from "../../../../context/userContext";
import { AVATAR_PLACEHOLDER } from "../../../../commons/constants";
import { useRouter } from "next/router";
import ImageWithName from "../../../../components/ImageWithName";
import useDeviceDimensions from "../../../../hooks/useDeviceDimensions";
import segmentEvents from "../../../../insights/segment";
import { userInfo } from "os";
import StudioService from "../../../Studio/services";
import LinkWithoutPrefetch from "../../../../components/LinkWithoutPrefetch";

interface IStudioCardProps {
  studio: StudioType;
}

const StudioCard: React.FunctionComponent<IStudioCardProps> = ({ studio }) => {
  const [isJoined, setIsJoined] = useState(studio.isJoined);
  const [isRequested, setIsRequested] = useState(studio.isRequested);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, user } = useUser();
  const router = useRouter();
  const { isTabletOrMobile } = useDeviceDimensions();

  const { addStudio, deleteStudio, currentStudio, saveCurrentStudio } =
    useStudio();
  // const [adminList, setAdminList] = useState([]);

  const { addToast } = useToasts();

  // React.useEffect(() => {
  //   StudioService.getAdmins()
  //     .then((resp) => {
  //       const { data: s } = resp;
  //       const final = s.data;
  //       setAdminList(final);
  //     })
  //     .catch((err) => {});
  // }, []);

  const handleJoin = async () => {
    const studioId = studio.id;
    // const payload = {
    //   userId: studio.id,
    // };
    setIsLoading(true);
    try {
      if (isJoined) {
        await ExploreService.unfollowStudio(studioId);
        deleteStudio(studio.id);
      } else {
        segmentEvents.studioJoined(
          user?.id,
          studio.handle,
          studio.membersCount
          // adminList[0]?.id,
          // adminList?.length
          //       member_user_id:member_user_id,
          // studio_handle: studio_handle,
          // total_member_count: total_member_count,
          // admin_user_id: admin_user_id,
          // admin_count: admin_count,
        );
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

  const tagArray: string[] = ["Collaboration", "Build In Public", "DAO"];

  return (
    <LinkWithoutPrefetch
      href={BipRouteUtils.getHandleRoute(studio.handle)}
      muted
      hoverColor="none"
    >
      <Box //default-card
        sx={{
          ":hover": {
            boxShadow: "0 0 12px rgba(33,33,33,.2)",
            cursor: "pointer",
          },
        }}
        backgroundColor={"studioCard.bg"}
        display={"flex"}
        flexDirection="column"
        // justifyContent={"center"}
        alignItems="center"
        padding={"16px"}
        width={["360px", "360px", "600px", "600px"]}
        // height={["177px", "177px", "152px", "152px"]}
        borderRadius="12px"
        borderWidth="1px"
        borderColor={"studioCard.border"}
        marginY={"30px"}
        borderStyle="solid"
        alignSelf={"stretch"}
        // overflow={"hidden"}
      >
        <Box //upper
          display={"flex"}
          flexDirection="row"
          justifyContent={"space-between"}
          width={"100%"}
          alignItems={"flex-start"}
          // width={["360px", "360px", "560px", "560px"]}
          // height={"70px"}
          // mt={["-35px", "-35px", "-0px", "0px"]}
          // alignSelf="stretch"
        >
          <Box //frame22
            display={"flex"}
            alignItems={"flex-start"}
            flex={1}
            // width="277px"
            // height={"70px"}
          >
            <Box minWidth={"64px"} minHeight={"64px"}>
              <ImageWithName
                sx={{ height: "64px", width: "64px", color: "text.default" }}
                // height={"64px !important"}
                // width={"64px !important"}
                src={studio.imageUrl}
                name={studio.displayName}
              />
            </Box>
            <Box //Frame19
              display={"flex"}
              flexDirection="column"
              // width="189px"
              // height={"70px"}
            >
              <Box //Frame17
                display={"flex"}
                flexDirection="column"
                // width="54px"
                // height={"40px"}
                ml="16px"
              >
                <Text
                  color={"studioCard.text.displayname"}
                  fontWeight={600}
                  fontSize="16px"
                  lineHeight={"24px"}
                  // whiteSpace={isTabletOrMobile ? "initial" : "nowrap"}
                  sx={{
                    width: isTabletOrMobile ? "108px" : "160px",
                    whiteSpace: isTabletOrMobile ? "initial" : "nowrap",
                    overflowWrap: "break-word",
                  }}
                >
                  {studio.displayName}
                </Text>

                <Text
                  color="studioCard.text.handle"
                  fontWeight={400}
                  fontSize="14px"
                  lineHeight={"20px"}
                  // mt={"5px"}
                  whiteSpace="nowrap"
                >
                  @{studio.handle}
                </Text>
              </Box>
              <Box
                sx={{
                  // width: ["320px", "320px", "480px", "480px"],
                  mt: ["27px", "27px", "20px", "20px"],
                  ml: ["-60px", "-60px", "15px", "15px"],
                }}
              >
                <Text
                  fontWeight={400}
                  fontSize="14px"
                  lineHeight={"20px"}
                  color={"studioCard.text.description"}
                >
                  {studio.description}
                </Text>
              </Box>
            </Box>
          </Box>

          {studio.createdById === user?.id ? null : (
            <Button
              disabled={isLoading}
              id={"explore-studio-join-btn"}
              onClick={joinHandler}
              sx={{
                color: !isJoined
                  ? "studioCard.text.joinButton"
                  : "studioCard.text.joinedButton",
                fontWeight: 600,
                ml: isJoined ? "-75px" : "-60px",
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
          )}
        </Box>
        <Box //lower
          display={"flex"}
          justifyContent="space-between"
          alignItems={"center"}
          padding="0px 0px 0px 88px"
          alignSelf="stretch"
          mt="30px"
          // mb={["-30px", "-30px", "0px", "0px"]}
          ml={["-90px", "-90px", "-10px", "-10px"]}
        >
          <Box //followers
            display={"flex"}
            flexDirection={"row"}
            justifyContent="space-between"
            padding="2px"
            // height={"14px"}
            // ml={["-100px"]} //dsfssdfadsfsdafda
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
          <Box //tags
            display={"flex"}
            padding="2px"
            flexWrap={"wrap"}
            // width="295px"
            // height={"26px"}
          >
            {studio.topics?.map((tag, i) =>
              tag.name ? (
                <Token
                  size="large"
                  key={i}
                  sx={{
                    // height: "26px",
                    fontWeight: 400,
                    fontSize: "14px",
                    mx: 1,
                    bg: "none",
                    padding: "1px 12px",
                    color: "text.subtle",
                    borderColor: "border.default",
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
  );
};

export default StudioCard;
