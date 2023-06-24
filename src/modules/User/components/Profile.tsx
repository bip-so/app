import { LocationIcon, PencilIcon, PlusIcon } from "@primer/styled-octicons";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  Heading,
  Text,
  Textarea,
  Truncate,
  Link as PrimerLink,
} from "@primer/react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import UserService from "../services";
import { useUser } from "../../../context/userContext";
import router, { useRouter } from "next/router";
import React, { FC, useEffect, useRef, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import StyledTextInput from "../../../components/StyledTextInput";
import { HandleWrapper } from "../../../hooks/useHandle";
import Modal from "../../../components/Modal";
import ExploreService from "../../Explore/services";
import { useToasts } from "react-toast-notifications";
import { useTranslation } from "next-i18next";
import StudioHeader from "../../../layouts/StudioLayout/components/StudioHeader";
import {
  AVATAR_PLACEHOLDER,
  DEFAULT_USER_PLACEHOLDER,
} from "../../../commons/constants";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";
import { CalendarIcon, GlobeIcon } from "@primer/styled-octicons";
import TwitterIcon from "../../../icons/TwitterIcon";
import BipRouteUtils from "../../../core/routeUtils";
import ImageWithName from "../../../components/ImageWithName";
import { StudioType } from "../../Studio/types";
import AvatarWithPlaceholder from "../../../components/AvatarWithPlaceholder";
import {
  BIP_HANDLE_REGEX,
  BIP_RESTRICTED_HANDLES,
} from "../../../core/constants";
import useDebounce from "../../../hooks/useDebounce";
import AuthService from "../../Auth/services";
import { UserProfileFormType } from "../types";
import StudioService from "../../Studio/services";
import segmentEvents from "../../../insights/segment";
import Link from "next/link";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

interface UserInfoProperties {
  avatarUrl: string;
  createdat: string;
  email: string;
  firstName: string;
  id: Number;
  is_super_user: boolean;
  lastName: string;
  updated_at: string;
  username: string;
  uuid: string;
  followers: Number;
  following: Number;
  userProfile: userProfile;
  fullName: string;
  isFollowing: boolean;
}
interface userProfile {
  bio: string;
  location: string;
  twitterUrl: string;
  userId: Number;
  website: string;
}

interface IUserProfileProps {
  profileUser: any;
}

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

const UserProfile: React.FunctionComponent<IUserProfileProps> = ({
  profileUser,
}) => {
  const { isLoggedIn, user, saveUser } = useUser();
  const { addToast } = useToasts();
  const [studios, setStudios] = useState<StudioType[]>([]);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState(profileUser);
  const { isTabletOrMobile } = useDeviceDimensions();
  const [openEdit, setOpenEdit] = useState(false);

  const [followAPILoading, setFollowAPILoading] = useState(false);

  const [image, setImage] = useState((): File | null => null);
  const [preview, setPreview] = useState((): any => null);
  const [profilePic, setProfilePic] = useState(false);
  const inputFile = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    setUserInfo(profileUser);
  }, [profileUser]);

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .trim()
      .required("Name is required")
      .min(3, "Minimum length is 3")
      .max(30, "Maximum length is 30"),
    username: yup
      .string()
      .trim()
      .required("Username is required")
      .min(3, "Minimum length is 3")
      .max(30, "Maximum length is 30")
      .notOneOf(
        BIP_RESTRICTED_HANDLES,
        `Can't be one of the following: ${BIP_RESTRICTED_HANDLES.join(", ")}`
      ),
    bio: yup.string().optional(),
    location: yup.string().optional(),
    twitterUrl: yup.string().optional(),
    website: yup.string().optional(),
  });
  // .required();

  const { register, handleSubmit, formState, reset, watch, getValues } =
    useForm<UserProfileFormType>({
      resolver: yupResolver(validationSchema),
      mode: "onChange",
      defaultValues: {
        name: `${profileUser.fullName}`,
        username: `${profileUser.username}`,
        bio: `${profileUser.userProfile.bio}`,
        location: `${profileUser.userProfile.location}`,
        twitterUrl: `${profileUser.userProfile.twitterUrl}`,
        website: `${profileUser.userProfile.website}`,
      },
    });
  const { errors, isValid } = formState;

  const handleName = watch("username", "");
  const debounceValue = useDebounce(handleName.trim(), 400);
  const [validatingHandle, setValidatingHandle] = useState<boolean>(false);
  const [validHandle, setValidHandle] = useState<boolean>(false);

  useEffect(() => {
    if (debounceValue?.length > 0) {
      setValidatingHandle(true);
      setValidHandle(false);
      StudioService.checkHandle(debounceValue.trim())
        // AuthService.verifyUsername({ username: debounceValue })
        .then((r) => {
          const available =
            r.data.available &&
            BIP_RESTRICTED_HANDLES.indexOf(debounceValue.trim()) === -1;
          setValidatingHandle(false);
          setValidHandle(available);
        })
        .catch((e) => {
          setValidatingHandle(false);
          setValidHandle(false);
        });
    } else {
      setValidHandle(false);
    }
  }, [debounceValue]);

  useEffect(() => {
    const getStudios = async () => {
      try {
        const response = await UserService.getBootstrap(profileUser.id);
        let studios = response.data.data.userStudios;
        studios = studios.map((x) => {
          return {
            ...x,
            isPersonalSpace: x.id === profileUser.defaultStudioID,
          };
        });
        setStudios(studios);
      } catch (error) {
        console.log(error);
      }
    };
    getStudios();
  }, [profileUser.id]);

  const handleSave = async (Data: any) => {
    const data = new FormData();
    segmentEvents.profileEdited(
      user?.id!,
      user?.email!,
      user?.avatarUrl ? true : false,
      user?.username!,
      Data?.username!,
      user?.fullName!,
      Data?.name!,
      user?.userProfile?.bio!,
      Data?.bio
    );
    if (image) {
      data.append("file", image);
    }
    data.append("fullName", Data.name?.trim());
    data.append("username", Data.username?.trim());
    data.append("bio", Data.bio?.trim());
    data.append("twitterUrl", Data?.twitterUrl?.trim());
    data.append("website", Data?.website?.trim());
    data.append("location", Data?.location?.trim());
    setSaving(true);

    try {
      const response = await UserService.updateUser(data);

      setUserInfo({ ...userInfo, ...response.data.data });
      await saveUser({ ...user, ...response.data.data });
      setOpenEdit(false);
      addToast(`Profile updated successfully`, {
        appearance: "success",
        autoDismiss: true,
      });
      router.push(
        BipRouteUtils.getHandleRoute(response.data.data.username!),
        undefined,
        {
          shallow: true,
        }
      );
    } catch (error) {
      addToast(`Failed to update profile`, {
        appearance: "error",
        autoDismiss: true,
      });
    }
    setSaving(false);
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

  const openFiles = () => {
    if (inputFile) {
      //@ts-ignore
      inputFile.current.value = null;
      //@ts-ignore
      inputFile.current.click();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      setImage(files[0]);
      getPreviewImage(files[0]);
    }
  };

  const handleFollowClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoggedIn) {
      const payload = {
        userId: userInfo?.id,
      };
      setFollowAPILoading(true);
      const { isFollowing } = userInfo;
      try {
        if (isFollowing) {
          await ExploreService.unfollowUser(payload);
        } else {
          await ExploreService.followUser(payload);
        }
        setUserInfo({ ...userInfo, isFollowing: !isFollowing });
        addToast(
          `${isFollowing ? "Unfollowed" : "Following"} ${userInfo?.fullName}`,
          {
            appearance: "success",
            autoDismiss: true,
          }
        );
      } catch (error) {
        addToast(
          `Unable to ${
            isFollowing ? "Unfollow" : "Follow"
          }. Please try again after some time!`,
          {
            appearance: "error",
            autoDismiss: true,
          }
        );
      }
      setFollowAPILoading(false);
    } else {
      router.push(
        `${BipRouteUtils.getSignInRoute()}?returnUrl=${router.asPath}`
      );
    }
  };

  useEffect(() => {
    user?.id !== userInfo?.id &&
      segmentEvents.userViewed(
        userInfo?.id,
        userInfo?.username,
        user?.id!,
        user?.username!
      );
  }, []);

  const resetForm = () => {
    reset({
      name: `${userInfo.fullName}`,
      username: `${userInfo.username}`,
      bio: `${userInfo.userProfile.bio}`,
      location: `${userInfo.userProfile.location}`,
      twitterUrl: `${userInfo.userProfile.twitterUrl}`,
      website: `${userInfo.userProfile.website}`,
    });
  };

  const isLoggedInUsersProfile = user?.id === userInfo?.id;

  const { isFollowing } = userInfo;
  return (
    <HandleWrapper>
      <Box
        display="flex"
        flexDirection={"column"}
        marginX={"auto"}
        sx={{
          gap: "16px",
          marginTop: ["0px", "50px", "50px", "50px"],
        }}
        width={"100%"}
        marginBottom={"200px"}
        maxWidth={"600px"}
        // width={["360px", "360px", "600px", "600px"]}
      >
        <Box
          display="flex"
          flexDirection={"column"}
          marginTop={"10px"}
          justifyContent="space-between"
          alignItems={"center"}
          padding={"16px"}
          sx={{
            border: "1px solid",
            borderColor: "profile.border",
            bg: "profile.bg",
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
            <Box position={"relative"}>
              <Avatar
                style={{
                  height: isTabletOrMobile ? "80px" : "96px",
                  width: isTabletOrMobile ? "80px" : "96px",
                  maxWidth: "96px",
                  // position: "relative",
                }}
                src={userInfo?.avatarUrl || AVATAR_PLACEHOLDER}
                size={isTabletOrMobile ? 80 : 96}
                alt={"studio-image"}
                sx={{
                  border: "1.5px solid",
                  borderColor: "profile.avatarBorder",
                }}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src = AVATAR_PLACEHOLDER;
                }}
              />
              {isLoggedInUsersProfile && (
                <>
                  <Box
                    width={"1.5rem"}
                    height={"1.5rem"}
                    bg={"#fff"}
                    borderRadius={"50%"}
                    boxShadow="0px 1px 3px rgba(0, 0, 0, 0.12), 0px 8px 24px rgba(149, 157, 165, 0.2)"
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    position={"absolute"}
                    zIndex={1}
                    top={isTabletOrMobile ? "55px" : "70px"}
                    left={isTabletOrMobile ? "55px" : "70px"}
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      openFiles();
                      setOpenEdit(true);
                    }}
                  >
                    <PencilIcon size={14} />
                  </Box>
                  <input
                    ref={inputFile}
                    type="file"
                    accept={"image/*"}
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="profile-image-file"
                  />
                </>
              )}
            </Box>
            <Box
              display="flex"
              flexDirection={"column"}
              sx={{
                gap: userInfo?.userProfile?.bio ? "16px" : "0px",
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
                            color: "profile.text.username",
                            width: ["150px", "150px", "300px", "300px"],
                            whiteSpace: "initial",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {userInfo?.fullName || "display Name"}
                        </Text>
                      </Box>
                      {isLoggedInUsersProfile ? (
                        !isTabletOrMobile ? (
                          <Box>
                            <Button
                              onClick={() => {
                                resetForm();
                                setOpenEdit(true);
                              }}
                              sx={{
                                ":hover:not([disabled])": {
                                  bg: "profile.editButtonHoverBg",
                                },
                              }}
                              aria-label="Edit Profile"
                            >
                              <PencilIcon
                                color={"profile.text.pencilIcon"}
                                size={16}
                              />{" "}
                              <Text
                                sx={{
                                  fontSize: 12,
                                }}
                              >
                                Edit Profile
                              </Text>
                            </Button>
                          </Box>
                        ) : null
                      ) : (
                        <Box>
                          <Button
                            onClick={handleFollowClick}
                            disabled={followAPILoading}
                            sx={{
                              color: !isFollowing
                                ? "profile.text.followButton"
                                : "profile.text.followingButton",
                              fontWeight: "600",
                            }}
                          >
                            {isFollowing ? "Following" : "Follow"}
                          </Button>
                        </Box>
                      )}
                    </Box>
                    <Box display={"flex"} alignItems={"center"}>
                      <Text
                        fontStyle={"normal"}
                        sx={{
                          marginRight: 2,
                          fontWeight: 400,
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: "profile.text.handle",
                          whiteSpace: "initial",
                          overflowWrap: "anywhere",
                        }}
                      >
                        @{userInfo?.username}
                      </Text>
                    </Box>
                  </Box>
                </Box>
                <Text
                  fontStyle={"normal"}
                  fontWeight={400}
                  color={"profile.text.bio"}
                  fontSize={isTabletOrMobile ? "14px" : "16px"}
                  lineHeight={"24px"}
                  marginLeft={["-90px", "-90px", "0px", "0px"]}
                  marginTop={["25px", "25px", "8px", "8px"]}
                  sx={{
                    order: 1,
                    alignSelf: "stretch",
                  }}
                >
                  {userInfo?.userProfile?.bio}
                </Text>
              </Box>
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
                    <CalendarIcon color={"profile.text.calendarIcon"} />

                    <Text
                      sx={{
                        color: "profile.text.date",
                        fontWeight: "400",
                        fontSize: "14px",
                      }}
                    >
                      {
                        monthEnum[
                          userInfo?.createdAt?.slice(0, 7).split("-")[1]
                        ]
                      }
                    </Text>
                    <Text
                      sx={{
                        color: "profile.text.date",
                        fontWeight: "400",
                        fontSize: "14px",
                      }}
                    >
                      {userInfo?.createdAt?.slice(0, 7).split("-")[0]}
                    </Text>
                  </Box>
                  <Box
                    display={"flex"}
                    alignItems={"center"}
                    sx={{ gap: "10px" }}
                  >
                    {userInfo?.userProfile.twitterUrl && (
                      <a
                        href={`https://twitter.com/${userInfo?.userProfile.twitterUrl}`}
                      >
                        <TwitterIcon
                          height={16}
                          width={16}
                          color={"profile.text.twitterIcon"}
                        />
                      </a>
                    )}

                    {userInfo?.userProfile?.website ? (
                      <Box
                        display={"flex"}
                        alignItems={"center"}
                        sx={{ gap: "5px" }}
                      >
                        <GlobeIcon size={16} color={"profile.text.globeIcon"} />
                        <PrimerLink
                          as="button"
                          underline={false}
                          muted={true}
                          hoverColor={"profile.text.linkHoverColor"}
                          sx={{ color: "profile.text.linkColor" }}
                          onClick={() => {
                            const website = userInfo?.userProfile?.website;
                            if (
                              website.startsWith("https") ||
                              website.startsWith("http")
                            ) {
                              window.open(userInfo?.userProfile?.website);
                            } else {
                              window.open(`https://${website}`);
                            }
                          }}
                        >
                          <Truncate
                            maxWidth={["60px", "250px", "150px", "150px"]}
                            title={userInfo?.userProfile?.website}
                            inline={true}
                          >
                            {userInfo?.userProfile?.website}
                          </Truncate>
                        </PrimerLink>
                      </Box>
                    ) : null}
                    {userInfo?.userProfile?.location ? (
                      <Box display={"flex"} alignItems={"center"}>
                        <LocationIcon
                          size={16}
                          color={"profile.text.location"}
                        />
                        <Text
                          sx={{
                            color: "profile.text.location",
                            fontSize: 16,
                            cursor: "default",
                          }}
                        >
                          <Truncate
                            maxWidth={"100px"}
                            title={userInfo?.userProfile?.location}
                            inline={true}
                          >
                            {userInfo?.userProfile?.location}
                          </Truncate>
                        </Text>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
                <Box display={"flex"} sx={{ gap: "8px" }}>
                  {/* <Link
                    href={`/@${userInfo?.username}/followers`}
                    sx={{
                      textDecoration: "none!important",
                    }}
                  > */}
                  {userInfo?.followers ? (
                    <LinkWithoutPrefetch
                      href={`/${userInfo?.username}/followers`}
                    >
                      <Box
                        marginLeft={["-90px", "-90px", "0px", "0px"]}
                        sx={{
                          cursor: "pointer",
                        }}
                      >
                        <Text
                          sx={{
                            fontSize: isTabletOrMobile ? "13px" : "14px",
                            fontWeight: 600,
                            color: "profile.text.followCount",
                          }}
                        >
                          {userInfo?.followers}{" "}
                        </Text>
                        <Text
                          sx={{
                            fontSize: isTabletOrMobile ? "13px" : "14px",
                            fontWeight: 400,
                            color: "profile.text.followCount",
                          }}
                        >
                          {userInfo?.followers === 1 ? "Follower" : "Followers"}
                        </Text>
                      </Box>
                    </LinkWithoutPrefetch>
                  ) : (
                    <Box marginLeft={["-90px", "-90px", "0px", "0px"]}>
                      <Text
                        sx={{
                          fontSize: isTabletOrMobile ? "13px" : "14px",
                          fontWeight: 600,
                          color: "profile.text.followCount",
                        }}
                      >
                        {userInfo?.followers}{" "}
                      </Text>
                      <Text
                        sx={{
                          fontSize: isTabletOrMobile ? "13px" : "14px",
                          fontWeight: 400,
                          color: "profile.text.followCount",
                        }}
                      >
                        {userInfo?.followers === 1 ? "Follower" : "Followers"}
                      </Text>
                    </Box>
                  )}

                  {/* </LinkWithoutPrefetch> */}
                  {/* <Link
                    href={`/@${userInfo?.username}/followers`}
                    sx={{
                      textDecoration: "none!important",
                    }}
                  > */}
                  {userInfo?.following ? (
                    <LinkWithoutPrefetch
                      href={`/${userInfo?.username}/followings`}
                    >
                      <Box
                        marginLeft={["0px", "0px", "0px", "0px"]}
                        sx={{
                          cursor: "pointer",
                        }}
                      >
                        <Text
                          sx={{
                            fontSize: isTabletOrMobile ? "13px" : "14px",
                            fontWeight: 600,
                            color: "profile.text.followCount",
                          }}
                        >
                          {userInfo?.following}{" "}
                        </Text>
                        <Text
                          sx={{
                            fontSize: isTabletOrMobile ? "13px" : "14px",
                            fontWeight: 400,
                            color: "profile.text.followCount",
                          }}
                        >
                          Following
                        </Text>
                      </Box>
                    </LinkWithoutPrefetch>
                  ) : (
                    <Box marginLeft={["0px", "0px", "0px", "0px"]}>
                      <Text
                        sx={{
                          fontSize: isTabletOrMobile ? "13px" : "14px",
                          fontWeight: 600,
                          color: "profile.text.followCount",
                        }}
                      >
                        {userInfo?.following}{" "}
                      </Text>
                      <Text
                        sx={{
                          fontSize: isTabletOrMobile ? "13px" : "14px",
                          fontWeight: 400,
                          color: "profile.text.followCount",
                        }}
                      >
                        Following
                      </Text>
                    </Box>
                  )}

                  {/* </LinkWithoutPrefetch> */}
                </Box>
                {isTabletOrMobile && isLoggedInUsersProfile ? (
                  <Box
                    marginLeft={["-90px", "-90px", "0px", "-90px"]}
                    sx={{ float: "left" }}
                  >
                    <Button
                      onClick={() => {
                        resetForm();
                        setOpenEdit(true);
                      }}
                      sx={{
                        ":hover:not([disabled])": {
                          bg: "profile.editButtonHoverBg",
                        },
                      }}
                      aria-label="Edit Profile"
                    >
                      <PencilIcon color={"profile.text.pencilIcon"} size={16} />{" "}
                      <Text
                        sx={{
                          fontSize: 12,
                        }}
                      >
                        Edit Profile
                      </Text>
                    </Button>
                  </Box>
                ) : null}
              </Box>
            </Box>
          </Box>
        </Box>
        {studios.filter((x) => !x.isPersonalSpace).length > 0 && (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "profile.border",
              boxShadow: "0px 1px 0px rgba(27, 31, 35, 0.04)",
            }}
            width={"100%"}
            maxWidth={"600px"}
            backgroundColor={"profile.bg"}
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
                {t("workspace.workspaces")}
              </Heading>
              <Box display={"flex"} flexWrap={"wrap"}>
                {studios
                  .filter((x) => !x.isPersonalSpace)
                  .map((studio, index) => {
                    return (
                      <LinkWithoutPrefetch
                        href={BipRouteUtils.getHandleRoute(studio.handle)}
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
                            cursor: "pointer",
                          }}
                        >
                          <Box
                            border={"1px"}
                            borderStyle={"solid"}
                            borderColor={"profile.studioBorder"}
                            borderRadius={"100%"}
                          >
                            <ImageWithName
                              className="h-12"
                              src={studio.imageUrl}
                              name={studio.displayName}
                              sx={{
                                height: "48px",
                                width: "48px",
                                color: "profile.text.username",
                              }}
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
                              color: "profile.text.handle",
                            }}
                          >
                            {studio?.displayName || studio?.handle}
                          </Text>
                        </Box>
                      </LinkWithoutPrefetch>
                    );
                  })}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {openEdit && (
        <Modal
          closeHandler={() => setOpenEdit(false)}
          hideCloseButton
          // sx={{ width: ["80%", "70%", "50%", "40%"] }}
          sx={{
            overflow: "hidden",
            width: "100%",
            maxWidth: ["352px", "480px", "480px", "480px"],
            marginX: "8px",
          }}
        >
          <>
            <form onSubmit={handleSubmit(handleSave)}>
              <Box display={"flex"} flexDirection={"column"}>
                <Box
                  display={"flex"}
                  // p={"16px"}
                  // width={"500px"}
                  borderRadius={"12px"}
                  // mt={"40px"}
                  flexDirection={"column"}
                  // sx={{
                  //   boxShadow: "0 0 12px rgba(33,33,33,.2)",
                  // }}
                >
                  <Box fontWeight={600} fontSize={"24px"} mb={"3px"}>
                    <div>Edit Profile</div>
                  </Box>
                  <hr />
                  <Box
                    display={"flex"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    mt={"5px"}
                  >
                    <Box display={"flex"} flexDirection={"column"}>
                      <Box
                        mx="auto"
                        borderRadius={"50%"}
                        border="1px solid"
                        borderColor={"editModal.avatarBorder"}
                        position={"relative"}
                        width={"108px"}
                        height={"108px"}
                      >
                        <AvatarWithPlaceholder
                          src={preview || userInfo?.avatarUrl}
                          alt={"profile-image"}
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
                      </Box>
                    </Box>
                    <Box
                      display={"flex"}
                      flexDirection={"column"}
                      fontSize={"20px"}
                      lineHeight={"28px"}
                      width={"320px"}
                    >
                      <FormControl>
                        <FormControl.Label>Name</FormControl.Label>
                        <StyledTextInput
                          {...register("name")}
                          width={5}
                          placeholder="Your Name"
                          emptyBoxHeight={"0px"}
                        />
                      </FormControl>
                      <Text
                        className="text-xs font-normal"
                        sx={{
                          color: "styledTextInput.errorColor",
                        }}
                      >
                        {errors?.name?.message}
                      </Text>
                      <FormControl>
                        <FormControl.Label>Username</FormControl.Label>
                        <StyledTextInput
                          {...register("username")}
                          // required
                          placeholder="@handle"
                          emptyBoxHeight={"0px"}
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
                          showWarning={
                            !validHandle &&
                            !validatingHandle &&
                            handleName?.length > 0 &&
                            profileUser.username !== handleName
                          }
                          warningMessage={t("auth.usernameAlreadyExists")}
                        />
                      </FormControl>
                      <Text
                        fontSize={"12px"}
                        lineHeight={"16px"}
                        fontWeight={400}
                        sx={{
                          color: "styledTextInput.errorColor",
                        }}
                      >
                        {errors?.username?.message}
                      </Text>
                    </Box>
                  </Box>
                  <FormControl sx={{ mb: "16px" }}>
                    <FormControl.Label>Bio</FormControl.Label>
                    <Textarea
                      {...register("bio", {
                        // required: "Bio is required",
                        minLength: {
                          value: 5,
                          message: "Minimum length is 5",
                        },
                        maxLength: {
                          value: 200,
                          message: "Maximum length is 40",
                        },
                      })}
                      placeholder={"A few words about you"}
                      rows={3}
                      sx={{
                        bg: "styledTextInput.bg",
                        border: "1px solid",
                        boxShadow: "inset 0px 1px 2px rgba(27, 31, 35, 0.075)",
                        borderColor: "styledTextInput.border",
                        width: "100%",
                        ":focus-within": {
                          border: "1px solid",
                          borderColor: "styledTextInput.focusBorder",
                          boxShadow: "0px 0px 0px 3px rgba(3, 102, 214, 0.3)",
                        },
                      }}
                    />
                  </FormControl>
                  <Text
                    className="text-xs font-normal"
                    sx={{ color: "styledTextInput.errorColor" }}
                  >
                    {errors?.bio?.message}
                  </Text>
                  <FormControl>
                    <FormControl.Label>Location</FormControl.Label>
                    <StyledTextInput
                      {...register("location", {
                        // required: "Location is required",
                      })}
                      placeholder="Where is your holy abode?"
                      emptyBoxHeight={"0px"}
                    />
                  </FormControl>
                  <Text
                    className="text-xs font-normal"
                    sx={{ color: "styledTextInput.errorColor" }}
                  >
                    {errors?.location?.message}
                  </Text>
                  <FormControl>
                    <FormControl.Label>Website</FormControl.Label>
                    <StyledTextInput
                      {...register("website")}
                      placeholder="One link to know more about you"
                      emptyBoxHeight={"0px"}
                    />
                  </FormControl>
                  <FormControl>
                    <FormControl.Label>Twitter Username</FormControl.Label>
                    <StyledTextInput
                      {...register("twitterUrl")}
                      placeholder="@Your twitter username"
                      emptyBoxHeight={"0px"}
                    />
                  </FormControl>
                  <div className="flex justify-end px-1 mt-4 space-x-2">
                    <Button
                      type={"reset"}
                      onClick={() => {
                        reset();
                        setPreview(null);
                        setOpenEdit(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={
                        !isValid ||
                        validatingHandle ||
                        (!validHandle && profileUser.username !== handleName)
                      }
                      variant={"primary"}
                      sx={{ border: "none" }}
                      type={"submit"}
                    >
                      {saving ? t("auth.saving") + "..." : t("auth.save")}
                    </Button>
                  </div>
                </Box>
              </Box>
            </form>
          </>
        </Modal>
      )}
    </HandleWrapper>
  );
};

export default UserProfile;
