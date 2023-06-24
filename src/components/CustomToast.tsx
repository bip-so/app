import { Box, IconButton, useTheme } from "@primer/react";
import {
  AlertIcon,
  CheckIcon,
  InfoIcon,
  XIcon,
  StopIcon,
} from "@primer/styled-octicons";
import { useEffect, useRef, useState } from "react";

const appearances = {
  success: {
    icon: CheckIcon,
  },
  error: {
    icon: StopIcon,
  },
  warning: {
    icon: AlertIcon,
  },
  info: {
    icon: InfoIcon,
  },
};

const Content = (props) => (
  <Box
    sx={{
      flexGrow: 1,
      fontSize: 14,
      minHeight: 52,
      padding: `8px 12px`,
      display: "flex",
      alignItems: "center",
    }}
    {...props}
  />
);

const Icon = ({ appearance }) => {
  const meta = appearances[appearance];
  const Icon = meta.icon;

  return (
    <Box
      sx={{
        bg: `toast.${appearance}`,
        borderTopLeftRadius: "6px",
        borderBottomLeftRadius: "6px",
        color: "toast.icon",
        flexShrink: 0,
        paddingBottom: "8px",
        paddingTop: "8px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
      }}
    >
      <Icon sx={{ position: "relative", zIndex: 1 }} />
    </Box>
  );
};

// Transitions
// ------------------------------

function getTranslate(placement) {
  const pos = placement.split("-");
  const relevantPlacement = pos[1] === "center" ? pos[0] : pos[1];
  const translateMap = {
    right: "translate3d(120%, 0, 0)",
    left: "translate3d(-120%, 0, 0)",
    bottom: "translate3d(0, 120%, 0)",
    top: "translate3d(0, -120%, 0)",
  };

  return translateMap[relevantPlacement];
}
export type TransitionState = "entering" | "entered" | "exiting" | "exited";
const toastStates = (placement: Placement) => ({
  entering: { transform: getTranslate(placement) },
  entered: { transform: "translate3d(0,0,0)" },
  exiting: { transform: "scale(0.66)", opacity: 0 },
  exited: { transform: "scale(0.66)", opacity: 0 },
});

const ToastElement = ({
  appearance,
  placement,
  transitionDuration,
  transitionState,
  ...props
}) => {
  const [height, setHeight] = useState("auto");
  const elementRef = useRef(null);
  const { colorMode } = useTheme();

  useEffect(() => {
    if (transitionState === "entered") {
      const el = elementRef.current;
      setHeight(el?.offsetHeight + 8);
    }
    if (transitionState === "exiting") {
      setHeight(0);
    }
  }, [transitionState]);

  return (
    <Box
      ref={elementRef}
      style={{ height }}
      sx={{
        transition: `height ${transitionDuration - 100}ms 100ms`,
      }}
    >
      <Box
        sx={{
          backgroundColor: "toast.bg",
          borderRadius: "6px",
          boxShadow:
            colorMode === "day"
              ? "0 3px 8px rgba(0, 0, 0, 0.175), inset 0 0 0 1px rgb(0 0 0 /10%)"
              : "inset 0 0 0 1px rgb(255 255 255 /10%)",
          color: "toast.text",
          display: "flex",
          marginBottom: "8px",
          maxWidth: "100%",
          transition: `transform ${transitionDuration}ms cubic-bezier(0.2, 0, 0, 1), opacity ${transitionDuration}ms`,
          width: "360px",
          ...toastStates(placement)[transitionState],
        }}
        {...props}
      />
    </Box>
  );
};

// ==============================
// DefaultToast
// ==============================

type ToastProps = {
  appearance: any;
  autoDismiss: boolean; // may be inherited from ToastProvider
  autoDismissTimeout: number; // inherited from ToastProvider
  children: Node;
  isRunning: boolean;
  onDismiss: Function;
  onMouseEnter: Function;
  onMouseLeave: Function;
  placement: string;
  transitionDuration: number; // inherited from ToastProvider
  transitionState: TransitionState; // inherited from ToastProvider
};

const CustomToast = ({
  appearance = "info",
  autoDismiss,
  autoDismissTimeout,
  children,
  isRunning,
  onDismiss,
  placement,
  transitionDuration,
  transitionState,
  onMouseEnter,
  onMouseLeave,
  ...otherProps
}: ToastProps) => {
  return (
    <ToastElement
      appearance={appearance}
      placement={placement}
      transitionState={transitionState}
      transitionDuration={transitionDuration}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...otherProps}
    >
      <Icon
        appearance={appearance}
        autoDismiss={autoDismiss}
        autoDismissTimeout={autoDismissTimeout}
        isRunning={isRunning}
      />
      <Content>{children}</Content>
      {onDismiss ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "4px",
          }}
        >
          <IconButton
            variant="invisible"
            onClick={onDismiss}
            icon={XIcon}
            sx={{ color: "toast.closeIcon" }}
          ></IconButton>
        </Box>
      ) : null}
    </ToastElement>
  );
};

CustomToast.defaultProps = {
  onDismiss: () => {},
};

export default CustomToast;
