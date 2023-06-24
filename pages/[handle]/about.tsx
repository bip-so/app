import { ReactElement, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import TwitterIcon from "../../src/icons/TwitterIcon";
import { BipPage } from "../../src/commons/types";
import StudioLayout from "../../src/layouts/StudioLayout/StudioLayout";
import {
  Avatar,
  Box,
  Button,
  ConfirmationDialog,
  Flash,
  Heading,
  Link as PrimerLink,
  Text,
  Token,
  Truncate,
} from "@primer/react";
import { useStudio } from "../../src/context/studioContext";
import {
  CalendarIcon,
  GlobeIcon,
  PencilIcon,
  LocationIcon,
  CheckIcon,
  InfoIcon,
} from "@primer/styled-octicons";
import { useToasts } from "react-toast-notifications";
import { useUser } from "../../src/context/userContext";
import CreateStudioModal from "../../src/modules/Studio/components/StudioModal";
import Modal from "../../src/components/Modal";
import { StudioType } from "../../src/modules/Studio/types";
import StudioService from "../../src/modules/Studio/services";
import { AVATAR_PLACEHOLDER } from "../../src/commons/constants";
import { HandleWrapper } from "../../src/hooks/useHandle";
import StudioHeader from "../../src/layouts/StudioLayout/components/StudioHeader";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../src/hooks/useHasPermission";
import { StudioPermissionEnum } from "../../src/modules/Permissions/enums";
import BipRouteUtils from "../../src/core/routeUtils";
import { DEFAULT_USER_PLACEHOLDER } from "../../src/commons/constants";
import useDeviceDimensions from "../../src/hooks/useDeviceDimensions";
import ImageWithName from "../../src/components/ImageWithName";
import ExploreService from "../../src/modules/Explore/services";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import segmentEvents from "../../src/insights/segment";
import { sanitizeHandle } from "../../src/utils/Common";
import { StyledOcticon } from "@primer/react";
import { useOnboarding } from "../../src/context/onboardingContext";
import LinkWithoutPrefetch from "../../src/components/LinkWithoutPrefetch";
import { useTranslation } from "next-i18next";

const monthEnum = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

const AboutPage: BipPage = () => {
  const router = useRouter();
  const { isNewStudio, provider } = router.query;
  const handle = sanitizeHandle(router.query.handle as string);
  const [isLoading, setIsLoading] = useState(false);
  const [updateStudioPic, setUpdateStudioPic] = useState(false);
  const { clearOnboardingSchema } = useOnboarding();

  const { t } = useTranslation();

  const [showUserLandingBanner, setShowUserLandingBanner] =
    useState<boolean>(false);
  useEffect(() => {
    if (!router.isReady) return;
    if (isNewStudio === "true") {
      router.push(
        {
          pathname: router.pathname,
          query: {
            handle: router.query.handle,
          },
        },
        undefined,
        { shallow: true }
      );
      setShowUserLandingBanner(true);
      clearOnboardingSchema();
      segmentEvents.integrationConnected(provider as string, handle, user?.id!);
    }
  }, []);

  const { isTabletOrMobile } = useDeviceDimensions();
  const [adminList, setAdminList] = useState([]);

  const { addStudio, currentStudio, deleteStudio, studios, saveCurrentStudio } =
    useStudio();
  const { isLoggedIn, user } = useUser();
  const canEditStudioProfile =
    useHasPermission(
      StudioPermissionEnum.STUDIO_EDIT_STUDIO_PROFILE,
      PermissionContextEnum.Studio
    ) && isLoggedIn;

  const canManageIntegrations =
    useHasPermission(
      StudioPermissionEnum.STUDIO_MANAGE_INTEGRATION,
      PermissionContextEnum.Studio
    ) && isLoggedIn;
  const [studioModalOpen, setStudioModalOpen] = useState<boolean>(false);
  const [deleteStudioConfirmOpen, setDeleteStudioConfirmOpen] =
    useState<boolean>(false);

  const { addToast } = useToasts();

  useEffect(() => {
    if (currentStudio && !currentStudio?.isJoined && studios?.length) {
      const studio = studios.find((st) => st.id === currentStudio?.id);
      if (studio) {
        saveCurrentStudio({ ...currentStudio, isJoined: true });
      }
    }
  }, [studios]);

  const handleJoin = async () => {
    const studioId = currentStudio?.id;
    setIsLoading(true);
    try {
      if (currentStudio?.isJoined) {
        await ExploreService.unfollowStudio(studioId);
        deleteStudio(currentStudio?.id);
      } else {
        segmentEvents.studioJoined(
          user?.id,
          currentStudio?.handle,
          currentStudio?.membersCount,
          adminList[0]?.id,
          adminList?.length
        );
        await ExploreService.followStudio(studioId);
        addStudio(currentStudio);
      }
      const currentStudioChange = {
        ...currentStudio,
        isJoined: !currentStudio?.isJoined,
        membersCount: currentStudio?.isJoined
          ? currentStudio.membersCount - 1
          : currentStudio.membersCount + 1,
      };
      saveCurrentStudio(currentStudioChange);
      addToast(
        `${currentStudio?.isJoined ? "Left" : "Joined"} ${
          currentStudio?.displayName
        }`,
        {
          appearance: "success",
          autoDismiss: true,
        }
      );
    } catch (error) {
      addToast(
        `Unable to ${
          currentStudio?.isJoined ? "Leave" : "Join"
        }. Please try again after some time!`,
        {
          appearance: "error",
          autoDismiss: true,
        }
      );
    }
    setIsLoading(false);
  };

  const requestToJoin = () => {
    if (currentStudio?.id) {
      setIsLoading(true);
      StudioService.requestToJoin(currentStudio?.id)
        .then((r) => {
          const updatedStudio = {
            ...currentStudio,
            isRequested: true,
          };
          saveCurrentStudio(updatedStudio);
          addToast(`Requested to join ${currentStudio?.displayName}`, {
            appearance: "success",
            autoDismiss: true,
          });
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          addToast(`Something went wrong. Please try again after some time!`, {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  };

  const joinHandler = async () => {
    if (isLoggedIn) {
      if (currentStudio?.isJoined || currentStudio?.allowPublicMembership) {
        handleJoin();
      } else if (!currentStudio?.isRequested) {
        requestToJoin();
      }
    } else {
      logout();
    }
  };

  const logout = () => {
    window.location.replace(
      `${BipRouteUtils.getSignInRoute()}?returnUrl=${router.asPath}`
    );
  };

  const handleCloseConfirmation = async (gesture: string) => {
    if (gesture === "confirm") {
      try {
        const filteredStudios = studios.filter(
          (studio: StudioType) => studio.id !== currentStudio?.id
        );
        await StudioService.deleteStudio(currentStudio?.id as number);
        deleteStudio(currentStudio?.id as number);
        if (filteredStudios?.length) {
          const firstStudio: StudioType = filteredStudios[0];
          saveCurrentStudio(firstStudio);
          router.replace(`/@${firstStudio.handle}`);
        } else {
          router.replace("/");
        }
        addToast(t("workspace.deleteSuccessful"), {
          appearance: "success",
          autoDismiss: true,
        });
        setDeleteStudioConfirmOpen(false);
      } catch (err) {
        addToast(t("workspace.problemDeleting"), {
          appearance: "error",
          autoDismiss: true,
        });
        setDeleteStudioConfirmOpen(false);
      }
    } else {
      setDeleteStudioConfirmOpen(false);
    }
  };

  useEffect(() => {
    if (currentStudio?.id && currentStudio?.handle === handle) {
      StudioService.getAdmins()
        .then((resp) => {
          const { data: s } = resp;
          const final = s.data;
          setAdminList(final);
        })
        .catch((err) => {});
    }
  }, [currentStudio?.id, handle]);

  useEffect(() => {
    segmentEvents.studioViewed(currentStudio?.handle!, user?.id!);
  }, []);

  const getStudioMembers = async () => {
    const { data } = await StudioService.getMembers();
    return data;
  };

  const onEditStudio = () => {
    setStudioModalOpen(true);
  };

  return (
    <HandleWrapper>
      <Head>
        <title>
          {`${
            currentStudio?.id === user?.defaultStudioID
              ? t("workspace.personalWorkspace")
              : currentStudio?.displayName
          }`}
          : About
        </title>
      </Head>
      <StudioHeader>
        <Box minHeight={"100vh"}>
          <Box
            display="flex"
            flexDirection={"column"}
            marginX={"auto"}
            sx={{
              gap: "16px",
              marginTop: ["16px", "48px", "48px", "48px"],
            }}
            // width={["360px", "360px", "600px", "600px"]}
            width={"100%"}
            maxWidth={"600px"}
          >
            {showUserLandingBanner ? (
              <Flash
                sx={{
                  border: "none",
                }}
                variant="success"
              >
                <StyledOcticon icon={InfoIcon} />
                {t("workspace.flashMessage")}
              </Flash>
            ) : null}
            <Box
              backgroundColor={"about.bg"}
              display="flex"
              flexDirection={"column"}
              marginTop={"10px"}
              justifyContent="space-between"
              alignItems={"center"}
              padding={"16px"}
              sx={{
                border: "1px solid",
                borderColor: "about.border",
                boxShadow: "0px 1px 0px rgba(27, 31, 35, 0.04)",
              }}
              borderRadius={["0px", "12px", "12px", "12px"]}
              alignSelf={"stretch"}
            >
              <Box
                display="flex"
                flexDirection={"row"}
                alignItems={"flex-start"}
                padding={"0px"}
                sx={{
                  gap: "16px",
                }}
                border={"1px"}
                alignSelf={"stretch"}
              >
                <Box display={"flex"} position={"relative"} flexShrink={0}>
                  <ImageWithName
                    src={currentStudio?.imageUrl}
                    name={currentStudio?.displayName}
                    sx={{
                      height: isTabletOrMobile ? "80px" : "96px",
                      width: isTabletOrMobile ? "80px" : "96px",
                      color: "about.text.avatarText",
                      border: "1.5px solid",
                      borderColor: "about.avatarBorder",
                    }}
                  />

                  {/*   This code is to add edit option for studio image
                  
                  {canEditStudioProfile && (
                    <Box
                      width={"1.5rem"}
                      height={"1.5rem"}
                      bg={"about.editButtonHoverBg"}
                      borderRadius={"50%"}
                      boxShadow="0px 1px 3px rgba(0, 0, 0, 0.12), 0px 8px 24px rgba(149, 157, 165, 0.2)"
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      position={"absolute"}
                      // zIndex={1}
                      top={isTabletOrMobile ? "55px" : "70px"}
                      left={isTabletOrMobile ? "55px" : "70px"}
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        setUpdateStudioPic(true);
                        setStudioModalOpen(true);
                      }}
                    >
                      <PencilIcon size={14} />
                    </Box>
                  )} */}
                </Box>
                <Box
                  display="flex"
                  flexDirection={"column"}
                  sx={{
                    gap: currentStudio?.description ? "16px" : "0px",
                  }}
                >
                  <Box
                    display="flex"
                    flexDirection={"column"}
                    sx={{
                      gap: "8px",
                    }}
                    alignSelf={"stretch"}
                  >
                    <Box
                      display="flex"
                      justifyContent={"space-between"}
                      sx={{
                        gap: "8px",
                      }}
                      alignSelf={"stretch"}
                    >
                      <Box //frame23
                        display="flex"
                        flexDirection={"column"}
                      >
                        <Box
                          width={["100%", "470px", "450px", "450px"]}
                          maxWidth={"470px"}
                          display={"flex"}
                          justifyContent={"space-between"}
                        >
                          <Box>
                            <Text
                              fontStyle={"normal"}
                              sx={{
                                marginRight: 2,
                                fontWeight: 600,
                                fontSize: "20px",
                                lineHeight: "30px",
                                letterSpacing: "0.3px",
                                color: "about.text.displayName",
                                // width: ["10px", "150px", "300px", "300px"],
                                whiteSpace: "initial",
                                overflowWrap: "anywhere",
                              }}
                            >
                              {currentStudio?.displayName}
                            </Text>
                          </Box>
                          {!isTabletOrMobile && canEditStudioProfile ? (
                            <Box>
                              <Button
                                onClick={onEditStudio}
                                sx={{
                                  ":hover:not([disabled])": {
                                    bg: "about.editButtonHoverBg",
                                  },
                                  ":active:not([disabled])": {
                                    bg: "about.editButtonHoverBg",
                                  },
                                }}
                                aria-label={t("workspace.edit")}
                              >
                                <PencilIcon
                                  color={"about.text.editIconColor"}
                                  size={16}
                                />{" "}
                                <Text
                                  sx={{
                                    fontSize: 12,
                                  }}
                                >
                                  {t("workspace.edit")}
                                </Text>
                              </Button>
                            </Box>
                          ) : !canEditStudioProfile ? (
                            <Box //Join-button
                            >
                              <Button
                                disabled={isLoading}
                                onClick={joinHandler}
                                sx={{
                                  color: currentStudio?.isJoined
                                    ? "about.text.joinedButton"
                                    : currentStudio?.allowPublicMembership ||
                                      !currentStudio?.isRequested
                                    ? "about.text.joinButton"
                                    : "about.text.joinedButton",
                                  fontWeight: 640,
                                }}
                              >
                                {currentStudio?.isJoined
                                  ? "Joined"
                                  : currentStudio?.allowPublicMembership
                                  ? "Join"
                                  : currentStudio?.isRequested
                                  ? "Requested"
                                  : "Request to Join"}
                              </Button>
                            </Box>
                          ) : null}
                        </Box>
                        <Box display={"flex"} alignItems={"center"}>
                          <Text
                            fontStyle={"normal"}
                            sx={{
                              marginRight: 2,
                              fontWeight: 400,
                              fontSize: "16px",
                              lineHeight: "24px",
                              color: "about.text.handle",
                            }}
                          >
                            @{currentStudio?.handle || ""}
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                    <Text
                      fontStyle={"normal"}
                      fontWeight={400}
                      color={"about.text.description"}
                      fontSize={isTabletOrMobile ? "14px" : "16px"}
                      lineHeight={"24px"}
                      marginLeft={["-90px", "-90px", "0px", "0px"]}
                      marginTop={["25px", "25px", "8px", "8px"]}
                      sx={{
                        order: 1,
                        alignSelf: "stretch",
                      }}
                    >
                      {currentStudio?.description}
                    </Text>
                  </Box>
                  {currentStudio?.topics?.length > 0 ? (
                    <Box //tags
                      display={"flex"}
                      marginLeft={["-90px", "-90px", "0px", "0px"]}
                      mb={"16px"}
                      sx={{ gap: "6px" }}
                      flexWrap="wrap"
                    >
                      {currentStudio?.topics?.map((tag, index) =>
                        tag.name ? (
                          <Token
                            size="large"
                            key={index}
                            sx={{
                              fontWeight: 400,
                              fontSize: "14px",
                              bg: "none",
                              paddingX: "12px",
                              color: "about.text.token",
                              borderColor: "about.tokenBorder",
                            }}
                            text={tag.name}
                          />
                        ) : null
                      )}
                    </Box>
                  ) : null}
                  <Box
                    display={"flex"}
                    flexDirection={"column"}
                    sx={{ gap: "10px" }}
                  >
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      marginLeft={["-90px", "-90px", "0px", "0px"]}
                      sx={{ gap: "16px", float: "left" }}
                    >
                      <Box
                        display={"flex"}
                        alignItems={"center"}
                        marginLeft={"0px!important"}
                        sx={{ gap: "4px" }}
                      >
                        <CalendarIcon color={"about.text.calendarIcon"} />

                        <Text
                          sx={{
                            color: "about.text.date",
                            fontWeight: "400",
                            fontSize: ["12px", "14px", "14px", "14px"],
                          }}
                        >
                          {
                            monthEnum[
                              currentStudio?.createdAt
                                ?.slice(0, 7)
                                .split("-")[1]
                            ]
                          }
                        </Text>
                        <Text
                          sx={{
                            color: "about.text.date",
                            fontWeight: "400",
                            fontSize: ["12px", "14px", "14px", "14px"],
                          }}
                        >
                          {currentStudio?.createdAt?.slice(0, 7).split("-")[0]}
                        </Text>
                      </Box>
                      <Box
                        display={"flex"}
                        alignItems={"center"}
                        sx={{ gap: "10px" }}
                      >
                        {currentStudio?.twitter ? (
                          <TwitterIcon
                            height={16}
                            width={16}
                            color={"about.text.twitterIcon"}
                          />
                        ) : null}

                        {currentStudio?.website ? (
                          <Box
                            display={"flex"}
                            alignItems={"center"}
                            sx={{ gap: "5px" }}
                          >
                            <GlobeIcon
                              size={16}
                              color={"about.text.globeIcon"}
                            />
                            <PrimerLink
                              as="button"
                              underline={false}
                              muted={true}
                              hoverColor={"about.text.linkHoverColor"}
                              sx={{ color: "about.text.linkColor" }}
                              onClick={() => {
                                const website = currentStudio.website;
                                if (
                                  website.startsWith("https") ||
                                  website.startsWith("http")
                                ) {
                                  window.open(currentStudio.website);
                                } else {
                                  window.open(`https://${website}`);
                                }
                              }}
                            >
                              <Truncate
                                maxWidth={["130px", "330px", "330px", "330px"]}
                                title={currentStudio.website}
                                inline={true}
                              >
                                {currentStudio.website}
                              </Truncate>
                            </PrimerLink>
                          </Box>
                        ) : null}
                        {currentStudio?.Location ? (
                          <Box display={"flex"} alignItems={"center"}>
                            <LocationIcon
                              size={16}
                              color={"about.text.location"}
                            />
                            <Text
                              sx={{
                                color: "about.text.location",
                                fontSize: 16,
                                cursor: "default",
                              }}
                            >
                              Location
                            </Text>
                          </Box>
                        ) : null}
                      </Box>
                    </Box>
                    <LinkWithoutPrefetch
                      href={`/@${currentStudio?.handle}/members`}
                      sx={{
                        textDecoration: "none!important",
                      }}
                    >
                      <Box marginLeft={["-90px", "-90px", "0px", "0px"]}>
                        <Text
                          sx={{
                            fontSize: ["13px", "14px", "14px", "14px"],
                            fontWeight: 600,
                            color: "about.text.followCount",
                          }}
                        >
                          {currentStudio?.membersCount}{" "}
                        </Text>
                        <Text
                          sx={{
                            fontSize: ["13px", "14px", "14px", "14px"],
                            fontWeight: 400,
                            color: "about.text.followCount",
                          }}
                        >
                          {currentStudio?.membersCount === 1
                            ? "Member"
                            : "Members"}
                        </Text>
                      </Box>
                    </LinkWithoutPrefetch>
                    {isTabletOrMobile && canEditStudioProfile ? (
                      <Box
                        marginLeft={["-90px", "-90px", "0px", "-90px"]}
                        sx={{ float: "left" }}
                      >
                        <Button
                          onClick={onEditStudio}
                          sx={{
                            ":hover:not([disabled])": {
                              bg: "about.editButtonHoverBg",
                            },
                            ":active:not([disabled])": {
                              bg: "about.editButtonHoverBg",
                            },
                          }}
                          aria-label={t("workspace.edit")}
                        >
                          <PencilIcon
                            color={"about.text.pencilIcon"}
                            size={16}
                          />{" "}
                          <Text
                            sx={{
                              fontSize: 12,
                            }}
                          >
                            {t("workspace.edit")}
                          </Text>
                        </Button>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box
              backgroundColor={"about.bg"}
              sx={{
                border: "1px solid",
                borderColor: "about.border",
                boxShadow: "0px 1px 0px rgba(27, 31, 35, 0.04)",
                marginBottom: "200px",
              }}
              // width={["360px", "360px", "600px", "600px"]}

              borderRadius={["0px", "12px", "12px", "12px"]}
            >
              <Box display="flex" flexDirection={"column"} padding={"16px"}>
                <Heading
                  sx={{
                    fontWeight: 600,
                    fontSize: "16px",
                    paddingLeft: "0px!important",
                    paddingBottom: "15px",
                  }}
                >
                  Admins
                </Heading>
                <Box display={"flex"} flexWrap={"wrap"}>
                  {adminList.map((admin, index) => {
                    return (
                      <LinkWithoutPrefetch
                        href={BipRouteUtils.getHandleRoute(admin.user.username)}
                        muted
                        key={index}
                        hoverColor="none"
                      >
                        <Box
                          display={"flex"}
                          flexDirection={"column"}
                          alignItems={"center"}
                          width={"73px"}
                          marginX={"20px"}
                          marginBottom="20px"
                          sx={{
                            overflowWrap: "break-word",
                            whiteSpace: "initial",
                          }}
                        >
                          <Box
                            border={"1px"}
                            borderStyle={"solid"}
                            borderColor={"border.muted"}
                            borderRadius={"100%"}
                          >
                            <Avatar
                              size={48}
                              className="h-12"
                              src={
                                admin.user.avatarUrl || DEFAULT_USER_PLACEHOLDER
                              }
                            />
                          </Box>
                          <Text
                            sx={{
                              fontWeight: "500",
                              fontSize: "14px",
                              lineHeight: "20px",
                              paddingTop: "5px",
                              width: "90px",
                              whiteSpace: "initial",
                              overflowWrap: "break-word",
                              textAlign: "center",
                            }}
                          >
                            {admin.user.fullName || admin.user.username}
                          </Text>
                        </Box>
                      </LinkWithoutPrefetch>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
        {studioModalOpen && (
          <Modal
            closeHandler={() => setStudioModalOpen(false)}
            hideCloseButton
            // sx={{ width: ["80%", "70%", "50%", "40%"] }}
            sx={{
              width: "100%",
              maxWidth: ["352px", "480px", "480px", "480px"],
              marginX: "8px",
            }}
          >
            <CreateStudioModal
              mode="edit"
              updateStudioPic={updateStudioPic}
              closeHandler={() => setStudioModalOpen(false)}
            />
          </Modal>
        )}

        {deleteStudioConfirmOpen && (
          <ConfirmationDialog
            title="Are you sure?"
            onClose={(e) => handleCloseConfirmation(e)}
            confirmButtonType="danger"
            confirmButtonContent="Delete"
          >
            {t("workspace.deleteConfirmationDialog")} `
            {currentStudio?.displayName}`
          </ConfirmationDialog>
        )}
      </StudioHeader>
    </HandleWrapper>
  );
};

AboutPage.getLayout = function getLayout(page: ReactElement, hideSidebar) {
  return <StudioLayout>{page}</StudioLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

AboutPage.auth = false;
export default AboutPage;
