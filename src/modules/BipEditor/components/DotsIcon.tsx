import { useTheme } from "@primer/react";
import React from "react";

function DotsIcon() {
  const { colorMode } = useTheme();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
      className="sc-AxjAm dQgIel"
      viewBox="0 0 24 24"
      style={{
        width: 16,
        height: 16,
        display: "inline-block",
        verticalAlign: "text-bottom",
      }}
      color={colorMode === "day" ? "rgba(55, 53, 47, 0.3)" : "#C9D1D9"}
    >
      <path fill="none" d="M0 0h24v24H0V0z"></path>
      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
    </svg>
  );
}

export default DotsIcon;
