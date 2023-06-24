import { FC, useEffect } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useRouter } from "next/router";

import { useUser } from "../context/userContext";
import bipChannels from "../realtime/channels";
import { supabase } from "../utils/supabaseClient";

interface IBipRealTimeProps {}

const BipRealTime: FC<IBipRealTimeProps> = (props) => {
  const { isLoggedIn, user, initUserStudios } = useUser();

  const router = useRouter();

  const updateCallbackHandler = (payload: any) => {
    const newBuildId = payload.new.build_id;
    const localBuildId = sessionStorage.getItem("buildId");
    if (newBuildId !== localBuildId) {
      alert("App updated, reloading page.");
      router.reload();
    }
  };

  const refetchBootstrapHandler = (payload: any) => {
    const studiosUpdated = payload.new.studio_update;
    if (studiosUpdated) {
      initUserStudios(user!);
    }
  };

  useEffect(() => {
    let studiosChannel: RealtimeChannel | null = null;
    (async () => {
      studiosChannel = bipChannels
        .realtime(
          user?.id!,
          (payload: any) => {
            if (isLoggedIn && user) {
              refetchBootstrapHandler(payload);
            }
          },
          (payload: any) => {
            updateCallbackHandler(payload);
          }
        )
        .subscribe();
    })();

    return () => {
      if (studiosChannel) {
        supabase.removeChannel(studiosChannel!);
      }
    };
  }, [isLoggedIn, user]);
  return <></>;
};

export default BipRealTime;
