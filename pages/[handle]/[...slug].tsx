import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";
import slugify from "slugify";
import { BipPage } from "../../src/commons/types";
import BipLoader from "../../src/components/BipLoader";
import BipRouteUtils from "../../src/core/routeUtils";
import StudioLayout from "../../src/layouts/StudioLayout/StudioLayout";

const ReRoutePage: BipPage = () => {
  const router = useRouter();

  const handle = router.query.handle as string;

  useEffect(() => {
    if (!router.isReady) return;
    const slug = router.query.slug as string[];
    const repoKey = slug[0].split("-")[slug[0].split("-").length - 1] ?? "";

    router.push(BipRouteUtils.getRepoRoute(handle, repoKey));
  });
  return <BipLoader />;
};

ReRoutePage.getLayout = function getLayout(page: ReactElement, hideSidebar) {
  return <StudioLayout>{page}</StudioLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

ReRoutePage.auth = false;
export default ReRoutePage;
