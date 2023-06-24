import React from "react";

interface IconProps {
  color?: string;
}

function SmileyIcon(props: IconProps) {
  const { color } = props;

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
        fill={color || "currentColor"}
        fillRule="evenodd"
        d="M5.707 7.707a1 1 0 11-1.414-1.414 1 1 0 011.414 1.414zm6 0a1 1 0 10-1.414-1.414 1 1 0 001.414 1.414zM5.875 9.511a.75.75 0 00-.555.125h-.001a.75.75 0 00-.183 1.044l.614-.43-.612.432v.002l.002.003.005.006.014.02.042.053c.196.231.422.434.673.604.474.322 1.18.63 2.126.63a3.766 3.766 0 002.127-.629c.192-.13.37-.279.53-.445.066-.067.128-.138.184-.213l.014-.019.005-.007.002-.003.001-.002v-.001l-.07-.05.071.05a.75.75 0 10-1.222-.87l-.007.008c-.103.118-.22.222-.35.31-.265.179-.683.371-1.285.371-.602 0-1.021-.192-1.285-.37a1.821 1.821 0 01-.35-.31l-.007-.009a.75.75 0 00-.483-.3zm4.375.739l.543.38-.543-.38z"
        clipRule="evenodd"
      ></path>
      <path
        fill={color || "currentColor"}
        d="M1.5 8a6.5 6.5 0 017.492-6.424L9.228.095a8 8 0 106.667 6.615L14.422 7A6.5 6.5 0 111.5 8z"
      ></path>
      <path
        fill={color || "currentColor"}
        d="M13.25 0a.75.75 0 01.75.75V2h1.25a.75.75 0 010 1.5H14v1.25a.75.75 0 01-1.5 0V3.5h-1.25a.75.75 0 010-1.5h1.25V.75a.75.75 0 01.75-.75z"
      ></path>
    </svg>
  );
}

export default SmileyIcon;
