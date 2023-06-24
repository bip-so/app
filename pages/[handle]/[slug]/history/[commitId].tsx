import { GetServerSideProps } from "next";
import { ReactElement, useRef, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import useSWR from "swr";

import { BipPage } from "../../../../src/commons/types";
import { HandleWrapper } from "../../../../src/hooks/useHandle";
import StudioLayout from "../../../../src/layouts/StudioLayout/StudioLayout";
import ViewOnlyEditor from "../../../../src/modules/BipEditor/components/ViewOnlyEditor";
import { CanvasBranchService } from "../../../../src/modules/Canvas/services";
import CanvasLayout from "../../../../src/modules/Canvas/components/CanvasLayout";
import CanvasHeader from "../../../../src/modules/Canvas/components/CanvasHeader";
import { useCanvas } from "../../../../src/context/canvasContext";
import BipRouteUtils from "../../../../src/core/routeUtils";
import { CanvasBranchWrapper } from "../../../../src/hooks/useCanvasBranch";
import { useStudio } from "../../../../src/context/studioContext";
import { Box } from "@primer/react";
import BipLoader from "../../../../src/components/BipLoader";

const CommitPage: BipPage = () => {
  const router = useRouter();

  const slug = router.query.slug as string;
  const branchId = BipRouteUtils.getBranchIdFromCanvasSlug(slug);
  const commitId = router.query.commitId as string;
  const { currentStudio } = useStudio();
  const handle = currentStudio?.handle;

  const editorContainerRef = useRef<HTMLDivElement>();

  const { repo } = useCanvas();

  const [commitBlocks, setCommitBlocks] = useState([]);

  const fetchCommitBlocks = async () => {
    try {
      const commitBlocksResponse = await CanvasBranchService.getCommitBlocks(
        branchId,
        commitId
      );
      setCommitBlocks(commitBlocksResponse.data.data);
      return commitBlocksResponse.data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const { data, error } = useSWR(
    commitId && branchId ? [commitId, "canvas-branch-commit"] : null,
    fetchCommitBlocks,
    {
      revalidateOnFocus: false,
    }
  );
  const loading = !data && !error;

  return (
    <HandleWrapper>
      <CanvasBranchWrapper>
        {loading ? (
          <BipLoader />
        ) : (
          <>
            <CanvasLayout
              header={
                <CanvasHeader
                  title={repo?.name?.toString() || ""}
                  showLeftArrow={true}
                  readOnly={true}
                  editorContainerRef={editorContainerRef}
                  onClickLeftArrow={() => {
                    router.push({
                      pathname: BipRouteUtils.getCanvasRoute(
                        handle!,
                        repo?.name!,
                        branchId
                      ),
                    });
                  }}
                />
              }
              content={
                <>
                  <div
                    className="flex justify-center w-full mt-12"
                    ref={editorContainerRef}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <ViewOnlyEditor
                        blocks={commitBlocks}
                        parentRef={editorContainerRef}
                        withCanvasTitle={true}
                      />
                    </Box>
                  </div>
                  <div className="w-4/12"></div>
                </>
              }
            />
          </>
        )}
      </CanvasBranchWrapper>
    </HandleWrapper>
  );
};

CommitPage.getLayout = function getLayout(page: ReactElement) {
  return <StudioLayout whiteBg>{page}</StudioLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

CommitPage.auth = false;
export default CommitPage;
