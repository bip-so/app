import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import { ThemeProvider, BaseStyles, SSRProvider } from "@primer/react";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { Router, useRouter } from "next/router";

import AppProviders from "../src/providers";

import { AuthWrapper } from "../src/hooks/useAuth";
import { bipTheme } from "../src/theming";
import "../styles/globals.css";
import Script from "next/script";
import ThemeSwitcher from "../src/components/ThemeSwitcher";
import BipInsights from "../src/insights";
import { isProduction } from "../src/utils/Common";
import segmentEvents from "../src/insights/segment";
import { OnboardingRedirectWrapper } from "../src/hooks/useOnboarding";
import BipRules from "../src/components/BipRules";
import BipRealTime from "../src/components/BipRealtime";

interface AppPropsWithAuthLayout extends AppProps {
  Component: AppProps["Component"] & {
    auth: boolean;
    getLayout?: (page: ReactElement, hideSidebar: boolean) => ReactNode;
  };
}

function BipApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithAuthLayout) {
  const router = useRouter();

  const getLayout = Component.getLayout ?? ((page) => page);

  const hideSidebar = false && router.pathname === "/";

  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const localUser = localStorage.getItem("user");
      if (localUser) {
        JSON.parse(localUser).user;
      }
    } catch (e) {
      window.localStorage.clear();
    }
  }, []);

  return (
    <ThemeProvider theme={bipTheme}>
      <AppProviders session={pageProps.session}>
        <SSRProvider>
          <BaseStyles>
            <ThemeSwitcher />
            <BipRealTime />
            <BipRules />
            <OnboardingRedirectWrapper>
              <div style={{ visibility: mounted ? "visible" : "hidden" }}>
                {Component.auth ? (
                  <AuthWrapper>
                    {getLayout(<Component {...pageProps} />, hideSidebar)}
                  </AuthWrapper>
                ) : (
                  getLayout(<Component {...pageProps} />, hideSidebar)
                )}
                <div id="modal"></div>
              </div>
            </OnboardingRedirectWrapper>
          </BaseStyles>
        </SSRProvider>
        {isProduction ? <BipInsights /> : null}
      </AppProviders>
    </ThemeProvider>
  );
}

// Segment pageview route switch
if (isProduction) {
  Router.events.on("routeChangeComplete", (url) => {
    segmentEvents.pageView();
  });
}

export default appWithTranslation(BipApp);
