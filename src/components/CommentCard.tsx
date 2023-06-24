import React, { FC, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  useOnOutsideClick,
  useTheme,
} from "@primer/react";
import { AlertIcon } from "@primer/octicons-react";
import { DEFAULT_USER_PLACEHOLDER } from "../commons/constants";
import { Editor, Transforms } from "slate";
import TextareaAutosize from "react-textarea-autosize";
import BlocksService from "../modules/BipEditor/services";
import { CreateMentionType, ThreadType } from "../modules/BipEditor/types";
import { useCanvas } from "../context/canvasContext";
import MentionsInput from "./MentionsInput";
import { useRightRail } from "../context/rightRailContext";
import { getFilteredMentions } from "../utils/mentions";
import { useSlate } from "slate-react";
import { getStringWithLineBreaks } from "../modules/BipEditor/utils";
import { useUser } from "../context/userContext";
import segmentEvents from "../insights/segment";
import { useStudio } from "../context/studioContext";
import {
  getLocalCanvasBlocks,
  invalidateCanvasBlocks,
  setLocalCanvasBlocks,
} from "../modules/Canvas/utils";

interface CommentCardProps {
  addMark?: () => void;
  onPost?: () => void;
  showContainerBox?: boolean;
  cancelHandler?: () => void;
}

const CommentCard: FC<CommentCardProps> = (props) => {
  const { user } = useUser();
  const {
    addingItem,
    currentBlock,
    cancelAdding,
    items,
    setItems,
    setItemRefs,
    setAddingItem,
  } = useRightRail();

  const { branch, repo, addThread, getBlock, updateBlock, pendingSave } =
    useCanvas();
  const editor = useSlate();
  const { colorMode } = useTheme();
  const { showContainerBox = true, onPost } = props;

  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const { currentStudio } = useStudio();

  const textAreaRef = useRef(null);
  const cardRef = useRef(null);

  const handleCancel = () => {
    cancelAdding();
  };

  useOnOutsideClick({
    onClickOutside: () => {
      if (addingItem) {
        setCommentText("");
        cancelAdding();
        setMentionedUsers([]);
      }
    },
    containerRef: cardRef,
  });

  useEffect(() => {
    //This is inside a setTimeout to enable the element to be added and then the right box to adjust its position on the screen
    //before focussing. Else, the page scrolls to the top as the initial position of this card is at the top
    setTimeout(() => {
      document.getElementById("add-block-thread-textarea")?.focus();
    }, 100);
  }, []);

  const createBlockThread = async () => {
    try {
      setPosting(true);
      const data = {
        canvasBranchId: branch?.id || 0,
        canvasRepositoryId: repo?.id || 0,
        highlightedText: editor.selection
          ? getStringWithLineBreaks(editor, editor.selection)
          : "",
        position: 1,
        startBlockUUID: currentBlock?.uuid,
        text: commentText.trim(),
        textRangeEnd: 0,
        textRangeStart: 0,
      };
      segmentEvents.commentAdded(
        currentStudio?.handle!,
        repo?.key,
        user?.id,
        "block"
      );
      const r = await BlocksService.createBlockThread(data);
      const thread: ThreadType = r.data.data;

      props.addMark && props.addMark(thread.uuid);
      const filteredMentions = getFilteredMentions(
        commentText.trim(),
        mentionedUsers
      );
      if (filteredMentions?.length) {
        const data: CreateMentionType = {
          branches: [],
          objectID: thread.id,
          roles: [],
          scope: "block_thread",
          users: filteredMentions.map((men: any) => men.id),
        };

        segmentEvents.mentionAdded(
          "user",
          "comment",
          user?.username!,
          filteredMentions[0]?.username,
          "",
          currentStudio?.handle!,
          repo?.key!,
          0
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
        addThread({ ...thread, mentions: newMentions });
      } else {
        addThread(thread);
      }

      const newItems = items.filter((item) => !item.type.includes("add"));
      let updatedBlock = getBlock(currentBlock?.uuid);
      updatedBlock = {
        ...updatedBlock,
        commentCount: updatedBlock.commentCount
          ? updatedBlock.commentCount + 1
          : 1,
      };
      updateBlock(updatedBlock);

      // local caching blocks invalidate
      invalidateCanvasBlocks(branch?.id);

      setItems(newItems);
      setItemRefs([]);
      setAddingItem(false);

      setPosting(false);
      setCommentText("");
      setMentionedUsers([]);
      onPost && onPost();
      if (editor.selection) {
        Transforms.deselect(editor);
      }
    } catch (err) {
      console.log(err);
      setShowError(true);
      setPosting(false);
    }
  };

  return (
    <Box
      sx={{
        borderRadius: "12px",
        border: showContainerBox ? "1px solid" : "",
        borderColor: showContainerBox ? "addComment.border" : "",
        boxShadow: showContainerBox ? "0px 1px 0px rgba(27, 31, 35, 0.04)" : "",
        padding: "16px",
        backgroundColor: "addComment.bg",
        zIndex: 99,
      }}
      contentEditable={false}
      ref={cardRef}
    >
      <div className="flex">
        <Avatar
          src={user?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
          sx={{ width: "24px", height: "24px", flexShrink: 0 }}
          alt={"user"}
          draggable={false}
        />
        <MentionsInput
          id={"add-block-thread-textarea"}
          onChange={(e: any, mentionedUsers: any) => {
            setCommentText(e.target.value);
            setMentionedUsers(mentionedUsers);
            setShowError(false);
          }}
          onEnterClick={() => {
            if (!posting && commentText?.trim()?.length && !pendingSave) {
              createBlockThread();
            }
          }}
          maxRows={20}
          className={
            "ml-2 border-0 overflow-hidden text-sm resize-none outline-0 w-full"
          }
          placeholder="Type your comment here"
          value={commentText}
          style={{
            backgroundColor: "transparent",
          }}
        />
      </div>

      <Box
        sx={{
          display: "flex",
          marginTop: "10px",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="invisible"
          sx={{
            color: "addComment.cancel",
            bg: "transparent",
          }}
          onClick={() => {
            setCommentText("");
            handleCancel();
            setMentionedUsers([]);
            props.cancelHandler && props.cancelHandler();
          }}
          size="small"
        >
          Cancel
        </Button>
        <Button
          id={"block-comment-post-final-btn"}
          variant="primary"
          sx={{
            backgroundColor: "addComment.postBg",
            color: "addComment.postText",
            borderWidth: 1,
            borderColor: "addComment.postBorder",
            borderStyle: "solid",
            ml: "10px",
            ":disabled": {
              cursor: "not-allowed",
            },
          }}
          disabled={posting || commentText?.trim()?.length <= 0 || pendingSave}
          size="small"
          onClick={createBlockThread}
        >
          Post
        </Button>
      </Box>
      {showError ? (
        <Box
          sx={{
            color: "addComment.errorColor",
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <AlertIcon size={10} />
          &nbsp;Error creating comment. Please try again!
        </Box>
      ) : null}
    </Box>
  );
};

export default CommentCard;
