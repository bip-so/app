import { Box, Text, Button } from "@primer/react";
import * as React from "react";
import type { GetServerSideProps, NextPage } from "next";
import { getSession, signIn } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { StudioType } from "../../src/modules/Studio/types";
import BipRouteUtils from "../../src/core/routeUtils";
import { useRouter } from "next/router";
import Header from "../../src/components/LandingShared/Header";
import LinkWithoutPrefetch from "../../src/components/LinkWithoutPrefetch";
import AuthStudioCard from "../../src/modules/Auth/components/AuthStudioCard";
import Footer from "../../src/components/LandingShared/Footer";

interface AuthExplorePageProps {}

const AuthExplorePage: NextPage<
  AuthExplorePageProps
> = ({}: AuthExplorePageProps) => {
  const router = useRouter();

  const logout = () => {
    window.location.replace(
      `${BipRouteUtils.getSignInRoute()}?returnUrl=${router.asPath}`
    );
  };

  return (
    <Box
      sx={{
        overflow: "hidden",
      }}
    >
      <Header hideBoxShadow />
      <Box
        sx={{
          // height: "100vh",
          width: "100%",
          position: "absolute",
          bg: "pricingPage.hero.bg",
          zIndex: -1,
        }}
      ></Box>
      <Box
        sx={{
          bg: "#F6F8FA",
        }}
      >
        <Box display={"flex"} flexDirection={"column"} alignItems={"center"}>
          <Text
            as="p"
            sx={{
              width: ["300px", "300px", "unset", "unset"],
              fontWeight: 600,
              fontSize: "32px",
              lineHeight: "48px",
              color: "pricingPage.text",
              textAlign: "center",
              marginTop: "30px",
              marginBottom: "50px",
              letterSpacing: "-0.008em",
              mt: ["140px", "140px", "140px", "140px"],
              mx: "16px",
            }}
          >
            Explore workspaces on bip
          </Text>
        </Box>
      </Box>
      <Box
        className="bg-gray-0 flex justify-center flex-col"
        alignItems={"center"}
        // padding={"40px"}
        // height={"100vh"}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            // mx: "40px",
            alignItems: "center",
            width: "100%",
            // paddingTop: "50px",
          }}
        >
          <AuthStudioCard />
          <LinkWithoutPrefetch href="/explore">
            <Button
              variant="primary"
              size={"large"}
              sx={{ mt: "30px", mb: "60px" }}
            >
              See more
            </Button>
          </LinkWithoutPrefetch>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res, locale } = context;
  const session = await getSession({ req });

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

export default AuthExplorePage;
