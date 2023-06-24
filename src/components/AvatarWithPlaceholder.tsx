import { Avatar, AvatarProps, Box } from "@primer/react";
import React, { FC } from "react";
import { AVATAR_PLACEHOLDER } from "../commons/constants";

interface IAvatarWithPlaceholderProps extends Omit<AvatarProps, "src"> {
  src?: string | undefined;
}

const AvatarWithPlaceholder: FC<IAvatarWithPlaceholderProps> = (props) => {
  const avatarProps = {
    ...props,
    src: props.src ? props.src : AVATAR_PLACEHOLDER,
  };
  return <Avatar {...avatarProps} />;
};

export default AvatarWithPlaceholder;
