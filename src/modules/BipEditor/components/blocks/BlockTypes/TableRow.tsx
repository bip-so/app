import { ActionList, ActionMenu, Box, IconButton } from "@primer/react";
import React, { useRef } from "react";
import { Editor, Element as SlateElement, Transforms } from "slate";
import { useSlateStatic } from "slate-react";
import { v4 as uuidv4 } from "uuid";
import DotsIcon from "../../DotsIcon";
import { useDrag, useDrop } from "react-dnd";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../../../hooks/useHasPermission";
import {
  CanvasPermissionEnum,
  PermissionTreeContextEnum,
} from "../../../../Permissions/enums";
import { BranchAccessEnum } from "../../../../Canvas/enums";
import { getNodesById } from "../../../utils";
import { useCanvas } from "../../../../../context/canvasContext";
import { useUser } from "../../../../../context/userContext";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useToasts } from "react-toast-notifications";

const TableRow = ({
  attributes,
  children,
  data,
  actions,
  element,
  ...props
}: any) => {
  const editor = useSlateStatic();
  const { branch } = useCanvas();
  const rowRef = useRef();
  const { isLoggedIn } = useUser();
  const { addToast } = useToasts();
  const hasEditPerm =
    useHasPermission(
      CanvasPermissionEnum.CANVAS_BRANCH_EDIT,
      PermissionContextEnum.Canvas,
      branch?.permissionGroup?.permissions
    ) || branch?.publicAccess === BranchAccessEnum.EDIT;

  const canEdit = isLoggedIn && hasEditPerm;

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: "table-row",
    item: { element },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: canEdit,
  }));

  let dragProps = {
    ref: drag,
  };

  const onRowMoved = (movedRow, movedAboveRow) => {
    if (movedRow.tableUUID !== movedAboveRow.tableUUID) {
      addToast("Cannot move rows between tables", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    let nodes = getNodesById(editor, [movedRow.uuid, movedAboveRow.uuid]);
    if (nodes.length < 2) {
      return;
    }

    let movedRowPath, movedAboveRowPath;
    if (nodes[0][0].uuid === movedRow.uuid) {
      movedRowPath = nodes[0][1];
      movedAboveRowPath = nodes[1][1];
    } else {
      movedRowPath = nodes[1][1];
      movedAboveRowPath = nodes[0][1];
    }

    Transforms.moveNodes(editor, {
      at: movedRowPath,
      to: movedAboveRowPath,
    });
  };

  const [{ isOver, direction, ...rest }, drop] = useDrop({
    accept: ["table-row"],
    drop: (item, _) => {
      onRowMoved(item.element, element);
    },

    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      direction: !monitor.getInitialSourceClientOffset()
        ? ""
        : monitor?.getInitialSourceClientOffset()?.y <
          monitor?.getClientOffset()?.y
        ? "down"
        : "up",
    }),
  });

  if (isDragging) {
    Transforms.deselect(editor);
  }

  preview(getEmptyImage());
  drop(attributes.ref);

  const deleteRow = () => {
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
      const hasSiblings = node.children.length > 1;
      if (hasSiblings) {
        Transforms.removeNodes(editor, {
          at: path,
          match: (n, p) => n.uuid === element.uuid,
        });
      } else {
        addToast("Cannot delete the last row", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }
  };

  const insertRow = (direction) => {
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
      const columnSize = element.children.length;
      const rowUUID = uuidv4();
      const tableUUID = node.uuid;
      const tableIndex = editor.children.findIndex(
        (el) => el.uuid === node.uuid
      );
      const rowIndex = node.children.findIndex(
        (row) => row.uuid === element.uuid
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
                tableUUID,
                uuid: uuidv4(),
                rowUUID,
                attributes: {},
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
        at: [
          tableIndex,
          direction === "above"
            ? rowIndex === 0
              ? 0
              : rowIndex
            : rowIndex + 1,
        ],
      });
    }
  };

  const clearRow = () => {
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
      const rowIndex = node.children.findIndex(
        (row) => row.uuid === element.uuid
      );
      Transforms.removeNodes(editor, {
        at: [...path, rowIndex],
        match: (n, p) => n.cellUUID && p[1] === rowIndex,
      });

      const nodes = Array.from(
        Editor.nodes(editor, {
          at: path,
          match: (n, p) => n.type === "table-cell",
        })
      );

      const cellsAtCurRowIndex = nodes.filter(
        (cell) => cell[1][1] === rowIndex
      );

      cellsAtCurRowIndex.forEach((cellNode) => {
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

  const renderedJSX = (
    <tr
      className={`relative group ${
        isDragging ? "opacity-30 border-2 border-blue-300" : ""
      }  ${
        isOver && direction === "up"
          ? "border-t-blue-400 border-t-2"
          : isOver && direction === "down"
          ? "border-b-blue-400 border-b-2"
          : ""
      }`}
      {...attributes}
    >
      {children}
      {!data?.isDiff && !props.isReadOnly && canEdit && (
        <div contentEditable="false" ref={drag} suppressContentEditableWarning>
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
                  left: "0px",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  padding: "2px 0px",
                  borderRadius: "5px",
                  transition: "all 150ms ease 50ms",
                  display: "none",
                }}
                className="group-hover:block"
              />
            </ActionMenu.Anchor>

            <ActionMenu.Overlay align="center">
              <ActionList>
                <ActionList.Item onSelect={() => insertRow("above")}>
                  Insert above
                </ActionList.Item>
                <ActionList.Item onSelect={() => insertRow("below")}>
                  Insert below
                </ActionList.Item>
                <ActionList.Item onSelect={clearRow}>Clear row</ActionList.Item>
                <ActionList.Item onSelect={deleteRow}>
                  Delete Row
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </div>
      )}
    </tr>
  );
  return renderedJSX;
};

export default TableRow;
