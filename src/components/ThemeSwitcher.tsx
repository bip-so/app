import { useTheme } from "@primer/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useUser } from "../context/userContext";

const ThemeSwitcher = () => {
  const router = useRouter();
  const { isLoggedIn } = useUser();
  const { setColorMode } = useTheme();

  useEffect(() => {
    setTimeout(() => {
      if (router.isReady) {
        let colorMode = localStorage.getItem("app-theme");
        if (!colorMode) {
          colorMode =
            (!isLoggedIn &&
              ["/", "/auth/signin", "/auth/setup"].includes(router.pathname)) ||
            ["/auth/setup"].includes(router.pathname)
              ? "day"
              : window?.matchMedia("(prefers-color-scheme: dark)")?.matches
              ? "night"
              : "day";
        }
        setColorMode(() => colorMode);
      }
    });
  }, [router, isLoggedIn]);

  return null;
};

export default ThemeSwitcher;
