import {
  AnchoredOverlay,
  Box,
  Button,
  Text,
  Tooltip,
  useOnOutsideClick,
  useTheme,
} from "@primer/react";
import * as React from "react";
import ExceptionalIcon from "../../../icons/ExceptionalIcon";
import JustLookingIcon from "../../../icons/JustLookingIcon";
import { useCallback, useState } from "react";
import WellDoneIcon from "../../../icons/WellDoneIcon";
import { ThumbsupIcon as ThumbsupOctiIcon } from "@primer/octicons-react";
import { POST_REACTIONS } from "../constants";
import { Picker } from "emoji-mart";
import { PlusIcon } from "@primer/styled-octicons";
import ClappingHandsIcon from "../../../icons/ClappingHandsIcon";
import CelebrateIcon from "../../../icons/CelebrateIcon";
import RocketIcon from "../../../icons/RocketIcon";
import HundredPointsIcon from "../../../icons/HundredPointsIcon";
import ThumbsdownIcon from "../../../icons/ThumbsdownIcon";
import ThumbsupIcon from "../../../icons/ThumbsupIcon";
import SmileyIcon from "../../../icons/SmileyIcon";

interface ILikeComponentProps {
  showThumb?: boolean;
  emoji?: string;
  addReaction: (emoji: string) => void;
  removeReaction: (emoji: string) => void;
}

const LikeComponent: React.FunctionComponent<ILikeComponentProps> = (props) => {
  const { showThumb, emoji, addReaction, removeReaction } = props;
  const [showLikeOverlay, setShowLikeOverlay] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const { colorMode } = useTheme();
  const pickerRef = React.useRef(null);

  const openOverlay = useCallback(
    () => setShowLikeOverlay(true),
    [setShowLikeOverlay]
  );

  const closeOverlay = useCallback(
    () => setShowLikeOverlay(false),
    [setShowLikeOverlay]
  );

  useOnOutsideClick({
    onClickOutside: () => {
      if (showPicker) {
        setShowPicker(false);
      }
    },
    containerRef: pickerRef,
  });

  const onEmojiPicked = (emoji: any, _: any) => {
    setShowPicker(false);
    addReaction(emoji.native);
  };

  const getReactionIcon = () => {
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
    <Button
      variant="invisible"
      sx={{
        color: "postInFeed.textLight",
        border: "none",
        borderColor: "none",
        px: "4px",
        ":hover:not([disabled])": {
          border: "none",
          borderColor: "none",
        },
      }}
      onClick={() => {
        removeReaction(emoji);
      }}
    >
      <Box
        display={"flex"}
        alignItems={"center"}
        sx={{
          gap: "5px",
        }}
      >
        {getReactionIcon()}
        <Text
          sx={{
            fontSize: "12px",
            fontWeight: 600,
            lineHeight: "18px",
          }}
        >
          {"Reacted"}
        </Text>
      </Box>
    </Button>
  ) : (
    <>
      <Box
        sx={{
          position: "relative",
          ":hover": {
            ".hover-box": {
              display: "block",
              visibility: "visible",
            },
          },
        }}
      >
        <Button
          variant="invisible"
          sx={{
            color: "postInFeed.textLight",
            border: "none",
            borderColor: "none",
            outline: "none !important",
            px: "4px",
            ":hover:not([disabled])": {
              border: "none",
              borderColor: "none",
            },
          }}
        >
          <Box
            display={"flex"}
            alignItems={"center"}
            sx={{
              gap: "5px",
            }}
          >
            {showThumb && <ThumbsupOctiIcon size={14} />}
            <Text
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                lineHeight: "18px",
              }}
            >
              React
            </Text>
          </Box>
        </Button>
        <Box
          padding={"16px"}
          height={"68px"}
          borderRadius={"12px"}
          sx={{
            display: showPicker ? "block" : "none",
            position: "absolute",
            bottom: "30px",
            bg: "postInFeed.likeOverlayBg",
            boxShadow:
              colorMode === "day"
                ? "0 1px 3px rgb(27 31 36 / 12%), 0 8px 24px rgb(66 74 83 / 12%)"
                : "0 0 0 1px #30363d, 0 16px 32px rgb(1 4 9 / 85%)",
          }}
          className="hover-box"
        >
          <Box
            display={"flex"}
            alignItems={"center"}
            padding={"4px"}
            sx={{
              gap: "34px",
              ":hover": { fontSize: "40" },
            }}
          >
            <Box
              sx={{
                cursor: "pointer",
                transition: ".1s",
                ":hover": {
                  transform: "scale(1.33)",
                },
              }}
              onClick={() => {
                addReaction("👍");
              }}
            >
              <ThumbsupIcon />
            </Box>
            <Box
              sx={{
                cursor: "pointer",
                transition: ".1s",
                ":hover": {
                  transform: "scale(1.33)",
                },
              }}
              onClick={() => {
                addReaction("👎");
              }}
            >
              <ThumbsdownIcon />
            </Box>
            <Box
              sx={{
                cursor: "pointer",
                transition: ".1s",
                ":hover": {
                  transform: "scale(1.33)",
                },
              }}
              onClick={() => {
                addReaction("👏");
              }}
            >
              <ClappingHandsIcon />
            </Box>
            <Box
              sx={{
                cursor: "pointer",
                transition: ".1s",
                ":hover": {
                  transform: "scale(1.33)",
                },
              }}
              onClick={() => {
                addReaction(POST_REACTIONS.CELEBRATE);
              }}
            >
              <CelebrateIcon />
            </Box>
            <Box
              sx={{
                cursor: "pointer",
                transition: ".1s",
                ":hover": {
                  transform: "scale(1.33)",
                },
              }}
              onClick={() => {
                addReaction("🚀");
              }}
            >
              <RocketIcon />
            </Box>
            <Box
              sx={{
                cursor: "pointer",
                transition: ".1s",
                ":hover": {
                  transform: "scale(1.33)",
                },
              }}
              onClick={() => {
                addReaction("💯");
              }}
            >
              <HundredPointsIcon />
            </Box>
            <div className="relative" contentEditable={false} ref={pickerRef}>
              <AnchoredOverlay
                renderAnchor={(anchorProps) => (
                  <Button
                    {...anchorProps}
                    variant="invisible"
                    sx={{
                      color: "text.muted",
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <SmileyIcon />
                  </Button>
                )}
                open={showPicker}
                onOpen={() => {
                  setShowPicker(true);
                }}
              >
                <Picker
                  onClick={onEmojiPicked}
                  title=""
                  emoji=""
                  theme={colorMode === "night" ? "dark" : "light"}
                  set={"twitter"}
                />
              </AnchoredOverlay>
            </div>
          </Box>
        </Box>
      </Box>
      {/* <AnchoredOverlay
        renderAnchor={(anchorProps) => (
          <Button
            {...anchorProps}
            variant="invisible"
            sx={{
              color: "postInFeed.textLight",
              border: "none",
              borderColor: "none",
              outline: "none !important",
              ":hover:not([disabled])": {
                border: "none",
                borderColor: "none",
              },
            }}
          >
            <Box
              display={"flex"}
              alignItems={"center"}
              sx={{
                gap: "5px",
              }}
            >
              {showThumb && <ThumbsupIcon size={14} />}
              <Text
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  lineHeight: "18px",
                }}
              >
                Like
              </Text>
            </Box>
          </Button>
        )}
        open={showLikeOverlay}
        onOpen={openOverlay}
        onClose={closeOverlay}
        overlayProps={{
          sx: {
            overflow: "visible",
          },
        }}
      >
        <Box
          padding={"16px"}
          width={"184px"}
          height={"68px"}
          borderRadius={"12px"}
        >
          <Box
            display={"flex"}
            padding={"4px"}
            sx={{
              gap: "34px",
              ":hover": { fontSize: "40" },
            }}
          >
            <Tooltip aria-label="Well Done">
              <Box
                onClick={() => {
                  addReaction(POST_REACTIONS.WELL_DONE);
                  closeOverlay();
                }}
              >
                <WellDoneIcon />
              </Box>
            </Tooltip>
            <Tooltip aria-label="Just Looking">
              <Box
                onClick={() => {
                  addReaction(POST_REACTIONS.JUST_LOOKING);
                  closeOverlay();
                }}
              >
                <JustLookingIcon />
              </Box>
            </Tooltip>
            <Tooltip aria-label="Exceptional">
              <Box
                onClick={() => {
                  addReaction(POST_REACTIONS.EXCEPTIONAL);
                  closeOverlay();
                }}
              >
                <ExceptionalIcon />
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </AnchoredOverlay> */}
    </>
  );
};

export default LikeComponent;
