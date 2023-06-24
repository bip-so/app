import { Box, Text, Button, Token, Tooltip } from "@primer/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@primer/styled-octicons";
import { FC, useState, useMemo } from "react";

import * as React from "react";
import BipRouteUtils from "../../../core/routeUtils";
import { useUser } from "../../../context/userContext";
import { useRouter } from "next/router";
import {
  STUDIOS_LIST,
  STUDIOS_LIST_MOBILE,
  StudioList,
} from "../../../core/studioLists";
import ImageWithName from "../../../components/ImageWithName";
import StudioService from "../../Studio/services";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";
import useDeviceDimensions from "../../../hooks/useDeviceDimensions";

interface AuthStudioCardProps {}

const AuthStudioCard: FC<AuthStudioCardProps> = (studio: any) => {
  const [isJoined, setIsJoined] = useState(studio.isJoined);
  const [isRequested, setIsRequested] = useState(studio.isRequested);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, user } = useUser();
  const router = useRouter();

  const { isTabletOrMobile } = useDeviceDimensions();

  const [selectedFeedback, setSelectedFeedback] = useState(
    (): StudioList[] => STUDIOS_LIST[0]
  );

  const [selectedStudios, setSelectedStudios] = useState(
    (): StudioList => STUDIOS_LIST_MOBILE[0]
  );

  const currentIndex = useMemo(() => {
    return STUDIOS_LIST.findIndex(
      (feed) => feed[0].id === selectedFeedback[0].id
    );
  }, [selectedFeedback]);

  const isFirst = useMemo(() => {
    return selectedFeedback[0].id === STUDIOS_LIST[0][0].id;
  }, [selectedFeedback]);

  const isLast = useMemo(() => {
    return (
      selectedFeedback[0].id === STUDIOS_LIST[STUDIOS_LIST.length - 1][0].id
    );
  }, [selectedFeedback]);

  const currentIndexMob = useMemo(() => {
    return STUDIOS_LIST_MOBILE.findIndex(
      (feed) => feed?.id === selectedStudios?.id
    );
  }, [selectedStudios]);

  const isFirstMob = useMemo(() => {
    return selectedStudios.id === STUDIOS_LIST_MOBILE[0].id;
  }, [selectedStudios]);

  const isLastMob = useMemo(() => {
    return (
      selectedStudios.id ===
      STUDIOS_LIST_MOBILE[STUDIOS_LIST_MOBILE.length - 1].id
    );
  }, [selectedStudios]);

  const requestToJoin = () => {
    setIsLoading(true);
    StudioService.requestToJoin(studio.id)
      .then((r) => {
        setIsRequested(true);
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  const joinHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoggedIn) {
      requestToJoin();
    } else logout();
  };

  const logout = () => {
    window.location.replace(
      `${BipRouteUtils.getSignInRoute()}?returnUrl=${router.asPath}`
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        mx: "80px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isTabletOrMobile ? (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bg: "#44B244",
              opacity: isFirstMob ? 0.5 : 1,
              width: ["32px", "32px", "64px", "64px"],
              height: ["32px", "32px", "64px", "64px"],
              borderRadius: "50%",
              mr: "20px",
              cursor: isFirstMob ? "default" : "pointer",
            }}
            onClick={() => {
              if (!isFirstMob) {
                setSelectedStudios(STUDIOS_LIST_MOBILE[currentIndexMob - 1]);
              }
            }}
          >
            <ChevronLeftIcon color={"#fff"} />
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <LinkWithoutPrefetch
              key={selectedStudios.id}
              href={BipRouteUtils.getHandleRoute(selectedStudios.handle)}
              muted
              hoverColor="none"
            >
              <Box
                sx={{
                  boxShadow: "0 3px 6px rgba(140,149,159,.15)",
                  cursor: "pointer",
                }}
                backgroundColor={"#FFFFFF"}
                display={"flex"}
                flexDirection="column"
                alignItems="center"
                position={"relative"}
                width={"236px"}
                borderRadius="12px"
                borderWidth="1px"
                height={"356px"}
                justifyContent={"space-between"}
                borderColor={"#DCE1E6"}
                borderStyle="solid"
                // marginLeft="20px"
                // marginRight="20px"
                alignSelf={"stretch"}
              >
                <Box
                  display={"flex"}
                  flexDirection="column"
                  padding={"12px 12px 0px"}
                  justifyContent={"space-between"}
                  width={"100%"}
                  height={"144px"}
                  alignItems={"flex-start"}
                >
                  <Box display={"flex"} flexDirection={"row"} width={"100%"}>
                    <Box
                      display={"flex"}
                      alignItems={"flex-start"}
                      flexDirection="column"
                      height={"84px"}
                      justifyContent="space-between"
                      flex={1}
                    >
                      <Box
                        display={"flex"}
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                        width={"100%"}
                      >
                        <ImageWithName
                          sx={{
                            height: "48px",
                            width: "48px",
                            color: "text.default",
                          }}
                          src={selectedStudios.img}
                          name={selectedStudios.displayName}
                        />
                        <Box
                          display={"flex"}
                          alignItems={"flex-start"}
                          flexDirection="row"
                        >
                          <Button
                            disabled={isLoading}
                            id={"explore-studio-join-btn"}
                            onClick={joinHandler}
                            sx={{
                              border: 0,
                              paddingX: "10px",
                              bg: "unset",
                              ":hover:not([disabled])": {
                                bg: "#F9F9F9 !important",
                              },
                              color: !isJoined
                                ? "collectionItem.nodeName"
                                : "studioCard.text.joinedButton",
                              fontWeight: 600,
                              ml: isJoined ? "-75px" : "-56px",
                            }}
                          >
                            {isJoined
                              ? "Joined"
                              : studio.allowPublicMembership
                              ? "Join"
                              : isRequested
                              ? "Requested"
                              : "Request to Join"}
                          </Button>
                        </Box>
                      </Box>
                      <Text
                        color={"#484F58"}
                        fontWeight={600}
                        fontSize="16px"
                        lineHeight={"24px"}
                        sx={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          width: "150px",
                          whiteSpace: "nowrap",
                          overflowWrap: "break-word",
                        }}
                      >
                        {selectedStudios.displayName}
                      </Text>
                    </Box>
                  </Box>
                  <Box
                    display={"flex"}
                    flexDirection={"row"}
                    justifyContent="space-between"
                    padding="2px"
                  >
                    <Text
                      fontStyle={"normal"}
                      fontWeight={400}
                      fontSize="14px"
                      color={"#484F58"}
                      lineHeight={"20px"}
                    >
                      {selectedStudios.membersCount}
                    </Text>
                    <Text
                      fontWeight={400}
                      fontSize="14px"
                      lineHeight={"20px"}
                      sx={{
                        pl: "6px",
                        color: "studioCard.text.members",
                      }}
                    >
                      Members
                    </Text>
                  </Box>
                </Box>
                <Box
                  display={"flex"}
                  justifyContent="space-between"
                  alignItems={"center"}
                  flexDirection={"column"}
                  borderRadius="12px"
                  bg={"#F6F8FA"}
                  minHeight={"188px"}
                  padding="12px 12px 20px"
                  alignSelf="stretch"
                >
                  <Box
                    display={"flex"}
                    flexDirection={"row"}
                    justifyContent="space-between"
                    padding="2px"
                  >
                    <Tooltip
                      aria-label={selectedStudios.description}
                      noDelay
                      sx={{
                        display: "content",
                        "::after": {
                          bg: "#30363D",
                          color: "#fff",
                          fontWeight: 600,
                          maxWidth: `210px !important`,
                          textAlign: "start",
                        },
                        "::before": {
                          borderTopColor: "#30363D !important",
                          color: "rgba(0, 0, 0, 0.65)",
                        },
                      }}
                      wrap
                      direction="n"
                    >
                      <Text
                        fontStyle={"normal"}
                        fontWeight={400}
                        fontSize="14px"
                        color={"#484F58"}
                        lineHeight={"20px"}
                        style={{
                          display: "-webkit-Box",
                          overflow: "hidden",
                          WebkitLineClamp: "3",
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {selectedStudios.description}
                      </Text>
                    </Tooltip>
                  </Box>
                  <Box display={"flex"} padding="2px" flexWrap={"wrap"}>
                    {selectedStudios.tags?.map(
                      (tag: any, i: number) => (
                        // tag ? (
                        <Token
                          size="large"
                          key={i}
                          sx={{
                            fontWeight: 400,
                            fontSize: "12px",
                            mx: 1,
                            bg: "none",
                            padding: "1px 12px",
                            color: "#484F58",
                            border: "1px solid",
                            borderColor: "setup.avatarBorder",
                            my: "2px",
                          }}
                          text={tag}
                        />
                      )
                      // ) : null
                    )}
                  </Box>
                </Box>
              </Box>
            </LinkWithoutPrefetch>
            <Box
              display={"flex"}
              sx={{ gap: "6px", mt: ["24px", "24px", "48px", "48px"] }}
            >
              {STUDIOS_LIST_MOBILE.map((item, index) => (
                <Box
                  key={item.id}
                  sx={{
                    width: ["8px", "8px", "12px", "12px"],
                    height: ["8px", "8px", "12px", "12px"],
                    borderRadius: "50%",
                    cursor: currentIndexMob === index ? "default" : "pointer",
                    bg:
                      currentIndexMob === index
                        ? "landing.testimonials.box.subText"
                        : "#DCE1E6",
                  }}
                  onClick={() => {
                    setSelectedStudios(STUDIOS_LIST_MOBILE[index]);
                  }}
                />
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bg: "#44B244",
              opacity: isLastMob ? 0.5 : 1,
              width: ["32px", "32px", "64px", "64px"],
              height: ["32px", "32px", "64px", "64px"],
              borderRadius: "50%",
              ml: "20px",
              cursor: isLastMob ? "default" : "pointer",
            }}
            onClick={() => {
              // if (!isLast) {
              //   setSelectedFeedback(STUDIOS_LIST[currentIndex + 1]);
              // }
              if (!isLastMob) {
                setSelectedStudios(STUDIOS_LIST_MOBILE[currentIndexMob + 1]);
              }
            }}
          >
            <ChevronRightIcon color={"#fff"} />
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bg: "#44B244",
              opacity: isFirst ? 0.5 : 1,
              width: ["32px", "32px", "64px", "64px"],
              height: ["32px", "32px", "64px", "64px"],
              borderRadius: "50%",
              mr: "32px",
              cursor: isFirst ? "default" : "pointer",
            }}
            onClick={() => {
              if (!isFirst) {
                setSelectedFeedback(STUDIOS_LIST[currentIndex - 1]);
              }
            }}
          >
            <ChevronLeftIcon color={"#fff"} />
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            width={"60%"}
            alignItems={"center"}
          >
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              {selectedFeedback.map((st: any, i: any) => (
                <LinkWithoutPrefetch
                  key={i}
                  href={BipRouteUtils.getHandleRoute(st.handle)}
                  muted
                  hoverColor="none"
                >
                  <Box
                    sx={{
                      boxShadow: "0 3px 6px rgba(140,149,159,.15)",
                      cursor: "pointer",
                    }}
                    backgroundColor={"#FFFFFF"}
                    display={"flex"}
                    flexDirection="column"
                    alignItems="center"
                    // position={"relative"}
                    width={"30%"}
                    borderRadius="12px"
                    borderWidth="1px"
                    height={"356px"}
                    justifyContent={"space-between"}
                    borderColor={"#DCE1E6"}
                    borderStyle="solid"
                    marginLeft="10px"
                    marginRight="10px"
                    // alignSelf={"stretch"}
                  >
                    <Box
                      display={"flex"}
                      flexDirection="column"
                      padding={"12px 12px 0px"}
                      justifyContent={"space-between"}
                      width={"100%"}
                      height={"144px"}
                      alignItems={"flex-start"}
                    >
                      <Box
                        display={"flex"}
                        flexDirection={"row"}
                        width={"100%"}
                      >
                        <Box
                          display={"flex"}
                          alignItems={"flex-start"}
                          flexDirection="column"
                          height={"84px"}
                          justifyContent="space-between"
                          flex={1}
                        >
                          <Box
                            display={"flex"}
                            flexDirection={"row"}
                            justifyContent={"space-between"}
                            width={"100%"}
                          >
                            <ImageWithName
                              sx={{
                                height: "48px",
                                width: "48px",
                                color: "text.default",
                              }}
                              src={st.img}
                              name={st.displayName}
                            />
                            <Box
                              display={"flex"}
                              alignItems={"flex-start"}
                              flexDirection="row"
                            >
                              <Button
                                disabled={isLoading}
                                id={"explore-studio-join-btn"}
                                onClick={joinHandler}
                                sx={{
                                  border: 0,
                                  paddingX: "10px",
                                  bg: "unset",
                                  ":hover:not([disabled])": {
                                    bg: "#F9F9F9 !important",
                                  },
                                  color: !isJoined
                                    ? "collectionItem.nodeName"
                                    : "studioCard.text.joinedButton",
                                  fontWeight: 600,
                                  ml: isJoined ? "-75px" : "-56px",
                                }}
                              >
                                {isJoined
                                  ? "Joined"
                                  : studio.allowPublicMembership
                                  ? "Join"
                                  : isRequested
                                  ? "Requested"
                                  : "Request to Join"}
                              </Button>
                            </Box>
                          </Box>
                          <Text
                            color={"#484F58"}
                            fontWeight={600}
                            fontSize="16px"
                            lineHeight={"24px"}
                            sx={{
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              width: "150px",
                              whiteSpace: "nowrap",
                              overflowWrap: "break-word",
                            }}
                          >
                            {st.displayName}
                          </Text>
                        </Box>
                      </Box>
                      <Box
                        display={"flex"}
                        flexDirection={"row"}
                        justifyContent="space-between"
                        padding="2px"
                      >
                        <Text
                          fontStyle={"normal"}
                          fontWeight={400}
                          color={"#484F58"}
                          fontSize="14px"
                          lineHeight={"20px"}
                        >
                          {st.membersCount}
                        </Text>
                        <Text
                          fontWeight={400}
                          fontSize="14px"
                          lineHeight={"20px"}
                          sx={{
                            pl: "6px",
                            color: "#B1BAC4",
                          }}
                        >
                          Members
                        </Text>
                      </Box>
                    </Box>
                    <Box
                      display={"flex"}
                      justifyContent="space-between"
                      alignItems={"center"}
                      flexDirection={"column"}
                      borderRadius="12px"
                      bg={"#F6F8FA"}
                      minHeight={"188px"}
                      padding="12px 12px 20px"
                      alignSelf="stretch"
                    >
                      <Box
                        display={"flex"}
                        flexDirection={"row"}
                        justifyContent="space-between"
                        padding="2px"
                      >
                        <Tooltip
                          aria-label={st.description}
                          noDelay
                          sx={{
                            display: "content",
                            "::after": {
                              bg: "#30363D",
                              color: "#fff",
                              fontWeight: 600,
                              maxWidth: `210px !important`,
                              textAlign: "start",
                            },
                            "::before": {
                              borderTopColor: "#30363D !important",
                              color: "rgba(0, 0, 0, 0.65)",
                            },
                          }}
                          wrap
                          direction="n"
                        >
                          <Text
                            fontStyle={"normal"}
                            fontWeight={400}
                            fontSize="14px"
                            color={"#484F58"}
                            lineHeight={"20px"}
                            style={{
                              display: "-webkit-Box",
                              overflow: "hidden",
                              WebkitLineClamp: "3",
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {st.description}
                          </Text>
                        </Tooltip>
                      </Box>
                      <Box display={"flex"} padding="2px" flexWrap={"wrap"}>
                        {st.tags?.map(
                          (tag: any, i: number) => (
                            // tag ? (
                            <Token
                              size="large"
                              key={i}
                              sx={{
                                fontWeight: 400,
                                fontSize: "12px",
                                mx: 1,
                                bg: "none",
                                padding: "1px 12px",
                                color: "#484F58",
                                border: "1px solid",
                                borderColor: "setup.avatarBorder",
                                my: "2px",
                              }}
                              text={tag}
                            />
                          )
                          // ) : null
                        )}
                      </Box>
                    </Box>
                  </Box>
                </LinkWithoutPrefetch>
              ))}
            </Box>
            <Box
              display={"flex"}
              sx={{ gap: "6px", mt: ["24px", "24px", "48px", "48px"] }}
            >
              {STUDIOS_LIST.map((item, index) => (
                <Box
                  key={item[0].id}
                  sx={{
                    width: ["8px", "8px", "12px", "12px"],
                    height: ["8px", "8px", "12px", "12px"],
                    borderRadius: "50%",
                    cursor: currentIndex === index ? "default" : "pointer",
                    bg:
                      currentIndex === index
                        ? "landing.testimonials.box.subText"
                        : "#DCE1E6",
                  }}
                  onClick={() => {
                    setSelectedFeedback(STUDIOS_LIST[index]);
                  }}
                />
              ))}
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bg: "#44B244",
              opacity: isLast ? 0.5 : 1,
              width: ["32px", "32px", "64px", "64px"],
              height: ["32px", "32px", "64px", "64px"],
              borderRadius: "50%",
              ml: "32px",
              cursor: isLast ? "default" : "pointer",
            }}
            onClick={() => {
              if (!isLast) {
                setSelectedFeedback(STUDIOS_LIST[currentIndex + 1]);
              }
            }}
          >
            <ChevronRightIcon color={"#fff"} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default AuthStudioCard;
