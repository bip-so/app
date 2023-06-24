import { useRouter } from "next/router";
import { ReactElement } from "react";
import useSWR from "swr";

import { BipPage } from "../../../../src/commons/types";
import BipLoader from "../../../../src/components/BipLoader";
import BipRouteUtils from "../../../../src/core/routeUtils";
import StudioLayout from "../../../../src/layouts/StudioLayout/StudioLayout";
import { CanvasRepoService } from "../../../../src/modules/Canvas/services";

const CanvasRepoPage: BipPage = () => {
  const router = useRouter();

  const handle = router.query.handle as string;
  const repoKey = router.query.repoKey as string;
  const inviteCode = router.query.inviteCode as string;

  const fetchCanvasRepo = async (key: string) => {
    try {
      const { data: repoData } = await CanvasRepoService.getRepo(
        key,
        inviteCode
      );
      router.push(
        BipRouteUtils.getCanvasRoute(
          handle,
          repoData.data.name,
          repoData.data.defaultBranch.id
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  const { data, error } = useSWR(
    repoKey ? [repoKey, "canvas-repo"] : null,
    fetchCanvasRepo,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return <BipLoader />;
};

CanvasRepoPage.getLayout = function getLayout(page: ReactElement, hideSidebar) {
  return <StudioLayout>{page}</StudioLayout>;
};

CanvasRepoPage.auth = false;
export default CanvasRepoPage;
