import React, { useEffect, useRef, useState } from "react";
import { GetServerSideProps, GetStaticProps, NextPage } from "next";
import { useTranslation } from "next-i18next";
import { Box, Button, Text } from "@primer/react";
import StyledTextInput from "../../src/components/StyledTextInput";
import { getProviders } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { BipPage } from "../../src/commons/types";
import UserService from "../../src/modules/User/services";
import useDebounce from "../../src/hooks/useDebounce";
import { useRouter } from "next/router";
import { useToasts } from "react-toast-notifications";
import { useUser } from "../../src/context/userContext";
import AvatarWithPlaceholder from "../../src/components/AvatarWithPlaceholder";
import StudioService from "../../src/modules/Studio/services";
import { BIP_RESTRICTED_HANDLES } from "../../src/core/constants";
import { PencilIcon } from "@primer/styled-octicons";
import segmentEvents from "../../src/insights/segment";
import { useLayout } from "../../src/context/layoutContext";
import { useOnboarding } from "../../src/context/onboardingContext";
import { OnboardingStepEnum } from "../../src/modules/Onboarding/enums";
import SetupHeader from "../../src/components/SetupHeader";

interface SetupProps {}

// @ts-ignore
const SetupPage: BipPage<SetupProps> = (props) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [image, setImage] = useState((): any => null);
  const [preview, setPreview] = useState((): any => null);
  const [saving, setSaving] = useState(false);
  const [validUsername, setValidUsername] = useState(false);
  const [searching, setSearching] = useState(false);

  const { setShowCreateStudioContainer } = useLayout();
  const { saveUser } = useUser();
  const { saveOnboardingSchema, saveSecondaryOnboardingSchema } =
    useOnboarding();
  const debounceValue = useDebounce(username, 400);
  const inputFile = useRef(null);

  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const router = useRouter();
  const { addToast } = useToasts();

  const openFiles = () => {
    if (inputFile) {
      //@ts-ignore
      inputFile.current.value = null;
      //@ts-ignore
      inputFile.current.click();
    }
  };

  const getPreviewImage = (image: File) => {
    if (image instanceof Blob) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = (e) => {
        setPreview(reader.result);
      };
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      setImage(files[0]);
      getPreviewImage(files[0]);
    }
  };

  useEffect(() => {
    if (debounceValue?.length > 0) {
      if (debounceValue?.length < 4) return;

      setSearching(true);
      setValidUsername(false);
      StudioService.checkHandle(debounceValue.trim())
        // AuthService.verifyUsername({ username: debounceValue })
        .then((r) => {
          const available =
            r.data.available &&
            BIP_RESTRICTED_HANDLES.indexOf(debounceValue.trim()) === -1;
          setValidUsername(available);
          setSearching(false);
        })
        .catch((e) => {
          setSearching(false);
          setValidUsername(false);
        });
    } else {
      setValidUsername(false);
    }
  }, [debounceValue]);

  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!saving) {
      if (
        name.trim().length > 0 &&
        username.trim().length > 0 &&
        validUsername
      ) {
        setLoading(true);
        const data = new FormData();
        if (image) {
          data.append("file", image);
        }
        data.append("fullName", name.trim());
        data.append("username", username.trim());
        setSaving(true);
        let newUser = {
          isSetupDone: true,
          fullName: name.trim(),
          username: username.trim(),
        };
        // const user = JSON.parse(data);
        // console.log(user, newUser, {
        //   ...user,
        //   ...newUser,
        // });
        // return;
        UserService.setupUser(data)
          .then(async (r) => {
            const data = localStorage.getItem("user");

            if (data) {
              const user = JSON.parse(data);
              if (user) {
                newUser = {
                  ...user,
                  ...r.data.data,
                };
              } else {
                newUser = { ...r.data.data };
              }
            } else {
              newUser = { ...r.data.data };
            }

            segmentEvents.signUpProfileSaved(
              newUser?.id!,
              newUser?.email!,
              newUser.username,
              newUser?.fullName
            );
            segmentEvents.loggedIn(
              "email-pwd",
              newUser.username,
              newUser?.id,
              true
            );

            if (
              !router.query.returnUrl &&
              router.query.isNewStudio !== "true"
            ) {
              saveOnboardingSchema({
                onboardingStep: OnboardingStepEnum.LANDING,
              });
            }
            saveSecondaryOnboardingSchema({
              showStudioFeedCard: true,
              showTimelineCard: true,
              showExploreCard: true,
              showStudioCard: true,
            });
            await saveUser(newUser);
            const route: string = router.query?.returnUrl
              ? (router.query.returnUrl as string)
              : "/";
            router.replace(route);
            setLoading(false);
            // setSaving(false);
            console.log(route);
          })
          .catch((e) => {
            setSaving(false);
            addToast("Something went wrong. Please try again!", {
              appearance: "error",
              autoDismiss: true,
            });
            setLoading(false);
          });
      }
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        bg: "auth.bg",
        width: "100%",
        display: "flex",
        alignItems: "center",
        // justifyContent: "center",
      }}
    >
      <Box
        display={"flex"}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        width={"648px"}
        height={"658px"}
        padding={"1rem"}
        borderRadius={"12px"}
        border={"1px solid"}
        borderColor={"auth.setup.border"}
        mx={"auto"}
        bg={"auth.setup.bg"}
      >
        <Box
          display={"flex"}
          flexDirection="column"
          width={"90%"}
          height={"538px"}
          borderRadius={"12px"}
          justifyContent="center"
          mx={"auto"}
          // bg={"auth.setup.bg"}
        >
          <Box
            display="flex"
            flexDirection="column"
            height="490px"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* <Text
              as={"p"}
              fontWeight={500}
              fontSize={"1rem"}
              lineHeight={"1.25rem"}
              textAlign="center"
              py={"0.625rem"}
              mb="0.75rem"
            >
              {t("auth.almostThere")}!
            </Text>
            <Text
              as={"p"}
              fontWeight={400}
              fontSize={"0.875rem"}
              lineHeight={"1.25rem"}
              textAlign="center"
              mb="1rem"
              color={"auth.setup.heading"}
            >
              {t("auth.completeYourProfile")}
            </Text> */}

            <SetupHeader progressNumber={66.6} />
            <Box
              display="flex"
              flexDirection="column"
              height="364px"
              width="100%"
              alignItems="center"
              justifyContent="center"
            >
              <Box display="flex" width="100%" alignItems="flex-start">
                <Text
                  as={"p"}
                  fontWeight={600}
                  fontSize={"1.25rem"}
                  lineHeight={"1.25rem"}
                  mb="1rem"
                  color={"auth.setup.text"}
                >
                  {t("auth.setupYourProfile")}
                </Text>
              </Box>
              <Box
                mx="auto"
                borderRadius={"50%"}
                border="1px solid"
                borderColor={"auth.setup.avatarBorder"}
                mb="1rem"
                position={"relative"}
                width={"108px"}
                height={"108px"}
              >
                <AvatarWithPlaceholder
                  src={preview}
                  alt={"profile-image"}
                  sx={{
                    width: "108px",
                    height: "108px",
                  }}
                />
                <Box
                  width={"1.5rem"}
                  height={"1.5rem"}
                  bg={"text.bg.white"}
                  borderRadius={"50%"}
                  boxShadow="0px 1px 3px rgba(0, 0, 0, 0.12), 0px 8px 24px rgba(149, 157, 165, 0.2)"
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  position={"absolute"}
                  zIndex={1}
                  top={"82px"}
                  left={"82px"}
                  sx={{ cursor: "pointer" }}
                  onClick={openFiles}
                >
                  <PencilIcon size={14} color={"auth.setup.icon"} />
                </Box>
                <input
                  ref={inputFile}
                  type="file"
                  accept={"image/png, image/gif, image/jpeg"}
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  id="profile-image-file"
                />
              </Box>
              <form
                onSubmit={save}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Text
                  as={"p"}
                  fontWeight={600}
                  fontSize={"0.875rem"}
                  lineHeight={"1.25rem"}
                  mb="0.5rem"
                  color={"auth.setup.text"}
                >
                  {t("auth.name")}
                </Text>
                <StyledTextInput
                  sx={{
                    width: "322px",
                  }}
                  aria-label="name"
                  type="text"
                  placeholder={t("auth.enterYourName")}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  emptyBoxHeight={"0px"}
                  autoFocus
                />
                <Text
                  as={"p"}
                  fontWeight={600}
                  fontSize={"0.875rem"}
                  lineHeight={"1.25rem"}
                  mb="0.5rem"
                  mt={"1rem"}
                  color={"auth.setup.text"}
                >
                  {t("auth.username")}
                </Text>
                <StyledTextInput
                  sx={{
                    width: "322px",
                  }}
                  aria-label="name"
                  type="text"
                  placeholder={t("auth.enterYourName")}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    const { which } = e;
                    if (which === 32) {
                      e.preventDefault();
                    }
                  }}
                  leadingVisual={"@"}
                  showWarning={
                    !validUsername &&
                    !searching &&
                    username?.length > 0 &&
                    username?.length >= 4
                  }
                  warningMessage={t("auth.usernameAlreadyExists")}
                  showError={username?.length > 0 && username?.length < 4}
                  errorMessage={t("auth.usernameError")}
                  minLength={4}
                />
                <Button
                  variant="primary"
                  size={"medium"}
                  type={"submit"}
                  sx={{
                    width: "100%",
                    mt: "1rem",
                    ":focus:not([disabled])": { boxShadow: "none" },
                  }}
                  disabled={
                    loading ||
                    saving ||
                    (name.trim().length > 0 &&
                    username.trim().length >= 4 &&
                    validUsername
                      ? false
                      : true)
                  }
                >
                  {saving || loading
                    ? t("auth.saving") + "..."
                    : t("auth.save")}
                </Button>
              </form>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

SetupPage.auth = true;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders();
  const { locale } = context;

  return {
    props: { providers, ...(await serverSideTranslations(locale || "en")) },
  };
};

export default SetupPage;
