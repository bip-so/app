import { Avatar, Box, IconButton, Text } from "@primer/react";
import { XIcon } from "@primer/styled-octicons";
import { FC, ReactNode } from "react";

interface IAuthContainerProps {
  back?: Function;
  header: ReactNode;
  children: ReactNode;
  onClose?: Function;
  hideAppDescription?: boolean;
}

const AuthContainer: FC<IAuthContainerProps> = (props) => {
  return (
    <Box
      display={"flex"}
      flexDirection="column"
      width={["100%", "100%", "648px", "648px"]}
      mx={["20px", "20px", "auto", "auto"]}
      height={"470px"}
      borderRadius={"12px"}
      justifyContent={"center"}
      alignItems={"center"}
      sx={{
        bg: "auth.signin.bg",
        boxShadow:
          " 0px 8px 24px rgba(66, 74, 83, 0.12), 0px 1px 3px rgba(27, 31, 36, 0.12)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "auth.signin.border",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          // alignItems: "flex-end",
          width: "82%",
          height: "380px",
        }}
      >
        {props.onClose && (
          <IconButton
            icon={XIcon}
            sx={{
              background: "unset",
              border: "none",
            }}
            onClick={props.onClose}
          />
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
            height: "372px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              height: "142px",
              marginBottom: "20px",
              width: "100%",
            }}
          >
            {!props.hideAppDescription && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginBottom: "15px",
                  gap: "0.5rem",
                }}
              >
                <Avatar src="/favicon.ico" size={32} />
                <Text
                  sx={{
                    color: "auth.setup.text",
                    fontWeight: 600,
                  }}
                >
                  Wiki for communities
                </Text>
              </Box>
            )}
            {props.header}
          </Box>
          {props.children}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthContainer;
