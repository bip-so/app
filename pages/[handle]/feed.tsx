import { Box, IconButton, Text } from "@primer/react";
import { ArrowLeftIcon } from "@primer/styled-octicons";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useToasts } from "react-toast-notifications";

import { BipPage } from "../../src/commons/types";
import BipLoader from "../../src/components/BipLoader";
import { useOnboarding } from "../../src/context/onboardingContext";
import { useStudio } from "../../src/context/studioContext";
import { useUser } from "../../src/context/userContext";
import { HandleWrapper } from "../../src/hooks/useHandle";
import StudioHeader from "../../src/layouts/StudioLayout/components/StudioHeader";
import StudioLayout from "../../src/layouts/StudioLayout/StudioLayout";
import { ReelType } from "../../src/modules/BipEditor/types";
import ReelCard from "../../src/modules/Explore/components/cards/ReelCard";
import OnboardingIntroCard from "../../src/modules/Onboarding/components/IntroCard";
import CreatePostCard from "../../src/modules/Posts/Components/CreatePostCard";
import PostCard from "../../src/modules/Posts/Components/PostCard";
import PostsService from "../../src/modules/Posts/services";
import { CreatePostType, PostType } from "../../src/modules/Posts/types";
import StudioService from "../../src/modules/Studio/services";

const FeedPage: BipPage = () => {
  const { user, isLoggedIn } = useUser();

  const { currentStudio } = useStudio();
  const { addToast } = useToasts();
  const { t } = useTranslation();
  const router = useRouter();
  const { postId, reelId, handle } = router.query;

  const [feed, setFeed] = useState((): (ReelType | PostType)[] => []);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [reelsPage, setReelsPage] = useState(0);
  const [postsPage, setPostsPage] = useState(1);

  const [creatingPost, setCreatingPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(
    (): PostType | ReelType | null => null
  );
  const { clearSecondaryOnboardingSchema, secondaryOnboardingSchema } =
    useOnboarding();
  const [loadingPostData, setLoadingPostData] = useState(false);

  const navigateToPosts = () => {
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
  };

  const replaceWithPosts = () => {
    router.replace(
      {
        pathname: router.pathname,
        query: {
          handle: router.query.handle,
        },
      },
      undefined,
      { shallow: true }
    );
  };

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
      postsPage === -1 || !isLoggedIn
        ? samplePromise
        : PostsService.getPosts(postsPage);
    const reelsPromise =
      reelsPage === -1 ? samplePromise : StudioService.getReelsFeed(reelsPage);
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

        setFeed([...feed, ...getSortedData(reels, posts)]);
        setReelsPage(parseInt(reelsNext));
        setPostsPage(parseInt(postsNext));
        setLoadingFeed(false);
      })
      .catch((err) => {
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
        setLoadingFeed(false);
      });
  };

  useEffect(() => {
    if (currentStudio?.id && currentStudio?.handle === handle) {
      getFeed();
    }
  }, [currentStudio?.id]);

  const getPostData = (postId: number) => {
    setLoadingPostData(true);
    PostsService.getPost(postId)
      .then((r) => {
        if (r.data.data) {
          setSelectedPost({ ...r.data.data, context: "POST" });
          setLoadingPostData(false);
        }
      })
      .catch((err) => {
        setLoadingPostData(false);
        addToast("Post Unavailable. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  useEffect(() => {
    if (postId && currentStudio?.id && currentStudio?.handle === handle) {
      const parsedId = parseInt(postId as string);
      const post = feed.find(
        (pos) => pos.id === parsedId && pos.context === "POST"
      );
      if (post) {
        setSelectedPost(post as PostType);
      } else {
        getPostData(parsedId);
      }
    }
  }, [postId, currentStudio?.id]);

  const getReelData = (reelId: number) => {
    setLoadingPostData(true);
    StudioService.getReel(reelId)
      .then((r) => {
        if (r.data.data) {
          setSelectedPost({ ...r.data.data, context: "REEL" });
          setLoadingPostData(false);
        }
      })
      .catch((err) => {
        setLoadingPostData(false);
        addToast("Post Unavailable. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  useEffect(() => {
    if (reelId && currentStudio?.id && currentStudio?.handle === handle) {
      const parsedId = parseInt(reelId as string);
      getReelData(parsedId);
    }
  }, [reelId, currentStudio?.id]);

  const updateReel = (reel: ReelType): void => {
    const reelIndex = feed?.findIndex(
      (re) => re.id === reel.id && re.context === "REEL"
    );
    if (reelIndex >= 0) {
      feed[reelIndex] = reel;
      setFeed([...feed]);
    }
    if (reelId && selectedPost) {
      setSelectedPost(reel);
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
    if (postId && selectedPost) {
      setSelectedPost(updatedPost);
    }
  };

  const postDeleteHandler = (id: number) => {
    setFeed(
      feed.filter(
        (post) =>
          (post.id !== id && post.context === "POST") || post.context === "REEL"
      )
    );
    if (postId) {
      replaceWithPosts();
      setSelectedPost(null);
    }
  };

  const createPost = (
    data: CreatePostType,
    resetEditor: () => void = () => {}
  ) => {
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
        addToast("Something went wrong. Please try again!", {
          appearance: "error",
          autoDismiss: true,
        });
      });
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
          : Timeline
        </title>
      </Head>
      <StudioHeader>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
          }}
          className="py-8"
          minHeight={"100vh"}
        >
          {secondaryOnboardingSchema?.showStudioFeedCard ? (
            <OnboardingIntroCard
              imageUrl="/studio-feed.svg"
              title={t("workspaceFeedOnboarding.title")}
              description={t("workspaceFeedOnboarding.description")}
              closeHandler={() => {
                clearSecondaryOnboardingSchema("showStudioFeedCard");
              }}
            />
          ) : null}
          {postId || reelId ? (
            <Box>
              <Box
                display={"flex"}
                alignItems={"center"}
                mb={"16px"}
                sx={{
                  width: ["360px", "500px", "600px", "600px"],
                }}
              >
                <IconButton
                  icon={ArrowLeftIcon}
                  onClick={navigateToPosts}
                  variant="invisible"
                  sx={{
                    color: "postInFeed.textLight",
                  }}
                />
                <Text as="p" fontWeight={600} ml={"4px"}>
                  Posts
                </Text>
              </Box>
              {loadingPostData ? (
                <Box display={"flex"} justifyContent={"center"}>
                  <BipLoader />
                </Box>
              ) : selectedPost ? (
                selectedPost.context === "POST" ? (
                  <PostCard
                    key={selectedPost.id}
                    post={selectedPost as PostType}
                    deletePostHandler={postDeleteHandler}
                    updatePost={updatePost}
                    showComments
                  />
                ) : selectedPost.context === "REEL" ? (
                  <ReelCard
                    key={selectedPost.id}
                    reel={selectedPost as ReelType}
                    updateReel={updateReel}
                    showComments
                  />
                ) : (
                  <Text as="p" my={"16px"} textAlign={"center"}>
                    Post Unavailable
                  </Text>
                )
              ) : (
                <Text as="p" my={"16px"} textAlign={"center"}>
                  Post Unavailable
                </Text>
              )}
            </Box>
          ) : (
            <>
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
              {feed?.length === 0 && !loadingFeed ? (
                <Text
                  as="p"
                  fontSize={"14px"}
                  color="sidebar.studionav.textSecondary"
                  sx={{
                    textAlign: "center",
                  }}
                >
                  No posts yet
                </Text>
              ) : (
                <InfiniteScroll
                  hasMore={reelsPage !== -1 || postsPage !== -1}
                  dataLength={feed.length}
                  next={getFeed}
                  loader={""}
                  className="space-y-8"
                  scrollableTarget={"studio-layout-content"}
                  style={{
                    overflow: "unset",
                  }}
                >
                  {feed.map((item) =>
                    item.context === "REEL" ? (
                      <ReelCard
                        key={item.id}
                        reel={item as ReelType}
                        updateReel={updateReel}
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
              {loadingFeed ? (
                <Box display={"flex"} justifyContent={"center"}>
                  <BipLoader />
                </Box>
              ) : null}
            </>
          )}
        </Box>
      </StudioHeader>
    </HandleWrapper>
  );
};

FeedPage.getLayout = function getLayout(page: ReactElement, hideSidebar) {
  return <StudioLayout>{page}</StudioLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

FeedPage.auth = false;
export default FeedPage;
