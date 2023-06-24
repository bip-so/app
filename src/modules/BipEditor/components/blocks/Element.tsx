import React from "react";
import Default from "./BlockTypes/Default";
import Embed from "./BlockTypes/Embed";
import Code from "./BlockTypes/Code";
import Callout from "./BlockTypes/Callout";
import Heading from "./BlockTypes/Heading";
import Loading from "./BlockTypes/Loading";
import BlockWrapper from "./BlockWrapper";
import Diff from "./BlockTypes/Diff";
import { EMBEDS } from "../../constants";
import ImageBlock from "./BlockTypes/ImageBlock";
import AttachmentBlock from "./BlockTypes/AttachmentBlock";
import ExcalidrawBlock from "./BlockTypes/Excalidraw";
import DividerBlock from "./BlockTypes/DividerBlock";
import UnorderedList from "./BlockTypes/UnorderedList";
import OrderedList from "./BlockTypes/OrderedList";
import CheckList from "./BlockTypes/CheckList";
import MergeBlockWrapper from "./MergeBlockWrapper";
import UserMentionBlock from "./BlockTypes/UserMentionBlock";
import PageMentionBlock from "./BlockTypes/PageMentionBlock";
import useDeviceDimensions from "../../../../hooks/useDeviceDimensions";
import { getReelsOnBlock } from "../../utils";
import { useCanvas } from "../../../../context/canvasContext";
import { useRightRail } from "../../../../context/rightRailContext";
import ViewBlockWrapper from "./ViewBlockWrapper";
import { Box } from "@primer/react";
import TOC from "./BlockTypes/TOC";
import Table from "./BlockTypes/Table";
import TableRow from "./BlockTypes/TableRow";
import TableCell from "./BlockTypes/TableCell";
import { TableProvider } from "../../../../context/tableContext";
import Subtext from "./BlockTypes/Subtext";
import Quote from "./BlockTypes/Quote";

const Element = (props: any) => {
  const { isTabletOrMobile } = useDeviceDimensions();
  let elementType = props.element.type;
  if (EMBEDS.map((x) => x.type).includes(elementType)) {
    elementType = "embed";
  }

  let renderElement = null;
  switch (elementType) {
    case "heading1":
      renderElement = <Heading variant={props.element.type} {...props} />;
      break;
    case "heading2":
      renderElement = <Heading variant={props.element.type} {...props} />;
      break;
    case "heading3":
      renderElement = <Heading variant={props.element.type} {...props} />;
      break;
    case "heading4":
      renderElement = <Heading variant={props.element.type} {...props} />;
      break;
    case "heading5":
      renderElement = <Heading variant={props.element.type} {...props} />;
      break;
    case "heading6":
      renderElement = <Heading variant={props.element.type} {...props} />;
      break;
    case "callout":
      renderElement = <Callout {...props} />;
      break;
    case "code":
      renderElement = <Code {...props} />;
      break;
    case "diff":
      renderElement = <Diff {...props} />;
      break;
    case "video":
      return <Embed {...props} />;
    case "embed":
      return <Embed {...props} />;
    case "tweet":
      return <Embed {...props} />;
    case "drawio":
      return <Embed {...props} />;
    case "loading":
      renderElement = <Loading {...props} />;
      break;
    case "image":
      return <ImageBlock {...props} />;
    case "attachment":
      return <AttachmentBlock {...props} />;
    case "excalidraw":
      return <ExcalidrawBlock {...props} />;
    case "hr":
      return <DividerBlock {...props} />;
    case "ulist":
      renderElement = <UnorderedList {...props} />;
      break;
    case "olist":
      renderElement = <OrderedList {...props} />;
      break;
    case "checklist":
      renderElement = <CheckList {...props} />;
      break;
    case "pageMention":
      return <PageMentionBlock {...props} />;
    case "userMention":
      return <UserMentionBlock {...props} />;
    case "toc":
      return <TOC {...props} />;

    case "simple_table_v1":
      renderElement = (
        <TableProvider>
          <Table {...props} />
        </TableProvider>
      );
      break;
    case "table-row":
      return <TableRow {...props} />;
    case "table-cell":
      return <TableCell {...props} />;
    case "subtext":
      renderElement = <Subtext {...props} />;
      break;
    case "quote":
      renderElement = <Quote {...props} />;
      break;
    default:
      renderElement = <Default {...props} />;
  }

  if (props.element.cellUUID) {
    return renderElement;
  }

  if (props?.data?.isMergeRequest) {
    return <MergeBlockWrapper {...props}>{renderElement}</MergeBlockWrapper>;
  }

  return props.isReadOnly && props.viewOnly ? (
    <ViewBlockWrapper {...props} block={props.element}>
      <div
        style={{
          flexGrow: 1,
          wordBreak: "break-word",
          width: isTabletOrMobile ? "80%" : "100%",
        }}
      >
        {renderElement}
      </div>
    </ViewBlockWrapper>
  ) : (
    <BlockWrapper {...props} block={props.element}>
      <div
        style={{
          flexGrow: 1,
          wordBreak: "break-word",
          width: isTabletOrMobile ? "80%" : "100%",
        }}
      >
        {renderElement}
      </div>
    </BlockWrapper>
  );
};

export default Element;
