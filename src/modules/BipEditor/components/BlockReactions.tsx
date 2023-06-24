import { Box } from "@primer/react";
import { FC, useCallback } from "react";
import { useToasts } from "react-toast-notifications";
import Reactions from "../../../components/Reactions";
import { useCanvas } from "../../../context/canvasContext";
import { useRightRail } from "../../../context/rightRailContext";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../hooks/useHasPermission";
import segmentEvents from "../../../insights/segment";
import { getUpdatedReactions } from "../../../utils/reactions";
import { BranchAccessEnum } from "../../Canvas/enums";
import { invalidateCanvasBlocks } from "../../Canvas/utils";
import { CanvasPermissionEnum } from "../../Permissions/enums";
import BlocksService from "../services";
import { BlockType, CreateReactionType } from "../types";

interface IBlockReactionsProps {
  blockUUID: string;
  onOpen?: () => void;
  onClose?: () => void;
}

const BlockReactions: FC<IBlockReactionsProps> = ({
  blockUUID,
  onOpen,
  onClose,
}: IBlockReactionsProps) => {
  const { addToast } = useToasts();
  const { branch, blocks, setBlocks, getBlock, updateBlock, repo } =
    useCanvas();
  const { setSelectedObjectId } = useRightRail();
  const block = getBlock(blockUUID);
  const { isLoggedIn, user } = useUser();
  const { currentStudio } = useStudio();

  const hasAddReactionPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_ADD_REACTION,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) ||
    branch?.publicAccess === BranchAccessEnum.COMMENT ||
    branch?.publicAccess === BranchAccessEnum.EDIT;

  const canAddReaction = isLoggedIn && hasAddReactionPerm;

  const addReaction = useCallback(
    (emoji: string) => {
      const data: CreateReactionType = {
        blockUUID: block.uuid,
        blockThreadID: 0,
        canvasBranchID: branch?.id!,
        scope: "block",
        emoji: emoji,
        reelCommentID: 0,
        blockCommentID: 0,
        reelID: 0,
      };
      if (
        block?.reactions?.find(
          (reaction) => reaction.emoji === emoji && reaction.reacted
        )
      ) {
        segmentEvents.reactionDeleted(
          currentStudio?.handle!,
          repo?.key!,
          user?.id!,
          "block"
        );
        BlocksService.removeReaction(data)
          .then((r) => {
            const reactions = getUpdatedReactions(
              block?.reactions,
              emoji,
              "remove"
            );
            const updatedBlock = {
              ...block,
              reactions: reactions,
            };
            updateBlock(updatedBlock);
            invalidateCanvasBlocks(branch?.id);
          })
          .catch((err) => {
            addToast("Something went wrong. Please try again", {
              appearance: "error",
              autoDismiss: true,
            });
          });
      } else {
        segmentEvents.reactionAdded(
          currentStudio?.handle,
          repo?.key,
          user.id,
          "block"
        );
        BlocksService.createReaction(data)
          .then((r) => {
            const reactions = getUpdatedReactions(block?.reactions, emoji);
            const updatedBlock = {
              ...block,
              reactions: reactions,
            };

            updateBlock(updatedBlock);

            invalidateCanvasBlocks(branch?.id);
          })
          .catch((err) => {
            addToast("Something went wrong. Please try again", {
              appearance: "error",
              autoDismiss: true,
            });
          });
      }
    },
    [block]
  );

  const removeReaction = useCallback(
    (emoji: string) => {
      const data: CreateReactionType = {
        blockUUID: block.uuid,
        blockThreadID: 0,
        canvasBranchID: branch?.id!,
        scope: "block",
        emoji: emoji,
        reelCommentID: 0,
        blockCommentID: 0,
        reelID: 0,
      };
      segmentEvents.reactionDeleted(
        currentStudio?.handle!,
        repo?.key!,
        user?.id!,
        "block"
      );
      BlocksService.removeReaction(data)
        .then((r) => {
          const reactions = getUpdatedReactions(
            block?.reactions,
            emoji,
            "remove"
          );
          const updatedBlock = {
            ...block,
            reactions: reactions,
          };
          updateBlock(updatedBlock);
          invalidateCanvasBlocks(branch?.id);
        })
        .catch((err) => {
          addToast("Something went wrong. Please try again", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    },
    [block]
  );

  return (
    <Box
      className="flex flex-wrap items-center gap-2 px-2 py-2 mb-2 cursor-pointer w-fit rounded-xl"
      onClick={() => {
        setSelectedObjectId(`reactions-${block?.uuid}`);
      }}
      sx={{
        bg: "blockReactions.bg",
      }}
    >
      {block?.reactions?.map((reaction) => (
        <Reactions
          key={reaction.emoji}
          addReaction={addReaction}
          removeReaction={removeReaction}
          emoji={reaction.emoji}
          count={reaction.count}
          reacted={reaction.reacted}
          viewOnly={!canAddReaction}
        />
      ))}
      {canAddReaction ? (
        <Reactions
          addReaction={addReaction}
          removeReaction={removeReaction}
          emoji={""}
          count={0}
          reacted={false}
          color={"#8D8D8D"}
          onOpen={onOpen}
          onClose={onClose}
        />
      ) : null}
    </Box>
  );
};

export default BlockReactions;
