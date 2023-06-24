import { FC } from "react";
import { useTranslation } from "next-i18next";
import { Box, Text } from "@primer/react";

import StudioForm from "../../Studio/forms/StudioForm";
import Image from "next/image";

interface IOnboardingStudioCreationStepProps {}

const OnboardingStudioCreationStep: FC<IOnboardingStudioCreationStepProps> = (
  props
) => {
  const { t } = useTranslation();

  return (
    <>
      <Box
        backgroundColor="auth.bg"
        padding={"52px"}
        sx={{
          width: "100%",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        minHeight="100vh"
        display={"flex"}
        flexDirection="column"
      >
        <Box
          display={"flex"}
          flexDirection="column"
          padding={"1rem"}
          borderRadius={"12px"}
          mx={"auto"}
          bg={"auth.signin.bg"}
          sx={{
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "auth.signin.border",
            width: ["100%", "90%", "70%", "40%"],
          }}
        >
          <Text fontSize={"24px"} textAlign={"center"} fontWeight={600}>
            {t("onboarding.createYourWorkspace")}
          </Text>
          <Box height={"24px"}></Box>
          <StudioForm mode="create" fromOnboarding />
        </Box>
      </Box>
    </>
  );
};

export default OnboardingStudioCreationStep;
