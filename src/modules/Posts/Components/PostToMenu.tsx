import {
  GlobeIcon,
  SearchIcon,
  TriangleRightIcon,
} from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  Avatar,
  Box,
  Text,
  TextInput,
} from "@primer/react";
import { useState } from "react";
import { AVATAR_PLACEHOLDER } from "../../../commons/constants";

interface IPostToMenuProps {}

const PostToMenu: React.FunctionComponent<IPostToMenuProps> = (props) => {
  return (
    <Box
      padding={"16px"}
      width={"212px"}
      borderRadius={"12px"}
      //   sx={{
      //     gap: "10px",
      //   }}
    >
      <Box
        display={"flex"}
        flexDirection={"column"}
        // alignItems={"center"}
        sx={{
          gap: "12px",
        }}
      >
        <Box
          display={"flex"}
          flexDirection={"column"}
          sx={{
            gap: "8px",
          }}
        >
          <Text
            sx={{
              fontWeight: 600,
              fontSize: "12px",
              lineHeight: "18px",
            }}
          >
            Who can see your post?
          </Text>
          <TextInput
            sx={{
              border: "1px solid",
              borderColor: "postInFeed.border",
              boxShadow: "none",
              height: "28px",
              background: "transparent",
              color: "text.grayUltraLight",
              "input::placeholder": { color: "text.gray" },
            }}
            leadingVisual={() => <SearchIcon color={"text.gray"} />}
            aria-label="Studios"
            name="Studios"
            placeholder="Choose a Workspace"
            //   value={searchInput}
            //   onChange={(e) => setSearchInput(e.target.value.toLowerCase())}
          />
        </Box>
        <Box
          display={"flex"}
          alignItems={"center!important"}
          margin={"6px 8px"}
          sx={{ gap: "8px" }}
        >
          <Box color={"postInFeed.textSelect"}>
            <GlobeIcon />
          </Box>
          <Text
            sx={{
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.15",
            }}
          >
            Everyone
          </Text>
        </Box>
      </Box>
      <Box //divider
        border={"1px solid"}
        bg={"postInFeed.border"}
        borderColor={"postInFeed.border"}
        marginY={"13px"}
      />
      <ActionMenu>
        <ActionMenu.Anchor variant={"invisible"}>
          <Box
            // as={"button"}
            display={"flex"}
            margin={"6px 4px"}
            alignItems={"center"}
            width={"100%"}
            justifyContent={"space-between"}
            sx={{
              cursor: "pointer",
            }}
          >
            <Box display={"flex"} sx={{ gap: "8px" }}>
              <Avatar
                sx={{
                  width: "20px",
                  height: "20px",
                  border: "1px solid",
                  borderColor: "postInFeed.border",
                  borderRadius: "100%",
                  flexShrink: 0,
                }}
                src={AVATAR_PLACEHOLDER}
              />
              <Text
                sx={{
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: "-0.15",
                }}
              >
                Studio name
              </Text>
            </Box>
            <Box color={"postInFeed.textLight"}>
              <TriangleRightIcon />
            </Box>
          </Box>
        </ActionMenu.Anchor>

        <ActionMenu.Overlay align="end">
          <ActionList>
            <ActionList.Item onSelect={(event) => console.log("New file")}>
              All Members
            </ActionList.Item>
            <ActionList.Divider />
            <ActionList.Item>Moderators Only</ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  );
};

export default PostToMenu;
