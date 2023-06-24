import { ActionList } from "@primer/react";
import React, { FC, useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";
import BipLoader from "../../../components/BipLoader";
import BlocksService from "../services";
import { BlockType, ReelType } from "../types";
import BlockReel from "./BlockReel";

interface BlockReelsProps {
  blockUUID: string;
}

const BlockReels: FC<BlockReelsProps> = (props) => {
  const [blockReels, setBlockReels] = useState<ReelType[]>([]);
  const { blockUUID } = props;

  const [loadingReels, setLoadingReels] = useState(false);

  const { addToast } = useToasts();

  useEffect(() => {
    if (blockUUID) {
      setLoadingReels(true);
      BlocksService.getBlockReels(blockUUID)
        .then((r) => {
          const data: ReelType[] = r.data.data;
          if (data?.length) {
            const filteredReels = data.filter((reel) => !reel.isArchived);
            setBlockReels(filteredReels);
          }
          setLoadingReels(false);
        })
        .catch((err) => {
          addToast("Something went wrong. Please try again", {
            appearance: "error",
            autoDismiss: true,
          });
          setLoadingReels(false);
        });
    }
  }, [blockUUID]);

  const updateReel = (reel: ReelType): void => {
    const reelIndex = blockReels?.findIndex((re) => re.id === reel.id);
    if (reelIndex >= 0) {
      blockReels[reelIndex] = reel;
      setBlockReels([...blockReels]);
    }
  };

  return loadingReels ? (
    <BipLoader />
  ) : (
    <>
      {blockReels.map((reel, index) => (
        <>
          <BlockReel
            key={reel.id}
            reel={reel}
            showContainerBox={false}
            alwaysShowReplyOption={true}
            showHighlightedText={true}
          />
          {index !== blockReels.length - 1 && <ActionList.Divider />}
        </>
      ))}
    </>
  );
};

export default BlockReels;
