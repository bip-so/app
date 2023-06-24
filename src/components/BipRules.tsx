import { RealtimeChannel } from "@supabase/supabase-js";
import { getCookie, setCookie } from "cookies-next";
import { access } from "fs";
import { Router, useRouter } from "next/router";
import { FC, useEffect } from "react";
import { useUser } from "../context/userContext";
import bipChannels from "../realtime/channels";
import { SUPABASE_TABLES } from "../realtime/constants";
import { isDev, isEmpty } from "../utils/Common";
import { dateMonthYearDate } from "../utils/date";
import { supabase } from "../utils/supabaseClient";

interface IBipRulesProps {}

const BipRules: FC<IBipRulesProps> = (props) => {
  const router = useRouter();
  const { user, initUserStudios } = useUser();

  useEffect(() => {
    // setting buildId from Supabase
    const setBuildId = async () => {
      const { data } = await supabase
        .from(SUPABASE_TABLES.DEPLOYMENTS)
        .select("build_id")
        .eq("id", 1);
      const buildId = data![0].build_id;
      sessionStorage.setItem("buildId", buildId);
    };

    setBuildId();
  }, []);

  useEffect(() => {
    const syncUserStudios = async () => {
      // const userStudiosUpdated = await checkUserStudiosUpdate();
      // if (userStudiosUpdated) {
      await initUserStudios(user!);
      localStorage.removeItem("refetchBootstrap");
      // await resetUserStudiosUpdate();
      // }
    };
    if (user && !isEmpty(user)) {
      const cutoffDate = dateMonthYearDate(new Date("2022-11-30").toString());
      const lastLoginDate = dateMonthYearDate(user.lastLogin?.toString()!);
      if (lastLoginDate <= cutoffDate) {
        const studiosRefreshed = Boolean(
          localStorage.getItem("studiosRefreshed")
        );
        if (!studiosRefreshed) {
          syncUserStudios();
          localStorage.setItem("studiosRefreshed", "true");
        }
      }

      // setting cookie for ssr
      const accessToken = getCookie("access-token");
      if (!accessToken) {
        setCookie("access-token", user.accessToken);
        router.reload();
      }
    }
  }, [user]);
  return <></>;
};

export default BipRules;
