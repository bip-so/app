import React from "react";
import { Box, Button } from "@primer/react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckIcon,
  XIcon,
} from "@primer/styled-octicons";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../../../../hooks/useHasPermission";
import { CanvasPermissionEnum } from "../../../../Permissions/enums";
import { usePermissions } from "../../../../../context/permissionContext";
import { PermissionGroup } from "../../../../Permissions/types";
import { useCanvas } from "../../../../../context/canvasContext";

const Diff = ({ children, data, actions, element }) => {
  let index = data?.conflicts.findIndex(
    (el) => el.conflictId === element.conflictId
  );
  let conflict = data?.conflicts[index] ?? {};

  const { mergeRequest } = data;

  const isMergeClosed = data.mergeRequest?.mergeRequest?.status !== "OPEN";
  const mergeRequestStatus = data.mergeRequest?.mergeRequest?.status;

  const { schema } = usePermissions();
  const { repo } = useCanvas();

  const canManageMergeRequestsOnParent = useHasPermission(
    CanvasPermissionEnum.CANVAS_BRANCH_MANAGE_MERGE_REQUESTS,
    PermissionContextEnum.Canvas,

    schema?.canvas.permissionGroups.find((pg: PermissionGroup) =>
      data.mergeRequest
        ? pg.systemName === mergeRequest?.canvasRepository?.permission
        : pg.systemName === repo?.defaultBranch?.permission
    )?.permissions
  );

  const actionButtonStyles = {
    borderRadius: "50%",
    display: "flex",
    width: 30,
    height: 30,
    padding: "0",
    justifyContent: "center",
    alignItems: "center",
    background: "unset",
    border: "1px solid transparent",
    borderStyle: "hidden",
    margin: "5px",
    "&:hover": {
      backgroundColor: "diff.actionButtonsHoverBg",
    },
  };
  const isAccepted = conflict.status === "Accepted";
  const isRejected = conflict.status === "Rejected";

  let postMergeStatus;

  switch (mergeRequestStatus) {
    case "ACCEPTED":
      postMergeStatus = "Accepted";
      break;
    case "PARTIALLY_ACCEPTED":
      const changes = data?.mergeRequest?.mergeRequest?.changesAccepted;
      for (const key in changes) {
        if (key === element?.children[0]?.uuid) {
          postMergeStatus = changes[key] ? "Accepted" : "Rejected";
        }
      }
      break;
    default:
  }
  return (
    <div contentEditable={false} className="my-8 ">
      <Box
        className="relative flex items-center justify-between w-full px-2 py-1"
        sx={{ bg: "diff.messageBg" }}
      >
        <Box
          className="text-base"
          sx={{
            color: "diff.message",
          }}
        >
          {element.message}
        </Box>
        <Box
          className="flex items-center justify-center text-xs"
          sx={{
            color: "diff.message",
          }}
        >
          <ChevronLeftIcon
            sx={{
              fill: "diff.arrowIcons",
              visibility: index > 0 ? "visible" : "hidden",
            }}
          />{" "}
          <span>
            {" "}
            {index + 1} of {data.conflicts.length}{" "}
          </span>{" "}
          <ChevronRightIcon
            sx={{
              fill: "diff.arrowIcons",
              visibility:
                index < data.conflicts.length - 1 ? "visible" : "hidden",
            }}
          />
        </Box>
        {!data.isDiff && (
          <Box className="absolute flex -right-32 ">
            {isMergeClosed ? (
              <>
                {postMergeStatus === "Accepted" ? (
                  <Box
                    sx={{
                      ...actionButtonStyles,
                      borderStyle: "solid",
                      borderColor: "diff.acceptColor",
                    }}
                  >
                    <CheckIcon
                      size={16}
                      sx={{
                        fill: "diff.acceptColor",
                        "&:hover": {
                          fill: "diff.acceptColor",
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      ...actionButtonStyles,
                      borderStyle: "solid",
                      borderColor: "diff.rejectColor",
                    }}
                  >
                    <XIcon
                      size={16}
                      sx={{
                        fill: "diff.rejectColor",
                        "&:hover": {
                          fill: "diff.rejectColor",
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <>
                {canManageMergeRequestsOnParent && (
                  <>
                    <Button
                      sx={{
                        ...actionButtonStyles,
                        borderStyle: isRejected ? "solid" : "hidden",
                        borderColor: isRejected
                          ? "diff.rejectColor"
                          : "transparent",
                      }}
                      onClick={() =>
                        actions.updateConflictStatus(
                          conflict.conflictId,
                          "Rejected"
                        )
                      }
                    >
                      <XIcon
                        size={16}
                        sx={{
                          fill: isRejected
                            ? "diff.rejectColor"
                            : "diff.actionIcons",
                          "&:hover": {
                            fill: "diff.rejectColor",
                          },
                        }}
                      />
                    </Button>
                    <Button
                      sx={{
                        ...actionButtonStyles,
                        borderStyle: isAccepted ? "solid" : "hidden",
                        borderColor: isAccepted
                          ? "diff.acceptColor"
                          : "transparent",
                      }}
                      onClick={() =>
                        actions.updateConflictStatus(
                          conflict.conflictId,
                          "Accepted"
                        )
                      }
                    >
                      <CheckIcon
                        size={16}
                        sx={{
                          fill: isAccepted
                            ? "diff.acceptColor"
                            : "diff.actionIcons",
                          "&:hover": {
                            fill: "diff.acceptColor",
                          },
                        }}
                      />
                    </Button>
                  </>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
      {children}
    </div>
  );
};

export default Diff;
