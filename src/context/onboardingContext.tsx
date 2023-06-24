import { useContext, createContext, useState, useEffect } from "react";

import { ChildrenProps } from "../commons/types";
import useLocalStorage from "../hooks/useLocalStorage";
import { OnboardingStepEnum } from "../modules/Onboarding/enums";
import { isEmpty } from "../utils/Common";

export type OnboardingContextSchemaType = {
  onboardingStep: OnboardingStepEnum;
};

export type SecondaryOnboardingContextSchemaType = {
  showStudioFeedCard: boolean;
  showTimelineCard: boolean;
  showExploreCard: boolean;
  showStudioCard: boolean;
};
export type SecondarySchemaItemType =
  | "showStudioFeedCard"
  | "showTimelineCard"
  | "showExploreCard"
  | "showStudioCard";

type OnboardingContextType = {
  isOnboarding: boolean;
  onboardingSchema: OnboardingContextSchemaType | null;
  setOnboardingSchema: (schema: OnboardingContextSchemaType | null) => void;
  saveOnboardingSchema: (schema: OnboardingContextSchemaType | null) => void;
  clearOnboardingSchema: () => void;
  secondaryOnboardingSchema: SecondaryOnboardingContextSchemaType;
  saveSecondaryOnboardingSchema: (
    schema: SecondaryOnboardingContextSchemaType | null
  ) => void;
  clearSecondaryOnboardingSchema: (key: SecondarySchemaItemType) => void;
};

export const OnboardingContext = createContext<OnboardingContextType | null>(
  null
);

export const OnboardingProvider = ({ children }: ChildrenProps) => {
  const {
    isOnboarding,
    onboardingSchema,
    setOnboardingSchema,
    saveOnboardingSchema,
    clearOnboardingSchema,
    secondaryOnboardingSchema,
    saveSecondaryOnboardingSchema,
    clearSecondaryOnboardingSchema,
  } = useProviderOnboarding();

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        onboardingSchema,
        setOnboardingSchema,
        saveOnboardingSchema,
        clearOnboardingSchema,
        secondaryOnboardingSchema,
        saveSecondaryOnboardingSchema,
        clearSecondaryOnboardingSchema,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

const useProviderOnboarding = () => {
  const [onboardingSchema, setOnboardingSchema] =
    useState<OnboardingContextSchemaType | null>(null);

  const [secondaryOnboardingSchema, setSecondaryOnboardingSchema] =
    useLocalStorage("secondaryOnboardingSchema", {
      showStudioFeedCard: false,
      showTimelineCard: false,
      showExploreCard: false,
      showStudioCard: false,
    });

  const saveOnboardingSchema = (schema: OnboardingContextSchemaType | null) => {
    localStorage.setItem("onboardingSchema", JSON.stringify(schema));
    setOnboardingSchema(schema);
  };

  const saveSecondaryOnboardingSchema = (
    schema: SecondaryOnboardingContextSchemaType | null
  ) => {
    setSecondaryOnboardingSchema(schema);
  };

  const clearSecondaryOnboardingSchema = (key: SecondarySchemaItemType) => {
    const newSchema = { ...secondaryOnboardingSchema };
    newSchema[key] = false;
    saveSecondaryOnboardingSchema(newSchema);
  };

  const clearOnboardingSchema = () => {
    localStorage.removeItem("onboardingSchema");
    setOnboardingSchema(null);
  };

  const isOnboarding: boolean = !!(
    onboardingSchema && !isEmpty(onboardingSchema)
  );

  useEffect(() => {
    const localOnboardingSchema = JSON.parse(
      window.localStorage.getItem("onboardingSchema") || "{}"
    );
    if (localOnboardingSchema) {
      setOnboardingSchema(localOnboardingSchema);
    }
  }, []);

  return {
    isOnboarding,
    saveOnboardingSchema,
    onboardingSchema,
    setOnboardingSchema,
    clearOnboardingSchema,
    secondaryOnboardingSchema,
    saveSecondaryOnboardingSchema,
    clearSecondaryOnboardingSchema,
  };
};

export const useOnboarding = () => {
  return useContext(OnboardingContext) as OnboardingContextType;
};
