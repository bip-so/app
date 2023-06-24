import { Button, Text } from "@primer/react";
import { useTranslation } from "next-i18next";
import React from "react";
import BipRouteUtils from "../../core/routeUtils";
import segmentEvents from "../../insights/segment";
import Colors from "../../utils/Colors";
import LinkWithoutPrefetch from "../LinkWithoutPrefetch";

const CommunityCard = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-[1384px] w-11/12 md:w-[90%]  mb-[150px] overflow-hidden relative rounded-xl p-8 md:py-20 md:px-14  bg-none md:bg-[url('/gradient-circle.png')] bg-no-repeat bg-gray-0">
      <div className="w-11/12 md:w-4/6">
        <Text
          as="h1"
          className="text-4xl font-semibold "
          sx={{
            color: "landing.communityCard.heading",
          }}
        >
          Join our community product demos.
          <br /> See how bip can help your community
        </Text>
        <Text
          as="p"
          className="my-4 text-xl"
          sx={{
            color: "landing.communityCard.subHeading",
          }}
        >
          {t("landing.communityCardSubHeading")}
        </Text>
        <LinkWithoutPrefetch href={BipRouteUtils.getSignInRoute()}>
          <Button
            onClick={() => {
              segmentEvents.signUpLoginClicked("try-for-free");
            }}
            variant="primary"
            sx={{
              mt: ["32px", "32px", "0px", "0px"],
              cursor: "pointer",
              py: 2,
              border: 0,
              // background: Colors.gray["0"],
              // color: Colors.bunker,
              // ":hover:not([disabled])": {
              //   background: Colors.gray["0"],
              //   color: Colors.bunker,
              //   opacity: 0.8,
              // },
            }}
          >
            {t("landing.tryForFree")}
          </Button>
        </LinkWithoutPrefetch>
      </div>
      {/* <div
        style={{
          position: "absolute",
          width: "476px",
          height: "386px",
          bottom: "-50%",
          right: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(243.91% 370.91% at 73.63% -46.37%, rgba(89, 207, 89, 0.6) 0%, rgba(255, 255, 255, 0) 35.07%) ",
          transform: "rotate(-14.03deg)",
        }}
      /> */}
    </div>
  );
};

export default CommunityCard;
