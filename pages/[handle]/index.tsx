import { GetServerSideProps } from "next";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { BipPage } from "../../src/commons/types";
import { useHandle } from "../../src/hooks/useHandle";
import BipLoader from "../../src/components/BipLoader";
import { HandleEnum } from "../../src/core/enums";
import Layout from "../../src/components/Layout";
import UserProfile from "../../src/modules/User/components/Profile";
import StudioLayout from "../../src/layouts/StudioLayout/StudioLayout";
import StudioHeader from "../../src/layouts/StudioLayout/components/StudioHeader";
import { useStudio } from "../../src/context/studioContext";
import { Text } from "@primer/react";
import BipRouteUtils from "../../src/core/routeUtils";
import { sanitizeHandle } from "../../src/utils/Common";
import Head from "next/head";

const HandlePage: BipPage = () => {
  const router = useRouter();

  const { loading, data } = useHandle();

  const { currentStudio } = useStudio();

  // if (!loading && data && data.context !== HandleEnum.User) {
  //   router.push(BipRouteUtils.getStudioAboutRoute(sanitizeHandle(data.handle)));
  // }

  return (
    <>
      {loading ? (
        <BipLoader />
      ) : data ? (
        data.context === HandleEnum.User ? (
          currentStudio?.id ? (
            <StudioLayout>
              <Head>
                <title>{data.fullName}</title>
                <link rel="icon" type="image/x-icon" href={data.avatarUrl} />
              </Head>
              <UserProfile profileUser={data} />
            </StudioLayout>
          ) : (
            <Layout>
              <Head>
                <title>{data.fullName}</title>
                <link rel="icon" type="image/x-icon" href={data.avatarUrl} />
              </Head>
              <UserProfile profileUser={data} />
            </Layout>
          )
        ) : (
          <StudioLayout>
            <StudioHeader>
              <div className="px-2"></div>
            </StudioHeader>
          </StudioLayout>
        )
      ) : null}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale || "en")),
    },
  };
};

HandlePage.auth = false;
export default HandlePage;
