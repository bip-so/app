import React from "react";
import { Box, Text, TextInput, TextInputProps } from "@primer/react";
import { AlertIcon } from "@primer/styled-octicons";

interface StyledTextInputProps extends TextInputProps {
  showError?: boolean;
  showWarning?: boolean;
  errorMessage?: string;
  warningMessage?: string;
  emptyBoxHeight?: string;
  sx?: object;
}

const StyledTextInput = React.forwardRef(
  (
    props: StyledTextInputProps,
    ref: React.ForwardedRef<HTMLInputElement> | undefined
  ) => {
    const { sx, ...rProps } = props;
    return (
      <>
        <TextInput
          ref={ref}
          sx={{
            border: "1px solid",
            boxShadow: "inset 0px 1px 2px rgba(27, 31, 35, 0.075)",
            borderColor: props.showError
              ? "styledTextInput.errorColor"
              : props.showWarning
              ? "styledTextInput.warningColor"
              : "styledTextInput.border",
            bg: "styledTextInput.bg",
            width: "100%",
            ":focus-within": {
              border: "1px solid",
              borderColor: "styledTextInput.focusBorder",
              boxShadow: "0px 0px 0px 3px rgba(3, 102, 214, 0.3)",
            },
            ...(sx ? sx : {}),
          }}
          {...rProps}
        />
        {props.showError || props.showWarning ? (
          <Box display="flex" mt={"0.25rem"}>
            <AlertIcon
              color={
                props.showWarning
                  ? "styledTextInput.warningColor"
                  : "styledTextInput.errorColor"
              }
              size={12}
            />
            <Text
              as="p"
              fontSize={"0.625rem"}
              lineHeight="0.875rem"
              color={
                props.showWarning
                  ? "styledTextInput.warningColor"
                  : "styledTextInput.errorColor"
              }
              ml={"0.25rem"}
            >
              {props.showWarning
                ? props.warningMessage
                : props.showError
                ? props.errorMessage
                : ""}
            </Text>
          </Box>
        ) : (
          <Box height={props.emptyBoxHeight || "1.125rem"} />
        )}
      </>
    );
  }
);

StyledTextInput.displayName = "StyledTextInput";

export default StyledTextInput;
