import { Avatar } from "@primer/react";
import { PeopleIcon } from "@primer/styled-octicons";
import Link from "next/link";
import { FC } from "react";
import { Editor } from "slate";
import { useSelected, useSlate } from "slate-react";
import {
  AVATAR_PLACEHOLDER,
  DEFAULT_USER_PLACEHOLDER,
} from "../../../../../commons/constants";
import Chip from "../../../../../components/Chip";

interface IMentionBlockProps {}

const UserMentionBlock: FC<IMentionBlockProps> = ({
  attributes,
  children,
  element,
}: any) => {
  const selected = useSelected();
  const editor = useSlate();
  const [currentNode] = Editor.nodes(editor, {
    at: [],
    match: (n, p) => n.uuid === element.uuid,
  });

  const parentBlock = editor.children[currentNode[1][0]];

  // HOTFIX UPDATE - Array.isArray check is to be removed later once chirag has fixed default block sending mentions as an object issue.
  let mention =
    Array.isArray(parentBlock?.mentions) &&
    parentBlock?.mentions?.find((mention) => mention.id === element.mention.id);

  if (!mention) {
    mention = element.mention;
  }

  if (mention?.type === "user") {
    return (
      <a
        contentEditable={false}
        href={`/@${mention?.username}`}
        {...attributes}
        style={{ cursor: "auto" }}
      >
        <Chip
          text={`@${mention?.username}`}
          icon={
            <Avatar
              src={mention?.avatarUrl || DEFAULT_USER_PLACEHOLDER}
              size={16}
            />
          }
          contentEditable={false}
          sx={{
            margin: "0px 1px",
            borderColor: selected ? "accent.fg" : "transparent",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {children}
        </Chip>
      </a>
    );
  } else {
    return (
      <Chip
        contentEditable={false}
        icon={<PeopleIcon />}
        sx={{
          margin: "0px 1px",
          borderColor: selected ? "accent.fg" : "transparent",
          userSelect: "none",
          cursor: "auto",
        }}
        text={mention?.name}
        {...attributes}
      >
        {children}
      </Chip>
    );
  }
};

export default UserMentionBlock;
