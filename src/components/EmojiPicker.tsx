import { useState, useEffect, useRef, FC, memo, useCallback } from "react";
import {
  ActionList,
  ActionMenu,
  Box,
  useOnOutsideClick,
  useTheme,
} from "@primer/react";
import { SmileyIcon } from "@primer/octicons-react";

import "emoji-mart/css/emoji-mart.css";
import { Picker } from "emoji-mart";

interface EmojiPickerProps {
  onEmojiPicked: (emojiName: string) => void;
  emoji: any;
  onOpen?: () => void;
  onClose?: () => void;
  size?: string;
  anchor?: any;
}

const EmojiPicker: FC<EmojiPickerProps> = memo((props) => {
  const [showPicker, setShowPicker] = useState(false);
  const anchorRef = useRef(null);
  const pickerRef = useRef(null);
  const { colorMode } = useTheme();

  const toggleEmojiPicker = () => {
    setShowPicker(!showPicker);
  };

  const { size = "16px" } = props;

  useEffect(() => {
    if (showPicker) {
      props.onOpen && props.onOpen();
    } else {
      props.onClose && props.onClose();
    }
  }, [showPicker]);

  useOnOutsideClick({
    onClickOutside: useCallback(() => {
      if (showPicker) {
        setShowPicker(false);
      }
    }, [showPicker]),
    containerRef: pickerRef,
  });

  const closeEmojiPicker = () => {
    setShowPicker(false);
  };

  const onEmojiPicked = (emoji: any, _: any) => {
    setShowPicker(false);
    props.onEmojiPicked(emoji.native);
  };

  return (
    <>
      {props.emoji ? (
        <span
          style={{ fontSize: size }}
          onClick={toggleEmojiPicker}
          ref={anchorRef}
        >
          {props.emoji}
        </span>
      ) : (
        <Box onClick={toggleEmojiPicker} ref={anchorRef}>
          <SmileyIcon />
        </Box>
      )}
      <ActionMenu anchorRef={anchorRef} open={showPicker}>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Item ref={pickerRef}>
              <Picker
                onClick={onEmojiPicked}
                title=""
                emoji=""
                theme={colorMode === "night" ? "dark" : "light"}
              />
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </>
    // <Box
    //   ref={wrapperRef}
    //   sx={{
    //     display: "flex",
    //     flexDirection: "column",
    //     justifyContent: "space-between",
    //     alignItems: "center",
    //     cursor: "pointer",
    //     position: props.pos === "relative" ? "relative" : "absolute",
    //     // zIndex: '10'
    //   }}
    //   onClick={(e) => {
    //     e.stopPropagation();
    //     e.preventDefault();
    //   }}
    // >
    //   {props.emoji ? (
    //     <span onClick={toggleEmojiPicker}>{props.emoji}</span>
    //   ) : (
    //     <Box onClick={toggleEmojiPicker}>
    //       <SmileyIcon />
    //     </Box>
    //   )}
    //   {showPicker ? (
    //     <Box
    //       sx={{
    //         top: "30px",
    //         left: "0px",
    //         position: "absolute",
    //         zIndex: "100",
    //       }}
    //     >
    //       <Picker onClick={onEmojiPicked} title="" emoji="" />
    //     </Box>
    //   ) : null}
    // </Box>
  );
});

EmojiPicker.displayName = "EmojiPicker";

export default EmojiPicker;
