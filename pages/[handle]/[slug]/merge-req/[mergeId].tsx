import { Avatar, Box, Text } from "@primer/react";
import React, { ReactElement, useState, useEffect } from "react";
import { useLayout } from "../../../../src/context/layoutContext";
import { withReact } from "slate-react";
import TimeAgo from "react-timeago";
import { withHistory } from "slate-history";
import { HandleWrapper } from "../../../../src/hooks/useHandle";
import { createEditor } from "slate";
import StudioLayout from "../../../../src/layouts/StudioLayout/StudioLayout";
import CanvasHeader from "../../../../src/modules/Canvas/components/CanvasHeader";
import { withCustomInlineVoid } from "../../../../src/modules/BipEditor/slatePlugins";
import { AVATAR_PLACEHOLDER } from "../../../../src/commons/constants";
import { useRouter } from "next/router";
import GitOpsService from "../../../../src/modules/Canvas/services/gitOpsService";
import { useUser } from "../../../../src/context/userContext";
import DiffEditor from "../../../../src/modules/BipEditor/components/DiffEditor";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import CanvasLayout from "../../../../src/modules/Canvas/components/CanvasLayout";
import useSWR from "swr";
import { CanvasRepoService } from "../../../../src/modules/Canvas/services";
import { AxiosError } from "axios";
import { useCanvas } from "../../../../src/context/canvasContext";
import BipRouteUtils from "../../../../src/core/routeUtils";
import { useStudio } from "../../../../src/context/studioContext";
import {
  formatDateAndTime,
  timeAgoFormatter,
} from "../../../../src/utils/Common";
import { usePages } from "../../../../src/context/pagesContext";
import { useToasts } from "react-toast-notifications";

const MergeRequest = () => {
  const { isSideNavOpen, setIsSideNavOpen } = useLayout();
  const [conflicts, setConflicts] = useState<any[]>([]);
  const { user } = useUser();
  const [mergeRequest, setMergeRequest] = useState({});
  const [blocks, setBlocks] = useState({
    sourceBlocks: [],
    destinationBlocks: [],
  });
  const { setShouldFetchCollections } = usePages();
  const { setRepo } = useCanvas();
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const mergeId = parseInt(router.query.mergeId as string);
  const { repoKey } = router.query;
  const { currentStudio } = useStudio();
  const handle = currentStudio?.handle;

  const [values, setValues] = useState([
    {
      type: "loading",
      children: [{ text: "" }],
    },
  ]);
  const [editor] = useState(
    withCustomInlineVoid(withHistory(withReact(createEditor())))
  );

  const fetchCanvasRepo = async (key: string) => {
    try {
      const { data: repoData } = await CanvasRepoService.getRepo(key);
      setRepo({ ...repoData.data });
      return { ...repoData.data };
    } catch (error) {
      const err = error as AxiosError;
      setIsSideNavOpen(true);
      throw error;
    }
  };

  const { data, error } = useSWR(
    repoKey ? [repoKey, "canvas-repo"] : null,
    fetchCanvasRepo,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    const getMergeRequestData = async () => {
      setShouldFetchCollections(true);
      try {
        const resp = await GitOpsService.getMergeRequestById(mergeId);

        const { sourceBlocks, destinationBlocks } = resp.data.data;
        setMergeRequest(resp.data.data);
        setBlocks({
          sourceBlocks,
          destinationBlocks: destinationBlocks || [],
        });
      } catch (error) {
        setHasError(true);
      }
    };
    mergeId && getMergeRequestData();
  }, [mergeId]);

  const updateConflictStatus = (conflictId: string, newStatus: string) => {
    const newConflicts = [...conflicts];
    const conflictIndex = newConflicts.findIndex(
      (conflict) => conflict.conflictId === conflictId
    );

    const conflict = newConflicts[conflictIndex];

    if (conflict.status === newStatus) {
      newConflicts[conflictIndex].status = "Unchanged";
    } else {
      newConflicts[conflictIndex].status = newStatus;
    }
    setConflicts(newConflicts);
  };

  // const { commitMessage } = mergeRequest?.mergeRequest;
  const {
    createdByUser: MRUser,
    status: mergeRequestStatus,
    closedByUser,
  } = mergeRequest?.mergeRequest ?? {};
  const isMergeClosed = mergeRequestStatus !== "OPEN";

  return (
    <HandleWrapper>
      <CanvasLayout
        header={
          <CanvasHeader
            title={mergeRequest?.canvasRepository?.name}
            isMergeRequestScreen={true}
            mergeRequest={mergeRequest}
            conflicts={conflicts}
            showLeftArrow={!hasError}
            onClickLeftArrow={() => {
              router.push({
                pathname: BipRouteUtils.getCanvasRoute(
                  handle!,
                  mergeRequest?.canvasRepository?.name,
                  mergeRequest?.mergeRequest?.destinationBranchID
                ),
              });
            }}
          />
        }
        content={
          <div className="flex flex-col">
            {hasError ? (
              <Box
                sx={{
                  position: "relative",
                  height: "80vh",
                }}
              >
                <Box
                  sx={{
                    padding: "12px 18px",

                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 800,
                  }}
                >
                  <Text
                    as="p"
                    sx={{
                      textAlign: "center",
                      fontSize: "20px",
                      color: "mergeRequest.errorMsg",
                    }}
                  >
                    Merge request invalid or doesn&apos;t exist
                  </Text>
                </Box>
              </Box>
            ) : (
              <>
                <div className="mx-auto mt-10">
                  <Box
                    sx={{
                      padding: "12px 18px",
                      border: "1px solid",
                      borderColor: "mergeRequest.border",
                      bg: "mergeRequest.bg",
                      borderRadius: 12,
                      position: "relative",
                      width: 600,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        size={26}
                        src={MRUser?.avatarUrl || AVATAR_PLACEHOLDER}
                      />
                      <Text padding={1} color="mergeRequest.username">
                        {MRUser?.username}
                      </Text>
                      <Text
                        as="p"
                        fontWeight={400}
                        fontSize={"12px"}
                        lineHeight={"18px"}
                        color="text.muted"
                      >
                        <TimeAgo
                          title={formatDateAndTime(
                            mergeRequest?.mergeRequest?.createdAt
                          )}
                          minPeriod={60}
                          formatter={timeAgoFormatter}
                          date={mergeRequest?.mergeRequest?.createdAt}
                        />
                      </Text>
                    </Box>
                    <Box>
                      <Text color={"mergeRequest.commitMessage"} fontSize={14}>
                        {mergeRequest?.mergeRequest?.commitMessage}
                      </Text>
                    </Box>
                    {isMergeClosed && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Text>{mergeRequestStatus} by </Text>
                        <Avatar
                          size={26}
                          src={closedByUser?.avatarUrl || AVATAR_PLACEHOLDER}
                          sx={{
                            marginLeft: "5px",
                          }}
                        />
                        <Text padding={1} color="mergeRequest.username">
                          {closedByUser?.username}
                        </Text>
                        <Text
                          as="p"
                          fontWeight={400}
                          fontSize={"12px"}
                          lineHeight={"18px"}
                          color="text.muted"
                        >
                          <TimeAgo
                            title={formatDateAndTime(
                              mergeRequest?.mergeRequest?.closedAt
                            )}
                            minPeriod={60}
                            formatter={timeAgoFormatter}
                            date={mergeRequest?.mergeRequest?.closedAt}
                          />
                        </Text>
                      </Box>
                    )}
                  </Box>
                </div>
                <div className="flex w-full mt-12">
                  <div className="flex-1">
                    <DiffEditor
                      data={{
                        readOnly: true,
                        isMergeRequest: true,
                      }}
                      actions={{ updateConflictStatus }}
                      conflicts={conflicts}
                      setConflicts={setConflicts}
                      blocks={blocks}
                      mergeRequest={mergeRequest}
                      withCanvasTitle={true}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        }
      />
    </HandleWrapper>
  );
};

MergeRequest.auth = false;
MergeRequest.getLayout = function getLayout(page: ReactElement) {
  return <StudioLayout whiteBg>{page}</StudioLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

export default MergeRequest;
