import { Box, Text, useTheme } from "@primer/react";
import { useEffect, useRef } from "react";
import { Transforms, Range } from "slate";
import { useReadOnly, useSlateStatic } from "slate-react";
import Colors from "../../../../../utils/Colors";
import { useCustomSelected } from "../../../utils";

interface ICalloutProps {}

export const CALLOUT_TYPES = [
  { type: "general", emoji: "📣", color: "callout.info" },
  { type: "tip", emoji: "ℹ️", color: "callout.tip" },
  { type: "success", emoji: "✅", color: "callout.success" },
  { type: "alert", emoji: "⚠️", color: "callout.alert" },
  { type: "danger", emoji: "⛔️", color: "callout.danger" },
];

const Callout: React.FunctionComponent = ({
  attributes,
  children,
  element,
}: any) => {
  const editor = useSlateStatic();
  const selected = useCustomSelected(element);
  const readOnly = useReadOnly();
  const selectMenuRef = useRef<any>();
  const { colorMode } = useTheme();

  var callOutTYpeObj;

  if (element?.attributes?.calloutColor && !element?.attributes?.calloutType) {
    //this section is for backward compatibility
    callOutTYpeObj = CALLOUT_TYPES.find(
      (typeObj) => typeObj.type === "general"
    );
  } else {
    callOutTYpeObj =
      CALLOUT_TYPES.find(
        (typeObj) => typeObj.type === element.attributes?.calloutType
      ) ?? CALLOUT_TYPES[0];
  }

  const renderedJSX = (
    <Box
      as="span"
      sx={{
        backgroundColor: callOutTYpeObj?.color,
        boxShadow:
          colorMode === "day"
            ? "inset 0 0 0 1px rgb(0 0 0 / 10%)"
            : "inset 0 0 0 1px rgb(255 255 255 / 10%)",
        borderRadius: "8px",
        margin: "2px 0px 0px 0px !important",
        fontSize: "16px !important",
        lineHeight: "26px",
        padding: "16px",
        display: "inline-flex",
        alignItems: "flex-start",
        width: "100%",
      }}
      {...attributes}
    >
      <Text
        as="p"
        sx={{
          fontSize: "16px !important",
          lineHeight: "26px",
          flexGrow: 0,
          fontFamily: "Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
          userSelect: "none",
        }}
        contentEditable={false}
      >
        {callOutTYpeObj?.emoji}
      </Text>
      <Text
        as="p"
        sx={{
          fontSize: "16px !important",
          lineHeight: "26px",
          marginLeft: "16px",
          flexGrow: 1,
        }}
      >
        {children}
      </Text>
    </Box>
  );

  const setCalloutType = (value) => {
    let attributes = {
      ...element.attributes,
      calloutType: value,
    };
    Transforms.setNodes(
      editor,
      {
        attributes: attributes,
      },
      {
        at: [],
        match: (node, _) => node.uuid === element.uuid,
      }
    );
  };
  return (
    <>
      {selected || document.activeElement === selectMenuRef.current ? (
        <div
          contentEditable={false}
          style={{ userSelect: "none", position: "relative" }}
        >
          <select
            value={callOutTYpeObj?.type}
            onChange={(e) => setCalloutType(e.target.value)}
            style={{
              userSelect: "none",
              borderRadius: "4px",
              background: "transparent",
              color: Colors.gray["500"],
              border: "none",
              fontSize: "12px",
              position: "absolute",
              right: "4px",
              top: "4px",
              cursor: "pointer",
            }}
            disabled={readOnly}
            ref={selectMenuRef}
          >
            {CALLOUT_TYPES.map((typeObject) => (
              <option key={typeObject.type} value={typeObject.type}>
                {typeObject.type}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {renderedJSX}
      {editor.selection &&
        selected &&
        Range.isCollapsed(editor.selection) &&
        !readOnly && (
          <div contentEditable={false}>
            <Text
              color="callout.hintText"
              fontSize={10}
              style={{
                float: "right",
                height: 0,
              }}
            >
              ⏎ (Enter) for new block, (shift + enter) for new line
            </Text>
          </div>
        )}
    </>
  );
};

export default Callout;
