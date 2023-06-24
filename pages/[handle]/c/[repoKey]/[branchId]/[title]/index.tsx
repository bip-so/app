import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";

import { BipPage } from "../../../../../../src/commons/types";
import BipLoader from "../../../../../../src/components/BipLoader";
import BipRouteUtils from "../../../../../../src/core/routeUtils";
import StudioLayout from "../../../../../../src/layouts/StudioLayout/StudioLayout";

const CanvasV1Page: BipPage = () => {
  const router = useRouter();
  const handle = router.query.handle as string;
  const title = router.query.title as string;
  const branchId = parseInt(router.query.branchId as string);

  useEffect(() => {
    const updatedQueries = { ...router.query };
    delete updatedQueries["title"];
    delete updatedQueries["repoKey"];
    delete updatedQueries["handle"];
    router.replace({
      pathname: BipRouteUtils.getCanvasRoute(handle, title, branchId),
      query: updatedQueries,
    });
  }, []);

  return <BipLoader />;
};

CanvasV1Page.getLayout = function getLayout(page: ReactElement, hideSidebar) {
  return <StudioLayout whiteBg>{page}</StudioLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

CanvasV1Page.auth = true;
export default CanvasV1Page;
