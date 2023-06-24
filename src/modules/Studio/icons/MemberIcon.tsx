import React from "react";

interface MemberIconProps {
  color?: string;
}

function MemberIcon(props: MemberIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="14"
      fill="none"
      viewBox="0 0 12 14"
    >
      <path
        fill={props?.color || "#21262D"}
        fillRule="evenodd"
        d="M8.5 4a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

export default MemberIcon;
