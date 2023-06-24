import { Link as PrimerLink, Text } from "@primer/react";
import { useRouter } from "next/router";
import BipRouteUtils from "../core/routeUtils";
import { getHttpLink } from "./Common";
import { FIND_MULTIPLE_LINK_REGEX } from "./Constants";

export const getFilteredMentions = (text: string, users: any) => {
  if (text?.length && users?.length) {
    const textArray = text.split(" ");
    return users.filter((user: any) => textArray.includes(`@${user.username}`));
  }
  return [];
};

export const getTextWithMentionsArray = (text: string, mentionsData: any) => {
  const router = useRouter();
  const mentions = mentionsData?.length ? mentionsData : [];
  if (text?.length) {
    const splittedText = text.split(" ");
    const textWithMenArray: any = [];
    const handleNames = mentions.map((men: any) => `@${men.username}`);
    splittedText.forEach((item, index) => {
      if (handleNames.includes(item)) {
        const element = (
          <Text
            key={index}
            sx={{
              color: "mentionsInput.mentionedText",
              cursor: "pointer",
            }}
            onClick={() => {
              router.push(BipRouteUtils.getHandleRoute(item));
            }}
          >
            {item}{" "}
          </Text>
        );
        textWithMenArray.push(element);
      } else {
        const matchedLink = item.match(FIND_MULTIPLE_LINK_REGEX);
        if (matchedLink?.length) {
          const words = item.split(matchedLink[0]);
          if (words.length > 1) {
            textWithMenArray.push(words[0]);
          }
          const element = (
            <PrimerLink
              href={getHttpLink(matchedLink[0])}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              {matchedLink[0]}{" "}
            </PrimerLink>
          );
          textWithMenArray.push(element);
        } else {
          textWithMenArray.push(item + " ");
        }
      }
    });
    return textWithMenArray;
  }
  return text;
};
