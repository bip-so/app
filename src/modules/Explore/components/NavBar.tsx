import { UnderlineNav, Text, TextInput } from "@primer/react";
import { SearchIcon } from "@primer/octicons-react";
import { StudioType, UserType } from "../types";
import { useState, FC, useEffect } from "react";
import ExploreService from "../services";
import Studios from "./Studios";
import People from "./People";
import PopularReels from "./PopularReels";
import NavTab from "./NavTab";
import StudioCard from "./cards/StudioCard";
import UserCard from "./cards/UserCard";
import ReelCard from "./cards/ReelCard";
import { ReelType } from "../../BipEditor/types";
import useDebounce from "../../../hooks/useDebounce";
import segmentEvents from "../../../insights/segment";
import { userInfo } from "os";
import { useUser } from "../../../context/userContext";
import InfiniteScroll from "react-infinite-scroll-component";
import BipLoader from "../../../components/BipLoader";
import { useTranslation } from "next-i18next";

interface INavBarProps {}

const NavBar: FC<INavBarProps> = () => {
  const [selectedTab, setSelectedTab] = useState("Studios");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [people, setPeople] = useState<UserType[]>([]);
  const [studios, setStudios] = useState<StudioType[]>([]);
  const [reels, setReels] = useState((): ReelType[] => []);

  const [studiosSkip, setStudiosSkip] = useState(0);
  const [reelsSkip, setReelsSkip] = useState(0);
  const [peopleSkip, setPeopleSkip] = useState(0);
  const [allSkip, setAllSkip] = useState(0);

  const { t } = useTranslation();

  const { user: currentUser } = useUser();

  const debounceSearch = useDebounce(searchKeyword, 100);
  const tabArray = ["Workspaces", "Post"];

  const getSearchData = (skip: number = 0) => {
    setIsLoading(true);
    ExploreService.getSearch(debounceSearch, skip)
      .then((result) => {
        if (result.data.data.users?.length) {
          const users = result.data.data.users;
          setPeople(skip === 0 ? users : [...people, ...users]);
        }
        if (result.data.data.studios?.length) {
          const stu = result.data.data.studios;
          setStudios(skip === 0 ? stu : [...studios, ...stu]);
        }
        if (result.data.data.reels?.length) {
          const reelsData = result.data.data.reels;
          setReels(skip === 0 ? reelsData : [...reels, ...reelsData]);
        }
        setIsLoading(false);
        const next = parseInt(result.data.next) || -1;
        setAllSkip(next);
        setStudiosSkip(result.data.data.studios?.length ? next : -1);
        setReelsSkip(result.data.data.reels?.length ? next : -1);
        setPeopleSkip(result.data.data.users?.length ? next : -1);
      })
      .catch((err) => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (debounceSearch?.length >= 3) {
      getSearchData(0);
      setSelectedTab("All");
    } else {
      setSelectedTab("Workspaces");
      setAllSkip(0);
      setStudiosSkip(0);
      setReelsSkip(0);
      setPeopleSkip(0);
      setStudios([]);
      setReels([]);
      setPeople([]);
    }
  }, [debounceSearch]);

  const getNextPage = () => {
    if (allSkip !== -1) {
      getSearchData(allSkip);
    }
  };

  const tabSelectionHandler = (tab: string) => {
    setSelectedTab(tab);
  };

  const updateReel = (reel: ReelType): void => {
    const reelIndex = reels?.findIndex((re) => re.id === reel.id);
    if (reelIndex >= 0) {
      reels[reelIndex] = reel;
      setReels([...reels]);
    }
  };
  // searchKeyword && selectedTab !== "All"
  //   ? segmentEvents.searchFiltered(selectedTab)
  //   : null;

  return (
    <div className="pb-8">
      <TextInput
        leadingVisual={SearchIcon}
        placeholder="Search"
        onChange={(e) => {
          segmentEvents.searchStarted(
            currentUser?.id!,
            currentUser?.username!,
            e.target.value,
            "platform"
          );
          setSearchKeyword(e.target.value);
        }}
        sx={{
          borderWidth: 1,
          width: ["360px", "360px", "600px", "600px"],
          height: "40px",
          borderStyle: "solid",
          p: 2,
        }}
      />
      <UnderlineNav aria-label="Main" sx={{ gap: "24px", border: "none" }}>
        {searchKeyword.length >= 3 ? (
          <UnderlineNav.Link
            as="button"
            onClick={() => tabSelectionHandler("All")}
            sx={{ width: "85px" }}
            selected={selectedTab === "All"}
          >
            {selectedTab === "All" ? (
              <Text sx={{ fontWeight: "600" }}>All</Text>
            ) : (
              <Text>All</Text>
            )}
          </UnderlineNav.Link>
        ) : null}

        {tabArray.map((tab, i) => (
          <NavTab
            key={`${tab}-${i}`}
            tab={{
              name: tab,
              onClick: () => {
                tabSelectionHandler(tab);
              },
              isSelected: selectedTab === tab,
            }}
          />
        ))}
      </UnderlineNav>
      <div>
        {searchKeyword.length >= 3 ? (
          selectedTab === "Workspaces" ? (
            studios?.length > 0 ? (
              <InfiniteScroll
                hasMore={studiosSkip !== -1}
                dataLength={studios?.length}
                next={getNextPage}
                loader={<BipLoader />}
                className="space-y-8"
                scrollableTarget={"home-layout-content"}
              >
                {studios.map((studio: StudioType, i: number) => (
                  <StudioCard
                    key={`studio-${studio.id}-${i}`}
                    studio={studio}
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <p className="text-xl font-medium text-center my-44 whitespace-nowrap">
                {t("notFound.workspace")}
              </p>
            )
          // ) : selectedTab === "People" ? (
          //   people?.length > 0 ? (
          //     <InfiniteScroll
          //       hasMore={peopleSkip !== -1}
          //       dataLength={people?.length}
          //       next={getNextPage}
          //       loader={<BipLoader />}
          //       className="space-y-8"
          //       scrollableTarget={"home-layout-content"}
          //     >
          //       {people.map((user: UserType, i: number) => (
          //         <UserCard key={`user-${user.id}-${i}`} userDetails={user} />
          //       ))}
          //     </InfiniteScroll>
          //   ) : (
          //     <p className="text-xl font-medium text-center my-44 whitespace-nowrap">
          //       {t("notFound.user")}
          //     </p>
          //   )
          ) : selectedTab === "Post" ? (
            reels?.length > 0 ? (
              <InfiniteScroll
                hasMore={reelsSkip !== -1}
                dataLength={reels?.length}
                next={getNextPage}
                loader={<BipLoader />}
                className="space-y-8"
                scrollableTarget={"home-layout-content"}
              >
                {reels.map((reel, i: number) => (
                  <ReelCard
                    key={`reel-${reel.id}-${i}`}
                    reel={reel}
                    updateReel={updateReel}
                    usersType="global"
                  />
                ))}
              </InfiniteScroll>
            ) : (
              <p className="text-xl font-medium text-center my-44 whitespace-nowrap">
                {t("notFound.reel")}
              </p>
            )
          ) : (
            // <h1 className="text-xl font-medium text-center my-44 whitespace-nowrap">
            //   No Reels Available for now!
            // </h1>
            <InfiniteScroll
              hasMore={allSkip !== -1}
              dataLength={
                (studios?.length || 0) +
                (reels?.length || 0) +
                (people?.length || 0)
              }
              next={getNextPage}
              loader={<BipLoader />}
              className="space-y-8"
              scrollableTarget={"home-layout-content"}
            >
              <div>
                <div>
                  <h1 className="text-lg font-medium mt-7">
                    {t("workspace.title")}
                  </h1>
                  {studios?.length > 0 ? (
                    <div>
                      {studios.map((studio: StudioType, i: number) => (
                        <StudioCard
                          key={`studio-${studio.id}-${i}`}
                          studio={studio}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-lg font-normal text-center whitespace-nowrap">
                      {t("notFound.workspace")}
                    </p>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-medium">People</h1>
                  {people?.length > 0 ? (
                    <div>
                      {people.map((user: UserType, i: number) => (
                        <UserCard
                          key={`user-${user.id}-${i}`}
                          userDetails={user}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-lg font-normal text-center whitespace-nowrap">
                      {t("notFound.user")}
                    </p>
                  )}
                </div>
                <div className="mt-8">
                  <h1 className="text-lg font-medium">Post</h1>
                  {reels?.length > 0 ? (
                    <div>
                      {reels.map((reel: ReelType, i: number) => (
                        <div className="my-8" key={`reel-${reel.id}-${i}`}>
                          <ReelCard
                            reel={reel}
                            updateReel={updateReel}
                            usersType="global"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-lg font-normal text-center whitespace-nowrap">
                      {t("notFound.reel")}
                    </p>
                  )}
                </div>
              </div>
            </InfiniteScroll>
          )
        ) : selectedTab === "Workspaces" ? (
          <Studios />
        ) : (
          // ) : selectedTab === "People" ? (
          //   <People />
          <PopularReels />
        )}
      </div>
    </div>
  );
};

export default NavBar;
