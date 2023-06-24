import UserCard from "./cards/UserCard";
import { FC, useEffect, useState } from "react";
import ExploreService from "../services";
import { UserType } from "../types";
import { useToasts } from "react-toast-notifications";
import InfiniteScroll from "react-infinite-scroll-component";
import BipLoader from "../../../components/BipLoader";

interface IPeopleProps {}

const People: FC<IPeopleProps> = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const { addToast } = useToasts();

  const getPeople = () => {
    if (!loading) {
      setLoading(true);
      ExploreService.getPeople(skip)
        .then((resp) => {
          setLoading(false);
          setPeople([...people, ...resp.data.data]);
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
    getPeople();
  }, []);

  return (
    <div>
      <InfiniteScroll
        hasMore={skip !== -1}
        dataLength={people.length}
        next={getPeople}
        loader={<BipLoader />}
        className="space-y-8"
        scrollableTarget={"home-layout-content"}
      >
        {people.map((user: UserType) => (
          <UserCard key={user.id} userDetails={user} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default People;
