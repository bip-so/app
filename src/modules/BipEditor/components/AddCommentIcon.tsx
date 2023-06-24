import React from "react";

interface AddCommentIconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
}

function AddCommentIcon(props: AddCommentIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
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
        d="M2.573 3.573A.25.25 0 012.75 3.5H8V2H2.75A1.75 1.75 0 001 3.75v7.5A1.75 1.75 0 002.75 13H4v1.543a1.457 1.457 0 002.487 1.03L9.06 13h4.19A1.75 1.75 0 0015 11.25V8h-1.5v3.25a.25.25 0 01-.25.25h-4.5a.75.75 0 00-.53.22L5.5 14.44v-2.19a.75.75 0 00-.75-.75h-2a.25.25 0 01-.25-.25v-7.5a.25.25 0 01.073-.177z"
        clipRule="evenodd"
      ></path>
      <path
        fill={props?.color || "#8d8d8d"}
        d="M13.75.75a.75.75 0 00-1.5 0v1.5h-1.5a.75.75 0 000 1.5h1.5v1.5a.75.75 0 001.5 0v-1.5h1.5a.75.75 0 000-1.5h-1.5V.75z"
      ></path>
    </svg>
  );
}

export default AddCommentIcon;
