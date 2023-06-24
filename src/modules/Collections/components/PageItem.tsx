import React from "react";

import CollectionItem from "./CollectionItem";
import CanvasItem from "./CanvasItem";
import BranchItem from "./BranchItem";

export const PageItem = (props: any) => {
  if (props.node.defaultLanguageCanvasRepoId) {
    return <></>;
  }
  switch (props.node.type) {
    case "COLLECTION":
      return <CollectionItem isCollection={true} {...props} />;
    case "CANVAS":
      return <CanvasItem {...props} />;
    default:
      return <></>;
  }
};
