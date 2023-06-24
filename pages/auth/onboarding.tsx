import { Box } from "@primer/react";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { BipPage } from "../../src/commons/types";
import { useUser } from "../../src/context/userContext";
import OnboardingLandingStep from "../../src/modules/Onboarding/components/LandingStep";
import OnboardingStudioCreationStep from "../../src/modules/Onboarding/components/StudioCreationStep";
import { OnboardingStepEnum } from "../../src/modules/Onboarding/enums";

const OnboardingPage: BipPage = () => {
  const { t } = useTranslation();
  const { user } = useUser();

  const router = useRouter();

  const step = parseInt(router.query.step as string) as OnboardingStepEnum;

  return (
    <Box
      display={"flex"}
      width={"100vw"}
      minHeight={"100vh"}
      backgroundColor={"auth.bg"}
    >
      {step === OnboardingStepEnum.LANDING ? (
        <OnboardingLandingStep />
      ) : (
        <OnboardingStudioCreationStep />
      )}
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

OnboardingPage.auth = true;
export default OnboardingPage;
