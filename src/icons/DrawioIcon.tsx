import { useTheme } from "@primer/react";
import React from "react";
import Colors from "../utils/Colors";

const DrawioIcon = ({ height, width, color }) => {
  const { colorMode } = useTheme();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      id="Ebene_1"
      x="0px"
      y="0px"
      viewBox="0 0 161.6 161.6"
      enableBackground={"new 0 0 161.6 161.6"}
      height={height}
      width={width}
    >
      <g>
        <path
          fill="#F08705"
          d="M161.6,154.7c0,3.9-3.2,6.9-6.9,6.9H6.9c-3.9,0-6.9-3.2-6.9-6.9V6.9C0,3,3.2,0,6.9,0h147.8   c3.9,0,6.9,3.2,6.9,6.9L161.6,154.7L161.6,154.7z"
        />
        <g>
          <path
            fill="#DF6C0C"
            d="M161.6,154.7c0,3.9-3.2,6.9-6.9,6.9H55.3l-32.2-32.7l20-32.7l59.4-73.8l58.9,60.7L161.6,154.7z"
          />
        </g>
        <path
          fill="#FFFFFF"
          d="M132.7,90.3h-17l-18-30.6c4-0.8,7-4.4,7-8.6V28c0-4.9-3.9-8.8-8.8-8.8h-30c-4.9,0-8.8,3.9-8.8,8.8v23.1   c0,4.3,3,7.8,6.9,8.6L46,90.4H29c-4.9,0-8.8,3.9-8.8,8.8v23.1c0,4.9,3.9,8.8,8.8,8.8h30c4.9,0,8.8-3.9,8.8-8.8V99.2   c0-4.9-3.9-8.8-8.8-8.8h-2.9L73.9,60h13.9l17.9,30.4h-3c-4.9,0-8.8,3.9-8.8,8.8v23.1c0,4.9,3.9,8.8,8.8,8.8h30   c4.9,0,8.8-3.9,8.8-8.8V99.2C141.5,94.3,137.6,90.3,132.7,90.3z"
        />
      </g>
    </svg>
  );
};

export default DrawioIcon;
