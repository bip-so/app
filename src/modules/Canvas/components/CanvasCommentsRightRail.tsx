import {
  CommentDiscussionIcon,
  SearchIcon,
  XIcon,
} from "@primer/octicons-react";
import { ActionList, Box, IconButton, TextInput } from "@primer/react";
import { ActionMenu } from "@primer/react";
import { NoEntryFillIcon } from "@primer/styled-octicons";
import { useRouter } from "next/router";

import * as React from "react";
import { FC, useEffect, useState, useMemo } from "react";
import { useToasts } from "react-toast-notifications";
import StyledTextInput from "../../../components/StyledTextInput";
import { useCanvas } from "../../../context/canvasContext";
import { useRightRail } from "../../../context/rightRailContext";
import Thread from "../../BipEditor/components/Thread";
import { EMBEDS } from "../../BipEditor/constants";
import BlocksService from "../../BipEditor/services";
import { ThreadType } from "../../BipEditor/types";
import RightRailContainer from "./RightRailContainer";

interface ICanvasRightRailProps {
  closeHandler: () => void;
  ignoredRefs: any[];
}

const CanvasCommentsRightRail: FC<ICanvasRightRailProps> = ({
  closeHandler,
  ignoredRefs,
}) => {
  const {
    threads,
    setThreads,
    blocks,
    branch,
    resolvedThreads,
    setResolvedThreads,
    getBlock,
  } = useCanvas();
  const { addToast } = useToasts();
  const [selectedFilter, setSelectedFilter] = useState("Unresolved");
  const filterArray = ["All", "Resolved", "Unresolved"];
  const [filteredThreads, setFilteredThreads] = useState<any>([]);
  const [searchKey, setSearchKey] = useState("");
  const router = useRouter();
  const { setSelectedObjectId } = useRightRail();

  useEffect(() => {
    if (branch?.id) {
      BlocksService.getBranchBlockThreads(branch.id, true)
        .then((r) => {
          const data: ThreadType[] = r.data.data;
          const filteredThreads = data.filter(
            (thread) => !thread.isArchived && thread.isResolved
          );
          setResolvedThreads(filteredThreads);
        })
        .catch((err) => {
          addToast("Failed to load comments.", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  }, [branch?.id]);

  const removeThread = (thread: ThreadType) => {
    if (thread.isResolved) {
      const updatedResolvedThreads = threads.filter(
        (thr) => thr.id !== thread.id
      );
      setResolvedThreads(updatedResolvedThreads);
    } else {
      const updatedUnresolvedThreads = threads.filter(
        (thr) => thr.id !== thread.id
      );
      setResolvedThreads(updatedUnresolvedThreads);
    }
  };

  const markThreadAsResolved = (id: number) => {
    let updatedThread: ThreadType = threads.find((thr) => thr.id === id);
    updatedThread.isResolved = true;
    const updatedUnresolvedThreads = threads.filter((thr) => thr.id !== id);
    const updatedResolvedThreads = [...resolvedThreads, updatedThread];
    setResolvedThreads(updatedResolvedThreads);
    setThreads(updatedUnresolvedThreads);
  };

  const filterHandler = () => {
    switch (selectedFilter) {
      case "Resolved":
        setFilteredThreads(
          resolvedThreads.sort(
            (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
          )
        );
        break;
      case "Unresolved":
        setFilteredThreads(
          threads.sort(
            (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
          )
        );
        break;
      case "All":
        setFilteredThreads(
          [...resolvedThreads, ...threads].sort(
            (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
          )
        );
        break;
    }
  };

  useEffect(() => {
    filterHandler();
  }, [selectedFilter, resolvedThreads, threads]);

  const searchedThreads = useMemo(() => {
    if (searchKey?.length > 0 && filteredThreads?.length > 0) {
      return filteredThreads.filter((thread: ThreadType) => {
        return thread.text.toLowerCase().includes(searchKey.toLowerCase());
      });
    }
    return filteredThreads;
  }, [searchKey, filteredThreads]);

  const shouldShowHighlightText = (thread: any) => {
    const block = getBlock(thread?.startBlockUUID);
    if (block) {
      const isImageBlock =
        block.children.findIndex((item) => item?.type === "image") !== -1;
      const isTableBlock = block.type === "simple_table_v1";
      const element = block.children.find((item) => Boolean(item?.type));
      const isEmbedBlock = EMBEDS.map((x) => x.type).includes(element?.type);
      return isImageBlock || isTableBlock || isEmbedBlock ? false : true;
    }
    return true;
  };

  return (
    <RightRailContainer
      onClickOutSideRightRail={closeHandler}
      ignoredRefs={ignoredRefs}
    >
      <div className="flex items-center justify-between w-full mt-2 px-4">
        <div className="flex items-center">
          <CommentDiscussionIcon />
          <h3 className="inline-block ml-1 font-medium">Comments</h3>
        </div>
        <IconButton
          icon={XIcon}
          sx={{
            color: "text.subtle",
          }}
          size={"small"}
          variant="invisible"
          onClick={closeHandler}
        />
      </div>
      <ActionList.Divider />
      <div className="flex space-x-2 px-4">
        <StyledTextInput
          leadingVisual={SearchIcon}
          placeholder="Search"
          contrast={true}
          onChange={(e) => {
            setSearchKey(e.target.value);
          }}
          size="small"
          sx={{
            border: "none",
            boxShadow: "none",
            flexGrow: 1,
            paddingLeft: "2px",
            backgroundColor: "transparent",
          }}
        />
        <ActionMenu>
          <ActionMenu.Button variant="default" size="small">
            {selectedFilter}
          </ActionMenu.Button>

          <ActionMenu.Overlay>
            <ActionList>
              {filterArray.map((filter) => (
                <ActionList.Item
                  value={filter}
                  onSelect={(e) => {
                    setSelectedFilter(filter);
                  }}
                >
                  {filter}
                </ActionList.Item>
              ))}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>
      <Box sx={{ marginBottom: "200px", px: "16px", overflowY: "scroll" }}>
        {searchedThreads?.map((thread: ThreadType) => (
          <>
            <Thread
              key={thread.id}
              thread={thread}
              showHighlightedText={true}
              showContainerBox={false}
              alwaysShowReplyOption={true}
              onDelete={removeThread}
              onResolve={markThreadAsResolved}
              handleCommentClick={() => {
                router.push({
                  query: {
                    blockUUID: thread.startBlockUUID,
                    handle: router.query.handle,
                    slug: router.query.slug,
                  },
                });
                setSelectedObjectId(`thread-${thread.uuid}`);
              }}
            />
            <ActionList.Divider
              sx={{ marginTop: "19px", marginBottom: "20px" }}
            />
          </>
        ))}
      </Box>
    </RightRailContainer>
  );
};

export default CanvasCommentsRightRail;
