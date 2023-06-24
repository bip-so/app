import React from "react";

interface AddReelIconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

function AddReelIcon(props: AddReelIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props?.width || "17"}
      height={props?.height || "16"}
      fill="none"
      viewBox="0 0 17 16"
      style={{
        display: "inline-block",
        userSelect: "none",
        verticalAlign: "text-bottom",
        overflow: "visible",
      }}
    >
      <path
        fill={props?.color || "#8d8d8d"}
        fillRule="evenodd"
        d="M6.187 3.5H2.25a.75.75 0 00-.53 1.28v3.94a.75.75 0 000 1.06v3.94A.75.75 0 002.25 15h7.5a.75.75 0 00.53-1.28v-.718h-1.5v.498H3.22V10h2.967V8.5H3.22V5h2.967V3.5z"
        clipRule="evenodd"
      ></path>
      <path
        fill={props?.color || "#8d8d8d"}
        fillRule="evenodd"
        d="M6.5 1.75A.75.75 0 017.25 1h7.5a.75.75 0 110 1.5h-7.5a.75.75 0 01-.75-.75zm0 5A.75.75 0 017.25 6h7.5a.75.75 0 110 1.5h-7.5a.75.75 0 01-.75-.75zM7.25 11a.75.75 0 100 1.5h7.5a.75.75 0 100-1.5h-7.5z"
        clipRule="evenodd"
      ></path>
      <path
        fill={props?.color || "#8d8d8d"}
        d="M14 12a.75.75 0 001.28-.53v-9.5a.75.75 0 10-1.5 0v9.5c0 .199.08.39.22.53zM6.94 12.06a.75.75 0 001.28-.53v-9.5a.75.75 0 10-1.5 0v9.5c0 .2.079.39.22.53z"
      ></path>
    </svg>
  );
}

export default AddReelIcon;
