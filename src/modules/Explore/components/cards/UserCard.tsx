import { Box, Avatar, Text, Button } from "@primer/react";
import { useState, FC } from "react";

import * as React from "react";
import { UserType } from "../../types";
import ExploreService from "../../services";
import { useToasts } from "react-toast-notifications";
import BipRouteUtils from "../../../../core/routeUtils";
import { DEFAULT_USER_PLACEHOLDER } from "../../../../commons/constants";
import { useUser } from "../../../../context/userContext";
import { useRouter } from "next/router";
import segmentEvents from "../../../../insights/segment";
import useDeviceDimensions from "../../../../hooks/useDeviceDimensions";
import LinkWithoutPrefetch from "../../../../components/LinkWithoutPrefetch";

interface IUserCardProps {
  userDetails: UserType;
}

const UserCard: FC<IUserCardProps> = ({ userDetails }) => {
  const { isTabletOrMobile } = useDeviceDimensions();
  const { addToast } = useToasts();
  const { isLoggedIn, user: currentUser } = useUser();
  const [isFollowing, setIsFollowing] = useState(userDetails.isFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleFollowClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoggedIn) {
      const payload = {
        userId: userDetails.id,
      };
      setIsLoading(true);
      try {
        if (isFollowing) {
          await ExploreService.unfollowUser(payload);
        } else {
          await ExploreService.followUser(payload);
          segmentEvents.userFollowed(
            currentUser?.id!,
            currentUser?.username!,
            currentUser?.email!,
            userDetails?.id,
            userDetails?.username
          );
        }
        addToast(
          `${isFollowing ? "Unfollowed" : "Following"} ${
            userDetails.fullName || userDetails.username || userDetails.handle
          }`,
          {
            appearance: "success",
            autoDismiss: true,
          }
        );
      } catch (error) {
        addToast(
          `Unable to ${
            isFollowing ? "Unfollow" : "Follow"
          }. Please try again after some time!`,
          {
            appearance: "error",
            autoDismiss: true,
          }
        );
      }
      setIsFollowing(!isFollowing);
      setIsLoading(false);
    } else logout();
  };
  const logout = () => {
    window.location.replace(
      `${BipRouteUtils.getSignInRoute()}?returnUrl=${router.asPath}`
    );
  };
  return (
    <LinkWithoutPrefetch
      href={BipRouteUtils.getHandleRoute(
        userDetails?.handle || userDetails?.username
      )}
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
        backgroundColor={"userCard.bg"}
        padding={"16px"}
        width={["360px", "360px", "600px", "600px"]}
        borderRadius="12px"
        borderWidth="1px"
        borderColor={"userCard.border"}
        mt="30px"
        borderStyle="solid"
        overflow={"hidden"}
      >
        <Box //upper
          display={"flex"}
          justifyContent={"space-between"}
          alignItems="flex-start"
          height={"70px"}
          alignSelf="stretch"
        >
          <Box //frame22
            display={"flex"}
            alignItems={"flex-start"}
            width="277px"
            height={"70px"}
          >
            <Box maxWidth={"64px"} maxHeight={"64px"}>
              <Avatar
                style={{
                  maxHeight: "64px",
                  maxWidth: "64px",
                }}
                size={64}
                src={userDetails.avatarUrl || DEFAULT_USER_PLACEHOLDER}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = DEFAULT_USER_PLACEHOLDER;
                }}
              />
            </Box>
            <Box //Frame19
              display={"flex"}
              flexDirection="column"
              alignItems={"flex-start"}
              width="189px"
              height={"70px"}
            >
              <Box //Frame17
                display={"flex"}
                flexDirection="column"
                alignItems={"flex-start"}
                width={isTabletOrMobile ? "160px" : "260px"}
                height={"40px"}
                ml="16px"
              >
                <Text
                  color={"userCard.text.username"}
                  fontWeight={600}
                  fontSize="16px"
                  lineHeight={"24px"}
                  sx={{
                    whiteSpace: "initial",
                    overflowWrap: "anywhere",
                  }}
                >
                  {userDetails.fullName || userDetails.username || "Bip User"}
                </Text>
                <Text
                  color="userCard.text.handle"
                  fontWeight={400}
                  fontSize="14px"
                  lineHeight={"20px"}
                  mt={"5px"}
                >
                  @{userDetails?.username || userDetails?.handle}
                </Text>
              </Box>
            </Box>
          </Box>
          {userDetails.id !== currentUser?.id ? (
            <Box>
              <Button
                onClick={handleFollowClick}
                disabled={isLoading}
                sx={{
                  color: !isFollowing
                    ? "userCard.text.followButton"
                    : "userCard.text.followingButton",
                  marginRight: ["30px", "30px", "00px", "00px"],
                  fontWeight: "600",
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            </Box>
          ) : null}
        </Box>
        <Box //lower
          display={"flex"}
          justifyContent="space-between"
          alignItems={"center"}
          padding="0px 0px 0px 88px"
          width={["360px", "360px", "568px", "568px"]}
          height={"26px"}
          alignSelf="stretch"
          mr="200px"
          mt="15px"
          ml="-10px"
        >
          <Box //followers
            display={"flex"}
            justifyContent="space-between"
            alignItems={"flex-start"}
            padding="2px"
            height={"14px"}
            marginLeft={["-80px", "-80px", "0px", "0px"]}
          >
            <Text
              fontWeight={400}
              fontSize="14px"
              lineHeight={"20px"}
              sx={{
                height: "14px",
              }}
            >
              {userDetails.followers}
            </Text>
            <Text
              fontWeight={400}
              fontSize="14px"
              lineHeight={"20px"}
              sx={{
                pl: "6px",
                color: "userCard.text.followers",
                width: "63px",
                height: "14px",
              }}
            >
              Followers
            </Text>
          </Box>
          <Box //followers
            display={"flex"}
            justifyContent="space-between"
            alignItems={"flex-start"}
            padding="2px"
            height={"14px"}
            marginRight={["140px", "140px", "250px", "250px"]}
          >
            <Text
              fontWeight={400}
              fontSize="14px"
              lineHeight={"20px"}
              sx={{
                height: "14px",
              }}
            >
              {userDetails.following}
            </Text>
            <Text
              fontWeight={400}
              fontSize="14px"
              lineHeight={"20px"}
              sx={{
                pl: "6px",
                color: "userCard.text.followers",
                width: "63px",
                height: "14px",
              }}
            >
              Following
            </Text>
          </Box>
        </Box>
      </Box>
    </LinkWithoutPrefetch>
  );
};

export default UserCard;
