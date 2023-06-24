import { useRouter } from "next/router";

import { BipPage } from "../../src/commons/types";
import BipLoader from "../../src/components/BipLoader";
import Layout from "../../src/components/Layout";
import { useStudio } from "../../src/context/studioContext";
import { HandleEnum } from "../../src/core/enums";
import BipRouteUtils from "../../src/core/routeUtils";
import { useHandle } from "../../src/hooks/useHandle";
import StudioLayout from "../../src/layouts/StudioLayout/StudioLayout";
import UserFollowersOrFollowings from "../../src/modules/User/components/UserFollowersOrFollowings";
import { sanitizeHandle } from "../../src/utils/Common";

const FollowingsPage: BipPage = () => {
  const router = useRouter();

  const { loading, data } = useHandle();

  const { currentStudio } = useStudio();

  if (!loading && data && data.context !== HandleEnum.User) {
    router.push(BipRouteUtils.getStudioAboutRoute(sanitizeHandle(data.handle)));
  }

  return currentStudio?.id ? (
    <StudioLayout>
      {loading ? (
        <BipLoader />
      ) : (
        <UserFollowersOrFollowings type="followings" data={data} />
      )}
    </StudioLayout>
  ) : (
    <Layout>
      {loading ? (
        <BipLoader />
      ) : (
        <UserFollowersOrFollowings type="followings" data={data} />
      )}
    </Layout>
  );
};

FollowingsPage.auth = false;

export default FollowingsPage;
