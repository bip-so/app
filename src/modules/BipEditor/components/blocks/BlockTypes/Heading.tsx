import React from "react";
import { Heading as HeadingCom } from "@primer/react";

const Heading = ({
  variant,
  attributes,
  children,
  data,
  actions,
  element,
}: any) => {
  let heading;
  switch (variant) {
    case "heading1":
      heading = (
        <HeadingCom
          as="h1"
          sx={{
            fontSize: "1.875rem",
            lineHeight: "2.25rem",
            color: "headings.text",
          }}
          {...attributes}
        >
          {children}
        </HeadingCom>
      );
      break;
    case "heading2":
      heading = (
        <HeadingCom
          as="h2"
          sx={{
            fontSize: "1.5rem",
            lineHeight: "2rem",
            color: "headings.text",
          }}
          {...attributes}
        >
          {children}
        </HeadingCom>
      );
      break;
    case "heading3":
      heading = (
        <HeadingCom
          as="h3"
          sx={{
            fontSize: "1.25rem",
            lineHeight: "1.75rem",
            color: "headings.text",
          }}
          {...attributes}
        >
          {children}
        </HeadingCom>
      );
      break;
    case "heading4":
      heading = (
        <HeadingCom
          as="h4"
          sx={{
            fontSize: "1rem",
            lineHeight: "1.5rem",
            color: "headings.text",
          }}
          {...attributes}
        >
          {children}
        </HeadingCom>
      );
      break;
    case "heading5":
      heading = (
        <HeadingCom
          as="h5"
          sx={{
            fontSize: "1rem",
            lineHeight: "1.5rem",
            color: "headings.text",
            fontStyle: "italic",
          }}
          {...attributes}
        >
          {children}
        </HeadingCom>
      );
      break;
    case "heading6":
      heading = (
        <HeadingCom
          as="h6"
          sx={{
            fontSize: "1rem",
            lineHeight: "1.5rem",
            color: "headings.text",
            fontStyle: "italic",
          }}
          {...attributes}
        >
          {children}
        </HeadingCom>
      );
      break;
    default:
  }

  return (
    <div id={element?.uuid} style={{ scrollMarginTop: "130px" }}>
      {heading}
    </div>
  );
};

export default Heading;
