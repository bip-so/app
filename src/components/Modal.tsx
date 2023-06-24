import { ReactNode, useEffect, useRef } from "react";
import { Box, IconButton, useOnOutsideClick } from "@primer/react";
import { XIcon } from "@primer/styled-octicons";
import ClientOnlyPortal from "./ClientOnlyPortal";

interface IModalProps {
  children: ReactNode;
  closeHandler: () => void;
  hideCloseButton?: boolean;
  sx?: any;
  zIndex?: number;
  handleOutsideClick?: boolean;
}

const Modal: React.FunctionComponent<IModalProps> = ({
  children,
  closeHandler,
  hideCloseButton,
  sx,
  zIndex,
  handleOutsideClick,
}) => {
  const modalRef = useRef(null);
  useOnOutsideClick({
    onClickOutside: () => {
      if (handleOutsideClick) {
        closeHandler();
      }
    },
    containerRef: modalRef,
  });
  const keyDownHandler = (event: any) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeHandler();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keyDownHandler);

    // 👇️ clean up event listener
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  return (
    <ClientOnlyPortal selector="#modal">
      <Box
        className="fixed inset-0 flex items-center justify-center overflow-hidden"
        sx={{
          zIndex: zIndex ? zIndex : 1000,
          bg: ["modal.bg"],
        }}
      >
        <Box
          padding={"16px"}
          overflow="auto"
          borderRadius={"12px"}
          ref={modalRef}
          maxHeight={"85%"}
          position="relative"
          sx={{
            width: ["80%", "60%", "60%", "60%"],
            bg: "modal.contentBg",
            border: "1px solid",
            borderColor: "modal.border",
            ...(sx ? sx : {}),
          }}
        >
          {hideCloseButton ? null : (
            <div
              className="absolute flex justify-end top-2 right-2"
              onClick={closeHandler}
            >
              <IconButton
                icon={XIcon}
                variant="invisible"
                sx={{ zIndex: 1, color: "modal.xIcon" }}
              />
            </div>
          )}

          {children}
        </Box>
      </Box>
    </ClientOnlyPortal>
  );
};

export default Modal;
