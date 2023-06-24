import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { ToastProvider, useToasts } from "react-toast-notifications";
import { SWRConfig } from "swr";

import { LayoutProvider } from "./context/layoutContext";
import { PagesProvider } from "./context/pagesContext";
import { PermissionProvider } from "./context/permissionContext";
import { StudioProvider } from "./context/studioContext";
import { UserProvider } from "./context/userContext";
import { CanvasProvider } from "./context/canvasContext";
import { RightRailProvider } from "./context/rightRailContext";
import { OnboardingProvider } from "./context/onboardingContext";
import { PreviewEditorProvider } from "./context/previewEditorContext";
import CustomToast from "./components/CustomToast";

type AppProps = {
  children: ReactNode;
  session: Session;
};

const AppProviders = ({ children, session }: AppProps) => {
  return (
    <SessionProvider session={session}>
      <ToastProvider
        placement="bottom-right"
        components={{ Toast: CustomToast }}
      >
        <SWRConfig
          value={{
            onError: (error, key) => {
              if (error.status !== 403 && error.status !== 404) {
                // We can send the error to Sentry,
                // or show a notification UI.
              }
            },
            revalidateOnFocus: false,
          }}
        >
          <PermissionProvider>
            <StudioProvider>
              <LayoutProvider>
                <PagesProvider>
                  <CanvasProvider>
                    <PreviewEditorProvider>
                      <RightRailProvider>
                        <OnboardingProvider>
                          <UserProvider>{children}</UserProvider>
                        </OnboardingProvider>
                      </RightRailProvider>
                    </PreviewEditorProvider>
                  </CanvasProvider>
                </PagesProvider>
              </LayoutProvider>
            </StudioProvider>
          </PermissionProvider>
        </SWRConfig>
      </ToastProvider>
    </SessionProvider>
  );
};

export default AppProviders;
