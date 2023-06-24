import { Button } from "@primer/react";
import { Box, IconButton, Text } from "@primer/react";
import { XIcon, ChevronRightIcon } from "@primer/styled-octicons";
import ReactPlayer from "react-player";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React, { FC, useState, useEffect } from "react";
import CommunityCard from "../../../components/LandingShared/CommunityCard";
import FAQ from "../../../components/LandingShared/FAQ";
import Footer from "../../../components/LandingShared/Footer";
import Header from "../../../components/LandingShared/Header";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";
import LandingFeature from "../../../components/LandingFeature";
import BipRouteUtils from "../../../core/routeUtils";
import segmentEvents from "../../../insights/segment";
import { PlayIcon } from "@primer/styled-octicons";
import Modal from "../../../components/Modal";
import { useLayout } from "../../../context/layoutContext";
import Colors from "../../../utils/Colors";
import Testimonials from "../../Pricing/components/Testimonials";

const NewAuthHome = () => {
  const router = useRouter();

  const { t } = useTranslation();

  useEffect(() => {
    segmentEvents.landingPageViewed(router.query);
  }, []);

  const [featuresList, setFeaturesList] = useState(FEATURES_LIST);

  const { showLandingPageVideo, setShowLandingPageVideo } = useLayout();

  return (
    <div className="relative flex flex-col items-center justify-center w-screen overflow-hidden">
      <Header />
      <div className="relative w-screen h-screen overflow-hidden bg-repeat">
        <Box
          className="absolute inset-0"
          sx={{
            bg: "landing.hero.bg",
            // "linear-gradient(97.34deg, #000000 0%, rgba(0, 0, 0, 0) 28.31%, rgba(0, 0, 0, 0) 44.15%, rgba(0, 0, 0, 0) 66.69%, #000000 100%)",
          }}
        />
        <div className=" flex items-center justify-center h-full w-full bg-no-repeat bg-none bg-[center_top_54%] ">
          <div className="relative w-11/12 -mt-24 text-center md:w-2/4">
            <Text
              as="h1"
              className="text-2xl font-semibold font-general lg:text-4xl xl:text-5xl 2xl:text-5xl "
              sx={{
                color: "landing.text",
              }}
            >
              {t("landing.heading")}
            </Text>
            <p className="my-8 text-gray-900 text-l font-normal md:text-xl lg:text-2xl">
              {t("landing.subHeading")}
            </p>
            <div className="z-10 flex flex-col items-center justify-center gap-4">
              <LinkWithoutPrefetch href={BipRouteUtils.getSignInRoute()}>
                <Button
                  sx={{
                    height: "60px",
                    px: "40px",
                    fontSize: "20px",
                    marginRight: ["0px", "0px", "20px", "20px"],
                    cursor: "pointer",
                    border: 0,
                  }}
                  variant="primary"
                  className="flex items-center justify-center"
                  onClick={() => {
                    segmentEvents.signUpLoginClicked("hero-get-started");
                  }}
                >
                  {t("landing.getStarted")}
                </Button>
              </LinkWithoutPrefetch>
              <a href="https://calendly.com/bipso/demo" target="_blank">
                <Button
                  variant="invisible"
                  sx={{
                    height: "60px",
                    fontSize: "20px",
                    color: "landing.hero.btn.text",
                    marginLeft: ["10px", "10px", "0px", "0px"],
                    // border: "2px solid",
                    // borderColor: Colors.gray["200"],
                    ":hover:not([disabled])": {
                      color: "landing.hero.btn.textHover",
                      background: "transparent",
                    },
                  }}
                  className="flex items-center justify-center"
                  onClick={() => {
                    segmentEvents.signUpSecondaryCTAClicked();
                  }}
                >
                  {t("landing.joinCommunityDemo")}{" "}
                  <ChevronRightIcon size={24} />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className=" relative w-full h-[100px] md:h-[400px]">
        <div
          className=" w-11/12 absolute -translate-y-[78%] sm:w-[55%]   sm:-tranlate-y-1/2  min-h-[150px]   
      lg:h-[120%] 2xl:h-[560px] left-1/2  2xl:-translate-y-1/3 md:-translate-y-1/3 -translate-x-1/2 lg:-translate-y-1/3  flex justify-center items-center"
        >
          <img
            src="landing-hero.gif"
            className="h-full rounded-lg"
            alt="landing image discord"
            onClick={() => setShowLandingPageVideo(true)}
          />
          <Box
            className="rounded-lg"
            position={"absolute"}
            padding={"20px"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
            // sx={{
            //   bg: "landing.hero.video.videoBg",
            // }}
            onClick={() => {
              setShowLandingPageVideo(true);
            }}
          >
            <Box
              display={"flex"}
              flexDirection={"column"}
              alignItems={"center"}
              // width={["128px", "128px", "225px", "225px"]}
              // height={"108px"}
            >
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                height={"94px"}
                borderRadius={"50px"}
                sx={{
                  bg: "landing.hero.video.videoBg",
                }}
              >
                <Button
                  variant="invisible"
                  sx={{
                    display: "content",
                    color: "landing.hero.video.text",
                    ":hover": {
                      bg: "transparent!important",
                    },
                  }}
                >
                  <PlayIcon size={64} />
                </Button>
              </Box>
              <Text
                padding={"10px"}
                fontStyle={"normal"}
                fontWeight={600}
                fontSize={["14px", "14px", "20px", "20px"]}
                lineHeight={["20px", "20px", "30px", "30px"]}
                color={"landing.hero.video.text"}
              >
                See how bip works
              </Text>
            </Box>
          </Box>
          {showLandingPageVideo && (
            <Modal
              closeHandler={() => setShowLandingPageVideo(false)}
              hideCloseButton
              handleOutsideClick
            >
              <LandingPageVideo
                closeHandler={() => setShowLandingPageVideo(false)}
              />
            </Modal>
          )}
        </div>
      </div>
      <div className="w-full flex md:hidden  md:mt-6 h-[170px] md:h-[450px] justify-center items-center relative">
        {/* <img
          className="absolute top-0 left-0 w-24 h-24"
          src="/circles-landing.svg"
        />
        <img
          className="absolute right-0 top-0 w-24 h-24 rotate-[120deg] -translate-y-3"
          src="/circles-landing.svg"
        /> */}
        <h1 className="relative max-w-sm mt-12 text-3xl font-semibold text-center text-gray-900 md:text-4xl">
          1534 leading <br />
          <span
          // className="text-4xl"
          // style={{
          //   background: "#484F58",
          //   WebkitBackgroundClip: "text",
          //   WebkitTextFillColor: "transparent",
          // }}
          >
            Communities
          </span>{" "}
          love bip
        </h1>
      </div>
      <div className="flex flex-wrap items-center justify-center w-full my-4 md:hidden">
        {FEATURED_STUDIOS.map((img) => (
          <div key={img} className="flex items-center justify-center m-4 ">
            <img src={img} className="w-20 h-20 border-2 rounded-full" />
          </div>
        ))}
      </div>

      <div className="w-full  my-6 h-[250px]  flex justify-center items-center flex-col hidden md:flex  relative">
        {/* <img
          className="absolute top-0 w-24 h-24 left-20"
          src="/circles-landing.svg"
        />
        <img
          className="absolute right-20 top-0 w-24 h-24 rotate-[120deg] -translate-y-3"
          src="/circles-landing.svg"
        /> */}
        <div className="relative flex items-center justify-center my-6">
          <h1 className="relative max-w-sm text-2xl font-normal text-center text-gray-900 md:text-2xl">
            1534 leading <br />
            Communities love bip
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-center w-full my-4">
          {FEATURED_STUDIOS.map((img) => (
            <div key={img} className="flex items-center justify-center m-4">
              <img src={img} className="w-20 h-20 border-2 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div id="features" className="flex flex-col w-full">
        {featuresList.map((feature, index) => {
          const isEven = index % 2 === 0;
          return (
            <div
              key={index}
              className={` w-full mx-auto ${isEven ? "bg-gray-0" : ""}`}
            >
              <LandingFeature
                feature={feature}
                featureIndex={index}
                handleChangeActive={(newActiveSubFeatureIndex: number) =>
                  setFeaturesList(
                    featuresList.map((feature, fIndex) => {
                      if (fIndex === index) {
                        return {
                          ...feature,
                          activeSubFeatureIndex: newActiveSubFeatureIndex,
                        };
                      }
                      return feature;
                    })
                  )
                }
              />
            </div>
          );
        })}
      </div>
      <div className="w-full">
        <Testimonials />
      </div>
      <div className="mt-8 mb-14">
        <FAQ />
      </div>
      <CommunityCard />
      <Footer />
    </div>
  );
};

export default NewAuthHome;

const FEATURES_LIST = [
  {
    title: (
      <>
        <span className="text-green-600 ">Save hours</span> every week with our
        easy members access management
      </>
    ),
    activeSubFeatureIndex: 0,
    subFeatureImages: ["sync-discord.gif", "manage-access.gif"],
    subFeatures: [
      {
        title: "Real-time sync of users and roles",
        subText:
          "Use Slack/Discord usernames and roles to manage permissions. No email needed!",
      },
      {
        title: "Role based access",
        subText: "Organize members into roles and set varying permissions",
      },
    ],
  },
  {
    title: (
      <>
        <span className="text-green-600">Engage</span> your community in
        creating knowledge
      </>
    ),
    activeSubFeatureIndex: 0,
    subFeatureImages: [
      "async-contributions.png",
      "accept-reject.gif",
      "async-attributions.gif",
    ],
    subFeatures: [
      {
        title: "Allow everyone to contribute",
        subText:
          "All edits happen in personal drafts. Members can send you a merge request when ready.",
      },
      {
        title: "Accept or Reject Changes",
        subText:
          "As a moderator, you decide what changes go in to your final document.",
      },
      {
        title: "Recognize members for their contribution",
        subText:
          "See who created each block and how much was contributed by each member",
      },
    ],
  },
  {
    title: "and much more...",
    activeSubFeatureIndex: 0,
    subFeatureImages: [
      "bip-mark.png",
      "link-sharing.gif",
      "request-access.png",
    ],
    subFeatures: [
      {
        title: "bip Mark",
        subText: "Capture Discord messages for re-use in bip later.",
      },
      {
        title: "Link Sharing",
        subText:
          "Share a secret link to allow access your document with a specific permission level.",
      },
      {
        title: "Access requests",
        subText:
          "Allow members to send requests to access private docs. Manage these requests from Slack/Discord too.",
      },
    ],
  },
];

const FEATURED_STUDIOS = [
  "/featured-studios/storyqube.png",
  "/featured-studios/truts.png",
  "/featured-studios/pesto.png",
  "/featured-studios/random1.png",
  "/featured-studios/mesh.png",
  "/featured-studios/nodestar.png",
  "/featured-studios/superteam.png",
  "/featured-studios/questbook.png",
];

interface LandingPageVideoProps {
  closeHandler?: Function;
}

const LandingPageVideo: FC<LandingPageVideoProps> = ({ closeHandler }) => {
  return (
    <Box width={"100%"}>
      <Box
        mt={"-10px"}
        mb={"10px"}
        sx={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <IconButton
          icon={XIcon}
          sx={{
            background: "unset",
            border: "none",
          }}
          onClick={closeHandler}
        />
      </Box>
      <ReactPlayer
        url="https://www.youtube.com/watch?v=J9AxKqTQUes"
        width="100%"
        height="500px"
        playing={true}
        controls={true}
      />
    </Box>
  );
};
