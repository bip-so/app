import React, { FC, useEffect, useRef, useState } from "react";
import slugify from "slugify";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useToasts } from "react-toast-notifications";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  Text,
  Textarea,
  TextInputWithTokens,
  useTheme,
} from "@primer/react";
import {
  AlertIcon,
  CheckCircleIcon,
  PencilIcon,
} from "@primer/styled-octicons";

import { usePages } from "../../../context/pagesContext";
import { usePermissions } from "../../../context/permissionContext";
import { useStudio } from "../../../context/studioContext";
import { useUser } from "../../../context/userContext";
import { PermissionGroup } from "../../Permissions/types";
import { StudioFormType } from "../types";
import {
  BIP_HANDLE_REGEX,
  BIP_RESTRICTED_HANDLES,
} from "../../../core/constants";
import useDebounce from "../../../hooks/useDebounce";
import StudioService from "../services";
import { HttpStatusCode } from "../../../commons/enums";
import BipRouteUtils from "../../../core/routeUtils";
import segmentEvents from "../../../insights/segment";
import StyledTextInput from "../../../components/StyledTextInput";
import { AVATAR_PLACEHOLDER } from "../../../commons/constants";
import BipLoader from "../../../components/BipLoader";
import { useOnboarding } from "../../../context/onboardingContext";
import Image from "next/image";
import ThemeToggle from "../../Auth/components/ThemeToggle";
import { CreateStudioStatusEnum } from "../../Onboarding/enums";
import { HandleEnum } from "../../../core/enums";

export type StudioFormMode = "create" | "edit";

interface IStudioFormProps {
  mode?: StudioFormMode;
  updateStudioPic?: boolean;
  closeHandler?: Function;
  fromOnboarding?: boolean;
}

const StudioForm: FC<IStudioFormProps> = ({
  mode,
  updateStudioPic,
  fromOnboarding,
  closeHandler,
}) => {
  const router = useRouter();

  // Partner Integration
  const guildId = router.query.guildId as string;
  const partnerIntegrationId = router.query.partnerIntegrationId as string;

  const { t } = useTranslation();
  const { addToast } = useToasts();
  const inputFile = useRef(null);

  const { user } = useUser();
  const { clearOnboardingSchema } = useOnboarding();
  const { schema } = usePermissions();
  const { studios, addStudio, saveCurrentStudio, currentStudio, updateStudio } =
    useStudio();
  const { setPagesLoaded } = usePages();
  const [image, setImage] = useState((): File | null => null);
  const [preview, setPreview] = useState((): any => null);
  const { colorMode } = useTheme();
  const [handle, setHandle] = useState("");
  const [validHandle, setValidHandle] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studioCreationStatus, setStudioCreationStatus] = useState(
    CreateStudioStatusEnum.OPEN
  );
  const [tokens, setTokens] = useState(
    (): { id: number | string; text: string }[] => []
  );

  const [newStudioRoute, setNewStudioRoute] = useState("");
  const [topics, setTopics] = useState("");

  const onTokenRemove = (tokenId: any) => {
    setTokens(tokens.filter((token) => token.id !== tokenId));
  };

  const openFiles = () => {
    if (inputFile) {
      //@ts-ignore
      inputFile.current.value = null;
      //@ts-ignore
      inputFile.current.click();
    }
  };
  useEffect(() => {
    updateStudioPic ? openFiles() : null;
  }, []);

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

  const validationSchema = yup
    .object()
    .shape({
      name: yup
        .string()
        .trim()
        .required("Name is required")
        .min(3, "Minimum length is 3")
        .max(30, "Maximum length is 30"),
      handle: yup
        .string()
        .trim()
        .required("Handle is required")
        .min(3, "Minimum length is 3")
        .max(30, "Maximum length is 30")
        .matches(
          /^[aA-zZ\s0-9]+$/,
          "Only alphabets,numbers are allowed for handle"
        )
        .notOneOf(
          BIP_RESTRICTED_HANDLES,
          `Can't be one of the following: ${BIP_RESTRICTED_HANDLES.join(", ")}`
        ),
      description: yup.string().optional(),
      // topics: yup.string().optional(),
      // imageUrl: yup.string().optional(),
      website: yup.string().optional(),
    })
    .required();

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState,
    watch,
    setValue,
  } = useForm<StudioFormType>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const studioName = watch("name", "");
  const studioDesc = watch("description", "");
  const handleName = watch("handle", "");
  // const topics = watch("topics", "");
  const debounceValue = useDebounce(handleName.trim(), 400);

  useEffect(() => {
    if (mode === "create") {
      setValue(
        "handle",
        slugify(studioName, {
          remove: /[!`+*)():-@.,"#{}\\/^~\[\]]/g,
        })
          .replaceAll("-", "")
          .toLowerCase()
          .slice(0, 29)
      );
    }
  }, [studioName]);

  useEffect(() => {
    if (
      mode === "edit" &&
      currentStudio?.handle.trim() === debounceValue.trim()
    ) {
      setValidHandle(true);
    } else if (debounceValue?.trim()?.length >= 2) {
      setSearching(true);
      setValidHandle(false);
      StudioService.checkHandle(debounceValue.trim())
        .then((r) => {
          if (r?.data?.available) {
            setValidHandle(true);
          } else {
            setValidHandle(false);
          }
          setSearching(false);
        })
        .catch((e) => {
          setValidHandle(false);
          setSearching(false);
        });
    } else {
      setValidHandle(false);
    }
  }, [debounceValue]);

  const { errors, isValid, isValidating } = formState;

  const onCreateStudio: SubmitHandler<StudioFormType> = async (data) => {
    try {
      setLoading(true);
      setStudioCreationStatus(CreateStudioStatusEnum.IN_PROGRESS);
      const updatedData = {
        ...data,
        name: data?.name?.trim(),
        handle: data?.handle?.trim(),
        description: data?.description?.trim(),
        topics: tokens?.map((item) => item.text),
      };
      const resp = await StudioService.createStudio(updatedData);
      if (resp.status === HttpStatusCode.OK) {
        let { data: studio, error } = resp.data;
        if (studio) {
          // Discord Integration
          const fromIntegration = Boolean(
            localStorage.getItem("fromIntegration")
          );

          if (fromOnboarding) {
            clearOnboardingSchema();
          }
          if (fromIntegration) {
            window.location.href =
              BipRouteUtils.getDiscordStudioIntegrationRedirectRoute(
                user?.id!,
                studio.id,
                guildId,
                partnerIntegrationId
              );
          } else {
            setNewStudioRoute(BipRouteUtils.getHandleRoute(studio.handle));
          }

          if (fromIntegration) {
            localStorage.removeItem("fromIntegration");
          }
          addStudio(studio);
          saveCurrentStudio({ ...studio, membersCount: 1 });
          if (image) {
            const {
              defaultCanvasBranchId,
              defaultCanvasRepoId,
              defaultCanvasRepoKey,
              defaultCanvasRepoName,
            } = studio;
            const formData = new FormData();
            formData.append("file", image);
            const resp = await StudioService.uploadStudioImage(formData);
            if (resp.status === HttpStatusCode.OK) {
              studio = {
                ...studio,
                ...resp.data.data,
                permission: studio.permission,
                defaultCanvasBranchId,
                defaultCanvasRepoId,
                defaultCanvasRepoKey,
                defaultCanvasRepoName,
              };
            }
          }
          studio = {
            ...studio,
            permissionGroup: schema?.studio?.permissionGroups.find(
              (pg: PermissionGroup) => pg.systemName === studio.permission
            ),
          };
          addStudio(studio);
          saveCurrentStudio({
            ...studio,
            membersCount: 1,
            context: HandleEnum.Studio,
            isJoined: true,
          });

          let studioRedirectTimeoutToast = () => {
            addToast("Workspace created successfully", {
              appearance: "success",
              autoDismiss: true,
            });
          };

          setTimeout(studioRedirectTimeoutToast, 2000);

          if (fromOnboarding) {
            segmentEvents.signUpCreateStudioSelected(
              user?.id!,
              user?.username!,
              "manual"
            );
          } else {
            segmentEvents.newStudioCreated(
              data.handle!,
              user?.id!,
              user?.email!,
              user?.username!,
              data.description!,
              user?.uuid!
            );
          }

          setStudioCreationStatus(CreateStudioStatusEnum.FINISHED);

          setLoading(false);
          setPagesLoaded(false);

          let studioRedirectTimeoutFn = () => {
            router.push(BipRouteUtils.getHandleRoute(studio.handle));
          };
          setTimeout(studioRedirectTimeoutFn, 2000);
        } else if (error) {
          setStudioCreationStatus(CreateStudioStatusEnum.OPEN);
          setLoading(false);
          addToast(error, {
            appearance: "error",
            autoDismiss: true,
          });
        }
      }
    } catch (err) {
      console.log(err);
      setStudioCreationStatus(CreateStudioStatusEnum.OPEN);
      const errorText =
        "Problem while creating Workspace. please try after sometime";
      addToast(errorText, {
        appearance: "error",
        autoDismiss: true,
      });
      setLoading(false);
    }
  };

  const onUpdateStudio: SubmitHandler<StudioFormType> = async (data) => {
    try {
      segmentEvents.studioEdited(
        currentStudio?.handle!,
        data?.handle!,
        currentStudio?.displayName!,
        data?.name!,
        currentStudio?.description!,
        data?.description!
      );
      setLoading(true);
      const updatedData = {
        id: currentStudio?.id,
        ...data,
        topics: tokens?.map((item) => item.text),
      };
      const resp = await StudioService.updateStudio(updatedData);
      if (resp.status === HttpStatusCode.OK) {
        let { data: studio } = resp.data;
        if (image) {
          const formData = new FormData();
          formData.append("file", image);
          const resp = await StudioService.uploadStudioImage(formData);
          if (resp.status === HttpStatusCode.OK) {
            studio = {
              ...studio,
              ...resp.data.data,
              permission: studio.permission,
            };
          }
        }

        studio = {
          ...studio,
          permissionGroup: schema?.studio?.permissionGroups.find(
            (pg: PermissionGroup) => pg.systemName === studio.permission
          ),
          isPersonalSpace: studio.id === user?.defaultStudioID,
        };

        updateStudio(studio);
        saveCurrentStudio(studio);
        addToast("Workspace updated successfully", {
          appearance: "success",
          autoDismiss: true,
        });
        closeHandler && closeHandler();
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      const errorText =
        "Problem while updating Workspace. please try after sometime";
      addToast(errorText, {
        appearance: "error",
        autoDismiss: true,
      });
      setLoading(false);
    }
  };

  const submitHandler: SubmitHandler<StudioFormType> = async (data) => {
    if (mode === "create") {
      segmentEvents.newStudioCreated(
        data.handle!,
        user?.id!,
        user?.email!,
        user?.username!,
        data.description!,
        user?.uuid!
      );
      onCreateStudio(data);
    } else {
      onUpdateStudio(data);
      router.push(BipRouteUtils.getStudioAboutRoute(data?.handle!));
    }
  };

  const [isOpen, setIsOpen] = useState<boolean>(true);

  const [studio, setStudio] = useState<StudioFormType>();

  useEffect(() => {
    // reset form with user data
    reset(studio);
  }, [studio]);

  useEffect(() => {
    if (mode === "edit") {
      setStudio({
        name: currentStudio?.displayName || "",
        handle: currentStudio?.handle || "",
        description: currentStudio?.description || "",
        // imageUrl: currentStudio?.imageUrl || "",
        // temporary: boolean;
        topics: "",
        website: currentStudio?.website || "",
      });
      setTokens(
        currentStudio?.topics?.map((topic) => {
          return {
            id: topic.id,
            text: topic.name,
          };
        }) || []
      );
    }
  }, []);

  const isDay = colorMode === "day";

  const ONBOARDING_MESSAGES = [
    {
      text: "Adding Workspace details",
      completed: studioCreationStatus !== CreateStudioStatusEnum.OPEN,
    },
    {
      text: "Adding canvases",
      completed: studioCreationStatus === CreateStudioStatusEnum.FINISHED,
    },
    {
      text: "Finishing up...",
      completed: studioCreationStatus === CreateStudioStatusEnum.FINISHED,
    },
  ];

  return (
    <>
      {studioCreationStatus !== CreateStudioStatusEnum.OPEN && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundColor: "auth.bg",
            zIndex: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "320px",
              backgroundColor: "createStudioLoader.bg",
              borderRadius: "12px",
              fontSize: "16px",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "auth.signin.border",
              boxShadow:
                "0px 8px 24px rgba(66, 74, 83, 0.12), 0px 1px 3px rgba(27, 31, 36, 0.12);",
            }}
          >
            <Text
              as="h1"
              sx={{
                padding: "14px 16px",
                fontWeight: "600",
              }}
            >
              {studioCreationStatus === CreateStudioStatusEnum.IN_PROGRESS
                ? "Creating your personal Workspace"
                : studioCreationStatus === CreateStudioStatusEnum.FINISHED
                ? "Your Workspace is ready!"
                : "Workspace creation failed"}
            </Text>
            <hr
              style={{
                borderColor: "#D0D7DE",
              }}
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={"/lift_off.gif"}
                alt="lift off"
                style={{
                  borderRadius: "50%",
                  margin: "16px 0",
                  objectFit: "cover",
                  width: "70px",
                  height: "70px",
                }}
              />
              <Box
                sx={{
                  margin: "0 0 22px 0",
                  color: "text.muted",
                }}
              >
                {ONBOARDING_MESSAGES.map(({ text, completed }) => (
                  <Box key={text} sx={{ margin: "10px 0" }}>
                    <CheckCircleIcon
                      sx={{
                        fill: completed
                          ? isDay
                            ? "black"
                            : "white"
                          : "text.muted",
                        marginRight: "5px",
                      }}
                    />
                    <Text>{text}</Text>
                  </Box>
                ))}
              </Box>
              <Button
                sx={{
                  width: "calc(100% - 24px)",
                  height: "30px",
                  margin: "12px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: isDay ? "1px solid" : "none",
                }}
                variant={isDay ? "default" : "primary"}
                onClick={() => {
                  router.push(newStudioRoute);
                  closeHandler && closeHandler();
                  setStudioCreationStatus(CreateStudioStatusEnum.OPEN);
                }}
                disabled={loading}
              >
                {loading ? <BipLoader /> : "Taking to your Workspace.. "}
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              position: "fixed",
              top: 6,
              right: 6,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ThemeToggle />
            <Text>Click to change theme</Text>
          </Box>
        </Box>
      )}
      <form onSubmit={handleSubmit(submitHandler)}>
        <Box
          display={"flex"}
          flexDirection={["column", "row", "row", "row"]}
          alignItems={["none", "center", "center", "center"]}
          // mb={"16px"}
        >
          <Box
            display={"flex"}
            justifyContent={"center"}
            mb={["16px", "20px", "20px", "20px"]}
          >
            <Box
              borderRadius={"50%"}
              border="1px solid rgba(27, 31, 36, 0.15)"
              position={"relative"}
              width={"108px"}
              height={"108px"}
            >
              <Avatar
                src={
                  preview
                    ? preview
                    : mode === "edit" && currentStudio?.imageUrl
                    ? currentStudio.imageUrl
                    : AVATAR_PLACEHOLDER
                }
                alt={"studio-image"}
                sx={{
                  width: "108px",
                  height: "108px",
                }}
              />
              <Box
                width={"1.5rem"}
                height={"1.5rem"}
                bg={"editModal.editIconBg"}
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
                <PencilIcon size={14} />
              </Box>
              <input
                ref={inputFile}
                type="file"
                accept={"image/*"}
                onChange={handleFileUpload}
                style={{ display: "none" }}
                id="studio-image-file"
              />
            </Box>
          </Box>
          <Box
            display={"flex"}
            flex={1}
            flexDirection={"column"}
            ml={["0px", "16px", "16px", "16px"]}
            sx={{ gap: "8px" }}
          >
            <FormControl>
              <FormControl.Label>
                {t("workspace.workspaceName")}
              </FormControl.Label>

              <StyledTextInput
                autoComplete="off"
                {...register("name")}
                required
                placeholder="Project X"
                emptyBoxHeight={"0px"}
                maxLength={100}
                showWarning={studioName.trim().length === 100}
                warningMessage={"Max Characters: 100"}
                sx={{
                  "::placeholder": {
                    color: "red !important",
                  },
                }}
              />
              <Text
                fontSize={"12px"}
                lineHeight={"16px"}
                fontWeight={400}
                sx={{
                  color: "styledTextInput.errorColor",
                }}
              >
                {errors?.name?.message}
              </Text>
            </FormControl>
            <FormControl>
              <FormControl.Label>Handle*</FormControl.Label>
              <StyledTextInput
                autoComplete="off"
                {...register("handle")}
                // required
                placeholder="projectx"
                leadingVisual={"@"}
                showWarning={
                  !validHandle && !searching && handleName?.trim()?.length >= 2
                }
                warningMessage={"Handle already exists"}
                maxLength={20}
                onKeyPress={(e) => {
                  var regex = new RegExp(BIP_HANDLE_REGEX);
                  var str = String.fromCharCode(
                    !e.charCode ? e.which : e.charCode
                  );
                  if (regex.test(str)) {
                    return true;
                  }

                  e.preventDefault();
                  return false;
                }}
                emptyBoxHeight={"0px"}
              />
              <Text
                fontSize={"12px"}
                lineHeight={"16px"}
                fontWeight={400}
                sx={{ color: "styledTextInput.errorColor" }}
              >
                {errors?.handle?.message}
              </Text>
            </FormControl>
          </Box>
        </Box>
        <FormControl sx={{ mb: "16px" }}>
          <FormControl.Label>Description</FormControl.Label>
          <Textarea
            {...register("description")}
            placeholder={t("workspace.placeholder")}
            rows={3}
            maxLength={300}
            sx={{
              border: "1px solid",
              boxShadow: "inset 0px 1px 2px rgba(27, 31, 35, 0.075)",
              borderColor: "styledTextInput.border",
              bg: "styledTextInput.bg",
              width: "100%",
              ":focus-within": {
                border: "1px solid",
                borderColor: "styledTextInput.focusBorder",
                boxShadow: "0px 0px 0px 3px rgba(3, 102, 214, 0.3)",
              },
            }}
          />
          {studioDesc.trim().length === 300 ? (
            <Box display="flex" mt={"0.25rem"}>
              <AlertIcon color={"styledTextInput.warningColor"} size={12} />
              <Text
                as="p"
                fontSize={"0.625rem"}
                lineHeight="0.875rem"
                color={"styledTextInput.warningColor"}
                ml={"0.25rem"}
              >
                {"Max Characters: 300"}
              </Text>
            </Box>
          ) : null}
        </FormControl>
        <FormControl sx={{ mb: "16px" }}>
          <FormControl.Label>Tags</FormControl.Label>
          <TextInputWithTokens
            tokens={tokens}
            onTokenRemove={onTokenRemove}
            // {...register("topics")}
            value={topics}
            onChange={(e) => {
              setTopics(e.target.value);
            }}
            placeholder="For ex. Web3, Fin-Tech (press enter or comma to add more)"
            size={"medium"}
            sx={{
              border: "1px solid",
              boxShadow: "inset 0px 1px 2px rgba(27, 31, 35, 0.075)",
              borderColor: "styledTextInput.border",
              width: "100%",
              bg: "styledTextInput.bg",
              ":focus-within": {
                border: "1px solid",
                borderColor: "styledTextInput.focusBorder",
                boxShadow: "0px 0px 0px 3px rgba(3, 102, 214, 0.3)",
              },
            }}
            onKeyDown={(e) => {
              if (e.key === "," || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (topics?.trim()?.length) {
                  const newTokens = topics?.split(",")?.map((topic) => {
                    return {
                      id: uuidv4(),
                      text: topic.trim(),
                    };
                  });
                  setTokens([...tokens, ...newTokens]);
                }
                setTopics("");
                // reset({ topics: "" });
              }
            }}
          />
        </FormControl>
        <FormControl sx={{ mb: "16px" }}>
          <FormControl.Label>Website</FormControl.Label>
          <StyledTextInput
            {...register("website")}
            placeholder="Website"
            emptyBoxHeight={"0px"}
          />
        </FormControl>
        {fromOnboarding ? (
          <Button
            variant="primary"
            size={"large"}
            type={"submit"}
            disabled={loading ? true : !(isValid && validHandle)}
            sx={{
              ":focus:not([disabled])": { boxShadow: "none" },
              border: "none",
              fontSize: "14px",
              fontWeight: "600",
              width: "100%",
            }}
          >
            <Box
              display={"flex"}
              alignItems="center"
              justifyContent={"center"}
              marginLeft={"auto"}
              marginRight="auto"
              className="text-center"
            >
              <Text
                sx={{
                  textAlign: "center",
                }}
              >
                {t("onboarding.createYourWorkspace")}
              </Text>
              {loading && (
                <Box marginLeft={"10px"}>
                  <BipLoader
                    sx={{
                      my: "none",
                      marginLeft: "10px",
                    }}
                  />
                </Box>
              )}
            </Box>
          </Button>
        ) : (
          <Box display={"flex"} justifyContent={"flex-end"}>
            <Button size={"medium"} type={"button"} onClick={closeHandler}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size={"medium"}
              type={"submit"}
              disabled={loading ? true : !(isValid && validHandle)}
              sx={{
                ml: "16px",
                ":focus:not([disabled])": { boxShadow: "none" },
                border: "none",
              }}
            >
              {mode === "create"
                ? loading
                  ? "Creating..."
                  : "Create"
                : loading
                ? "Saving..."
                : "Save"}
            </Button>
          </Box>
        )}
      </form>
    </>
  );
};

export default StudioForm;
