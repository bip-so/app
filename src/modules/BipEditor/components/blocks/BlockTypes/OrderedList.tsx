import { Box } from "@primer/react";
import { Editor } from "slate";
import { useSlateStatic } from "slate-react";

function OrderedList({ element, children, data, actions, attributes }: any) {
  const editor = useSlateStatic();
  let number = 1,
    currentLevel = element?.attributes?.level;
  let value = editor.children;

  if (element.cellUUID) {
    const nodes = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) => n.uuid === element.cellUUID,
      })
    );
    if (nodes.length > 0) {
      const [[node, path]] = nodes;
      value = node.children;
    }
  }
  const index = value.findIndex((el) => el.uuid === element.uuid);

  for (let i = index - 1; i >= 0; i--) {
    if (value[i].type !== "olist") {
      break;
    }
    if (value[i]?.attributes?.level === currentLevel) {
      number++;
    } else if (value[i]?.attributes?.level < currentLevel) {
      break;
    }
  }
  const level = element?.attributes?.level;

  const getListStyle = (level: number) => {
    if (level) {
      switch (level % 5) {
        case 0:
          return "lower-alpha";
        case 2:
          return "lower-alpha";
        case 3:
          return "lower-roman";
        case 1:
        case 4:
        default:
          return "decimal";
      }
    }
    return "decimal";
  };

  return (
    <Box {...attributes} sx={{ color: "orderedListBlock.text" }}>
      <ol
        start={number}
        style={{
          paddingLeft: level ? `${level * 38}px` : "38px",
          listStyle: getListStyle(level),
        }}
      >
        <li>{children}</li>
      </ol>
    </Box>
  );
}

export default OrderedList;
