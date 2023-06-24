import { themeGet } from "@primer/react";
import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 250px;
  max-height: 400px;
  min-height: 100px;
  padding: 8px 0px;
  background: ${(props: any) =>
    props.isPinned ? "transparent" : themeGet("colors.toc.bg")};
  box-shadow: ${(props: any) =>
    props.isPinned
      ? "none"
      : "0px 8px 24px rgba(66, 74, 83, 0.12), 0px 1px 3px rgba(27, 31, 36, 0.12)"};
  border-radius: 12px;
  position: fixed;
  top: ${(props: any) => props.top || "125px"};
  right: ${(props: any) => (props.isPinned ? "20px" : "-220px")};
  z-index: 10;
  transition: 0.3s;
  border-width: ${(props: any) => (props.isPinned ? "0px" : "1px")};
  border-color: ${(props: any) =>
    props.isPinned ? "none" : themeGet("colors.toc.border")};
  &:hover {
    right: ${(props: any) => (props.isPinned ? "20px" : "-12px")};
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 22px 10px 8px;
`;

export const Divider = styled.div`
  height: 1px;
  background: rgba(208, 215, 222, 0.48);
`;

export const ContentHeadings = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 12px 12px 0px 12px;
`;

export const HeadingText = styled.p`
  font-weight: ${(props: any) => (props.isActive ? 500 : 400)};
  font-size: 13px;
  line-height: 19px;
  cursor: pointer;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(props: any) =>
    props.isActive
      ? themeGet("colors.toc.activeText")
      : themeGet("colors.toc.text")};
  &:hover {
    color: ${themeGet("colors.toc.activeText")};
    font-weight: 500;
  }
`;

export const TextContainer = styled.div`
  display: flex;
  align-items: center;
  padding-left: ${(props: any) =>
    props.level ? `${props.level * 12}px` : "0px"};
`;

export const EmptyIconContainer = styled.div`
  width: 12px;
`;
