import React from "react";
import { Box } from "@primer/react";
import Link, { LinkProps } from "next/link";

const LinkWithoutPrefetch = (props: any) => {
  // defaults prefetch to false if `prefetch` is not true
  return (
    <Link {...props} prefetch={props.prefetch ?? false}>
      {props.children}
    </Link>
  );
};

export default LinkWithoutPrefetch;
