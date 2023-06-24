import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

import { BipPage } from "../../../src/commons/types";
import BipLoader from "../../../src/components/BipLoader";
import { useStudio } from "../../../src/context/studioContext";
import BipRouteUtils from "../../../src/core/routeUtils";
import { HandleWrapper, useHandle } from "../../../src/hooks/useHandle";
import CanvasBranchService from "../../../src/modules/Canvas/services/canvasBranch";

const CanvasInviteTokenPage: BipPage = () => {
  const router = useRouter();
  const { code, canvasTitle } = router.query;

  const { loading: loadingHandle, data: handleData } = useHandle();

  const getAccessCodeDetails = async () => {
    try {
      const { data: accessCodeData } =
        await CanvasBranchService.getBranchAccessTokenDetail(code as string);
      router.push({
        pathname: BipRouteUtils.getCanvasRoute(
          accessCodeData?.studioHandle!,
          canvasTitle as string,
          accessCodeData.branchId
        ),
        query: {
          inviteCode: code as string,
        },
      });
    } catch (error) {
      console.log("Invalid access code.");
      router.push({
        pathname: BipRouteUtils.getHomeRoute(),
      });
    }
  };

  const { data, error } = useSWR(
    code && !loadingHandle ? [code, "access-code"] : null,
    getAccessCodeDetails
  );
  const isLoading = !data && !error;

  useEffect(() => {
    if (code) {
      console.log(code);
    }
  }, [router.query]);

  return <HandleWrapper>{isLoading ? <BipLoader /> : null}</HandleWrapper>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

CanvasInviteTokenPage.auth = false;
export default CanvasInviteTokenPage;
