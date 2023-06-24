import { Box, Text } from "@primer/react";
import { CheckIcon, PeopleIcon } from "@primer/styled-octicons";
import * as React from "react";
import { IUserMini } from "../../../../commons/types";
import AvatarWithPlaceholder from "../../../../components/AvatarWithPlaceholder";
import ImageWithName from "../../../../components/ImageWithName";
import { BranchMemberTypeEnum } from "../../enums";
import { IBranchMember, IRole } from "../../interfaces";

interface IMemberListItemProps {
  type: BranchMemberTypeEnum;
  user?: IUserMini;
  role?: IRole;
  selected?: boolean;
}

const MemberListItem: React.FunctionComponent<IMemberListItemProps> = ({
  type,
  user,
  role,
  selected,
}: IMemberListItemProps) => {
  return (
    <div className="flex items-center justify-between">
      {type === BranchMemberTypeEnum.Member ? (
        <div className="flex items-center space-x-2">
          <AvatarWithPlaceholder
            src={user?.avatarUrl}
            size={32}
            sx={{
              color: "text.default",
              width: "32px",
              height: "32px",
            }}
          />
          <div className="flex flex-col">
            <Text
              fontSize={"14px"}
              sx={{
                color: "selectedUsers.username",
              }}
            >
              {user?.fullName || "-"}
            </Text>
            <Text fontSize={"12px"} color="selectedUsers.handle">
              @{user?.handle || user?.username}
            </Text>
          </div>
        </div>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          // onMouseEnter={(event) => setShowGroupMembers(true)}
          // onMouseLeave={(event) => setShowGroupMembers(false)}
        >
          <PeopleIcon size={32} marginRight="8px" />
          <div className="flex space-x-3">
            <Text
              fontSize={"14px"}
              fontWeight="bold"
              color={"selectedUsers.username"}
            >
              {role?.name}
            </Text>
          </div>
        </Box>
      )}

      {selected ? <CheckIcon color="selectedUsers.checkIcon" /> : null}
    </div>
  );
};

export default MemberListItem;
