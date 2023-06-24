import React from "react";
import { Text } from "@primer/react";

interface ChipProps {
  icon?: any;
  text?: string;
  sx?: object;
  contentEditable?: boolean;
  children?: any;
}

const Chip = (props: ChipProps) => {
  const { sx, text, icon, contentEditable, children } = props;
  return (
    <Text
      contentEditable={contentEditable}
      sx={{
        fontSize: 16,
        height: 20,
        borderRadius: 4,
        bg: "chip.bg",
        padding: "2px 4px",
        margin: "0px 1px",
        borderWidth: 1,
        ...sx,
      }}
    >
      {icon && (
        <span
          style={{
            height: 18,
            width: 16,
            alignItems: "center",
            verticalAlign: "text-bottom",
            display: "inline-flex",
            marginRight: 4,
          }}
        >
          {icon}
        </span>
      )}
      {text && <Text contentEditable={contentEditable}>{text}</Text>}
      {children}
    </Text>
  );
};

export default Chip;
