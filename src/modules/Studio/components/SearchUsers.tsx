import { CheckIcon, SearchIcon } from "@primer/octicons-react";
import { Box, Button, Text } from "@primer/react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PeopleIcon,
  XCircleFillIcon,
} from "@primer/styled-octicons";
import React, { FC, useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useToasts } from "react-toast-notifications";
import AvatarWithPlaceholder from "../../../components/AvatarWithPlaceholder";
import BipLoader from "../../../components/BipLoader";
import StyledTextInput from "../../../components/StyledTextInput";
import useDebounce from "../../../hooks/useDebounce";
import { isValidEmail } from "../../../utils/Common";
import UserService from "../../User/services";
import StudioService from "../services";
import { Member } from "../types";
import { useTranslation } from "next-i18next";

interface DropDownItemProps {
  title: string;
  count: number;
  opened: boolean;
  onClick: () => void;
}
const DropDownItem: FC<DropDownItemProps> = ({
  title,
  count,
  opened,
  onClick,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: "8px",
        px: "4px",
        cursor: count ? "pointer" : "default",
        alignItems: "center",
        opacity: count ? 1 : 0.5,
        borderRadius: "6px",
        ":hover": {
          bg: count ? "mentionDropdown.hoverBg" : "none",
        },
      }}
      onClick={() => {
        if (count > 0) {
          onClick();
        }
      }}
    >
      <Box display={"flex"} alignItems={"center"}>
        <Text
          as="p"
          sx={{
            fontSize: "14px",
            lineHeight: "20px",
            fontWeight: 500,
            color: "mentionDropdown.text",
          }}
        >
          {title}
        </Text>
        <Box
          as="p"
          sx={{
            fontSize: "12px",
            lineHeight: "18px",
            ml: "8px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "mentionDropdown.countColor",
            bg: "mentionDropdown.countBg",
            width: "20px",
            height: "20px",
          }}
        >
          {count}
        </Box>
      </Box>
      {opened ? (
        <ChevronDownIcon size={12} sx={{ color: "mentionDropdown.text" }} />
      ) : (
        <ChevronRightIcon size={12} sx={{ color: "mentionDropdown.text" }} />
      )}
    </Box>
  );
};

interface SearchUsersProps {
  inviteUsers: (ids: string[] | number[], emails: string[]) => void;
  showInviteAlways?: boolean;
  placeholder: string;
  addedUsers?: any[];
  members?: Member[];
  membersSkip?: number;
  loadingMembers?: boolean;
  scrollContainerId?: string;
  getNextPageMembers?: () => void;
  isRoleTab?: boolean;
}

const SearchUsers: FC<SearchUsersProps> = (props) => {
  const {
    members,
    membersSkip,
    loadingMembers,
    scrollContainerId,
    getNextPageMembers,
    isRoleTab,
  } = props;

  const [selectedUsers, setSelectedUsers] = useState((): any => []);
  const [emails, setEmails] = useState((): string[] => []);
  const [users, setUsers] = useState((): any => []);
  const [searchedMembers, setSearchedMembers] = useState((): Member[] => []);
  const [searching, setSearching] = useState(false);
  const [username, setUsername] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const [searchSkip, setSearchSkip] = useState(0);
  const debounceSearch = useDebounce(username, 500);
  const { addToast } = useToasts();
  const { t } = useTranslation();

  useEffect(() => {
    if (debounceSearch?.length) {
      if (isRoleTab) {
        setSearching(true);
        const resp1: any = StudioService.searchStudioMembers(debounceSearch);
        const resp2: any = UserService.getUsers(debounceSearch);
        Promise.all([resp1, resp2])
          .then((r) => {
            setSearchedMembers(r[0].data?.data || []);
            setUsers(r[1].data.data.users);
            setSearchSkip(parseInt(r[1].data?.next || "-1"));
            setSearching(false);
          })
          .catch((err) => {
            setSearching(false);
          });
      } else {
        setSearching(true);
        UserService.getUsers(debounceSearch)
          .then((r) => {
            setUsers(r.data.data.users);
            setSearchSkip(parseInt(r.data?.next || "-1"));
            setSearching(false);
          })
          .catch((err) => {
            setSearching(false);
          });
      }
    }
  }, [debounceSearch]);

  const searchNextPageUsers = () => {
    if (searchSkip !== -1 && debounceSearch?.length) {
      UserService.getUsers(debounceSearch, searchSkip)
        .then((r) => {
          const sUsers = r.data?.data?.users || [];
          setSearchSkip(parseInt(r.data?.next || "-1"));
          setUsers([...users, ...sUsers]);
        })
        .catch((err) => {});
    }
  };

  const isUserSelected = (user: any) => {
    const userData = selectedUsers.find(
      (selectedUser: any) => selectedUser.id === user.id
    );
    return userData ? true : false;
  };

  const onClickUser = (user: any) => {
    if (isUserSelected(user)) {
      const updatedUsers = selectedUsers.filter((us: any) => us.id !== user.id);
      setSelectedUsers(updatedUsers);
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const onClickInvite = () => {
    const memberIds = selectedUsers.map((user: any) => user.id);
    props.inviteUsers(memberIds, emails);
  };

  const addEmail = (email: string) => {
    setEmails([...emails, email]);
  };

  const removeEmail = (index: number) => {
    const filteredEmails = emails.filter(
      (email: string, emailIndex: number) => emailIndex !== index
    );
    setEmails(filteredEmails);
  };

  const valid = useMemo(() => {
    return isValidEmail(username.trim());
  }, [username]);

  const onEnterClick = () => {
    if (valid) {
      addEmail(username.trim());
      setUsername("");
    } else {
      addToast("Please enter valid email!", {
        appearance: "warning",
        autoDismiss: true,
      });
    }
  };

  const filteredContacts = useMemo(() => {
    if (members?.length) {
      const users = members.map((mem) => mem.user);
      return users.filter((user: any) =>
        props.addedUsers?.length
          ? selectedUsers.findIndex(
              (selUser: any) => selUser?.id === user?.id
            ) === -1 &&
            props.addedUsers.findIndex((adUser) => adUser?.id === user.id) ===
              -1
          : selectedUsers.findIndex(
              (selUser: any) => selUser?.id === user?.id
            ) === -1
      );
    }
    return [];
  }, [members, selectedUsers]);

  useEffect(() => {
    if (membersSkip >= 0 && filteredContacts?.length < 10) {
      getNextPageMembers && getNextPageMembers();
    }
  }, [filteredContacts]);

  const filteredMembers = useMemo(() => {
    if (searchedMembers?.length) {
      const users = searchedMembers.map((mem) => mem.user);
      return users.filter((user: any) =>
        props.addedUsers?.length
          ? selectedUsers.findIndex(
              (selUser: any) => selUser?.id === user?.id
            ) === -1 &&
            props.addedUsers.findIndex((adUser) => adUser?.id === user.id) ===
              -1
          : selectedUsers.findIndex(
              (selUser: any) => selUser?.id === user?.id
            ) === -1
      );
    }
    return [];
  }, [searchedMembers, selectedUsers, props.addedUsers]);

  useEffect(() => {
    if (filteredMembers.length) {
      setShowMembers(true);
    } else {
      setShowMembers(false);
    }
  }, [filteredMembers]);

  const filteredUsers = useMemo(() => {
    if (users?.length) {
      return users.filter(
        (user: any) =>
          (props.addedUsers?.length
            ? selectedUsers.findIndex(
                (selUser: any) => selUser?.id === user?.id
              ) === -1 &&
              props.addedUsers.findIndex((adUser) => adUser?.id === user.id) ===
                -1
            : selectedUsers.findIndex(
                (selUser: any) => selUser?.id === user?.id
              ) === -1) &&
          filteredMembers.findIndex(
            (selUser: any) => selUser?.id === user?.id
          ) === -1
      );
    }
    return [];
  }, [users, selectedUsers, props.addedUsers, filteredMembers]);

  useEffect(() => {
    if (filteredUsers?.length === 0) {
      setShowOthers(false);
    } else if (filteredMembers.length === 0) {
      setShowOthers(true);
    }
  }, [filteredMembers, filteredUsers]);

  return (
    <>
      <StyledTextInput
        leadingVisual={SearchIcon}
        placeholder={props.placeholder}
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
        onKeyDown={(e) => {
          if (!e.shiftKey && e.key === "Enter") {
            e.preventDefault();
            onEnterClick();
          }
        }}
        emptyBoxHeight={"0px"}
      />
      {valid ? (
        <Text
          as="p"
          fontSize={"0.625rem"}
          lineHeight="0.875rem"
          mt={"0.25rem"}
          ml={"0.25rem"}
        >
          Press enter on keyboard to add user(s)
        </Text>
      ) : null}
      {selectedUsers?.length || props.showInviteAlways || emails.length ? (
        <Box display={"flex"} justifyContent={"flex-end"} mt={"10px"}>
          <Box mr={"16px"}>
            <Button
              onClick={() => {
                setUsername("");
                setSelectedUsers([]);
                setEmails([]);
              }}
              disabled={selectedUsers.length || emails.length ? false : true}
            >
              Cancel
            </Button>
          </Box>
          <Button
            variant="primary"
            onClick={onClickInvite}
            disabled={selectedUsers.length || emails.length ? false : true}
          >
            Send Invite
          </Button>
        </Box>
      ) : null}
      {emails.length ? (
        <>
          <Text as="p" my={"16px"} fontWeight={600}>
            Emails ({emails.length})
          </Text>
          <Box className={"space-y-2"}>
            {emails.map((email, index) => (
              <Box display="flex" alignItems={"center"}>
                <Box
                  display="flex"
                  alignItems={"center"}
                  sx={{
                    px: "12px",
                    py: "4px",
                    borderRadius: "20px",
                    bg: "searchUsers.emailBg",
                  }}
                >
                  <AvatarWithPlaceholder
                    src={""}
                    size={20}
                    sx={{
                      color: "text.default",
                    }}
                  />
                  <Text
                    as="p"
                    sx={{
                      fontSize: "14px",
                      lineHeight: "20px",
                      fontWeight: 600,
                      color: "searchUsers.emailText",
                      ml: "8px",
                    }}
                  >
                    {email}
                  </Text>
                  <Box
                    display={"flex"}
                    alignItems="center"
                    sx={{ ml: "16px", cursor: "pointer" }}
                    onClick={() => {
                      removeEmail(index);
                    }}
                  >
                    <XCircleFillIcon
                      size={14}
                      color={"searchUsers.emailText"}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      ) : null}
      {selectedUsers?.length ? (
        <>
          <Text as="p" my={"16px"} fontWeight={600}>
            Selected ({selectedUsers.length})
          </Text>
          {selectedUsers?.map((user: any, index: number) => (
            <Box
              px={"8px"}
              py={"6px"}
              borderRadius={"4px"}
              sx={{
                cursor: "pointer",
                ":hover": {
                  bg: "searchUsers.hoverBg",
                },
              }}
              mb={"6px"}
              display="flex"
              alignItems={"center"}
              justifyContent={"space-between"}
              onClick={() => {
                onClickUser(user);
              }}
              key={`selected-${user.id}-index`}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <AvatarWithPlaceholder
                  src={user?.avatarUrl}
                  size={30}
                  sx={{
                    width: "30px",
                    height: "30px",
                    color: "text.default",
                  }}
                />
                <Box ml="12px">
                  <Text as="p">
                    {user?.fullName || user.handle || user?.username}
                  </Text>
                  <Text as="p" sx={{ fontSize: "12px", color: "text.muted" }}>
                    @{user.handle || user?.username}
                  </Text>
                </Box>
              </Box>
              <CheckIcon size={16} fill={"#44B244"} />
            </Box>
          ))}
        </>
      ) : null}
      {filteredContacts?.length && username.length === 0 ? (
        <>
          <Box display={"flex"} flex={1} flexDirection={"column"}>
            <Text as="p" my={"16px"} fontWeight={600}>
            {t("MEMBERS.WORKSPACE")}
            </Text>
            <InfiniteScroll
              hasMore={membersSkip !== -1}
              dataLength={filteredContacts.length}
              next={() => {
                getNextPageMembers && getNextPageMembers();
              }}
              loader={""}
              scrollableTarget={scrollContainerId}
            >
              {filteredContacts?.map((user: any, index: number) => (
                <Box
                  px={"8px"}
                  py={"6px"}
                  borderRadius={"4px"}
                  sx={{
                    cursor: "pointer",
                    ":hover": {
                      bg: "searchUsers.hoverBg",
                    },
                  }}
                  mb={"6px"}
                  display="flex"
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  onClick={() => {
                    onClickUser(user);
                  }}
                  key={`results-${user.id}-index`}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <AvatarWithPlaceholder
                      src={user?.avatarUrl}
                      size={30}
                      sx={{
                        width: "30px",
                        height: "30px",
                        color: "text.default",
                      }}
                    />
                    <Box ml="12px">
                      <Text as="p">
                        {user?.fullName || user.handle || user?.username}
                      </Text>
                      <Text
                        as="p"
                        sx={{ fontSize: "12px", color: "text.muted" }}
                      >
                        @{user.handle || user?.username}
                      </Text>
                    </Box>
                  </Box>
                  {isUserSelected(user) ? (
                    <CheckIcon size={16} fill={"#44B244"} />
                  ) : null}
                </Box>
              ))}
            </InfiniteScroll>
            {loadingMembers ? (
              <div className="flex items-center justify-center my-8">
                <BipLoader />
              </div>
            ) : null}
          </Box>
        </>
      ) : null}
      {username.length ? (
        <>
          {searching ? (
            <div className="flex justify-center">
              <BipLoader />
            </div>
          ) : (
            <Box
              display={"flex"}
              flex={1}
              flexDirection={"column"}
              overflowY="auto"
            >
              {filteredUsers?.length || filteredMembers?.length ? (
                <>
                  {isRoleTab ? (
                    <>
                      <DropDownItem
                        title={t("MEMBERS.WORKSPACE")}
                        count={filteredMembers.length}
                        onClick={() => {
                          setShowMembers(!showMembers);
                        }}
                        opened={showMembers}
                      />
                      {showMembers &&
                        filteredMembers?.map((user: any, index: number) => (
                          <Box
                            px={"8px"}
                            py={"6px"}
                            borderRadius={"4px"}
                            sx={{
                              cursor: "pointer",
                              ":hover": {
                                bg: "searchUsers.hoverBg",
                              },
                            }}
                            mb={"6px"}
                            display="flex"
                            alignItems={"center"}
                            justifyContent={"space-between"}
                            onClick={() => {
                              onClickUser(user);
                            }}
                            key={`results-${user.id}-index`}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <AvatarWithPlaceholder
                                src={user?.avatarUrl}
                                size={30}
                                sx={{
                                  width: "30px",
                                  height: "30px",
                                  color: "text.default",
                                }}
                              />
                              <Box ml="12px">
                                <Text as="p">
                                  {user?.fullName ||
                                    user.handle ||
                                    user?.username}
                                </Text>
                                <Text
                                  as="p"
                                  sx={{ fontSize: "12px", color: "text.muted" }}
                                >
                                  @{user.handle || user?.username}
                                </Text>
                              </Box>
                            </Box>
                            {isUserSelected(user) ? (
                              <CheckIcon size={16} fill={"#44B244"} />
                            ) : null}
                          </Box>
                        ))}
                    </>
                  ) : null}

                  <DropDownItem
                    title="OTHERS"
                    count={filteredUsers.length}
                    onClick={() => {
                      setShowOthers(!showOthers);
                    }}
                    opened={showOthers}
                  />
                  {showOthers && (
                    <InfiniteScroll
                      hasMore={showOthers && searchSkip !== -1}
                      dataLength={filteredUsers.length}
                      next={searchNextPageUsers}
                      loader={<BipLoader />}
                      scrollableTarget={"box-3-container"}
                    >
                      {filteredUsers?.map((user: any, index: number) => (
                        <Box
                          px={"8px"}
                          py={"6px"}
                          borderRadius={"4px"}
                          sx={{
                            cursor: "pointer",
                            ":hover": {
                              bg: "searchUsers.hoverBg",
                            },
                          }}
                          mb={"6px"}
                          display="flex"
                          alignItems={"center"}
                          justifyContent={"space-between"}
                          onClick={() => {
                            onClickUser(user);
                          }}
                          key={`results-${user.id}-index`}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <AvatarWithPlaceholder
                              src={user?.avatarUrl}
                              size={30}
                              sx={{
                                width: "30px",
                                height: "30px",
                                color: "text.default",
                              }}
                            />
                            <Box ml="12px">
                              <Text as="p">
                                {user?.fullName ||
                                  user.handle ||
                                  user?.username}
                              </Text>
                              <Text
                                as="p"
                                sx={{ fontSize: "12px", color: "text.muted" }}
                              >
                                @{user.handle || user?.username}
                              </Text>
                            </Box>
                          </Box>
                          {isUserSelected(user) ? (
                            <CheckIcon size={16} fill={"#44B244"} />
                          ) : null}
                        </Box>
                      ))}
                    </InfiniteScroll>
                  )}
                </>
              ) : (
                <Box
                  display={"flex"}
                  flexDirection={"column"}
                  alignItems={"center"}
                  mt={"32px"}
                >
                  <PeopleIcon
                    sx={{
                      color: "searchUsers.peopleIcon",
                      width: "31.51px",
                      height: "22.01px",
                    }}
                  />
                  <Text
                    as="p"
                    mt={"10px"}
                    fontWeight={600}
                    fontSize={"14px"}
                    lineHeight={"20px"}
                  >
                    No users found
                  </Text>
                </Box>
              )}
            </Box>
          )}
        </>
      ) : null}
    </>
  );
};

export default SearchUsers;
