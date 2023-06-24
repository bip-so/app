import { useRef, useEffect, useMemo, useState, FC } from "react";
import { ActionList, Avatar, Box, Text } from "@primer/react";
import { useSlate, ReactEditor } from "slate-react";
import InfiniteScroll from "react-infinite-scroll-component";
import BipLoader from "../../../components/BipLoader";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  PeopleIcon,
} from "@primer/styled-octicons";
import { DEFAULT_USER_PLACEHOLDER } from "../../../commons/constants";
import BipMarkMessage from "../../Notifications/Components/BipMarks/BipMarkMessage";
import { Editor } from "slate";
import Colors from "../../../utils/Colors";
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
        mx: "4px",
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
        onClick();
      }}
    >
      <Box display={"flex"} alignItems={"center"}>
        <Text
          as="p"
          sx={{
            fontSize: "12px",
            lineHeight: "18px",
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

export enum COMMAND_TYPE {
  USER_MENTION = "userMention",
  SLASH_COMMANDS = "slashCommands",
  PAGE_MENTION = "pageMention",
  AUTO_EMBED = "autoEmbed",
  BIP_MARKS = "bipMarks",
}

const CommandMenu = ({
  index,
  target,
  filteredItems,
  handleCommand,
  commandType,
  fetchMoreStudioMembers,
  studioMembersNext,
  studioRoles,
  studioMembers,
  isSearching,
  setFilteredItems,
}: any) => {
  const [showRoles, setShowRoles] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const ref = useRef<HTMLDivElement | null>();
  const editor = useSlate();
  const { t } = useTranslation();
  useEffect(() => {
    if (target) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      const containerRect = document
        .getElementById("editor-container")
        ?.getBoundingClientRect();
      const { x, y } = {
        x: rect.right - (containerRect ? containerRect.x : 0) - 16, //16 to push dropdown 16px left of cursor
        y: rect.bottom - (containerRect ? containerRect.y : 0) + 44, //44 px to push the box before the cursor
      };

      el.style.left = `${Math.min(
        x,
        window.innerWidth - containerRect.x - 200 - 16 //16 is hard coded padding from the end of screen
      )}px`;
      el.style.top = `${y}px`;
    }
  }, [editor, index, target]);

  const handleSelectItem = (item) => {
    let newBlockType = "text";
    if (commandType === COMMAND_TYPE.SLASH_COMMANDS) {
      newBlockType = item.type;
    } else if (commandType === COMMAND_TYPE.USER_MENTION) {
      newBlockType = "userMention";
    } else if (commandType === COMMAND_TYPE.PAGE_MENTION) {
      newBlockType = "pageMention";
    } else if (commandType === COMMAND_TYPE.AUTO_EMBED) {
      newBlockType = item.type;
    }

    handleCommand({ newBlockType, data: item });
  };

  const CommandMenuItem = ({ item }) => {
    switch (commandType) {
      case COMMAND_TYPE.SLASH_COMMANDS:
        return (
          <>
            <ActionList.LeadingVisual>
              <span
                style={{
                  display: "inline-flex",
                  justifyContent: "center",
                  width: 20,
                }}
              >
                {item.icon}
              </span>
            </ActionList.LeadingVisual>
            <Text>{item.title}</Text>
          </>
        );
      case COMMAND_TYPE.PAGE_MENTION:
        return (
          <>
            <ActionList.LeadingVisual>
              {item.icon ? (
                <span style={{ display: "inline-block", width: 20 }}>
                  {item.icon}
                </span>
              ) : (
                <span style={{ display: "inline-block", width: 20 }}>
                  <FileIcon color={"commandMenu.fileIcon"} />
                </span>
              )}
            </ActionList.LeadingVisual>
            <Text>
              {item.id === -1 ? (
                <>
                  <span>Create sub-canvas '</span>
                  <span className="font-medium">{item.name}</span>
                  <span>'</span>
                </>
              ) : (
                item.name
              )}
            </Text>
          </>
        );
      case COMMAND_TYPE.USER_MENTION:
        return (
          <>
            <ActionList.LeadingVisual>
              <span style={{ display: "inline-block", width: 20 }}>
                {item.type === "user" && (
                  <Avatar src={item.avatarUrl || DEFAULT_USER_PLACEHOLDER} />
                )}
                {item.type === "role" && <PeopleIcon />}
              </span>
            </ActionList.LeadingVisual>
            <Text>
              {item.type === "user" ? `@${item.username}` : item.name}
            </Text>
          </>
        );
      case COMMAND_TYPE.AUTO_EMBED:
        return (
          <>
            <Text>{item.text}</Text>
          </>
        );
        break;
      case COMMAND_TYPE.BIP_MARKS:
        return (
          <Box
            sx={{
              width: 350,
            }}
          >
            <BipMarkMessage setBipMarks={setFilteredItems} bipMark={item} />
          </Box>
        );
      default:
        return <></>;
    }
  };

  if (index) {
    scrollIfNeeded(
      document.querySelector(`[aria-labelledby="command-menu-${index} "]`),
      document.getElementById("command-menu-container")
    );
  }

  function scrollIfNeeded(element, container) {
    if (!element || !container) {
      return;
    }
    const buffer = 64;
    if (element.offsetTop < container.scrollTop + buffer) {
      container.scrollTop = Math.max(element.offsetTop - buffer, 0);
    } else if (element.offsetTop - buffer > container.scrollTop) {
      const offsetBottom = element.offsetTop + element.offsetHeight;
      const scrollBottom = container.scrollTop + container.offsetHeight;
      if (offsetBottom + buffer > scrollBottom) {
        container.scrollTop = offsetBottom - container.offsetHeight + buffer;
      }
    }
  }

  const roleItems = useMemo(() => {
    if (commandType === COMMAND_TYPE.USER_MENTION && filteredItems?.length) {
      const roleItems = filteredItems.filter(
        (item: any) => item.type === "role"
      );
      if (roleItems?.length === 0) {
        setShowRoles(false);
      }
      return roleItems;
    }
    return [];
  }, [filteredItems]);

  const userItems = useMemo(() => {
    if (commandType === COMMAND_TYPE.USER_MENTION && filteredItems?.length) {
      const userItems = filteredItems.filter(
        (item: any) => item.type === "user"
      );
      if (userItems?.length === 0) {
        setShowUsers(false);
      } else {
        setShowUsers(true);
      }
      return userItems;
    }
    return [];
  }, [filteredItems]);

  const search = Editor.string(editor, target).split("@")[1];

  return (
    <Box
      id="command-menu-container"
      sx={{
        position: "absolute",
        zIndex: 29,
        marginTop: -6,
        bg: "commandMenu.bg",
        border: "1px solid",
        borderColor: "commandMenu.border",
        color: "black",
        borderRadius: 12,
        transition: "opacity 0.75s",
        boxShadow:
          "0px 8px 24px rgba(66, 74, 83, 0.12), 0px 1px 3px rgba(27, 31, 36, 0.12)",
        maxHeight: 250,
        maxWidth: 600,
        minWidth: 200,
        overflow: "auto",
        overscrollBehavior: "contain",
      }}
      ref={ref}
      onMouseDown={(e) => {
        // prevent toolbar from taking focus away from editor
        e.preventDefault();
      }}
    >
      <ActionList>
        {isSearching ? (
          <BipLoader />
        ) : (
          <InfiniteScroll
            style={{ overflow: "visible" }}
            dataLength={filteredItems.length}
            next={() => {
              if (
                commandType === COMMAND_TYPE.USER_MENTION &&
                studioMembersNext.current !== -1
              ) {
                fetchMoreStudioMembers();
                // const search = Editor.string(editor, target).split("@")[1];
                // let filteredRoles = studioRoles.current.filter((role) =>
                //   role.name.includes(search)
                // );
                // let filteredMembers = studioMembers.current.filter(
                //   (member) =>
                //     member.username.includes(search) ||
                //     member.fullName.includes(search)
                // );
                // setFilteredItems([...filteredRoles, ...filteredMembers]);
              }
            }}
            loader={<BipLoader />}
            hasMore={
              commandType === COMMAND_TYPE.USER_MENTION &&
              studioMembersNext.current !== -1 &&
              search?.length === 0 &&
              showUsers
            }
            scrollableTarget={"command-menu-container"}
          >
            {filteredItems.length === 0 && (
              <Text
                as="p"
                textAlign={"center"}
                color={"text.gray"}
                padding="10px"
              >
                No results found
              </Text>
            )}
            {commandType === COMMAND_TYPE.USER_MENTION &&
            filteredItems?.length ? (
              <>
                <DropDownItem
                  title="ROLES"
                  count={roleItems.length}
                  opened={showRoles}
                  onClick={() => {
                    setShowRoles(!showRoles);
                  }}
                />
                {showRoles
                  ? roleItems.map((item, i) => (
                      <>
                        <ActionList.Item
                          onClick={() => handleSelectItem(item)}
                          sx={{
                            bg: i === index ? "commandMenu.hoverBg" : "",
                            ml: "12px",
                          }}
                          id={`command-menu-${i}`}
                          key={`command-menu-${i}`}
                        >
                          <CommandMenuItem item={item} />
                        </ActionList.Item>
                      </>
                    ))
                  : null}
                <DropDownItem
                  title={t("MEMBERS.WORKSPACE")}
                  count={userItems.length}
                  opened={showUsers}
                  onClick={() => {
                    setShowUsers(!showUsers);
                  }}
                />
                {showUsers
                  ? userItems.map((item, i) => (
                      <>
                        <ActionList.Item
                          onClick={() => handleSelectItem(item)}
                          sx={{
                            bg: i === index ? "commandMenu.hoverBg" : "",
                            ml: "12px",
                          }}
                          id={`command-menu-${i}`}
                          key={`command-menu-${i}`}
                        >
                          <CommandMenuItem item={item} />
                        </ActionList.Item>
                      </>
                    ))
                  : null}
              </>
            ) : (
              filteredItems.map((item, i) => (
                <>
                  <ActionList.Item
                    onClick={() => handleSelectItem(item)}
                    sx={{
                      bg: i === index ? "commandMenu.hoverBg" : "",
                    }}
                    id={`command-menu-${i}`}
                    key={`command-menu-${i}`}
                  >
                    <CommandMenuItem item={item} />
                  </ActionList.Item>
                  {commandType === COMMAND_TYPE.PAGE_MENTION &&
                    item?.id === -1 && <ActionList.Divider />}
                </>
              ))
            )}
          </InfiniteScroll>
        )}
      </ActionList>
    </Box>
  );
};

export default CommandMenu;
