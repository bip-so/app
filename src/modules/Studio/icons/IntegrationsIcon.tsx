import React from "react";

interface IntegrationsIconProps {
  color?: string;
}

function IntegrationsIcon(props: IntegrationsIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="14"
      fill="none"
      viewBox="0 0 16 14"
    >
      <path
        fill={props?.color || "#21262D"}
        fillRule="evenodd"
        d="M10.276 2.09a.25.25 0 01.192-.09h.782a.25.25 0 01.25.25v8.5a.25.25 0 01-.25.25h-.782a.25.25 0 01-.192-.09l-.95-1.14a.75.75 0 00-.483-.264l-3.124-.39a.25.25 0 01-.219-.249V4.133a.25.25 0 01.219-.248l3.124-.39a.75.75 0 00.483-.265l.95-1.14zM4 7v1.867a1.75 1.75 0 001.533 1.737l2.83.354.761.912c.332.4.825.63 1.344.63h.782A1.75 1.75 0 0013 10.75V10h2.25a.75.75 0 000-1.5H13v-4h2.25a.75.75 0 000-1.5H13v-.75A1.75 1.75 0 0011.25.5h-.782c-.519 0-1.012.23-1.344.63l-.76.913-2.831.353A1.75 1.75 0 004 4.133V5.5H2.5A2.5 2.5 0 000 8v5.25a.75.75 0 001.5 0V8a1 1 0 011-1H4z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export default IntegrationsIcon;
