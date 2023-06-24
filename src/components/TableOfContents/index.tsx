import { HorizontalRuleIcon, PinIcon } from "@primer/octicons-react";
import { Text } from "@primer/react";
import React, { FC, useEffect, useRef, useState } from "react";
import ContentsIcon from "../../icons/ContentsIcon";
import UnPinIcon from "../../icons/UnPinIcon";
import { getCanvasTableOfContents } from "../../utils/Common";
import {
  Container,
  ContentHeadings,
  Divider,
  EmptyIconContainer,
  Header,
  HeadingText,
  TextContainer,
} from "./styledComponents";

const useIntersectionObserver = (setActiveId: Function, toc: TOCType[]) => {
  const headingElementsRef = useRef({});

  useEffect(() => {
    const headingElements = toc.map((content) =>
      document.getElementById(content.uuid)
    );

    const callback = (headings) => {
      headingElementsRef.current = headings.reduce((map, headingElement) => {
        map[headingElement.target.id] = headingElement;
        return map;
      }, headingElementsRef.current);

      // Get all headings that are currently visible on the page
      const visibleHeadings = [];
      Object.keys(headingElementsRef.current).forEach((key) => {
        const headingElement = headingElementsRef.current[key];
        if (headingElement.isIntersecting) visibleHeadings.push(headingElement);
      });

      const getIndexFromId = (id) =>
        headingElements.findIndex((heading) => heading.id === id);

      // If there is only one visible heading, this is our "active" heading
      if (visibleHeadings.length === 1) {
        setActiveId(visibleHeadings[0].target.id);
        // If there is more than one visible heading,
        // choose the one that is closest to the top of the page
      } else if (visibleHeadings.length > 1) {
        const sortedVisibleHeadings = visibleHeadings.sort(
          (a, b) => getIndexFromId(a.target.id) > getIndexFromId(b.target.id)
        );

        setActiveId(sortedVisibleHeadings[0].target.id);
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-130px 0px -40% 0px",
    });

    headingElements.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [setActiveId, toc]);
};

interface TableOfContentsProps {
  blocks: any[];
  editor: any;
  defaultPinned?: boolean;
}

type TOCType = {
  uuid: string;
  title: string;
  level: number;
};

const TableOfContents: FC<TableOfContentsProps> = (props) => {
  const { blocks, editor, defaultPinned = false } = props;

  const [isPinned, setIsPinned] = useState(defaultPinned);
  const [activeId, setActiveId] = useState((): string | null => null);
  const [toc, setTOC] = useState((): TOCType[] => []);
  useIntersectionObserver(setActiveId, toc);

  useEffect(() => {
    const contents: TOCType[] = getCanvasTableOfContents(editor);
    setTOC(contents);
  }, [blocks, editor?.children]);

  return toc?.length ? (
    <Container
      contentEditable={false}
      isPinned={isPinned}
      className="hide-on-key-down"
      top={defaultPinned ? "calc(30vh + 48px)" : null}
    >
      <Header>
        <div className="flex items-center space-x-2">
          <ContentsIcon />
          <Text
            as="p"
            fontWeight={600}
            fontSize={"12px"}
            lineHeight={"18px"}
            color={"toc.text"}
          >
            CONTENTS
          </Text>
        </div>

        {/* Commented out pinning until we find better UX between this and comments on right side
        <div
          className="cursor-pointer"
          onClick={() => {
            setIsPinned(!isPinned);
          }}
        >
          {isPinned ? <UnPinIcon /> : <PinIcon size={16} fill={"#484F58"} />}
        </div> */}
      </Header>
      <Divider />
      <ContentHeadings className="space-y-2">
        {toc.map((content) => (
          <TextContainer
            className="space-x-2"
            key={content.uuid}
            level={content.level}
            id={`heading-${content.uuid}`}
          >
            {activeId === content.uuid ? (
              <HorizontalRuleIcon size={12} fill={"#484f58"} />
            ) : (
              <EmptyIconContainer />
            )}
            <HeadingText
              isActive={activeId === content.uuid}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(content.uuid);
                element &&
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                setActiveId(content.uuid);
              }}
            >
              {content.title}
            </HeadingText>
          </TextContainer>
        ))}
      </ContentHeadings>
    </Container>
  ) : null;
};

export default TableOfContents;
