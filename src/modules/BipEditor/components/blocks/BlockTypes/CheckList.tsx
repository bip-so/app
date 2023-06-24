import { Box } from "@primer/react";
import { Transforms } from "slate";
import { useSlateStatic } from "slate-react";

function CheckList({
  element,
  children,
  data,
  actions,
  attributes,
  isReadOnly,
}: any) {
  const { checked, level } = element.attributes ?? {};
  const editor = useSlateStatic();

  const changeHandler = (e: any) => {
    let attributes = {
      ...element.attributes,
      checked: e.target.checked,
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
    <Box
      {...attributes}
      className="inline-flex items-start w-full"
      sx={{
        paddingLeft: level ? `${level * 38 - 20}px` : "38px",
        paddingTop: "3px",
        paddingBottom: "3px",
        color: "checklistBlock.text",
      }}
    >
      <span
        contentEditable={false}
        className="pr-1.5 mt-0.5 accent-gray-500 select-none"
      >
        <input
          type="checkbox"
          checked={checked ?? false}
          onChange={changeHandler}
          disabled={isReadOnly}
        />
      </span>
      <span
        contentEditable={isReadOnly ? false : true}
        suppressContentEditableWarning={true}
        className={`flex-grow ${checked ? "line-through text-gray-500" : ""}`}
      >
        {children}
      </span>
    </Box>
  );
}

export default CheckList;
