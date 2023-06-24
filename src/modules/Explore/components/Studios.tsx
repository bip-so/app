import StudioCard from "./cards/StudioCard";
import { useEffect, useState, FC, useRef } from "react";
import ExploreService from "../services";
import { StudioType } from "../../Studio/types";
import InfiniteScroll from "react-infinite-scroll-component";
import { useToasts } from "react-toast-notifications";
import BipLoader from "../../../components/BipLoader";

interface IStudiosProps {}

const Studios: FC<IStudiosProps> = () => {
  const [studios, setStudios] = useState<StudioType[]>([]);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToasts();
  const [skip, setSkip] = useState(0);

  const getStudios = () => {
    if (!loading && skip !== -1) {
      setLoading(true);
      ExploreService.getStudios(skip)
        .then((resp) => {
          setLoading(false);
          setStudios([...studios, ...resp.data.data]);
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

  useEffect(() => {
    getStudios();
  }, []);

  return (
    <div>
      <InfiniteScroll
        hasMore={skip !== -1}
        dataLength={studios.length}
        next={getStudios}
        loader={<BipLoader />}
        className="space-y-8"
        scrollableTarget={"home-layout-content"}
      >
        {studios.map((studio: StudioType) => (
          <StudioCard key={studio.id} studio={studio} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default Studios;
