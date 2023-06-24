import ReelCard from "./cards/ReelCard";
import { FC, useEffect, useState } from "react";
import ExploreService from "../services";
import { useToasts } from "react-toast-notifications";
import BipLoader from "../../../components/BipLoader";
import { ReelType } from "../../BipEditor/types";
import { Box } from "@primer/react";
import InfiniteScroll from "react-infinite-scroll-component";

interface IReelsProps {}

const PopularReels: FC<IReelsProps> = () => {
  const [reels, setReels] = useState((): ReelType[] => []);
  const [loadingReels, setLoadingReels] = useState(false);
  const [skip, setSkip] = useState(0);

  const { addToast } = useToasts();

  const getPopularReels = () => {
    setLoadingReels(true);
    ExploreService.getPopularReels(skip)
      .then((r) => {
        setLoadingReels(false);
        setReels([...reels, ...r.data.data]);
        setSkip(parseInt(r.data.next));
      })
      .catch((err) => {
        setLoadingReels(false);
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  useEffect(() => {
    getPopularReels();
  }, []);

  const updateReel = (reel: ReelType): void => {
    const reelIndex = reels?.findIndex((re) => re.id === reel.id);
    if (reelIndex >= 0) {
      reels[reelIndex] = reel;
      setReels([...reels]);
    }
  };

  return (
    <>
      <InfiniteScroll
        hasMore={skip !== -1}
        dataLength={reels.length}
        next={getPopularReels}
        loader={<BipLoader />}
        className="space-y-8 py-8"
        scrollableTarget={"home-layout-content"}
        scrollThreshold={0.9}
      >
        {reels.map((reel) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            updateReel={updateReel}
            usersType="global"
          />
        ))}
      </InfiniteScroll>
    </>
  );
};

export default PopularReels;
