import React from "react";

function RocketIcon({ size }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || "24"}
      height={size || "24"}
      fill="none"
      viewBox="0 0 24 24"
    >
      <g clipPath="url(#clip0_1747_16710)">
        <path
          fill="#A0041E"
          d="M.667 11.333L6 6.667l10.667.666L17.334 18l-4.667 5.333s0-3.999-4-8c-4-4-8-4-8-4z"
        ></path>
        <path
          fill="#FFAC33"
          d="M.648 23.333S.624 18.014 2.638 16C4.652 13.986 10 14.125 10 14.125s0 5.208-2 7.208-7.352 2-7.352 2z"
        ></path>
        <path
          fill="#FFCC4D"
          d="M6 20.667a2.667 2.667 0 100-5.334 2.667 2.667 0 000 5.334z"
        ></path>
        <path
          fill="#55ACEE"
          d="M23.999 0S17.332 0 9.332 6.667c-4 3.333-4 9.333-2.666 10.666 1.333 1.334 7.333 1.334 10.666-2.666C24 6.667 24 0 24 0z"
        ></path>
        <path
          fill="#000"
          d="M18 3.333a2.664 2.664 0 00-2.428 1.574 2.646 2.646 0 012.98.54 2.65 2.65 0 01.542 2.979A2.662 2.662 0 0018 3.334z"
        ></path>
        <path
          fill="#A0041E"
          d="M5.333 18.667s0-2.667.667-3.334c.666-.666 8.667-7.332 9.333-6.666.666.666-6 8.666-6.667 9.333-.667.667-3.333.667-3.333.667z"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_1747_16710">
          <path fill="#fff" d="M0 0H24V24H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}

export default RocketIcon;
