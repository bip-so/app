import { setCookie } from "cookies-next";
import moment from "moment";
import { Editor } from "slate";
import styled from "styled-components";

import { BIP_DATE_FORMAT, BIP_TIME_FORMAT } from "../core/constants";
import UserService from "../modules/User/services";
import { EMAIL_REGEX, FIND_MULTIPLE_LINK_REGEX, LINK_REGEX } from "./Constants";

export const isValidEmail = (email = "") => {
  return String(email).trim().toLowerCase().match(EMAIL_REGEX);
};

export const isValidLink = (link = "") => {
  if (link === "") {
    return false;
  } else {
    return link.trim().toLowerCase().match(FIND_MULTIPLE_LINK_REGEX);
  }
};

export const getHttpLink = (link) => {
  return link.trim().startsWith("http") || link.trim().startsWith("mailto")
    ? link.trim()
    : "https://" + link.trim();
};

export const isEmpty = (object: any) => {
  if (object) {
    return Object.keys(object)?.length === 0;
  }
  return false;
};

export const sanitizeHandle = (handle: string) => {
  let processedHandle = handle;
  if (processedHandle?.startsWith("@")) {
    processedHandle = processedHandle?.substring(1);
  }
  return processedHandle;
};

export const getHandleDetails = async (handle: string) => {
  let processedHandle = sanitizeHandle(handle);
  if (processedHandle) {
    try {
      const { data: handleResponse } = await UserService.getHandleDetails(
        processedHandle
      );
      return {
        context: handleResponse.data.context,
        ...handleResponse.data.data,
      };
    } catch (_error) {
      throw new Error(_error?.data.error);
    }
  }
};

export const formatDate = (date: string, format = BIP_DATE_FORMAT) => {
  return moment(date).format(format);
};

export const formatDateAndTime = (date: string, format = BIP_TIME_FORMAT) => {
  return moment(date).format(format);
};

export const formatTimestamp = (timestamp: number) => {
  return moment.utc(timestamp).format(BIP_TIME_FORMAT);
};

export const DesktopContainer = styled.div`
  @media (max-width: 768px) {
    display: none !important;
  }
`;

export const MobileContainer = styled.div`
  @media (min-width: 769px) {
    display: none !important;
  }
`;

export const getCanvasTableOfContents = (editor: any) => {
  let latestHeadingLevel;
  let latestLevelParam;
  let mapping = [
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ];
  let contentsArray = [];
  editor.children.forEach((block, index) => {
    let blockText = Editor.string(editor, [index], { voids: true });
    if (
      (block.type === "heading1" ||
        block.type === "heading2" ||
        block.type === "heading3" ||
        block.type === "heading4" ||
        block.type === "heading5" ||
        block.type === "heading6") &&
      blockText !== ""
    ) {
      let headingLevel = parseInt(block.type.replace("heading", "")) - 1;
      if (typeof latestLevelParam === "undefined") {
        latestLevelParam = 0;
        latestHeadingLevel = headingLevel;
      } else if (headingLevel > latestHeadingLevel) {
        latestLevelParam = latestLevelParam + 1;
        latestHeadingLevel = headingLevel;
      } else if (headingLevel < latestHeadingLevel) {
        let j = headingLevel;
        while (j <= latestHeadingLevel) {
          if (typeof mapping[j] !== "undefined") {
            latestLevelParam = mapping[j];
            break;
          }
          j++;
        }
        latestHeadingLevel = headingLevel;
      }
      mapping[headingLevel] = latestLevelParam;
      let k = headingLevel + 1;
      while (k < 6) {
        mapping[k] = undefined;
        k++;
      }
      contentsArray.push({
        uuid: block.uuid,
        title: blockText,
        level: latestLevelParam,
      });
    }
  });
  return contentsArray;
};

export const timeAgoFormatter = function (
  value: number,
  unit: string,
  suffix: any
) {
  if (unit === "second") {
    return "just now";
  }
  if (value !== 1) {
    unit += "s";
  }
  return value + " " + unit + " " + suffix;
};

export const timeAgoFormatterWithoutSuffix = function (
  value: number,
  unit: string,
  suffix: any
) {
  if (unit === "second") {
    return "just now";
  }
  if (unit === "month") {
    return value + "mon";
  }
  return value + unit[0];
};

export const shortTimeAgoFormatter = function (
  value: number,
  unit: string,
  suffix: any
) {
  if (unit === "second") {
    return "now";
  }
  if (unit === "month") {
    return value + "mon";
  }
  return value + unit.slice(0, 1);
};

export const isStringEmpty = function (str) {
  return str.length === 0 || !str.trim();
};

export const stringReplaceAll = function (string, search, replaceWith) {
  if (typeof string !== "string") {
    string = "";
  }
  return string.split(search).join(replaceWith);
};

export const truncate = (name: string, length: number = 20) => {
  if (name) {
    if (name.length > length) {
      return name.substring(0, length) + "...";
    } else {
      return name;
    }
  } else {
    return "";
  }
};

export const getPageMeta = (blocksData: any, coverUrl: string) => {
  const textBlocks = blocksData.filter(
    (block: any) =>
      block.children.filter(
        (child: any) => child.text !== "" && child.text !== undefined
      ).length
  );
  let imageUrl = coverUrl;
  if (!imageUrl) {
    const imageBlock = blocksData.find((block: any) =>
      block.children.find((child: any) => {
        if (child.type === "image") imageUrl = child.url;
        return child.type === "image";
      })
    );
  }

  let description = "";
  if (textBlocks.length > 0) {
    description = textBlocks
      .slice(0, 2)
      .reduce((prev: any, current: any) => {
        return [...prev, ...current.children];
      }, [])
      .map((child: any) => child.text)
      .join(" ");
  }

  return {
    description,
    imageUrl,
  };
};

export const setTempStudioIdHeader = (id: string | number) => {
  const tmpStudioId = typeof id === "string" ? id : JSON.stringify(id);
  sessionStorage.setItem("bip-studio-id-tmp", tmpStudioId);
  setCookie("bip-studio-id-tmp", tmpStudioId);
};

export const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "PROD";

export const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === "LOCAL";
