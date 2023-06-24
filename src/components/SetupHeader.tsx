import React, { FC } from "react";
import { Box, Text, Avatar, ProgressBar } from "@primer/react";

interface SetupHeaderProps {
  progressNumber: number;
}

const SetupHeader: FC<SetupHeaderProps> = (props) => (
  <Box
    display={"flex"}
    height={"100px"}
    width={"100%"}
    flexDirection="column"
    alignItems="flex-start"
    justifyContent="space-between"
  >
    <Box
      display="flex"
      sx={{
        justifyContent: "flex-start",
        alignItems: "center",
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
    <Box display="flex" flexDirection="column" width="100%">
      <Box
        display={"flex"}
        flexDirection="row"
        width="100%"
        alignItems="flex-start"
        justifyContent={"space-between"}
        marginBottom="0.5rem"
      >
        <Text
          as={"p"}
          fontWeight={700}
          fontStyle={"normal"}
          fontSize={"0.95rem"}
          lineHeight={"1.25rem"}
          textAlign="center"
        >
          Create Account
        </Text>
        <Text
          as={"p"}
          fontWeight={700}
          fontStyle={"normal"}
          fontSize={"0.95rem"}
          lineHeight={"1.25rem"}
          textAlign="center"
        >
          Setup Profile
        </Text>
        <Text
          as={"p"}
          fontWeight={700}
          fontStyle={"normal"}
          fontSize={"0.95rem"}
          lineHeight={"1.25rem"}
          textAlign="center"
        >
          Create your workspace
          <br/>
          <Text
          fontSize={"12px"}
          >
          (Optional)
          </Text>
        </Text>
      </Box>
      <ProgressBar
        progress={props.progressNumber}
        bg={"auth.signin.progressBar"}
        sx={{
          width: "100%",
        }}
      />
    </Box>
  </Box>
);

export default SetupHeader;
