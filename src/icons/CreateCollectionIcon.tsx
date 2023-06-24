import { useTheme } from "@primer/react";
import React from "react";
import Colors from "../utils/Colors";

interface CreateCollectionIconProps {
  color?: string;
}

const CreateCollectionIcon = (props: CreateCollectionIconProps) => {
  const { colorMode } = useTheme();
  const isDay = colorMode === "day";
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.512563 1.51256C0.840752 1.18437 1.28587 1 1.75 1H5.25C5.8 1 6.32 1.26 6.65 1.7L7.55 2.9C7.57329 2.93105 7.60348 2.95625 7.6382 2.97361C7.67291 2.99096 7.71119 3 7.75 3H14.25C14.7141 3 15.1592 3.18437 15.4874 3.51256C15.8156 3.84075 16 4.28587 16 4.75V13.25C16 13.7141 15.8156 14.1592 15.4874 14.4874C15.1592 14.8156 14.7141 15 14.25 15H1.75C0.784 15 0 14.216 0 13.25V2.75C0 2.28587 0.184374 1.84075 0.512563 1.51256ZM1.69859 2.5C1.59301 2.5 1.50741 2.58321 1.50741 2.68587L1.5 13.3141C1.5 13.4168 1.58559 13.5 1.69118 13.5H14.3088C14.4144 13.5 14.5 13.4168 14.5 13.3141V4.71783C14.5 4.61518 14.4144 4.53197 14.3088 4.53197H7.83094C7.38812 4.53197 6.97397 4.319 6.72476 3.96313L5.65803 2.58126C5.62242 2.53042 5.56326 2.5 5.5 2.5H1.69859Z"
        fill={
          props?.color
            ? props.color
            : isDay
            ? Colors.noColorName
            : Colors.gray["500"]
        }
      />
      <path
        d="M8.75 6.75C8.75 6.33579 8.41421 6 8 6C7.58579 6 7.25 6.33579 7.25 6.75V8.25H5.75C5.33579 8.25 5 8.58579 5 9C5 9.41421 5.33579 9.75 5.75 9.75H7.25V11.25C7.25 11.6642 7.58579 12 8 12C8.41421 12 8.75 11.6642 8.75 11.25V9.75H10.25C10.6642 9.75 11 9.41421 11 9C11 8.58579 10.6642 8.25 10.25 8.25H8.75V6.75Z"
        fill={
          props?.color
            ? props.color
            : isDay
            ? Colors.noColorName
            : Colors.gray["500"]
        }
      />
    </svg>
  );
};

export default CreateCollectionIcon;
