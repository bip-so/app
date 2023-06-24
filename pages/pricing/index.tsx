import React, { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import { getSession, signIn } from "next-auth/react";
import type { OAuthProviderType } from "next-auth/providers";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import SigninBox from "../../src/modules/Auth/components/SigninBox";
import BipRouteUtils from "../../src/core/routeUtils";
import { useRouter } from "next/router";
import { Box, Button, Text } from "@primer/react";
import LiteProBox from "../../src/modules/Pricing/components/LiteProBox";
import useDeviceDimensions from "../../src/hooks/useDeviceDimensions";
import Addon from "../../src/modules/Pricing/components/Addon";
import CanvasFeatureItem from "../../src/modules/Pricing/components/CanvasFeatureItem";
import GitWorkflowFeatureItem from "../../src/modules/Pricing/components/GitWorkflowFeatureItem";
import IntegrationsFeatureItem from "../../src/modules/Pricing/components/IntegrationsFeatureItem";
import EditorFeatureItem from "../../src/modules/Pricing/components/EditorFeatureItem";
import CommunityFeatureItem from "../../src/modules/Pricing/components/CommunityFeatureItem";
import TranslationFeatureItem from "../../src/modules/Pricing/components/TranslationFeatureItem";
import WorkspaceFeatureItem from "../../src/modules/Pricing/components/WorkspaceFeatureItem";
import Header from "../../src/components/LandingShared/Header";
import Footer from "../../src/components/LandingShared/Footer";
import FAQ from "../../src/components/LandingShared/FAQ";
import Testimonials from "../../src/modules/Pricing/components/Testimonials";
import segmentEvents from "../../src/insights/segment";
import { useUser } from "../../src/context/userContext";
import LinkWithoutPrefetch from "../../src/components/LinkWithoutPrefetch";
import AuthStudioCard from "../../src/modules/Auth/components/AuthStudioCard";

interface PricingPageProps {}

const PricingPage: NextPage<PricingPageProps> = ({}: PricingPageProps) => {
  const { user: curUser } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    segmentEvents.pricingViewed(curUser?.id!);
  }, []);

  return (
    <Box
      sx={{
        overflow: "hidden",
      }}
    >
      <Header hideBoxShadow />
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          position: "absolute",
          bg: "pricingPage.hero.bg",
          // background:
          //   "url(background-ellipse.png), url(background-pattern.png), linear-gradient(97.34deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 28.31%, rgba(0, 0, 0, 0) 44.15%, rgba(0, 0, 0, 0) 66.69%, rgba(0, 0, 0, 0.5) 100%), linear-gradient(270deg, #44B244 -25.62%, #326B38 7.14%, #21262D 114.17%)",
          // backgroundRepeat: "no-repeat",
          // backgroundPosition: "center",
          // backgroundPositionY: "40px, center, center, center",
          // backgroundPositionX: "center",
          // backgroundSize: [
          //   "90%, auto, auto, auto",
          //   "80%, auto, auto, auto",
          //   "80%, auto, auto, auto",
          //   "contain, auto, auto, auto",
          // ],
          zIndex: -1,
        }}
      ></Box>
      <Box>
        <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
          <Text
            as="p"
            sx={{
              color: "pricingPage.text",
              fontWeight: 600,
              fontFamily: "general",
              fontSize: ["22px", "36px", "36px", "48px"],
              lineHeight: ["32px", "48px", "48px", "64px"],
              textAlign: "center",
              letterSpacing: "-0.008em",
              mt: ["240px", "240px", "240px", "240px"],
              mx: "16px",
            }}
          >
            {t("pricingPage.heading")}
          </Text>
          <Text
            as="p"
            sx={{
              color: "pricingPage.subText",
              fontSize: ["14px", "18px", "18px", "24px"],
              lineHeight: ["20px", "26px", "26px", "36px"],
              textAlign: "center",
              letterSpacing: "-0.008em",
              mt: ["12px", "16px", "16px", "24px"],
              width: ["80%", "70%", "70%", "unset"],
            }}
          >
            Trusted by <strong>1534</strong> communities
          </Text>
        </Box>
        <Box
          display={"flex"}
          alignItems={["center", "center", "unset", "unset"]}
          justifyContent={"center"}
          sx={{
            gap: ["16px", "16px", "32px", "32px"],
            mt: ["40px", "50px", "80px", "80px"],
            flexDirection: ["column", "column", "row", "row"],
          }}
        >
          <LiteProBox isPro={false} />
          <LiteProBox isPro={true} />
        </Box>
      </Box>
      <Box
        sx={{
          flexDirection: "column",
          alignItems: "center",
          mt: "34px",
          display: ["none", "none", "flex", "flex"],
        }}
      >
        <Text
          as="p"
          sx={{
            fontSize: "14px",
            lineHeight: "20px",
            color: "pricingPage.box.text",
          }}
        >
          {t("pricingPage.noCreditCard")}
        </Text>
        <LinkWithoutPrefetch href={BipRouteUtils.getSignInRoute()}>
          <Button variant="primary" size={"large"} sx={{ mt: "16px" }}>
            {t("pricingPage.getStartedForFree")}
          </Button>
        </LinkWithoutPrefetch>
      </Box>
      <Box
        sx={{
          mt: [
            "calc(1088px - 100vh + 60px)",
            "calc(1088px - 100vh + 60px)",
            "148px",
            "148px",
          ],
          maxWidth: "980px",
          mx: ["16px", "16px", "16px", "auto", "auto"],
        }}
      >
        <Text
          as="p"
          sx={{
            color: "#000000",
            fontWeight: 600,
            fontSize: "32px",
            lineHeight: "48px",
            textAlign: "center",
          }}
        >
          {t("pricingPage.improveExperience")}
        </Text>
        <Box
          sx={{
            mt: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Addon
            isGitHub={false}
            isCustomDomain={true}
            isJiraIntegration={false}
          />
          <Addon
            isGitHub={true}
            isCustomDomain={false}
            isJiraIntegration={false}
          />
          <Addon
            isGitHub={false}
            isCustomDomain={false}
            isJiraIntegration={true}
          />
        </Box>
      </Box>
      <Box
        className="bg-none md:bg-[url('/gradient-circle.png')] bg-no-repeat bg-gray-0"
        sx={{
          mt: ["48px", "48px", "108px", "108px"],
          mx: ["16px", "16px", "16px", "auto", "auto"],
          py: ["25px", "25px", "28px", "28px"],
          // bg: "#0366D6",
          borderRadius: "12px",
          maxWidth: "980px",
        }}
      >
        <Box sx={{ ml: ["20px", "20px", "64px", "64px"] }}>
          <Text
            as="p"
            sx={{
              color: "pricingPage.noProfitCard.heading",
              fontWeight: 600,
              fontSize: ["18px", "18px", "32px", "32px"],
              lineHeight: ["26px", "26px", "48px", "48px"],
            }}
          >
            {t("pricingPage.nonProfitHeading")}
          </Text>
          <Text
            as="p"
            sx={{
              color: "pricingPage.noProfitCard.subHeading",
              fontSize: ["13px", "13px", "16px", "16px"],
              lineHeight: ["18px", "18px", "24px", "24px"],
              mt: "8px",
            }}
          >
            {t("pricingPage.nonProfitSubHeading")}
          </Text>
          <Button
            sx={{
              bg: "pricingPage.noProfitCard.btn.bg",
              border: "1px solid rgba(27, 31, 36, 0.15)",
              mt: "24px",
              fontSize: ["12px", "12px", "14px", "14px"],
              lineHeight: ["18px", "18px", "20px", "20px"],
              color: "pricingPage.noProfitCard.btn.text",
              fontWeight: 600,
              ":hover": {
                color: "pricingPage.noProfitCard.btn.bg",
              },
            }}
            onClick={() => {
              window.open("https://form.jotform.com/223281623962457");
            }}
          >
            {t("pricingPage.applyHere")}
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          mt: ["80px", "80px", "140px", "140px"],
          display: "flex",
          flexDirection: "column",
          mx: ["16px", "16px", "16px", "auto", "auto"],
          maxWidth: "980px",
        }}
        id="features"
      >
        <Text
          as="p"
          sx={{
            fontWeight: 600,
            fontSize: "32px",
            lineHeight: "48px",
            color: "pricingPage.text",
            textAlign: "center",
          }}
        >
          {t("pricingPage.feature")}
        </Text>
        <CanvasFeatureItem />
        <GitWorkflowFeatureItem />
        <IntegrationsFeatureItem />
        <EditorFeatureItem />
        <CommunityFeatureItem />
        <TranslationFeatureItem />
        <WorkspaceFeatureItem />
      </Box>
      <Box
        sx={{
          mt: ["20px", "20px", "120px", "120px"],
          width: "100%",
        }}
      >
        <Testimonials />
      </Box>
      <Box
        sx={{
          my: ["40px", "40px", "80px", "80px"],
          width: "100%",
        }}
      >
        <FAQ />
      </Box>
      <Footer />
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res, locale } = context;
  const session = await getSession({ req });

  // if (session) {
  //   return {
  //     props: { ...(await serverSideTranslations(locale || "en")) },
  //     redirect: {
  //       permanent: false,
  //       destination: "/",
  //     },
  //   };
  // }
  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

export default PricingPage;
