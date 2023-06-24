import { Avatar, IconButton, Spinner, Text } from "@primer/react";
import { ArrowLeftIcon } from "@primer/styled-octicons";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { AVATAR_PLACEHOLDER } from "../../src/commons/constants";

import { BipPage } from "../../src/commons/types";
import Handle from "../../src/components/Handle";
import ImageWithName from "../../src/components/ImageWithName";
import LinkWithoutPrefetch from "../../src/components/LinkWithoutPrefetch";
import { useStudio } from "../../src/context/studioContext";
import BipRouteUtils from "../../src/core/routeUtils";
import { HandleWrapper } from "../../src/hooks/useHandle";
import StudioLayout from "../../src/layouts/StudioLayout/StudioLayout";
import UserCard from "../../src/modules/Explore/components/cards/UserCard";
import StudioService from "../../src/modules/Studio/services";
import { Member } from "../../src/modules/Studio/types";
import { sanitizeHandle } from "../../src/utils/Common";

const StudioMembersPage: BipPage = () => {
  const { currentStudio } = useStudio();
  const router = useRouter();
  const handle = sanitizeHandle(router.query.handle as string);

  const [loading, setLoading] = useState<boolean>(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [skip, setSkip] = useState(0);

  useEffect(() => {
    if (currentStudio?.id && currentStudio?.handle === handle) {
      getMembers();
    }
  }, [currentStudio?.id, handle]);

  const getMembers = async () => {
    if (skip !== -1) {
      setLoading(true);
      const { data } = await StudioService.getMembers(skip);
      const mem = data?.data || [];
      const newSkip = data.next;
      setMembers([...members, ...mem]);
      setSkip(parseInt(newSkip));
      setLoading(false);
    }
  };

  return (
    <HandleWrapper>
      <div className="flex flex-col w-1/2 mx-auto mt-4">
        <div className="flex items-center space-x-2">
          <LinkWithoutPrefetch
            href={BipRouteUtils.getStudioAboutRoute(currentStudio?.handle!)}
          >
            <IconButton
              aria-label="Back"
              icon={ArrowLeftIcon}
              sx={{
                border: "none",
                borderRadius: "50%",
                background: "transparent",
                boxShadow: "none",
              }}
            />
          </LinkWithoutPrefetch>
          <div className="flex items-center space-x-4">
            <ImageWithName
              sx={{
                width: "40px",
                height: "40px",
                color: "text.default",
              }}
              src={currentStudio?.imageUrl}
              name={currentStudio?.displayName}
            />
            <div className="flex flex-col">
              <Text fontWeight={"bold"} fontSize="16px">
                {currentStudio?.displayName}
              </Text>
              <Handle handle={currentStudio?.handle || ""} />
            </div>
          </div>
        </div>
        <InfiniteScroll
          hasMore={skip !== -1}
          dataLength={members.length}
          next={getMembers}
          loader={""}
          className="mx-auto mb-8"
          style={{ overflow: "unset" }}
          scrollableTarget={"studio-layout-content"}
        >
          {members.map((member: Member) => (
            <UserCard key={member.user.uuid} userDetails={member.user} />
          ))}
        </InfiniteScroll>

        {loading ? (
          <div className="mx-auto my-8">
            <Spinner
              size="small"
              sx={{
                color: "success.fg",
              }}
            />
          </div>
        ) : null}
      </div>
    </HandleWrapper>
  );
};

StudioMembersPage.getLayout = function getLayout(
  page: ReactElement,
  hideSidebar
) {
  return <StudioLayout>{page}</StudioLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

StudioMembersPage.auth = false;
export default StudioMembersPage;
