import NavBar from "../../src/modules/Explore/components/NavBar";
import { BipPage } from "../../src/commons/types";
import { Box } from "@primer/react";
import Layout from "../../src/components/Layout";
import { ReactElement } from "react";
import Head from "next/head";
import OnboardingIntroCard from "../../src/modules/Onboarding/components/IntroCard";
import { useOnboarding } from "../../src/context/onboardingContext";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { DefaultSeo } from "next-seo";

const ExplorePage: BipPage = () => {
  const { clearSecondaryOnboardingSchema, secondaryOnboardingSchema } =
    useOnboarding();
  const { t } = useTranslation();
  return (
    <>
      <DefaultSeo title="bip.so: Explore" />

      <Box
        // marginLeft={"auto"}
        // marginRight={"auto"}
        // marginX={"auto"}

        marginX={["auto", "auto", "auto", "auto"]}
        width={["360px", "360px", "600px", "600px"]}
        maxWidth={"100vw"}
        // height={"824px"}
        marginTop={"96px"}
        // flexWrap={"nowrap"}
        // overflowY={"scroll"}
        // overflowX={"hidden"}
      >
        {secondaryOnboardingSchema?.showExploreCard ? (
          <OnboardingIntroCard
            imageUrl="/explore-onboarding.svg"
            title={t("exploreOnboarding.title")}
            description={t("exploreOnboarding.description")}
            closeHandler={() => {
              clearSecondaryOnboardingSchema("showExploreCard");
            }}
          />
        ) : null}
        <Box display="flex" justifyContent={"center"}>
          <NavBar />
        </Box>
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};
ExplorePage.getLayout = function getLayout(page: ReactElement, hideSidebar) {
  if (hideSidebar) {
    return <>{page}</>;
  }

  return <Layout>{page}</Layout>;
};

ExplorePage.auth = false;

export default ExplorePage;
