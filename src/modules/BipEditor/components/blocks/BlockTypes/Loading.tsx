import React from "react";
import BipLoader from "../../../../../components/BipLoader";

const Loading = ({ attributes, children, data, actions, element }: any) => {
  const renderedJSX = <BipLoader />;
  return (
    <div {...attributes} className="my-2" contentEditable={false}>
      {renderedJSX}
      {children}
    </div>
  );
};

export default Loading;
