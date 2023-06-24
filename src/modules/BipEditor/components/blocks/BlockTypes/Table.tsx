import { PlusIcon } from "@primer/octicons-react";
import { Box, Button, IconButton } from "@primer/react";
import { Transforms, Range, Editor } from "slate";
import { v4 as uuidv4 } from "uuid";
import { useReadOnly, useSlateStatic } from "slate-react";

import React from "react";

const Table = ({ attributes, children, data, actions, element }: any) => {
  const editor = useSlateStatic();
  const readOnly = useReadOnly();
  const renderedJSX = (
    <table
      style={{
        userDrag: "none",
        userSelect: "none",
        width: "max-content",
      }}
      {...attributes}
    >
      <tbody>{children}</tbody>
    </table>
  );

  const addRow = () => {
    const columnSize = element.children[0].children.length;
    const rowUUID = uuidv4();
    const tableUUID = element.uuid;
    const tableIndex = editor.children.findIndex(
      (el) => el.uuid === element.uuid
    );

    const newRow = {
      type: "table-row",
      uuid: rowUUID,
      children: [...Array(columnSize)].map(() => {
        const cellUUID = uuidv4();
        return {
          type: "table-cell",
          children: [
            {
              type: "text",
              children: [{ text: "" }],
              cellUUID,
              uuid: uuidv4(),
              rowUUID,
              attributes: {},
              tableUUID,
            },
          ],
          tableUUID,
          uuid: uuidv4(),
          rowUUID,
        };
      }),

      tableUUID,
    };
    Transforms.insertNodes(editor, newRow, {
      at: [tableIndex, element.children.length],
    });
  };

  const addColumn = () => {
    element.children.forEach((row, i) => {
      const rowUUID = row.uuid;
      const tableUUID = element.uuid;
      const cellUUID = uuidv4();
      const tableIndex = editor.children.findIndex(
        (el) => el.uuid === element.uuid
      );

      const newCell = {
        type: "table-cell",
        children: [
          {
            type: "text",
            children: [{ text: "" }],
            cellUUID,
            tableUUID,
            uuid: uuidv4(),
            rowUUID,
            attributes: {},
          },
        ],
        tableUUID,
        uuid: cellUUID,
        rowUUID,
      };

      Transforms.insertNodes(editor, newCell, {
        at: [tableIndex, i, row.children.length],
      });
    });
  };

  return (
    <Box
      sx={{
        overflowX: "auto",
        overflowY: "visible",
        "::-webkit-scrollbar": { height: "8px", cursor: "pointer" },
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "inline-block",
          margin: "15px",
          outline: 0,
        }}
      >
        {renderedJSX}
        {!readOnly && (
          <>
            <Box
              sx={{
                position: "absolute",
                display: "flex",
                right: "0px",
                top: "0px",
                bottom: "0px",
                transform: "translateX(100%)",
              }}
              contentEditable="false"
              suppressContentEditableWarning
            >
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  opacity: "0",
                  transition: "opacity 150ms ease 50ms",
                  "&:hover": {
                    opacity: 1,
                  },
                }}
              >
                <IconButton
                  aria-label="Add Column"
                  icon={PlusIcon}
                  onClick={addColumn}
                  sx={{
                    borderRadius: "0px",
                    width: "20px",
                    padding: "0px",
                    svg: {
                      width: "14px",
                    },
                  }}
                />
              </Box>
            </Box>
            <Box
              sx={{
                position: "absolute",
                display: "flex",
                flexDirection: "row",
                bottom: "-18px",
                left: "0px",
                right: "0px",
                // transform: "translateY(100%)",
              }}
              contentEditable="false"
              suppressContentEditableWarning
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  height: "100%",
                  opacity: "0",
                  transition: "opacity 150ms ease 50ms",
                  "&:hover": {
                    opacity: 1,
                  },
                }}
              >
                <IconButton
                  aria-label="Add Row"
                  icon={PlusIcon}
                  onClick={addRow}
                  sx={{
                    borderRadius: "0px",
                    width: "100%",
                    height: "20px",
                    padding: "0px",
                    svg: {
                      width: "14px",
                    },
                  }}
                />
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Table;
