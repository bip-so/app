import { supabase } from "../utils/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";
import { SUPABASE_TABLES } from "./constants";

const bipChannels = {
  realtime: (
    userId: number,
    bootstrapCallBack: Function,
    updateCallBack: Function
  ): RealtimeChannel =>
    supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: SUPABASE_TABLES.USERS,
          filter: `user_id=eq.${userId ?? 0}`,
        },
        (payload: any) => {
          bootstrapCallBack(payload);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: SUPABASE_TABLES.DEPLOYMENTS,
          filter: `id=eq.1`,
        },
        (payload: any) => {
          updateCallBack(payload);
        }
      ),
};

export default bipChannels;
