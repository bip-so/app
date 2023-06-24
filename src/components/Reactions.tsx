import { useState, useEffect, useRef, FC, memo, useCallback } from "react";
import {
  ActionList,
  AnchoredOverlay,
  Box,
  Button,
  IconButton,
  useOnOutsideClick,
  useTheme,
} from "@primer/react";

import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";
import SmileyIcon from "../icons/SmileyIcon";
import useDeviceDimensions from "../hooks/useDeviceDimensions";
import { POST_REACTIONS } from "../modules/Posts/constants";
import CelebrateIcon from "../icons/CelebrateIcon";
import ExceptionalIcon from "../icons/ExceptionalIcon";
import JustLookingIcon from "../icons/JustLookingIcon";
import WellDoneIcon from "../icons/WellDoneIcon";

interface IReactionsProps {
  addReaction?: (emoji: string, count: number) => void;
  removeReaction?: (emoji: string) => void;
  emoji: string;
  withText?: boolean;
  count: number | string;
  reacted: boolean;
  color?: string;
  onOpen?: () => void;
  onClose?: () => void;
  viewOnly?: boolean;
  disabled?: boolean;
}

const Reactions: FC<IReactionsProps> = memo((props) => {
  const {
    emoji,
    count,
    reacted,
    addReaction,
    removeReaction,
    color,
    onOpen,
    onClose,
    viewOnly,
    withText = false,
    disabled = false,
  } = props;
  const [showPicker, setShowPicker] = useState(false);
  const { colorMode } = useTheme();

  const { isTabletOrMobile } = useDeviceDimensions();
  const pickerRef = useRef(null);

  const onEmojiPicked = (emoji: any, _: any) => {
    setShowPicker(false);
    onClose && onClose();
    addReaction && addReaction(emoji.native, 1);
  };

  useOnOutsideClick({
    onClickOutside: useCallback(() => {
      if (showPicker) {
        setShowPicker(false);
        onClose && onClose();
      }
    }, [showPicker]),
    containerRef: pickerRef,
  });

  const getReactionIcon = (emoji: string) => {
    switch (emoji) {
      case POST_REACTIONS.WELL_DONE:
        return <WellDoneIcon size={14} />;
      case POST_REACTIONS.JUST_LOOKING:
        return <JustLookingIcon size={14} />;
      case POST_REACTIONS.EXCEPTIONAL:
        return <ExceptionalIcon size={14} />;
      case POST_REACTIONS.CELEBRATE:
        return <CelebrateIcon size={14} />;
      default:
        return emoji;
    }
  };

  return emoji ? (
    <Box
      display={"flex"}
      alignItems={"center"}
      padding={"0px 6px"}
      borderRadius={"14px"}
      border={"1px solid rgba(27, 31, 35, 0.15)"}
      sx={{ cursor: viewOnly ? "default" : "pointer" }}
      onClick={() => {
        if (!viewOnly) {
          if (reacted) {
            removeReaction && removeReaction(emoji);
          } else {
            addReaction && addReaction(emoji, Number(props.count) + 1);
          }
        }
      }}
      contentEditable={false}
    >
      <div className="mr-1 text-sm">{getReactionIcon(emoji)}</div>
      <p className="text-sm">{count}</p>
    </Box>
  ) : viewOnly ? null : (
    <div className="relative" contentEditable={false} ref={pickerRef}>
      <AnchoredOverlay
        renderAnchor={(anchorProps) =>
          withText ? (
            <div {...anchorProps}>
              {!isTabletOrMobile ? (
                <ActionList.Item onClick={() => {}}>
                  <ActionList.LeadingVisual>
                    <SmileyIcon color={color} />
                  </ActionList.LeadingVisual>
                  Add Reaction
                </ActionList.Item>
              ) : null}
            </div>
          ) : (
            <Button
              variant={"invisible"}
              size="small"
              {...anchorProps}
              sx={{
                padding: "4px 6px",
              }}
            >
              <SmileyIcon color={color} />
            </Button>
          )
        }
        open={showPicker}
        onOpen={() => {
          if (!disabled) {
            setShowPicker(true);
            onOpen && onOpen();
          }
        }}
        onClose={onClose}
      >
        <Picker
          onClick={onEmojiPicked}
          title=""
          emoji=""
          theme={colorMode === "night" ? "dark" : "light"}
        />
      </AnchoredOverlay>
    </div>
  );
});
Reactions.displayName = "Reactions";

export default Reactions;
