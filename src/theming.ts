import deepmerge from "deepmerge";
import { theme } from "@primer/react";

import colors from "./utils/Colors";
import { lightTheme } from "./lightTheme";
import { darkTheme } from "./darkTheme";

export const bipTheme = deepmerge(theme, {
  fonts: {
    mono: "Roboto, sans-serif",
  },
  colors: {
    text: {
      black: colors.black,
      white: colors.white,
      primary: colors.gray["900"],
      gray: colors.gray["600"],
      grayDark: colors.gray["700"],
      grayLight: colors.gray["500"],
      grayUltraLight: colors.gray["400"],
      blue: colors.blue["500"],
      blueHoverLink: colors.blue["300"],
      blueForLink: colors.blue["400"],
      green: colors.green["600"],
      yellow: colors.yellow["800"],
      orange: colors.orange["900"],
      orangeLight: colors.orange["600"],
      red: colors.red["600"],
      pink: colors.pink["500"],
      purple: colors.purple["500"],
      bunker: colors.bunker,
    },
    border: {
      white: colors.white,
      lightBlue: colors.blue["200"],
      blue: colors.blue["500"],
      green: colors.green["400"],
      red: colors.red["500"],
      purple: colors.purple["500"],
      yellow: colors.yellow["300"],
    },
  },
  colorSchemes: {
    // Customize an existing scheme
    light: {
      colors: {
        ...lightTheme,
      },
    },
    dark: {
      colors: {
        ...darkTheme,
      },
    },
  },
});
