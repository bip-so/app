import { MarkGithubIcon } from "@primer/octicons-react";
import { Avatar, Header, StyledOcticon } from "@primer/react";
import React, { FC } from "react";
import { AVATAR_PLACEHOLDER } from "../commons/constants";
import AvatarWithPlaceholder from "./AvatarWithPlaceholder";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
  return (
    <Header>
      <Header.Item full>
        <Header.Link href="/">
          <Avatar
            src="https://bip.so/static/media/logo.842fade0.svg"
            size={32}
            sx={{ mr: 2 }}
          />
        </Header.Link>
      </Header.Item>
      <Header.Item>
        <AvatarWithPlaceholder src={AVATAR_PLACEHOLDER} size={32} alt="user" />
      </Header.Item>
    </Header>
  );
};

export default Navbar;
