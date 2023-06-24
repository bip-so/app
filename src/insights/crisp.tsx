import { Button } from "@primer/react";
import { CommentIcon } from "@primer/styled-octicons";
import { FC, useEffect, useState } from "react";
import { useUser } from "../context/userContext";

const Crisp: FC = () => {
  const [isCrispOpen, setIsCrispOpen] = useState<boolean>(false);
  const { isLoggedIn, user } = useUser();

  const toggleCrisp = () => {
    setIsCrispOpen((prev) => !prev);
  };

  const initiializeCrisp = () => {
    window.$crisp?.push(["on", "chat:closed", toggleCrisp]);
    window.$crisp?.push(["do", "chat:hide"]);
    isLoggedIn &&
      window.$crisp?.push(["set", "user:nickname", [`@${user?.username}`]]);
  };

  useEffect(() => {
    if (isCrispOpen) {
      window.$crisp?.push(["do", "chat:open"]);
      window.$crisp?.push(["do", "chat:show"]);
    } else {
      window.$crisp?.push(["do", "chat:close"]);
      window.$crisp?.push(["do", "chat:hide"]);
    }
  }, [isCrispOpen]);

  useEffect(() => {
    window.CRISP_READY_TRIGGER = initiializeCrisp;
    return () => {
      window.$crisp?.push(["off", "chat:closed"]);
    };
  }, []);

  return (
    <Button
      onClick={toggleCrisp}
      variant="invisible"
      sx={{
        mx: 2,
        mb: 2,
        bg: "layout.user.bg",
        color: "sidebar.studionav.textSecondary",
        ":hover:not([disabled])": {
          bg: "layout.user.hoverBg",
        },
        ":active:not([disabled])": {
          bg: "layout.user.hoverBg",
        },
        "&[aria-expanded='true']": {
          bg: "layout.user.hoverBg",
        },
      }}
    >
      <CommentIcon sx={{ mr: 2 }} />
      Chat with bip.so team
    </Button>
  );
};

export default Crisp;
