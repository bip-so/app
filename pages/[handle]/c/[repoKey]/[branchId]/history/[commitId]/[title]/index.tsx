import { GetServerSideProps } from "next";
import { ReactElement, useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

import { BipPage } from "../../../../../../../../src/commons/types";
import StudioLayout from "../../../../../../../../src/layouts/StudioLayout/StudioLayout";
import BipRouteUtils from "../../../../../../../../src/core/routeUtils";
import BipLoader from "../../../../../../../../src/components/BipLoader";

const CommitPage: BipPage = () => {
  const router = useRouter();

  const handle = router.query.handle as string;
  const title = router.query.title as string;
  const branchId = parseInt(router.query.branchId as string);
  const commitId = router.query.commitId as string;

  useEffect(() => {
    router.push({
      pathname: BipRouteUtils.getCommitRoute(handle, title, branchId, commitId),
    });
  }, []);

  return <BipLoader />;
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
