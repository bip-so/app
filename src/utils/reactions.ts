import { ReactionType } from "../modules/BipEditor/types";

export const getUpdatedReactions = (
  reactions: ReactionType[] | null | undefined,
  emoji: string,
  type: string = "update"
) => {
  if (type === "remove") {
    if (reactions?.length) {
      const reactionIndex = reactions?.findIndex(
        (reac) => reac.emoji === emoji
      );
      if (reactionIndex >= 0) {
        const reaction = reactions[reactionIndex];
        if (reaction?.count === 1) {
          return reactions?.filter((reac) => reac.emoji !== emoji);
        } else {
          const updatedReaction = {
            emoji: emoji,
            count: reactions[reactionIndex].count - 1,
            reacted: false,
          };
          let updatedReactions = [...reactions];
          updatedReactions[reactionIndex] = updatedReaction;
          return updatedReactions;
        }
      }
      return reactions;
    }
    return [];
  } else {
    if (reactions?.length) {
      const reactionIndex = reactions?.findIndex(
        (reac) => reac.emoji === emoji
      );
      if (reactionIndex >= 0) {
        const updatedReaction = {
          emoji: emoji,
          count: reactions[reactionIndex].count + 1,
          reacted: true,
        };
        let updatedReactions = [...reactions];
        updatedReactions[reactionIndex] = updatedReaction;
        return updatedReactions;
      } else {
        return [
          ...reactions,
          {
            emoji: emoji,
            count: 1,
            reacted: true,
          },
        ];
      }
    } else {
      return [
        {
          emoji: emoji,
          count: 1,
          reacted: true,
        },
      ];
    }
  }
};
