import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { ReactElement, useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { BipPage } from "../../../../../../src/commons/types";
import PublicLayout from "../../../../../../src/layouts/StudioLayout/PublicLayout";
import BipRouteUtils from "../../../../../../src/core/routeUtils";
import BipLoader from "../../../../../../src/components/BipLoader";

const PublicCanvasBranchPage: BipPage = () => {
  const router = useRouter();

  const handle = router.query.handle as string;
  const title = router.query.title as string;
  const branchId = parseInt(router.query.branchId as string);

  useEffect(() => {
    router.push({
      pathname: BipRouteUtils.getPublicCanvasRoute(handle, title, branchId),
    });
  }, []);

  return <BipLoader />;
};

PublicCanvasBranchPage.getLayout = function getLayout(
  page: ReactElement,
  hideSidebar
) {
  return <PublicLayout>{page}</PublicLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

PublicCanvasBranchPage.auth = false;
export default PublicCanvasBranchPage;
