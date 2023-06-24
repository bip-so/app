import { ActionList, Box } from "@primer/react";
import React, { FC, useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";
import CommentCard from "../../../components/CommentCard";
import { useCanvas } from "../../../context/canvasContext";
import { useRightRail } from "../../../context/rightRailContext";
import BlocksService from "../services";
import { BlockType, ThreadType } from "../types";
import Thread from "./Thread";

interface BlockThreads {
  blockUUID: string;
}

const BlockThreads: FC<BlockThreads> = (props) => {
  const { branch } = useCanvas();
  const [threads, setThreads] = useState<ThreadType[]>([]);
  const { addToast } = useToasts();
  const { blockUUID } = props;

  useEffect(() => {
    // if (blocks?.length) {
    //   if (blocks[0].type !== "loading") {
    if (branch?.id) {
      BlocksService.getBranchBlockThreads(branch.id, false)
        .then((r) => {
          const data: ThreadType[] = r.data.data;
          const filteredThreads = data.filter(
            (thread) =>
              !thread.isArchived &&
              !thread.isResolved &&
              blockUUID === thread.startBlockUUID
          );
          setThreads(filteredThreads);
        })
        .catch((err) => {
          addToast("Failed to load comments.", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
    // }
    // }
  }, [branch?.id, blockUUID]);

  return (
    <>
      {threads.map((thread, index) => (
        <>
          <Thread
            key={thread.id}
            thread={thread}
            showHighlightedText={true}
            showContainerBox={false}
            alwaysShowReplyOption={true}
          />
          {index !== threads.length - 1 && (
            <ActionList.Divider
              sx={{ marginTop: "19px", marginBottom: "20px" }}
            />
          )}
        </>
      ))}
    </>
  );
};

export default BlockThreads;
