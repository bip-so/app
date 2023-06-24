import { IconButton, useTheme } from "@primer/react";
import { MoonIcon, SunIcon } from "@primer/styled-octicons";
import { FC } from "react";

interface IThemeToggleProps {}

const ThemeToggle: FC<IThemeToggleProps> = (props) => {
  const { colorMode, setColorMode } = useTheme();
  return (
    <IconButton
      icon={colorMode === "day" ? SunIcon : MoonIcon}
      size="small"
      onClick={() => {
        if (colorMode === "day") {
          setColorMode("night");
          localStorage.setItem("app-theme", "night");
        } else {
          setColorMode("day");
          localStorage.setItem("app-theme", "day");
        }
      }}
      sx={{
        border: "none",
        bg: "transparent",
        boxShadow: "none",
        color: "auth.header.text",
        ":hover:not([disabled])": {
          bg: "transparent",
        },
      }}
    />
  );
};

export default ThemeToggle;
