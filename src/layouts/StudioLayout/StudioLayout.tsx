import {
  Avatar,
  Box,
  IconButton,
  PageLayout,
  Text,
  CounterLabel,
  ActionMenu,
  Button,
  Truncate,
  Tooltip,
} from "@primer/react";
import { NavList } from "@primer/react/drafts";
import Link from "next/link";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  DownloadIcon,
  PlusCircleIcon,
  PlusIcon,
} from "@primer/styled-octicons";

import { useStudio } from "../../context/studioContext";
import { useUser } from "../../context/userContext";

import { LayoutProps } from "../../commons/interfaces";
import { NavIcon } from "../../core/types";
import NavIconLink from "./components/NavIcon";
import CreateStudioModal from "../../modules/Studio/components/StudioModal";
import Modal from "../../components/Modal";
import UserMenu from "../../modules/Sidebar/components/UserMenu";
import CollectionTree from "../../modules/Collections/components/CollectionTree";
import { NAV_ITEMS, STUDIO_DETAIL_NAV_ITEMS } from "../../core/constants";
import ImageWithName from "../../components/ImageWithName";
import { useLayout } from "../../context/layoutContext";
import { DndProvider } from "react-dnd";
import { getBackendOptions, MultiBackend } from "@minoru/react-dnd-treeview";
import Container from "../../modules/Notifications/Container";
import BipRouteUtils from "../../core/routeUtils";
import NotificationService from "../../modules/Notifications/services";
import useDeviceDimensions from "../../hooks/useDeviceDimensions";
import LayoutFAB from "../../components/LayoutFAB";
import Settings from "../../modules/Studio/components/settings";
import {
  PermissionContextEnum,
  useHasPermission,
} from "../../hooks/useHasPermission";
import {
  CollectionPermissionEnum,
  CollectionPermissionGroupEnum,
  StudioPermissionEnum,
} from "../../modules/Permissions/enums";
import { useRouter } from "next/router";
import DoubleChevronLeftIcon from "../../icons/DoubleChevronLeftIcon";
import DoubleChevronRightIcon from "../../icons/DoubleChevronRightIcon";
import LoginButton from "../../modules/User/components/LoginButton";
import DraftsTree from "./components/DraftsTree";
import Crisp from "../../insights/crisp";
import Head from "next/head";
import segmentEvents from "../../insights/segment";
import { useCanvas } from "../../context/canvasContext";
import ImportNotions from "../../components/ImportNotions";
import StudioService from "../../modules/Studio/services";
import { PageType, usePages } from "../../context/pagesContext";
import { BranchAccessEnum } from "../../modules/Canvas/enums";
import CollectionService from "../../modules/Collections/services";
import { HttpStatusCode } from "../../commons/enums";
import { useToasts } from "react-toast-notifications";
import { supabase } from "../../utils/supabaseClient";
import { SUPABASE_TABLES } from "../../realtime/constants";
import { useTranslation } from "next-i18next";
import LinkWithoutPrefetch from "../../components/LinkWithoutPrefetch";

const TRANSITION_DELAY = "0.2s";

const StudioLayout: FC<LayoutProps> = ({ children, whiteBg, ...props }) => {
  const { t } = useTranslation();
  const { studios, personalSpace, saveNotificationCount } = useStudio();
  const { isLoggedIn, user, initUserStudios } = useUser();
  const { isSideNavOpen, setIsSideNavOpen, isPinned } = useLayout();

  const [fetchingBootstrap, setFetchingBootstrap] = useState<boolean>(false);

  const [createStudioOpen, setCreateStudioOpen] = useState<boolean>(false);
  const { currentStudio, clearCurrentStudio, saveCurrentStudio } = useStudio();
  const { pages, updatePages, drafts } = usePages();
  const { addToast } = useToasts();

  const { repo, isPublicView } = useCanvas();

  const getCanvasRoute = isPublicView
    ? BipRouteUtils.getPublicCanvasRoute
    : BipRouteUtils.getCanvasRoute;

  const canManageSettings =
    useHasPermission(
      StudioPermissionEnum.STUDIO_CREATE_DELETE_ROLE,
      PermissionContextEnum.Studio
    ) && isLoggedIn;
  const router = useRouter();
  const handle = router.query.handle as string;
  const inviteCode = router.query.inviteCode as string;
  const slug = router.query.slug as string;
  const slugTokens = slug?.split("-") || [];
  const title = slugTokens.slice(0, -1).join("-");
  const { open_settings, isNewStudio } = router.query;
  const [notificationsCount, setNotificationsCount] = useState<number>(0);
  const [studioNotificationCount, setStudioNotificationCount] = useState([]);

  const [showSettings, setShowSettings] = useState(false);
  const [showImportNotion, setShowImportNotion] = useState(false);

  const collectionTreeRef = useRef(null);

  const isPersonalStudio = currentStudio?.id === user?.defaultStudioID;

  useEffect(() => {
    isLoggedIn &&
      (async () => {
        try {
          const resp = await NotificationService.getNotificationsCount();
          setNotificationsCount(Number(resp.data.data.all));
        } catch (err) {
          console.log(err);
        }
      })();
  }, []);

  const checkUserStudiosUpdate = async () => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .select("studio_update")
      .eq("user_id", user?.id);
    if (!error && data?.length) {
      return data[0].studio_update;
    }
    return false;
  };

  const resetUserStudiosUpdate = async () => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.USERS)
      .update({ studio_update: false })
      .eq("user_id", user?.id);
  };

  useEffect(() => {
    if (!router.isReady || fetchingBootstrap) return;
    if (
      isNewStudio !== "true" &&
      open_settings &&
      !isTabletOrMobile &&
      canManageSettings
    ) {
      setShowSettings(Boolean(open_settings));
    }
  }, [router.isReady, open_settings, canManageSettings, fetchingBootstrap]);

  useEffect(() => {
    const syncUserStudios = async () => {
      setFetchingBootstrap(true);
      // const userStudiosUpdated = await checkUserStudiosUpdate();
      // if (userStudiosUpdated) {
      await initUserStudios(user!);
      localStorage.removeItem("refetchBootstrap");
      setFetchingBootstrap(false);
      // await resetUserStudiosUpdate();
      // }
    };
    const isNewDiscordUser = Boolean(localStorage.getItem("refetchBootstrap"));
    if (isNewDiscordUser && user) {
      syncUserStudios();
    }
  }, [user]);

  useEffect(() => {
    if (!router.isReady || fetchingBootstrap) return;
    const updateMemberCount = async () => {
      const membersCountResp = await StudioService.getMembersCount();
      if (membersCountResp.data) {
        saveCurrentStudio({
          ...currentStudio!,
          membersCount: membersCountResp.data?.data?.members,
        });
      }
    };

    if (open_settings && currentStudio) {
      updateMemberCount();
    }
  }, [fetchingBootstrap]);

  const { isTabletOrMobile } = useDeviceDimensions();

  const finalNavItems = [...NAV_ITEMS];

  useEffect(() => {
    if (document) {
      showSettings
        ? (document.body.style.overflow = "hidden")
        : (document.body.style.overflow = "unset");
    }
  }, [showSettings]);

  const getLastCollection = () => {
    const collectionPages = pages?.filter(
      (page) =>
        page.type === "COLLECTION" &&
        (page?.permission !== CollectionPermissionGroupEnum.NONE ||
          page.publicAccess !== BranchAccessEnum.PRIVATE)
    );
    if (collectionPages?.length) {
      return collectionPages[collectionPages.length - 1];
    }
    return null;
  };

  const canViewMetaData = useHasPermission(
    CollectionPermissionEnum.COLLECTION_VIEW_METADATA,
    PermissionContextEnum.Collection,
    getLastCollection()?.permissionGroup?.permissions
  );

  const canCreateCanvas = () => {
    const node = getLastCollection();
    if (node) {
      return canViewMetaData || node.publicAccess !== BranchAccessEnum.PRIVATE;
    }
    return false;
  };

  const getCanvases = async (node: any) => {
    try {
      const resp = await CollectionService.getCanvasRepo(
        {
          parentCollectionID: node.id,
          parentCanvasRepositoryID: 0,
        },
        isPublicView
      );
      const canvases = resp.data.data;
      const pagesIds = pages.map((page) => page.id);
      const filteredCanvases = canvases.filter(
        (can: PageType) => !pagesIds.includes(can.id)
      );
      let tempPages = [...pages, ...filteredCanvases];
      const rootCanvasCount = tempPages.filter(
        (page) => page.collectionID && !page.parentCanvasRepositoryID
      ).length;
      tempPages = tempPages.map((el) =>
        el.id === node.id
          ? {
              ...node,
              computedRootCanvasCount: rootCanvasCount,
              areCanvasesFetched: true,
            }
          : el
      );
      updatePages(tempPages);
      collectionTreeRef?.current?.addOpenId &&
        collectionTreeRef?.current?.addOpenId(node.id);
    } catch (err) {
      addToast("Something went wrong while fetching canvases.", {
        appearance: "error",
        autoDismiss: true,
      });
      console.log(err);
    }
  };

  const createNewCanvas = async () => {
    const node: any = getLastCollection();
    if (node) {
      try {
        isTabletOrMobile && setIsSideNavOpen(false);
        const resp = await CollectionService.createCanvas({
          name: "New Canvas",
          collectionID: node.id,
          position: 1,
        });

        const newCanvasRepo = resp.data.data;

        await router.push(`
         ${getCanvasRoute(
           currentStudio?.handle!,
           newCanvasRepo.name,
           newCanvasRepo.defaultBranch.id
         )}?isNew=true`);

        if (node?.areCanvasesFetched || node?.computedRootCanvasCount === 0) {
          const newPage = {
            ...newCanvasRepo,
            parent: newCanvasRepo.collectionID,
          };
          const tempPages = [newPage, ...pages];
          const collectionIndex = tempPages.findIndex(
            (page) => page.id === node.id
          );
          const tempCollection = {
            ...tempPages[collectionIndex],
            computedRootCanvasCount: node.computedRootCanvasCount + 1,
            areCanvasesFetched: true,
          };
          tempPages[collectionIndex] = tempCollection;
          updatePages(tempPages);
        } else {
          const tempPages = [...pages];
          const collectionIndex = tempPages.findIndex(
            (page) => page.id === node.id
          );
          const tempCollection = {
            ...tempPages[collectionIndex],
            computedRootCanvasCount: node.computedRootCanvasCount + 1,
          };
          tempPages[collectionIndex] = tempCollection;
          updatePages(tempPages);
        }
        // if (newCanvasRepo.nudge) {
        //   addToast(t("billing.limitExceededWarning"), {
        //     appearance: "warning",
        //     autoDismiss: false,
        //   });
        // }

        if (node?.areCanvasesFetched || node?.computedRootCanvasCount === 0) {
          collectionTreeRef?.current?.addOpenId &&
            collectionTreeRef?.current?.addOpenId(node.id);
        } else {
          setTimeout(() => {
            getCanvases(node);
          }, 1000);
        }
      } catch (error: any) {
        if (error?.status === HttpStatusCode.FORBIDDEN) {
          addToast("You don't have permission to perform this action.", {
            appearance: "error",
            autoDismiss: true,
          });
          console.log(error);
        }
      }
    }
  };

  if (isLoggedIn && personalSpace) {
    finalNavItems.push({
      type: "icon",
      title: "Personal Space",
      path: BipRouteUtils.getHandleRoute(personalSpace.handle),
      icon: (props) => (
        <Box title={personalSpace.displayName}>
          <ImageWithName
            src={personalSpace.imageUrl}
            name={personalSpace.displayName}
            sx={{
              width: personalSpace.imageUrl ? "28px" : "18px",
              height: personalSpace.imageUrl ? "28px" : "18px",
              padding: "2px",
            }}
            {...props}
          />
        </Box>
      ),
      activeIcon: (props) => (
        <ImageWithName
          src={personalSpace.imageUrl}
          name={personalSpace.displayName}
          sx={{
            width: personalSpace.imageUrl ? "28px" : "18px",
            padding: "2px",
            height: personalSpace.imageUrl ? "28px" : "18px",
          }}
          {...props}
        />
      ),
    });
  }
  const options = {
    touch: {
      scrollAngleRanges: [
        { start: 30, end: 150 },
        { start: 210, end: 330 },
      ],
    },
  };

  return (
    <>
      <Head>
        <link rel="icon" type="image/x-icon" href={currentStudio?.imageUrl} />
      </Head>
      <DndProvider backend={MultiBackend} options={getBackendOptions(options)}>
        <PageLayout columnGap="none" containerWidth="full" padding="none">
          <Box
            position={"fixed"}
            display="flex"
            sx={{
              top: isSideNavOpen ? 0 : "70px",
              zIndex: 100,
              height: isSideNavOpen ? "unset" : "calc(100vh - 70px)",
              transition: TRANSITION_DELAY,
              left:
                isSideNavOpen || isPinned
                  ? "0px"
                  : isTabletOrMobile
                  ? "-290px"
                  : "-260px",
              paddingRight: isTabletOrMobile
                ? "0px"
                : isSideNavOpen || isPinned
                ? "0px"
                : "60px",
              ":hover": isTabletOrMobile
                ? {}
                : {
                    left: "0px",
                    paddingRight: "0px",
                  },
            }}
          >
            <PageLayout.Pane
              position="start"
              sx={{
                width: isTabletOrMobile ? "48px !important" : "10px !important",
                height: isSideNavOpen ? "100vh" : "80vh",
                bg: "sidebar.studionav.bg",
                transition: TRANSITION_DELAY,
                flexDirection: "row-reverse",
                ".nav-data": {
                  display: isTabletOrMobile ? "flex" : "none",
                },
                ":hover": {
                  width: "48px !important",
                  ".nav-data": {
                    display: "flex",
                  },
                },
              }}
            >
              <div className="flex-col flex-1 hidden w-full h-full nav-data">
                <Box
                  display="flex"
                  flexDirection={"column"}
                  paddingX={"8px"}
                  paddingBottom={"16px"}
                  alignItems="center"
                >
                  <NavList
                    sx={{
                      marginBottom: "3px",
                    }}
                  >
                    {finalNavItems.map((navIcon: NavIcon, i) => {
                      return (
                        <Box
                          key={i}
                          id={
                            navIcon.title === "Personal Space"
                              ? "personal-space-studio-layout-btn"
                              : ""
                          }
                          sx={{
                            margin: "8px 0",
                            display: "flex",
                            justifyContent: "center",
                          }}
                          className={
                            navIcon.title === "Personal Space"
                              ? `relative before:absolute before::content-[''] before: before:w-2 before:bg-green-500 before:rounded-xl before:-translate-y-2/4 before:-translate-x-2/4 before:top-2/4  before:-left-2 my-1 ${
                                  currentStudio?.id === personalSpace?.id
                                    ? `before:h-full`
                                    : `hover:before:block before:hidden  before:h-3`
                                }`
                              : ""
                          }
                          onClick={() => {
                            updatePages([]);
                          }}
                        >
                          <NavIconLink navIcon={navIcon} />
                        </Box>
                      );
                    })}
                  </NavList>
                  <hr className="w-full" />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    overflowY: "overlay",
                    overflowX: "hidden",
                    paddingBottom: "100px",
                    scrollbarWidth: "thin",
                  }}
                >
                  {studios
                    .filter((studio) => !studio.isPersonalSpace)
                    .map((studio, i) => (
                      <div
                        className={`flex px-2 relative items-center py-1 cursor-pointer font-semibold before:absolute before::content-[''] before: before:w-2 before:bg-green-500 before:rounded-xl before:-translate-y-2/4 before:-translate-x-2/4 before:top-2/4  before:left-0 my-1
                ${
                  currentStudio?.id === studio?.id
                    ? `before:h-full`
                    : `hover:before:block before:hidden  before:h-3`
                }
                `}
                        title={studio.displayName}
                        key={i}
                      >
                        <LinkWithoutPrefetch
                          href={BipRouteUtils.getHandleRoute(studio.handle)}
                          passHref
                        >
                          <a
                            onClick={() => {
                              updatePages([]);
                            }}
                          >
                            <ImageWithName
                              src={studio.imageUrl}
                              name={studio.displayName}
                            />
                          </a>
                        </LinkWithoutPrefetch>
                      </div>
                    ))}
                  {isLoggedIn && (
                    <Box>
                      <IconButton
                        onClick={() => setCreateStudioOpen(true)}
                        sx={{
                          bg: "none",
                          boxShadow: "none",
                          border: "none",
                          borderColor: "transparent",
                          ":hover": {
                            bg: "transparent!important",
                          },
                        }}
                        aria-label="Search"
                        icon={() => (
                          <PlusCircleIcon
                            size={32}
                            color={"sidebar.studionav.addStudioColor"}
                          />
                        )}
                      />
                    </Box>
                  )}{" "}
                </Box>
              </div>
            </PageLayout.Pane>
            <PageLayout.Pane
              position="start"
              sx={{
                width: "240px!important",
                bg: "sidebar.bg",
                borderTopRightRadius: isSideNavOpen ? "0px" : "12px",
                borderBottomRightRadius: isSideNavOpen ? "0px" : "12px",
                height: isSideNavOpen ? "100vh" : "80vh",
                transition: TRANSITION_DELAY,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: isSideNavOpen ? "100vh" : "80vh",
                  transition: TRANSITION_DELAY,
                }}
              >
                <Box
                  display="flex"
                  flex={1}
                  flexDirection={"column"}
                  padding={"12px 6px 12px 6px"}
                  height="80%"
                  // sx={{
                  //   overscrollBehavior: "contain",
                  //   overflow: "auto",
                  //   scrollbarWidth: "thin",
                  //   // overflow: "overlay", not working in firefox
                  //   // overflow: "hidden",
                  //   // ":hover": {
                  //   // },
                  // }}
                >
                  <Box
                    marginBottom={"16px"}
                    display={"flex"}
                    justifyContent="space-between"
                    alignItems={"center"}
                  >
                    <Box display={"flex"}>
                      <ImageWithName
                        src={currentStudio?.imageUrl}
                        name={currentStudio?.displayName}
                        key={currentStudio?.id}
                        sx={{
                          width: "28px",
                          height: "28px",
                        }}
                      />
                      <Text
                        color={"sidebar.text"}
                        fontSize="16px"
                        paddingLeft={"8px"}
                        sx={{
                          whiteSpace: "initial",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {isPersonalStudio
                          ? "Personal Space"
                          : currentStudio?.displayName}
                      </Text>
                    </Box>
                    <IconButton
                      icon={
                        isSideNavOpen
                          ? DoubleChevronLeftIcon
                          : DoubleChevronRightIcon
                      }
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: "sidebar.text",
                        padding: "6px 8px",
                        ":hover:not([disabled])": {
                          backgroundColor: "sidebar.arrowIconsHoverBg",
                        },
                        "&[aria-expanded='true']": {
                          backgroundColor: "sidebar.arrowIconsHoverBg",
                        },
                      }}
                      size={"small"}
                      variant="invisible"
                      onClick={(e: any) => {
                        setIsSideNavOpen(!isSideNavOpen);
                      }}
                    />
                    {/* <
                    sx={{
                      cursor: "pointer",
                    }}
                  /> */}
                  </Box>

                  <Box>
                    {STUDIO_DETAIL_NAV_ITEMS.filter(
                      (navItem) =>
                        !navItem.isProtected ||
                        (navItem.isProtected && isLoggedIn)
                    ).map((navItem, i) =>
                      navItem.title === "Settings" ? (
                        !isTabletOrMobile && canManageSettings ? (
                          <Box
                            key={i}
                            paddingY={"8px"}
                            alignItems={"center"}
                            display={"flex"}
                            color={"sidebar.studionav.textSecondary"}
                            sx={{
                              cursor: "pointer",
                              ":hover": {
                                color: "sidebar.studionav.textSecondaryHover",
                              },
                            }}
                            onClick={() => {
                              router.push(
                                {
                                  pathname: router.pathname,
                                  query: {
                                    ...router.query,
                                    open_settings: true,
                                  },
                                },
                                undefined,
                                {
                                  shallow: true,
                                }
                              );
                              setShowSettings(true);
                            }}
                          >
                            <navItem.icon size={16} />
                            <Text
                              sx={{
                                paddingLeft: "8px",
                                fontSize: "14px",
                              }}
                            >
                              {navItem.title}
                            </Text>
                          </Box>
                        ) : null
                      ) : (
                        !isPersonalStudio && (
                          <LinkWithoutPrefetch
                            key={i}
                            href={`${BipRouteUtils.getHandleRoute(
                              currentStudio?.handle!
                            )}/${navItem.path}`}
                            passHref
                          >
                            <a>
                              <Box
                                paddingY={"8px"}
                                alignItems={"center"}
                                display={"flex"}
                                color={"sidebar.studionav.textSecondary"}
                                sx={{
                                  cursor: "pointer",
                                  ":hover": {
                                    color:
                                      "sidebar.studionav.textSecondaryHover",
                                  },
                                }}
                              >
                                <navItem.icon size={16} />
                                {/* {navItem.title === "Feed" ? (
                                <>
                                  <Truncate
                                    inline
                                    sx={{
                                      paddingLeft: "8px",
                                      fontSize: "14px",
                                    }}
                                    maxWidth={170}
                                    title={currentStudio?.displayName || ""}
                                  >
                                    {currentStudio?.displayName + "'s "}
                                  </Truncate>
                                  <Text
                                    as="p"
                                    marginLeft={"3px"}
                                    sx={{
                                      fontSize: "14px",
                                    }}
                                  >
                                    {" " + " Feed"}
                                  </Text>
                                </>
                              ) : ( */}
                                <Text
                                  sx={{
                                    paddingLeft: "8px",
                                    fontSize: "14px",
                                  }}
                                >
                                  {navItem.title}
                                </Text>
                                {/* )} */}
                              </Box>
                            </a>
                          </LinkWithoutPrefetch>
                        )
                      )
                    )}
                  </Box>

                  {isLoggedIn ? (
                    <div
                      className="flex-row justify-between pr-2 my-2 mb-1"
                      style={{
                        display: "flex",
                      }}
                    >
                      {canCreateCanvas() ? (
                        <Button
                          leadingIcon={PlusIcon}
                          variant="invisible"
                          sx={{
                            display: "content",
                            color: "notionImport.importText",
                            paddingLeft: "0px",
                            // paddingLeft: "34px",
                            // paddingRight: "40px",
                            ":hover:not([disabled])": {
                              color: "sidebar.studionav.buttonHover",
                              bg: "sidebar.studionav.buttonHoverBg",
                            },
                            marginRight: "4px",
                          }}
                          onClick={() => {
                            createNewCanvas();
                          }}
                          size="small"
                        >
                          New Canvas
                        </Button>
                      ) : null}
                      {canManageSettings ? (
                        <Tooltip
                          aria-label="Import"
                          noDelay
                          sx={{
                            display: "content",
                            "::after": {
                              bg: "#fff",
                              color: "#24292F",
                              fontWeight: 600,
                              maxWidth: `210px !important`,
                              textAlign: "start",
                            },
                            "::before": {
                              borderTopColor: "#fff !important",
                              color: "#fff",
                            },
                          }}
                          wrap
                          direction="n"
                        >
                          <Button
                            leadingIcon={DownloadIcon}
                            variant="invisible"
                            sx={{
                              display: "content",
                              color: "notionImport.importText",
                              paddingLeft: "8px",
                              ":hover:not([disabled])": {
                                color: "sidebar.studionav.buttonHover",
                                bg: "sidebar.studionav.buttonHoverBg",
                              },
                              marginLeft: "4px",
                              marginRight: "4px",
                            }}
                            onClick={() => {
                              setShowImportNotion(true);
                            }}
                            size="small"
                          ></Button>
                        </Tooltip>
                      ) : null}
                    </div>
                  ) : null}

                  <CollectionTree ref={collectionTreeRef} />
                  {/* {drafts.length > 1 && <ActionMenu.Divider />}
                  {isLoggedIn ? <DraftsTree /> : null} */}
                </Box>

                {isLoggedIn ? (
                  <UserMenu />
                ) : (
                  <Box className="flex mx-2 mb-3">
                    <LoginButton
                      returnUrl={
                        inviteCode
                          ? BipRouteUtils.getCanvasInviteCodeRoute(
                              handle,
                              inviteCode,
                              title
                            )
                          : router.asPath
                      }
                      sx={{ flex: 1 }}
                    />
                  </Box>
                )}
                <Crisp />
                {isTabletOrMobile ? <Box paddingBottom={"70px"}></Box> : null}
              </Box>
            </PageLayout.Pane>
          </Box>
          <PageLayout.Content
            width="full"
            sx={{
              marginLeft: isTabletOrMobile
                ? "0px"
                : isSideNavOpen
                ? "250px"
                : "0px",
              transition: `margin-left ${TRANSITION_DELAY}`,
              bg: whiteBg ? "studioLayout.white" : "studioLayout.bg",
            }}
          >
            <Box
              width={"100%"}
              sx={{
                height: "100vh",
                overflow: "auto",
                scrollbarWidth: "thin",
              }}
              id="studio-layout-content"
            >
              {children}
            </Box>
          </PageLayout.Content>
        </PageLayout>

        {isTabletOrMobile ? (
          <LayoutFAB
            opened={isSideNavOpen}
            onClick={() => {
              !isSideNavOpen &&
                segmentEvents.leftRailOpened(
                  currentStudio?.handle!,
                  repo?.key!,
                  repo?.name!,
                  user?.id!
                );
              setIsSideNavOpen(!isSideNavOpen);
            }}
          />
        ) : null}

        {createStudioOpen && (
          <Modal
            closeHandler={() => setCreateStudioOpen(false)}
            hideCloseButton
            sx={{ width: ["80%", "70%", "50%", "40%"], maxWidth: "600px" }}
          >
            <CreateStudioModal
              closeHandler={() => setCreateStudioOpen(false)}
            />
          </Modal>
        )}
        {showSettings ? (
          <Modal
            closeHandler={() => {
              const params = new URLSearchParams(router.query);
              params.delete("open_settings");
              router.replace(
                {
                  pathname: router.pathname,
                  query: params.toString(),
                },
                undefined,
                { shallow: true }
              );
              setShowSettings(false);
            }}
            sx={{
              height: "80vh",
              width: ["60%", "80%", "80%", "70%", "60%"],
              padding: "0px",
            }}
            zIndex={100}
          >
            <Settings closeHandler={() => setShowSettings(false)} />
          </Modal>
        ) : null}

        {showImportNotion ? (
          <Modal
            closeHandler={() => {
              setShowImportNotion(false);
            }}
            sx={{ maxWidth: "450px" }}
          >
            <ImportNotions
              onClose={() => {
                setShowImportNotion(false);
              }}
            />
          </Modal>
        ) : null}
        {/* </HandleWrapper> */}
      </DndProvider>
    </>
  );
};

export default StudioLayout;
