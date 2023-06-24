import React, { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import ReactTextareaAutosize, {
  TextareaAutosizeProps,
} from "react-textarea-autosize";
import InputTrigger from "react-input-trigger";
import useDebounce from "../hooks/useDebounce";
import UserService from "../modules/User/services";
import { AnchoredOverlay, Avatar, Box } from "@primer/react";
import { DEFAULT_USER_PLACEHOLDER } from "../commons/constants";
import StudioService from "../modules/Studio/services";
import { MentionUsersType } from "../types";

interface MentionsInputProps extends TextareaAutosizeProps {
  onEnterClick?: (e: any) => void;
  onChange?: (
    e: ChangeEvent<HTMLTextAreaElement>,
    mentionedUsers?: any
  ) => void;
  usersType?: MentionUsersType;
}

let endHandler = () => {};

const MentionsInput: FC<MentionsInputProps> = (props) => {
  const { usersType, onEnterClick, value, onChange, ...remProps } = props;

  const [showSuggestor, setShowSuggestor] = useState(false);
  const [metadata, setMetadata] = useState((): any => null);
  const [mentionText, setMentionText] = useState("");
  const [users, setUsers] = useState((): any => []);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(-1);
  const [mentionedUsers, setMentionedUsers] = useState((): any => []);
  const [forceStopSearch, setForceStopSearch] = useState(false);

  const debounceValue = useDebounce(mentionText, 400);
  const triggerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (debounceValue?.length && !forceStopSearch) {
      if (usersType === "global") {
        getGlobalUsers(debounceValue);
      } else {
        getStudioUsers(debounceValue);
      }
    } else {
      setCurrentSelection(-1);
      setUsers([]);
    }
  }, [debounceValue]);

  const getStudioUsers = (value: string) => {
    setSearchingUsers(true);
    StudioService.searchStudioMembers(value)
      .then((r) => {
        const data = r.data.data;
        if (data?.length) {
          const users = data.map((member: any) => member.user);
          setUsers(users);
          setCurrentSelection(0);
        } else {
          setUsers([]);
        }
        setSearchingUsers(false);
        setShowSuggestor(true);
      })
      .catch((err) => {
        setSearchingUsers(false);
      });
  };

  const getGlobalUsers = (value: string) => {
    setSearchingUsers(true);
    UserService.getUsers(value)
      .then((r) => {
        const data = r.data.data.users;
        if (data?.length) {
          const users = data.map((user: any) => {
            return { ...user, username: user.handle };
          });
          setUsers(users);
          setCurrentSelection(0);
        } else {
          setUsers([]);
        }
        setSearchingUsers(false);
        setShowSuggestor(true);
      })
      .catch((err) => {
        setSearchingUsers(false);
      });
  };

  const addMention = (user: any) => {
    const textareaValue: string = value as string;
    const { startPosition: position } = metadata;
    const startPosition =
      textareaValue[position] === "@" ? position + 1 : position;

    if (textareaValue?.length && startPosition) {
      setForceStopSearch(true);
      endHandler(); //end handler is not working some times. so used ref to reset state
      //@ts-ignore
      triggerRef && triggerRef?.current?.resetState();
      const newText = `${textareaValue.slice(0, startPosition - 1)}@${
        user.username
      } ${textareaValue.slice(startPosition + mentionText.length)}`;
      onChange &&
        onChange(
          {
            target: {
              value: newText,
            },
          } as ChangeEvent<HTMLTextAreaElement>,
          [...mentionedUsers, user]
        );
      setMentionedUsers([...mentionedUsers, user]);
      setShowSuggestor(false);
      setUsers([]);
      setMetadata(null);
      setMentionText("");
    }
  };

  const handleKeyDown = (e: any) => {
    const { which } = e;
    if (showSuggestor) {
      if (which === 32) {
        // 32 is the character code of the space button
        setShowSuggestor(false);
        setUsers([]);
        setMetadata(null);
        setMentionText("");
        endHandler();
        //@ts-ignore
        triggerRef && triggerRef?.current?.resetState();
      }
      if (users.length) {
        if (which === 40) {
          // 40 is the character code of the down arrow
          e.preventDefault();
          const index = (currentSelection + 1) % users.length;
          setCurrentSelection(index);
        }

        if (which === 38) {
          // 38 is the character code of the up arrow
          e.preventDefault();
          if (currentSelection > 0) {
            const index = (currentSelection - 1) % users.length;
            setCurrentSelection(index);
          }
        }

        if (which === 13 || which === 9) {
          // 13 is the character code for enter, 9 is the character code for tab
          e.preventDefault();
          const user = users[currentSelection];
          addMention(user);
        }
      }
    } else {
      if (!e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        onEnterClick && onEnterClick(e);
        endHandler();
        //@ts-ignore
        triggerRef && triggerRef?.current?.resetState();
      }
    }
  };

  const toggleSuggestor = (metaData: any) => {
    const { hookType, cursor } = metaData;
    if (hookType === "start") {
      setForceStopSearch(false);
      setShowSuggestor(true);
      setMetadata({
        left: cursor.left - 150,
        top: cursor.top + cursor.height, // we need to add the cursor height so that the dropdown doesn't overlap with the `@`.
        startPosition: cursor.selectionStart === 0 ? 1 : cursor.selectionStart,
      });
    }

    if (hookType === "cancel") {
      setShowSuggestor(false);
      setMetadata(null);
    }
  };

  useEffect(() => {
    //this useEffect is used instaed of handleInput method because not getting exact mention text value in firefox
    if (showSuggestor && value?.length && metadata) {
      const { startPosition } = metadata;
      const subStr = value.substr(startPosition);
      const splitText = subStr?.split(" ");
      if (splitText?.length) {
        const text = splitText[0];
        //In firefox startPosition value is position value of @ instead of after @ character position sometimes, so checked for @
        if (text[0] === "@") {
          setMentionText(text.replace("@", ""));
        } else {
          setMentionText(text);
        }
      }
    }
  }, [value]);

  const handleInput = (metaInformation: any) => {
    // const splitText = metaInformation.text?.split(" ");
    // if (splitText?.length) {
    //   setMentionText(splitText[0]);
    // }
  };

  return (
    <div
      className="relative w-full"
      onKeyDown={handleKeyDown}
      ref={containerRef}
      contentEditable={false}
    >
      <AnchoredOverlay
        open={showSuggestor && users.length}
        onClose={() => {
          setShowSuggestor(false);
          setMetadata(null);
          setUsers([]);
        }}
        anchorRef={containerRef}
        overlayProps={{
          visibility: "visible",
          ignoreClickRefs: [containerRef],
        }}
        renderAnchor={() => {
          return (
            <InputTrigger
              ref={triggerRef}
              trigger={{
                keyCode: 50,
                shiftKey: true,
              }}
              onStart={(metaData: any) => {
                toggleSuggestor(metaData);
              }}
              onType={(metaData: any) => {
                handleInput(metaData);
              }}
              onCancel={(metaData: any) => {
                toggleSuggestor(metaData);
              }}
              endTrigger={(endHand: () => void) => {
                endHandler = endHand;
              }}
            >
              <ReactTextareaAutosize
                placeholder={"Type your input..."}
                value={value}
                onChange={(e) => {
                  onChange && onChange(e, mentionedUsers);
                }}
                {...remProps}
              />
            </InputTrigger>
          );
        }}
      >
        <Box
          id={"users-dropdown"}
          sx={{
            // position: "absolute",
            width: "300px",
            padding: "8px",
            maxHeight: "400px",
            overflow: "auto",
            borderRadius: "6px",
            bg: "mentionsInput.users.bg",
            boxShadow: "rgba(0, 0, 0, 0.4) 0px 1px 4px",
            top: metadata?.top,
            left: metadata?.left,
            zIndex: 1,
          }}
        >
          {users.map((user: any, index: number) => (
            <Box
              key={index}
              sx={{
                padding: "8px",
                bg:
                  index === currentSelection
                    ? "mentionsInput.users.selectedBg"
                    : "",
                display: "flex",
                cursor: "pointer",
                ":hover": {
                  bg: "mentionsInput.users.selectedBg",
                },
              }}
              id={user.id}
              onClick={() => {
                addMention(user);
              }}
            >
              <Avatar
                src={user?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
                sx={{ width: "34px", height: "34px", flexShrink: 0 }}
                alt={"user"}
                draggable={false}
              />
              <div className="flex flex-col ml-2">
                <p className="text-xs font-bold">
                  {user?.fullName || "User Name"}
                </p>
                <p className="text-xs font-normal">{`@${user?.username}`}</p>
              </div>
            </Box>
          ))}
        </Box>
      </AnchoredOverlay>
    </div>
  );
};

export default MentionsInput;
