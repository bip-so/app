import { useState } from "react";
import { Transforms } from "slate";
import { SelectPanel, Button } from "@primer/react";
import { useSlate } from "slate-react";
import {
  getActiveBlockType,
  insertInlineVoid,
  SLASH_COMMAND_OPTIONS,
} from "../utils";
import { INLINE_VOID_BLOCK_TYPES } from "../constants";

const BlockTypeSelector = ({
  anchor,
  trailingIcon,
  at,
  open,
  setOpen,
  setShowFakeSelection,
  selectedBlockType,
}) => {
  const editor = useSlate();
  const items = SLASH_COMMAND_OPTIONS.map((option) => {
    return { ...option, text: option.title };
  });
  const [filter, setFilter] = useState("");
  const HIDDEN_BLOCK_TYPES = ["simple_table_v1"];

  const filteredItems = items.filter(
    (item) =>
      item.text.toLowerCase().includes(filter.toLowerCase()) &&
      !HIDDEN_BLOCK_TYPES.includes(item.type)
  );

  const onSelectedChange = (item) => {
    if (item) {
      if (INLINE_VOID_BLOCK_TYPES.includes(item.type)) {
        insertInlineVoid(editor, item.type, at);
      } else {
        let properties = { type: item.type };
        if (item.type === "checklist") {
          properties.attributes = {
            checked: false,
            level: 1,
          };
        }
        Transforms.setNodes(editor, properties, {
          at: at,
          match: (_, path) => path.length === 1,
        });
      }
    }
  };

  const currentBlockType = selectedBlockType
    ? selectedBlockType
    : getActiveBlockType(editor);
  const selected = items.find((item) => item.type === currentBlockType);

  return (
    <SelectPanel
      renderAnchor={({
        children,
        "aria-labelledby": ariaLabelledBy,
        ...anchorProps
      }) => {
        if (anchor) {
          return (
            <div
              {...anchorProps}
              style={{ display: "inline-flex", width: "100%" }}
            >
              {anchor}
            </div>
          );
        } else {
          return (
            <Button
              variant="invisible"
              sx={{
                color: "text.default",
                fontWeight: 400,
                display: "inline-block",
              }}
              trailingIcon={trailingIcon}
              {...anchorProps}
              onMouseDown={(e) => {
                e.preventDefault();
                if (setShowFakeSelection) {
                  setShowFakeSelection(true);
                }
              }}
            >
              {selected ? selected.text : "Block Type"}
            </Button>
          );
        }
      }}
      placeholderText="Search blocks"
      open={open}
      onOpenChange={setOpen}
      items={filteredItems}
      selected={selected}
      onSelectedChange={onSelectedChange}
      onFilterChange={setFilter}
      showItemDividers={false}
      overlayProps={{ width: "small", height: "small" }}
    />
  );
};

export default BlockTypeSelector;
