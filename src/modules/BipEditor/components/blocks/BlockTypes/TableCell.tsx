import React, { useEffect, useState, useRef } from "react";
import { useFocused, useSelected, useSlate, useSlateStatic } from "slate-react";
import { useDrag, useDrop } from "react-dnd";
import { Editor, Element as SlateElement, Transforms } from "slate";
import { useTable } from "../../../../../context/tableContext";
import { getNodesById } from "../../../utils";
import { ActionList, ActionMenu, Box, IconButton } from "@primer/react";
import DotsIcon from "../../DotsIcon";
import { v4 as uuidv4 } from "uuid";
import { getEmptyImage } from "react-dnd-html5-backend";

import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../../../hooks/useHasPermission";
import { CanvasPermissionEnum } from "../../../../Permissions/enums";
import { useCanvas } from "../../../../../context/canvasContext";
import { BranchAccessEnum } from "../../../../Canvas/enums";
import { useUser } from "../../../../../context/userContext";
import { useToasts } from "react-toast-notifications";

const TableCell = ({
  attributes,
  children,
  data,
  actions,
  element,
  ...props
}: any) => {
  const editor = useSlate();
  const selected = useSelected();
  const {
    columnIndex,
    setColumnIndex,
    dropHoverOverColumnIndex,
    setDropHoverOverColumnIndex,
    draggingColumnIndex,
    setDraggingColumnIndex,
  } = useTable();
  const [showDotsBtn, setShowDotsBtn] = useState(false);
  const { branch } = useCanvas();
  const [curColumnIndex, setCurColumnIndex] = useState();
  const cellRef = useRef();
  const { addToast } = useToasts();
  const { isLoggedIn } = useUser();
  const hasEditPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_EDIT,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) || branch?.publicAccess === BranchAccessEnum.EDIT;
  const canEdit = isLoggedIn && hasEditPerm;

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "table-col",
    item: { element },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: canEdit,
  }));

  let dragProps = {
    ref: drag,
  };

  const onColumnMoved = (movedCell, movedAroundCell) => {
    setDraggingColumnIndex(null);
    if (movedCell.tableUUID !== movedAroundCell.tableUUID) {
      addToast("Cannot move columns between tables", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    let nodes = getNodesById(editor, [movedCell.uuid, movedAroundCell.uuid]);
    if (nodes.length < 2) {
      return;
    }
    const [[node, path]] = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.uuid === element.tableUUID,
      })
    );

    const oldColumnIndex = columnIndex;
    const newColumnIndex = nodes.find(
      (node) => node[0].uuid === movedAroundCell.uuid
    )[1][2];

    const cellNodesAtColIndex = Array.from(
      Editor.nodes(editor, {
        at: path,
        match: (n, p) => n.type === "table-cell" && p[2] === oldColumnIndex,
      })
    );

    cellNodesAtColIndex.forEach((cell) => {
      const oldPath = cell[1];
      let newPath = [...oldPath];
      newPath[2] = newColumnIndex;
      Transforms.moveNodes(editor, {
        at: oldPath,
        to: newPath,
      });
    });
  };

  const [{ isOver, direction, ...rest }, drop] = useDrop({
    accept: ["table-col"],
    drop: (item, _) => {
      onColumnMoved(item.element, element);
      // onRowMoved(item.element, element);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      direction: !monitor.getInitialSourceClientOffset()
        ? ""
        : monitor?.getInitialSourceClientOffset()?.x <
          monitor?.getClientOffset()?.x
        ? "right"
        : "left",
    }),
  });

  preview(getEmptyImage());

  drop(cellRef);
  useEffect(() => {
    if (dropHoverOverColumnIndex) {
      const [[node, _]] = Array.from(
        Editor.nodes(editor, {
          at: [],
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.uuid === element.tableUUID,
        })
      );
      if (node) {
        const row = node.children.find((row) => row.uuid === element.rowUUID);
        const newColumnIndex = row.children.findIndex(
          (col) => col.uuid === element.uuid
        );
        setCurColumnIndex(newColumnIndex);
      }
    }
  }, [dropHoverOverColumnIndex]);

  useEffect(() => {
    if (isOver || isDragging) {
      const [[node, _]] = Array.from(
        Editor.nodes(editor, {
          at: [],
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.uuid === element.tableUUID,
        })
      );
      if (node) {
        const row = node.children.find((row) => row.uuid === element.rowUUID);
        const newColumnIndex = row.children.findIndex(
          (col) => col.uuid === element.uuid
        );
        if (isOver) {
          setDropHoverOverColumnIndex(newColumnIndex);
        }
        if (isDragging) {
          setDraggingColumnIndex(newColumnIndex);
        }
      }
    } else {
      setDropHoverOverColumnIndex(null);
    }
  }, [isOver, isDragging]);

  useEffect(() => {
    if (columnIndex !== null && !data?.isDiff) {
      const nodes = Array.from(
        Editor.nodes(editor, {
          at: [],
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.uuid === element.tableUUID,
        })
      );

      if (nodes.length) {
        const [[node, path]] = nodes;
        const rowIndex = node.children.findIndex(
          (row) => row.uuid === element.rowUUID
        );

        const row = node.children[rowIndex];
        const curColumnIndex = row.children.findIndex(
          (col) => col.uuid === element.uuid
        );
        if (rowIndex === 0 && curColumnIndex === columnIndex) {
          setShowDotsBtn(true);
        } else {
          setShowDotsBtn(false);
        }
      } else {
        setShowDotsBtn(false);
      }
    } else {
      setShowDotsBtn(false);
    }
  }, [columnIndex, element, editor, data?.isDiff, canEdit]);

  const handleMouseOver = () => {
    if (data?.isDiff) {
      return;
    }
    const nodes = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.uuid === element.tableUUID,
      })
    );

    const updateColumnIndex = (node) => {
      const row = node.children.find((row) => row.uuid === element.rowUUID);
      const newColumnIndex = row.children.findIndex(
        (col) => col.uuid === element.uuid
      );
      setColumnIndex(newColumnIndex);
    };

    if (nodes.length) {
      const [[node, path]] = nodes;
      updateColumnIndex(node);
    } else {
      const [[_, cellPath]] = Array.from(
        Editor.nodes(editor, {
          at: [],
          match: (n) => n.uuid === element.uuid,
        })
      );
      const [table, tablePath] = Editor.node(editor, cellPath.slice(0, 1));
      const matchedNodes = Array.from(
        Editor.nodes(editor, {
          at: tablePath,
          match: (n, p) => {
            if (
              SlateElement.isElement(n) &&
              ((n.type.includes("table") && n.type !== "simple_table_v1") ||
                n.cellUUID)
            ) {
              return true;
            }
          },
        })
      );

      matchedNodes.forEach((entry) => {
        const [node, path] = entry;
        Transforms.setNodes(
          editor,
          {
            tableUUID: table.uuid,
          },
          {
            at: path,
          }
        );
      });
      updateColumnIndex(table);
    }
  };
  const deleteColumn = () => {
    const [[node, path]] = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.uuid === element.tableUUID,
      })
    );
    if (node) {
      const hasSiblings = node.children[0].children.length > 1;
      if (hasSiblings) {
        Transforms.removeNodes(editor, {
          at: path,
          match: (n, p) => n.type === "table-cell" && p[2] === columnIndex,
        });
      } else {
        addToast("Cannot delete the last column", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }
  };
  const insertColumn = (direction) => {
    const [[node, path]] = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.uuid === element.tableUUID,
      })
    );
    if (node) {
      node.children.forEach((row, i) => {
        const rowUUID = row.uuid;
        const tableUUID = node.uuid;
        const cellUUID = uuidv4();
        const tableIndex = editor.children.findIndex(
          (el) => el.uuid === node.uuid
        );

        const newCell = {
          type: "table-cell",
          children: [
            {
              type: "text",
              children: [{ text: "" }],
              cellUUID,
              uuid: uuidv4(),
              tableUUID,
              rowUUID,
              attributes: {},
            },
          ],
          tableUUID,
          uuid: cellUUID,
          rowUUID,
        };

        Transforms.insertNodes(editor, newCell, {
          at: [
            tableIndex,
            i,
            direction === "right"
              ? columnIndex + 1
              : columnIndex === 0
              ? 0
              : columnIndex,
          ],
        });
      });
    }
  };

  const clearColumn = () => {
    const [[node, path]] = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.uuid === element.tableUUID,
      })
    );

    if (node) {
      Transforms.removeNodes(editor, {
        at: path,
        match: (n, p) => n.cellUUID && p[2] === columnIndex,
      });

      const nodes = Array.from(
        Editor.nodes(editor, {
          at: path,
          match: (n, p) => n.type === "table-cell",
        })
      );

      const cellsAtCurColumnIndex = nodes.filter(
        (cell) => cell[1][2] === columnIndex
      );
      cellsAtCurColumnIndex.forEach((cellNode) => {
        const [cell, path] = cellNode;
        const { uuid: cellUUID, rowUUID, tableUUID } = cell;
        Transforms.insertNodes(
          editor,
          {
            type: "text",
            children: [{ text: "" }],
            cellUUID,
            tableUUID,
            uuid: uuidv4(),
            rowUUID,
            attributes: {},
          },
          {
            at: [...path, 0],
          }
        );
      });
    }
  };

  const onResizeColumn = (newWidth) => {
    const [[node, path]] = Array.from(
      Editor.nodes(editor, {
        at: [],
        match: (n) => n.uuid === element.uuid,
      })
    );

    Transforms.setNodes(
      editor,
      {
        attributes: {
          colWidth: newWidth,
        },
      },
      {
        at: [path[0]],
        match: (n, p) => n.type === "table-cell" && p[2] === columnIndex,
      }
    );
  };

  const hoveredBoxPosition = direction === "right" ? { right: 0 } : { left: 0 };

  const renderedJSX = (
    <td
      className={`relative   ${
        selected && !props.isReadOnly
          ? "outline outsine-offset-0  outline-2  outline-green-300"
          : "border-solid border border-gray-200"
      } `}
      onMouseOver={handleMouseOver}
      onMouseLeave={() => setColumnIndex(null)}
      style={{
        width: element?.attributes?.colWidth
          ? `${+element?.attributes?.colWidth + 10}px`
          : "",
        marginLeft: selected ? "500px" : "",
        maxWidth: 300,
        // opacity: draggingColumnIndex === curColumnIndex ? "0.3" : 1,
      }}
      {...attributes}
    >
      <Box
        style={{
          ...hoveredBoxPosition,
          position: "absolute",
          top: 0,

          height: "100%",
        }}
        contentEditable="false"
        suppressContentEditableWarning
      >
        <Box
          sx={{
            position: "absolute",
            width: "5px",
            height: "100%",
            backgroundColor:
              dropHoverOverColumnIndex === curColumnIndex &&
              dropHoverOverColumnIndex !== draggingColumnIndex
                ? "table.border"
                : "transparent",
            marginLeft: "-1px",
            marginTop: "-1px",
          }}
          contentEditable="false"
          suppressContentEditableWarning
        />
      </Box>
      <span
        style={{
          margin: "auto",
          width: "calc(100% - 10px)",
        }}
        ref={cellRef}
      >
        {children}
      </span>

      {showDotsBtn && !props.isReadOnly && canEdit && (
        <div contentEditable="false" suppressContentEditableWarning ref={drag}>
          <ActionMenu>
            <ActionMenu.Anchor>
              <IconButton
                icon={DotsIcon}
                {...dragProps}
                id={`${element.uuid}_drag`}
                size="small"
                contentEditable="false"
                suppressContentEditableWarning
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: "0px",
                  transform: "translate(-50%, -50%) rotate(90deg)",
                  padding: "2px 0px",
                  borderRadius: "5px",
                  transition: "all 150ms ease 50ms",
                }}
              />
            </ActionMenu.Anchor>

            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item onSelect={() => insertColumn("right")}>
                  Insert right
                </ActionList.Item>
                <ActionList.Item onSelect={() => insertColumn("left")}>
                  Insert left
                </ActionList.Item>
                <ActionList.Item onSelect={clearColumn}>
                  Clear Column
                </ActionList.Item>
                <ActionList.Item onSelect={() => {}}>
                  <label>Column Width</label>
                  <input
                    type="range"
                    required
                    min="30"
                    max="300"
                    value={
                      element?.attributes?.colWidth ??
                      cellRef?.current?.offsetWidth
                    }
                    onChange={(e) => onResizeColumn(e.target.value)}
                  />
                </ActionList.Item>
                <ActionList.Item onSelect={deleteColumn}>
                  Delete Column
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      )}
    </td>
  );
  return renderedJSX;
};

export default TableCell;
