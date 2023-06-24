import { Box, Text, TextInput } from "@primer/react";
import * as React from "react";
import useSWR from "swr";
import { IUserStudio } from "../../../interfaces/user/IUserStudio";
import RoleService from "../../Permissions/services/roleService";
import { IUserMini } from "../../../commons/types";
import { IRole } from "../interfaces";
import ImageWithName from "../../../components/ImageWithName";
import AvatarWithPlaceholder from "../../../components/AvatarWithPlaceholder";
import { SearchIcon } from "@primer/styled-octicons";
import InfiniteScroll from "react-infinite-scroll-component";
import BipLoader from "../../../components/BipLoader";
import useDebounce from "../../../hooks/useDebounce";

interface IRoleMembersOverlayProps {
  role: IRole;
}

type RoleMemberType = {
  avatarUrl: string;
  fullName: string;
  id: number;
  username: string;
  uuid: string;
};

const RoleMembersOverlay: React.FunctionComponent<IRoleMembersOverlayProps> = ({
  role,
}) => {
  const [searchInput, setSearchInput] = React.useState<string>("");
  const [members, setMembers] = React.useState((): RoleMemberType[] => []);
  const [searchedMembers, setSearchedMembers] = React.useState(
    (): RoleMemberType[] => []
  );
  const [skip, setSkip] = React.useState(0);
  const [searchSkip, setSearchSkip] = React.useState(0);
  const debounceSearch = useDebounce(searchInput, 500);

  const fetchRoleMembers = async () => {
    if (skip === -1) return;
    try {
      const resp = await RoleService.getRoleMembers(role.id, skip);
      if (resp.data.data?.length) {
        setMembers([...members, ...resp.data.data]);
      }
      if (resp.data.next) {
        setSkip(parseInt(resp.data.next));
      } else {
        setSkip(-1);
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchSearchedMembers = async (
    skip: number = 0,
    initialMembers: RoleMemberType[] = []
  ) => {
    if (skip === -1) return;
    try {
      const resp = await RoleService.searchRoleMembers(
        role.id,
        debounceSearch,
        skip
      );
      if (resp.data.data?.length) {
        setSearchedMembers([...initialMembers, ...resp.data.data]);
      }
      if (resp.data.next) {
        setSearchSkip(parseInt(resp.data.next));
      } else {
        setSearchSkip(-1);
      }
    } catch (error) {
      throw error;
    }
  };

  React.useEffect(() => {
    if (role) {
      fetchRoleMembers();
    }
  }, [role]);

  React.useEffect(() => {
    if (debounceSearch.length) {
      fetchSearchedMembers();
    } else {
      setSearchedMembers([]);
      setSearchSkip(0);
    }
  }, [debounceSearch]);

  const filteredMembers = React.useMemo(() => {
    if (debounceSearch.length) {
      return searchedMembers;
    }
    return members;
  }, [members, searchedMembers, debounceSearch]);

  const filteredSkip = React.useMemo(() => {
    if (debounceSearch.length) {
      return searchSkip;
    }
    return skip;
  }, [searchSkip, skip, debounceSearch]);

  return (
    <Box
      sx={{
        padding: "8px",
      }}
    >
      {members?.length > 6 ? (
        <TextInput
          sx={{
            border: "1px solid",
            borderColor: "border.subtle",
            boxShadow: "none",
            background: "transparent",
            boxSizing: "border-box",
            "input::placeholder": { color: "text.gray" },
          }}
          leadingVisual={() => <SearchIcon color={"text.gray"} />}
          aria-label="Members"
          name="Members"
          placeholder="Search members"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value.toLowerCase())}
        />
      ) : null}
      <Box
        sx={{
          maxHeight: "240px",
          overflowY: "auto",
          paddingTop: members?.length > 6 ? "10px" : "0px",
        }}
        id={"role-members-container"}
      >
        {filteredMembers?.length ? (
          <InfiniteScroll
            hasMore={filteredSkip !== -1}
            dataLength={filteredMembers.length}
            next={() => {
              if (debounceSearch.length) {
                fetchSearchedMembers(searchSkip, searchedMembers);
              } else {
                fetchRoleMembers();
              }
            }}
            loader={<BipLoader />}
            className="space-y-4"
            scrollableTarget={"role-members-container"}
            scrollThreshold={0.9}
          >
            {filteredMembers.map((member: IUserMini, index: number) => {
              return (
                <Box key={index} display="flex" alignItems="center">
                  <AvatarWithPlaceholder
                    src={member?.avatarUrl}
                    sx={{
                      color: "text.default",
                      width: "20px",
                      height: "20px",
                    }}
                  />
                  <Text marginLeft="8px" fontSize={"14px"}>
                    {member?.fullName || member?.username}
                  </Text>
                </Box>
              );
            })}
          </InfiniteScroll>
        ) : (
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            py={"4px"}
          ></Box>
        )}
      </Box>
    </Box>
  );
};

export default RoleMembersOverlay;
