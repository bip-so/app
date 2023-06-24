import React, { ReactElement } from "react";
import StudioLayout from "../../../../../../../src/layouts/StudioLayout/StudioLayout";
import { useRouter } from "next/router";
import GitOpsService from "../../../../../../../src/modules/Canvas/services/gitOpsService";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import useSWR from "swr";
import BipRouteUtils from "../../../../../../../src/core/routeUtils";
import BipLoader from "../../../../../../../src/components/BipLoader";

const MergeRequest = () => {
  const router = useRouter();

  const handle = router.query.handle as string;
  const mergeId = parseInt(router.query.mergeId as string);

  const fetchMergeRequest = async (id: number) => {
    try {
      const { data: mrData } = await GitOpsService.getMergeRequestById(id);
      const { data: mergeRequest } = mrData;
      router.push(
        BipRouteUtils.getMergeRequestRoute(
          handle,
          mergeRequest.canvasRepository.name,
          mergeRequest.mergeRequest.destinationBranchID,
          mergeId
        )
      );
    } catch (error) {
      console.log(error);
      router.push(BipRouteUtils.getStudioAboutRoute(handle));
    }
  };

  const { data, error } = useSWR(
    mergeId ? [mergeId, "merge-request"] : null,
    fetchMergeRequest,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return <BipLoader />;
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
