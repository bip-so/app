import React, { FC, useEffect, useRef, useState } from "react";
import { XIcon } from "@primer/octicons-react";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Text,
  useOnOutsideClick,
  useTheme,
} from "@primer/react";
import TextareaAutosize from "react-textarea-autosize";
import { DEFAULT_USER_PLACEHOLDER } from "../../../commons/constants";
import BlocksService from "../services";
import { useToasts } from "react-toast-notifications";
import { BlockType, CreateMentionType, ReelType } from "../types";
import { useCanvas } from "../../../context/canvasContext";
import MentionsInput from "../../../components/MentionsInput";
import { getFilteredMentions } from "../../../utils/mentions";
import { useRightRail } from "../../../context/rightRailContext";
import { useSlateStatic } from "slate-react";
import { Editor } from "slate";
import { getStringWithLineBreaks } from "../utils";
import { useUser } from "../../../context/userContext";
import segmentEvents from "../../../insights/segment";
import { useStudio } from "../../../context/studioContext";
import { useRouter } from "next/router";

interface CreateReelsProps {
  closeHandler: () => void;
  blockUUID: string | number | undefined;
  blockId: number;
  showPostToReel: boolean;
  onPostReelSuccess: (reel: ReelType) => void;
  block: BlockType;
  showContainerBox?: boolean;
}

const CreateReels: FC<CreateReelsProps> = (props) => {
  const {
    closeHandler,
    blockId,
    blockUUID,
    showPostToReel,
    onPostReelSuccess,
    block,
    showContainerBox = true,
  } = props;
  const {
    addingItem,
    currentBlock,
    cancelAdding,
    items,
    setItems,
    setAddingItem,
    setItemRefs,
  } = useRightRail();
  const router = useRouter();

  const { blocks, setBlocks, getBlock, updateBlock, pendingSave } = useCanvas();
  const editor = useSlateStatic();
  const { addReel } = useCanvas();
  const [reelsText, setReelsText] = useState("");
  const [posting, setPosting] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const { currentStudio } = useStudio();

  const { setCurrentBlock } = useRightRail();
  const { addToast } = useToasts();
  const cardRef = useRef(null);
  const textAreaRef = useRef(null);

  const { user } = useUser();
  const { branch, repo } = useCanvas();
  const { colorMode } = useTheme();

  useOnOutsideClick({
    onClickOutside: () => {
      setReelsText("");
      cancelAdding();
      setMentionedUsers([]);
    },
    containerRef: cardRef,
  });

  useEffect(() => {
    //This is inside a setTimeout to enable the element to be added and then the right box to adjust its position on the screen
    //before focussing. Else, the page scrolls to the top as the initial position of this card is at the top
    setTimeout(() => {
      document.getElementById("add-reel-textarea")?.focus();
    }, 100);
  }, []);

  const getSelectedBlocks = (selStartPoint, selEndPoint) => {
    // let x = document.getElementById("docview").childNodes[0].
    const selectedBlocks = {
      blockUUIDs: [],
      blocksData: {},
    };
    for (let i = selStartPoint; i <= selEndPoint; i++) {
      const curBlock = editor.children[i];
      selectedBlocks.blockUUIDs.push(curBlock.uuid);
      selectedBlocks.blocksData[curBlock.uuid] = curBlock;
    }
    return selectedBlocks;
  };

  const getCreateReelData = () => {
    const anchorIndex = editor?.selection?.anchor?.path[0];
    const focusIndex = editor?.selection?.focus?.path[0];
    let startPoint, endPoint;
    if (anchorIndex > focusIndex) {
      endPoint = anchorIndex;
      startPoint = focusIndex;
    } else {
      startPoint = anchorIndex;
      endPoint = focusIndex;
    }

    let curBlock;
    if (currentBlock) {
      curBlock = currentBlock;
    } else {
      const [block, path] = Editor.node(editor, [startPoint]);
      curBlock = block;
    }

    const selectedBlocks =
      startPoint === endPoint
        ? {
            blockUUIDs: [curBlock?.uuid],
            blocksData: {
              [curBlock?.uuid]: curBlock,
            },
          }
        : getSelectedBlocks(startPoint, endPoint);

    return {
      canvasBranchID: branch?.id,
      canvasRepositoryID: repo?.id,
      contextData: {
        text: reelsText,
      },
      highlightedText: editor.selection
        ? getStringWithLineBreaks(editor, editor.selection)
        : "",
      rangeEnd: {
        pos: 1,
      },
      rangeStart: {
        pos: 2,
      },
      startBlockUUID: curBlock?.uuid,
      textRangeEnd: 0,
      textRangeStart: 0,
      selectedBlocks,
    };
  };

  const createReel = async () => {
    try {
      setPosting(true);
      const data = getCreateReelData();

      segmentEvents.reelCreated(
        currentStudio?.handle!,
        repo?.key!,
        repo?.name!,
        data.contextData.text,
        blocks.length,
        user?.id!
      );
      const r: any = await BlocksService.createReel(data);
      const reel: ReelType = r.data.data;
      const filteredMentions = getFilteredMentions(
        reelsText.trim(),
        mentionedUsers
      );
      if (filteredMentions?.length) {
        const data: CreateMentionType = {
          branches: [],
          objectID: reel.id,
          roles: [],
          scope: "reel",
          users: filteredMentions.map((men: any) => men.id),
        };
        segmentEvents.mentionAdded(
          "user",
          "reel",
          user?.username!,
          filteredMentions[0].username,
          "",
          currentStudio?.handle!,
          repo?.key!,
          reel.id
        );
        const response2 = await BlocksService.mentionUsers(data);
        const newMentions =
          filteredMentions?.map((user: any) => {
            return {
              avatarUrl: user.avatarUrl,
              fullName: user.fullName,
              id: user.id,
              type: "user",
              username: user.username,
              uuid: user.uuid,
            };
          }) || [];
        addReel({ ...reel, mentions: newMentions });
      } else {
        addReel(reel);
      }

      const newItems = items.filter((item) => !item.type.includes("add"));
      setItems(newItems);
      setItemRefs([]);
      let curBlock;
      if (currentBlock) {
        curBlock = currentBlock;
      } else {
        curBlock = data.selectedBlocks.blocksData[data.startBlockUUID];
      }

      let updatedBlock = getBlock(curBlock?.uuid);
      updatedBlock = {
        ...updatedBlock,
        reelCount: updatedBlock.reelCount ? updatedBlock.reelCount + 1 : 1,
      };
      updateBlock(updatedBlock);
      setAddingItem(false);
      setReelsText("");
      setMentionedUsers([]);
      setPosting(false);
      onPostReelSuccess && onPostReelSuccess();
    } catch (err) {
      addToast("Failed to create post. Please try again", {
        appearance: "error",
        autoDismiss: true,
      });
      setPosting(false);
    }
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      flex={1}
      bg={"addReel.bg"}
      p={"16px"}
      border={showContainerBox ? "1px solid" : ""}
      borderColor={showContainerBox ? "addReel.border" : ""}
      boxShadow={showContainerBox ? "0px 1px 0px rgba(27, 31, 35, 0.04)" : ""}
      borderRadius={"8px"}
      contentEditable={false}
      ref={cardRef}
    >
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Text
          as="p"
          fontWeight={600}
          color={"addReel.heading"}
          fontSize={"16px"}
          lineHeight={"14px"}
        >
          Create Post
        </Text>
        <IconButton
          icon={XIcon}
          variant={"invisible"}
          onClick={() => {
            setReelsText("");
            cancelAdding();
            closeHandler && closeHandler();
          }}
          size="small"
          sx={{ color: "addReel.closeIcon" }}
        />
      </Box>
      <Box display={"flex"} mt={"16px"}>
        <Avatar
          src={user?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
          sx={{ width: "24px", height: "24px", flexShrink: 0 }}
          alt={"user"}
          draggable={false}
        />
        <MentionsInput
          id={"add-reel-textarea"}
          onChange={(e: any, mentionedUsers: any) => {
            setReelsText(e.target.value);
            setMentionedUsers(mentionedUsers);
          }}
          onEnterClick={(e: any) => {
            if (!posting && !pendingSave) {
              createReel();
            }
          }}
          maxRows={15}
          className={
            "mt-1 ml-2 border-0 overflow-hidden text-sm resize-none outline-0 w-full"
          }
          placeholder="Add context to the post"
          //autoFocus
          value={reelsText}
          style={{
            backgroundColor: "transparent",
          }}
        />
      </Box>
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"flex-end"}
        mt={"16px"}
      >
        <Text
          as="p"
          fontSize={"10px"}
          lineHeight={"14px"}
          color={"addReel.hintText"}
          mr={"16px"}
        >
          (shift + enter) for new line . (enter) to post
        </Text>
        <Button
          variant="primary"
          sx={{ border: "none" }}
          disabled={posting || pendingSave}
          onClick={createReel}
          size="small"
        >
          {posting ? "Posting..." : "Post"}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateReels;
