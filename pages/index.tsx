import type { GetServerSideProps } from "next";
import { useEffect, useState, ReactElement, useLayoutEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { useLayout } from "../src/context/layoutContext";

import { BipPage } from "../src/commons/types";

import { Button, Text } from "@primer/react";

import useDeviceDimensions from "../src/hooks/useDeviceDimensions";

import Head from "next/head";
import Layout from "../src/components/Layout";
import AuthHome from "../src/modules/Auth/components/AuthHome";
import { getSession, signOut } from "next-auth/react";
import Modal from "../src/components/Modal";
import { useUser } from "../src/context/userContext";
import AuthService from "../src/modules/Auth/services";
import { usePermissions } from "../src/context/permissionContext";
import HomeFeed from "../src/modules/Home/components/HomeFeed";
import BipRouteUtils from "../src/core/routeUtils";
import { useOnboarding } from "../src/context/onboardingContext";
import { OnboardingStepEnum } from "../src/modules/Onboarding/enums";
import NewAuthHome from "../src/modules/Auth/components/NewAuthHome";

interface HomePageProps {}

const CAMPAIGN_KEYS = ["utm_source", "utm_medium", "gclid"];

const Home: BipPage = ({}: HomePageProps) => {
  const { t } = useTranslation();

  const { isLoggedIn } = useUser();

  const { isTabletOrMobile } = useDeviceDimensions();
  const { isOnboarding } = useOnboarding();

  const router = useRouter();

  const utm_source = router.query.utm_source as string;
  const utm_medium = router.query.utm_medium as string;
  const gclid = router.query.gclid as string;

  useEffect(() => {
    if (utm_source || utm_medium || gclid) {
      let campaignMeta: any = {};
      Object.keys(router.query).forEach((key) => {
        const value = router.query[key] as string;
        if (
          (key === "utm_source" || key === "utm_medium" || key === "gclid") &&
          value !== undefined
        ) {
          campaignMeta[key] = value;
        }
      });
      if (Object.keys(campaignMeta).length !== 0) {
        localStorage.setItem("bip-campaign-meta", JSON.stringify(campaignMeta));
      }
    }
  }, []);

  useEffect(() => {
    const clearStaleSession = async () => {
      const session = await getSession();
      if (session) {
        await signOut();
      }
    };
    const localUser = localStorage.getItem("user");

    if (isLoggedIn) {
      if (localUser) {
        const user = JSON.parse(localUser);
        if (user && !user?.isSetupDone) {
          router.push({
            pathname: BipRouteUtils.getSetupRoute(),
            query: { returnUrl: router.asPath },
          });
        } else {
          const localOnboardingSchema =
            localStorage.getItem("onboardingSchema");
          if (localOnboardingSchema) {
            router.push({
              pathname: BipRouteUtils.getOnboardingRoute(),
              query: {
                step: OnboardingStepEnum.LANDING,
              },
            });
          }
          const fromIntegration = localStorage.getItem("fromIntegration");
          if (fromIntegration) {
            localStorage.removeItem("fromIntegration");
            router.push({
              pathname: BipRouteUtils.getDiscordIntegrationRoute(),
              // query: { returnUrl: router.asPath },
            });
          }
        }
      }
    } else {
      if (!localUser) {
        clearStaleSession();
      }
    }
  }, [router, isLoggedIn]);

  // console.log(isSideNavOpen);

  // useLayoutEffect(() => {
  //   if (!router.isReady) return;
  //   if (!isLoggedIn && router.pathname === "/") {
  //     setIsSideNavOpen(false);
  //   }
  // }, [router, isLoggedIn]);

  return (
    <>
      <Head>
        <meta
          name="description"
          content="Collaborate with the world’s best Makers to Co-create products."
        />
        <title>{"bip.so: Home"}</title>
        <meta
          property="og:description"
          content="Collaborate with the world’s best Makers to Co-create products."
        />
        <meta property="og:title" content="Bip - Home Reels" />
        <meta name="twitter:card" content="summary" />
        <meta property="twitter:title" content="Bip - Home Reels" />
        <meta
          property="twitter:description"
          content="Collaborate with the world’s best Makers to Co-create products."
        />
      </Head>
      {isLoggedIn ? (
        <Layout>
          <div className="flex justify-between w-full my-3">
            {!isOnboarding ? <HomeFeed /> : null}
          </div>
        </Layout>
      ) : (
        <div className="overflow-hidden">
          {/* {isTabletOrMobile ? <AuthHome /> : <NewAuthHome />} */}
          <NewAuthHome />
        </div>
      )}
    </>
  );
};

// Home.getLayout = function getLayout(page: ReactElement, hideSidebar) {
//   if (hideSidebar) {
//     return <>{page}</>;
//   }

//   return <Layout>{page}</Layout>;
// };

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res, locale } = context;
  // const session = await getSession({ req });

  return {
    props: {
      // isLoggedIn: session ? true : false,
      ...(await serverSideTranslations(locale || "en")),
    },
  };
};

Home.auth = false;
export default Home;
