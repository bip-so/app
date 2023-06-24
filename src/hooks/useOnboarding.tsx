import { useRouter } from "next/router";
import { ChildrenProps } from "../commons/types";
import { useOnboarding } from "../context/onboardingContext";

import BipRouteUtils from "../core/routeUtils";
import { OnboardingStepEnum } from "../modules/Onboarding/enums";

export const OnboardingRedirectWrapper = ({ children }: ChildrenProps) => {
  const router = useRouter();
  const { isOnboarding } = useOnboarding();

  if (isOnboarding && router.route !== "/auth/onboarding") {
    router.push({
      pathname: BipRouteUtils.getOnboardingRoute(),
      query: {
        step: OnboardingStepEnum.LANDING,
      },
    });
  }
  return <>{children}</>;
};
