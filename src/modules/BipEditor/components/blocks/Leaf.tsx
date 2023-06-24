import { Link as PrimerLink, Text, useTheme } from "@primer/react";
import { useRouter } from "next/router";
import React from "react";
import { Editor } from "slate";
import { useSlateStatic } from "slate-react";
import Chip from "../../../../components/Chip";
import { useCanvas } from "../../../../context/canvasContext";
import { useRightRail } from "../../../../context/rightRailContext";
import { getCommentThreadsOnTextNode, getReelsOnTextNode } from "../../utils";

const Leaf = React.memo(({ attributes, children, leaf, showHighlights }) => {
  const { colorMode } = useTheme();
  const editor = useSlateStatic();
  const router = useRouter();

  const { selectedObjectId } = useRightRail();
  if (leaf.bold) {
    children = <span style={{ fontWeight: 700 }}>{children}</span>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.placeholder) {
    children = (
      <Text
        sx={{
          "&::placeholder": {
            color: "red",
          },
        }}
      >
        {children}
      </Text>
    );
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.strikethrough) {
    children = <del>{children}</del>;
  }
  if (leaf.inlineCode || leaf.code)
    children = (
      <>
        <span contentEditable={false}></span>
        <Chip
          sx={{
            margin: "0px 1px",
            borderColor: "transparent",
            userSelect: "none",
            color: "inlineCode.text",
            paddingLeft: "1px",
            paddingRight: "1px",
            fontFamily: "monospace",
            fontSize: "14px",
          }}
        >
          <code>{children}</code>
        </Chip>
        <span contentEditable={false}></span>
      </>
    );

  if (leaf.link) {
    try {
      const url = new URL(leaf.link);
      const searchParams = new URLSearchParams(url.search);
      const blockUUID = searchParams.get("blockUUID");
      let isBlockFromCurCanvas: boolean;
      if (blockUUID) {
        const nodes = Array.from(
          Editor.nodes(editor, {
            at: [],
            match: (n, p) => n.uuid === blockUUID,
          })
        );
        if (nodes.length) {
          isBlockFromCurCanvas = true;
        }
      }
      children = (
        <PrimerLink
          href={leaf.link}
          rel="nofollow ugc"
          sx={{
            color: "left.text.link",
            cursor: "pointer",
          }}
          onClick={(e) => {
            isBlockFromCurCanvas
              ? router.push({
                  pathname: router.route,
                  query: {
                    ...router.query,
                    blockUUID,
                  },
                })
              : window.open(leaf.link, "_blank");
          }}
        >
          {children}
        </PrimerLink>
      );
    } catch (error) {
      console.error(error);
    }
  }
  if (showHighlights) {
    const commentThreads = getCommentThreadsOnTextNode(leaf, children);

    if (commentThreads.length > 0) {
      const isSelected = commentThreads.includes(
        selectedObjectId?.replace("thread-", "")
      );
      children = (
        <Text
          sx={{
            bg: isSelected ? "leaf.yellowBorder" : "",
            color: isSelected ? "leaf.text.darkText" : "",
          }}
        >
          {children}
        </Text>
      );
    }
  }

  // move to constants color codes
  let leafColor = leaf.comment
    ? "#6a9955"
    : leaf.operator || (leaf.url && leaf.text === "") //RP -> NR discuss
    ? "#d4d4d4"
    : leaf.keyword
    ? "#569CD6"
    : leaf.variable || leaf.regex
    ? "#d16969"
    : leaf.number ||
      leaf.boolean ||
      leaf.tag ||
      leaf.constant ||
      leaf.symbol ||
      leaf["attr-name"] ||
      leaf.selector
    ? "#b5cea8"
    : leaf.punctuation
    ? "#d4d4d4"
    : leaf.string || leaf.char
    ? "#ce9178"
    : leaf.function || leaf["class-name"]
    ? "#dcdcaa"
    : null;

  const style = {
    fontWeight: leaf.textProperties
      ? leaf.textProperties.bold
        ? "600"
        : null
      : null,
    fontStyle: leaf.textProperties
      ? leaf.textProperties.italic
        ? "italic"
        : null
      : null,
    backgroundColor: leaf.selection ? "#3297FD" : null,
    color: leaf.selection ? "white" : null,
  };
  if (leafColor) {
    style.color = leafColor;
    style.fontFamily = "monospace";
  }

  let bgColor;
  switch (leaf.diff) {
    case "added":
      bgColor = "rgba(61, 160, 61, 0.2)";
      break;
    case "removed":
      bgColor = "rgba(203, 36, 49, 0.25)";
      break;
    default:
  }

  if (bgColor) style.backgroundColor = bgColor;

  return (
    <>
      <span style={style} {...attributes}>
        {children}
        {leaf.placeholder && (
          <span
            style={{
              opacity: colorMode === "day" ? 0.5 : 0.3,
              position: "absolute",
              top: 0,
              pointerEvents: "none",
              userSelect: "none",
            }}
            contentEditable={false}
          >
            {leaf.placeholder}
          </span>
        )}
      </span>
    </>
  );
});

Leaf.displayName = "Leaf";
export default Leaf;
