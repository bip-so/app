import { FC, useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";
import BipLoader from "../../../components/BipLoader";
import { ReelType } from "../../BipEditor/types";
import { Box, Text, IconButton } from "@primer/react";
import { XIcon } from "@primer/octicons-react";
import ReelCard from "../../Explore/components/cards/ReelCard";
import ExploreService from "../../Explore/services";
import HomeService from "../services";
import InfiniteScroll from "react-infinite-scroll-component";
import { CreatePostType, PostType } from "../../Posts/types";
import PostsService from "../../Posts/services";
import { StudioType } from "../../Studio/types";
import { setTempStudioIdHeader } from "../../../utils/Common";
import CreatePostCard from "../../Posts/Components/CreatePostCard";
import { useUser } from "../../../context/userContext";
import PostCard from "../../Posts/Components/PostCard";
import { useOnboarding } from "../../../context/onboardingContext";
import OnboardingIntroCard from "../../Onboarding/components/IntroCard";
import { useTranslation } from "next-i18next";
import { OnboardingStepEnum } from "../../Onboarding/enums";
import OnboardingStudioCard from "../../Onboarding/components/OnboardingStudioCard";

interface HomeFeedProps {}

const HomeFeed: FC<HomeFeedProps> = () => {
  const [loadingReels, setLoadingReels] = useState(false);
  const [popularReelsPage, setPopularReelsPage] = useState(0);
  const [studiosCard, setStudiosCard] = useState<StudioType[]>([]);

  const [feed, setFeed] = useState((): (ReelType | PostType)[] => []);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [reelsFeedSkip, setReelsFeedSkip] = useState(0);
  const [postsPage, setPostsPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);

  const [creatingPost, setCreatingPost] = useState(false);

  const { addToast } = useToasts();
  const { isLoggedIn } = useUser();

  const {
    onboardingSchema,
    secondaryOnboardingSchema,
    clearSecondaryOnboardingSchema,
    saveOnboardingSchema,
    saveSecondaryOnboardingSchema,
  } = useOnboarding();

  const getStudios = () => {
    if (!loading && skip !== -1) {
      setLoading(true);
      ExploreService.getStudios(skip)
        .then((resp) => {
          setLoading(false);
          setStudiosCard([...studiosCard, ...resp.data.data]);
          setSkip(parseInt(resp.data.next));
        })
        .catch((err) => {
          setLoading(false);
          addToast("Something went wrong. Please try again", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  };

  const { t } = useTranslation();

  const getSortedData = (reels: ReelType[] = [], posts: PostType[] = []) => {
    if (reels.length && posts.length) {
      const data = [...reels, ...posts];
      data.sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return bDate - aDate;
      });
      return data;
    }
    return [...reels, ...posts];
  };

  const getFeed = () => {
    if (loadingFeed) {
      return;
    }
    setLoadingFeed(true);
    const samplePromise: any = new Promise((resolve) => {
      resolve({});
    });
    const postsPromise =
      postsPage === -1
        ? samplePromise
        : PostsService.getHomePagePosts(postsPage);
    const reelsPromise =
      reelsFeedSkip === -1
        ? samplePromise
        : HomeService.getReelsFeed(reelsFeedSkip);
    Promise.all([postsPromise, reelsPromise])
      .then((r) => {
        const posts: PostType[] =
          r[0]?.data?.data?.map((post: PostType) => {
            return { ...post, context: "POST" };
          }) || [];
        const postsNext = r[0]?.data?.nextPage || -1;

        const reels: ReelType[] =
          r[1]?.data?.data?.map((reel: ReelType) => {
            return { ...reel, context: "REEL" };
          }) || [];
        const reelsNext = r[1]?.data?.next || -1;

        const combinedData = [...feed, ...getSortedData(reels, posts)];
        setFeed(combinedData);
        setLoadingFeed(false);
        if (
          combinedData?.length <= 2 &&
          reelsFeedSkip === 0 &&
          postsPage === -1 &&
          parseInt(reelsNext) === -1 &&
          parseInt(postsNext) === -1
        ) {
          getPopularReels(combinedData);
        }
        setReelsFeedSkip(parseInt(reelsNext));
        setPostsPage(parseInt(postsNext));
      })
      .catch((err) => {
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
        setLoadingFeed(false);
      });
  };

  const getPopularReels = (curReels: (ReelType | PostType)[] | null = null) => {
    if (popularReelsPage !== -1) {
      setLoadingReels(true);
      ExploreService.getPopularReels(popularReelsPage)
        .then((r) => {
          setLoadingReels(false);
          const popularReels =
            r?.data?.data?.map((reel: ReelType) => {
              return { ...reel, context: "REEL" };
            }) || [];

          if (curReels) {
            const filteredReels = popularReels.filter(
              (reel: ReelType) =>
                curReels.findIndex((homeReel) => homeReel.id === reel.id) === -1
            );
            setFeed([...curReels, ...filteredReels]);
          } else {
            const filteredReels = popularReels.filter(
              (reel: ReelType) =>
                feed.findIndex((homeReel) => homeReel.id === reel.id) === -1
            );
            setFeed([...feed, ...filteredReels]);
          }
          setPopularReelsPage(parseInt(r.data.next));
        })
        .catch((err) => {
          setLoadingReels(false);
          addToast("Something went wrong. Please try again", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    }
  };

  useEffect(() => {
    getFeed();
    getStudios();
  }, []);

  const getNextPageReels = () => {
    if (reelsFeedSkip !== -1 || postsPage !== -1) {
      getFeed();
    } else if (popularReelsPage !== -1) {
      getPopularReels();
    }
  };

  const updateReel = (reel: ReelType): void => {
    const reelIndex = feed?.findIndex(
      (re) => re.id === reel.id && re.context === "REEL"
    );
    if (reelIndex >= 0) {
      feed[reelIndex] = reel;
      setFeed([...feed]);
    }
  };

  const updatePost = (updatedPost: PostType) => {
    const postIndex = feed.findIndex(
      (post) => post.id === updatedPost.id && post.context === "POST"
    );
    if (postIndex !== -1) {
      feed[postIndex] = updatedPost;
      setFeed([...feed]);
    }
  };

  const postDeleteHandler = (id: number) => {
    setFeed(
      feed.filter(
        (post) =>
          (post.id !== id && post.context === "POST") || post.context === "REEL"
      )
    );
  };

  const createPost = (
    data: CreatePostType,
    resetEditor: () => void = () => {},
    studio?: StudioType | null
  ) => {
    if (studio) {
      setTempStudioIdHeader(studio.id);
      setCreatingPost(true);
      PostsService.createPosts(data)
        .then((r) => {
          resetEditor();
          setFeed([{ ...r.data.data, context: "POST" }, ...feed]);
          setCreatingPost(false);
          addToast("Post created.", {
            appearance: "success",
            autoDismiss: true,
          });
        })
        .catch((err) => {
          setCreatingPost(false);
          addToast("Something went wrong.Please try again", {
            appearance: "error",
            autoDismiss: true,
          });
        });
    } else {
      addToast(t("workspace.selectWorkspaceToPost"), {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
        }}
        className="py-8"
      >
        {secondaryOnboardingSchema?.showTimelineCard ? (
          <OnboardingIntroCard
            imageUrl="/user-feed.svg"
            title={t("userFeedOnboarding.title")}
            description={t("userFeedOnboarding.workspaceDescription")}
            subtext={t("userFeedOnboarding.subtext")}
            closeHandler={() => {
              clearSecondaryOnboardingSchema("showTimelineCard");
            }}
          />
        ) : null}
        {isLoggedIn ? (
          <>
            <CreatePostCard
              createPost={createPost}
              creatingPost={creatingPost}
            />
            <Box
              bg={"postInFeed.border"}
              height={"1px"}
              marginY={"32px"}
              sx={{
                width: ["360px", "500px", "600px", "600px"],
              }}
            />
          </>
        ) : null}
        {feed?.length === 0 && !loadingFeed && !loadingReels ? (
          <Text
            as="p"
            fontSize={"14px"}
            color="sidebar.studionav.textSecondary"
            sx={{
              textAlign: "center",
            }}
          >
            {t("notFound.post")}
          </Text>
        ) : (
          <InfiniteScroll
            hasMore={
              reelsFeedSkip !== -1 ||
              postsPage !== -1 ||
              popularReelsPage !== -1
            }
            dataLength={feed.length}
            next={getNextPageReels}
            loader={""}
            className="px-4 pt-4 space-y-8"
            scrollableTarget={"home-layout-content"}
            scrollThreshold={0.9}
          >
            {feed.map((item) =>
              item.context === "REEL" ? (
                <ReelCard
                  key={item.id}
                  reel={item as ReelType}
                  updateReel={updateReel}
                  usersType="global"
                />
              ) : (
                <PostCard
                  key={item.id}
                  post={item as PostType}
                  deletePostHandler={postDeleteHandler}
                  updatePost={updatePost}
                />
              )
            )}
          </InfiniteScroll>
        )}
        {secondaryOnboardingSchema?.showStudioCard ? (
          <>
            <Text
              as="p"
              fontSize={"14px"}
              sx={{
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              Follow any of the workspaces that interest you
              <br />
              and their public posts will show on this feed.
            </Text>
            <Box display={"flex"} flexDirection={"column"}>
              <div className="flex justify-end">
                <IconButton
                  icon={XIcon}
                  variant="invisible"
                  sx={{ zIndex: 1, color: "modal.xIcon" }}
                  onClick={() => {
                    clearSecondaryOnboardingSchema("showStudioCard");
                  }}
                />
              </div>
              <Box
                display={"flex"}
                flexDirection={"row"}
                width={["300px", "300px", "782px", "782px"]}
                height={"366px"}
                borderRadius={"12px"}
                overflow={"auto"}
              >
                <InfiniteScroll
                  hasMore={false}
                  dataLength={studiosCard?.length}
                  next={getStudios}
                  loader={<BipLoader />}
                  style={{
                    display: "flex",
                  }}
                  className="space-x-8"
                  scrollableTarget={"home-layout-content"}
                >
                  {studiosCard.map((studio: StudioType) => (
                    <OnboardingStudioCard key={studio.id} studio={studio} />
                  ))}
                </InfiniteScroll>
              </Box>
            </Box>
          </>
        ) : null}
      </Box>
      {loadingReels || loadingFeed ? (
        <div className="flex items-center justify-center flex-1 p-4">
          <BipLoader />
        </div>
      ) : null}
    </div>
  );
};

export default HomeFeed;
