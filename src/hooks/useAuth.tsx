import { useEffect } from "react";
import { useRouter } from "next/router";
import { ChildrenProps } from "../commons/types";
import BipRouteUtils from "../core/routeUtils";
import { isEmpty } from "../utils/Common";
import { useUser } from "../context/userContext";

const useAuth = () => {
  const { isLoggedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    const localUser = JSON.parse(window.localStorage.getItem("user") || "{}");
    if (!localUser || isEmpty(localUser)) {
      router.push({
        pathname: BipRouteUtils.getSignInRoute(),
        query: { returnUrl: router.asPath },
      });
    } else if (router.route !== "/auth/setup") {
      const data = localStorage.getItem("user");
      if (data) {
        const user = JSON.parse(data);
        if (user && !user?.isSetupDone) {
          router.push({
            pathname: BipRouteUtils.getSetupRoute(),
            query: { returnUrl: router.asPath },
          });
        }
      }
    }
  }, [router]);

  return isLoggedIn;
};

export const AuthWrapper = ({ children }: ChildrenProps) =>
  useAuth() ? <>{children}</> : null;
