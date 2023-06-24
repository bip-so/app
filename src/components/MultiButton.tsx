import React, { useState, useRef, FC, ReactNode } from "react";

interface MultiButtonProps {
  btnMenuData: {
    title: string;
    handleClick: () => void;
    icon?: any;
  }[];
  isLoading: boolean;
  mainBtnClickHandler: () => void;
  children: ReactNode;
}

const MultiButton: FC<MultiButtonProps> = ({
  btnMenuData,
  isLoading,
  mainBtnClickHandler,
  children,
}) => {
  return <div>{children}</div>;
};

export default MultiButton;
