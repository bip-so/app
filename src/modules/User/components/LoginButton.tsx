import { Button } from "@primer/react";
import { ButtonBaseProps } from "@primer/react/lib/Button/types";
import { useRouter } from "next/router";
import { FC } from "react";
import BipRouteUtils from "../../../core/routeUtils";

interface LoginButtonProps extends ButtonBaseProps {
  returnUrl?: string;
  text?: string;
}

const LoginButton: FC<LoginButtonProps> = (props) => {
  const router = useRouter();
  const {
    returnUrl,
    size = "medium",
    variant = "primary",
    text = "Login / Sign up",
    sx,
  } = props;
  const loginUrl = BipRouteUtils.getSignInRoute(returnUrl);

  return (
    <Button
      size={size}
      variant={variant}
      onClick={() => {
        router.push(loginUrl);
      }}
      sx={sx}
    >
      {text}
    </Button>
  );
};

export default LoginButton;
