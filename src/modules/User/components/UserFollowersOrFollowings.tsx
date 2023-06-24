import React, { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { HandleWrapper } from "../../../hooks/useHandle";
import { sanitizeHandle } from "../../../utils/Common";
import UserService from "../services";
import { Avatar, Box, IconButton, Text } from "@primer/react";
import BipLoader from "../../../components/BipLoader";
import BipRouteUtils from "../../../core/routeUtils";
import { ArrowLeftIcon } from "@primer/styled-octicons";
import { AVATAR_PLACEHOLDER } from "../../../commons/constants";
import Handle from "../../../components/Handle";
import UserCard from "../../Explore/components/cards/UserCard";
import Link from "next/link";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

interface UserFollowType {
  avatarUrl: string;
  followers: number;
  following: number;
  fullName: string;
  id: number;
  isFollowing: boolean;
  username: string;
  uuid: string;
}

interface Props {
  type: "followers" | "followings";
  data: any;
}

const UserFollowersOrFollowings: FC<Props> = (props) => {
  const { type, data } = props;
  const router = useRouter();
  const handle = sanitizeHandle(router.query.handle as string);

  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<UserFollowType[]>([]);

  useEffect(() => {
    if (data?.id && data?.username === handle) {
      if (type === "followers") {
        getFollowers();
      } else if (type === "followings") {
        getFollowings();
      }
    }
  }, [data, handle]);

  const getFollowers = async () => {
    setLoading(true);
    const { data: followersData } = await UserService.getFollowers(data?.id);
    setUsers(followersData || []);
    setLoading(false);
  };

  const getFollowings = async () => {
    setLoading(true);
    const { data: followingsData } = await UserService.getFollowings(data?.id);
    setUsers(followingsData || []);
    setLoading(false);
  };

  return (
    <HandleWrapper>
      <div className="flex flex-col w-1/2 mx-auto mt-4">
        {data ? (
          <>
            <div className="flex items-center space-x-2">
              <LinkWithoutPrefetch
                href={BipRouteUtils.getHandleRoute(data?.username)}
              >
                <IconButton
                  aria-label="Back"
                  icon={ArrowLeftIcon}
                  sx={{
                    border: "none",
                    borderRadius: "50%",
                    background: "transparent",
                    boxShadow: "none",
                  }}
                />
              </LinkWithoutPrefetch>
              <div className="flex items-center space-x-4">
                <Avatar
                  src={data?.avatarUrl || AVATAR_PLACEHOLDER}
                  sx={{
                    width: "40px",
                    height: "40px",
                  }}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = AVATAR_PLACEHOLDER;
                  }}
                />
                <div className="flex flex-col">
                  <Text fontWeight={"bold"} fontSize="16px">
                    {data?.fullName}
                  </Text>
                  <Handle handle={data?.username || ""} />
                </div>
              </div>
            </div>
          </>
        ) : null}
        {users.map((user) => (
          <UserCard key={user.uuid} userDetails={user} />
        ))}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: "16px" }}>
            <BipLoader />
          </Box>
        ) : null}
      </div>
    </HandleWrapper>
  );
};

export default UserFollowersOrFollowings;
