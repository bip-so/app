import { Box } from "@primer/react";
import { useSlateStatic } from "slate-react";

function UnorderedList({ element, children, data, actions, attributes }: any) {
  const editor = useSlateStatic();
  const index = editor.children.findIndex((x) => x.uuid === element.uuid);
  const isFirst =
    index === 0 || (index > 1 && editor.children[index - 1].type !== "ulist");
  const level = element?.attributes?.level;

  const getListStyle = (level: number) => {
    if (level) {
      switch (level % 5) {
        case 0:
          return "square";
        case 2:
          return "circle";
        case 1:
        default:
          return "disc";
      }
    }
    return "disc";
  };

  return (
    <Box
      {...attributes}
      sx={{
        color: "unOrderedListBlock.text",
      }}
    >
      <ul
        style={{
          paddingLeft: level ? `${level * 38}px` : "38px",
          listStyle: getListStyle(level),
        }}
      >
        <li>{children}</li>
      </ul>
    </Box>
  );
}

export default UnorderedList;
