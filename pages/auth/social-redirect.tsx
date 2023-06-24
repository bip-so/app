import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { BipPage } from "../../src/commons/types";
import BipLoader from "../../src/components/BipLoader";
import { useOnboarding } from "../../src/context/onboardingContext";
import { useStudio } from "../../src/context/studioContext";
import { useUser } from "../../src/context/userContext";
import { SocialAuthProvidersEnum } from "../../src/core/enums";
import BipRouteUtils from "../../src/core/routeUtils";
import segmentEvents from "../../src/insights/segment";
import { OnboardingStepEnum } from "../../src/modules/Onboarding/enums";

const SocialRedirectPage: BipPage = () => {
  const router = useRouter();

  // Partner Integration
  const guildId = router.query.guildId as string;
  const partnerIntegrationId = router.query.partnerIntegrationId as string;

  const { saveUser } = useUser();
  const { isLoggedIn, user } = useUser();
  const { studios } = useStudio();

  const { saveOnboardingSchema, saveSecondaryOnboardingSchema } =
    useOnboarding();

  useEffect(() => {
    if (!router.isReady) return;
    const setUpSocialAuth = async () => {
      const provider = router.query.provider as string;
      const fromIntegration = Boolean(router.query.fromIntegration as string);
      const nextRoute = router.query.returnUrl
        ? (router.query.returnUrl as string)
        : BipRouteUtils.getHomeRoute();
      if (!isLoggedIn) {
        const session = await getSession();
        console.log(session);
        if (session && session.isSocialLogin) {
          await saveUser(session);
        }
        if (fromIntegration && provider === SocialAuthProvidersEnum.DISCORD) {
          if (session?.isNewUser) {
            localStorage.setItem("refetchBootstrap", JSON.stringify(true));
            window.location.href =
              BipRouteUtils.getDiscordStudioIntegrationRedirectRoute(
                session?.id,
                0,
                guildId,
                partnerIntegrationId
              );
          } else {
            localStorage.setItem("fromIntegration", JSON.stringify(true));
          }
        }

        if (session?.isSignUp) {
          if (!router.query.returnUrl && router.query.isNewStudio !== "true") {
            saveOnboardingSchema({
              onboardingStep: OnboardingStepEnum.LANDING,
            });
          }
          saveSecondaryOnboardingSchema({
            showStudioFeedCard: true,
            showTimelineCard: true,
            showExploreCard: true,
          });
        }
        segmentEvents.loggedIn(
          "social-login",
          session?.username!,
          session?.id!,
          false
        );
      }
      router.push(nextRoute);
    };
    setUpSocialAuth();
  }, [router.isReady]);

  return (
    <div>
      <BipLoader />
    </div>
  );
};

SocialRedirectPage.auth = false;
export default SocialRedirectPage;
