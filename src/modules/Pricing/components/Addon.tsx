import { Box, Text } from "@primer/react";
import { LinkIcon, MarkGithubIcon } from "@primer/styled-octicons";
import React, { FC, useMemo } from "react";
import JiraIcon from "../../../icons/JiraIcon";

interface AddonProps {
  isGitHub: boolean;
  isCustomDomain: boolean;
  isJiraIntegration: boolean;
}

const Addon: FC<AddonProps> = (props) => {
  const { isGitHub, isCustomDomain, isJiraIntegration } = props;

  const icon = useMemo(() => {
    if (isGitHub) {
      return (
        <MarkGithubIcon
          sx={{
            width: ["18px"],
            height: ["18px"],
          }}
        />
      );
    }
    if (isCustomDomain) {
      return (
        <LinkIcon
          sx={{
            width: ["16px"],
            height: ["16px"],
          }}
        />
      );
    }
    if (isJiraIntegration) {
      return <JiraIcon />;
    }
    return null;
  }, [isGitHub, isCustomDomain, isJiraIntegration]);

  const heading = useMemo(() => {
    if (isGitHub) {
      return "Github backup";
    }
    if (isCustomDomain) {
      return "Custom Domain";
    }
    if (isJiraIntegration) {
      return "Jira Integration";
    }
    return "";
  }, [isGitHub, isCustomDomain, isJiraIntegration]);

  const subHeading = useMemo(() => {
    if (isGitHub) {
      return "Get your canvases synced with github";
    }
    if (isCustomDomain) {
      return "Get a domain of your choice";
    }
    if (isJiraIntegration) {
      return "Integrate Jira with your workspace to collaborate with your community and your tech team";
    }
    return "";
  }, [isGitHub, isCustomDomain, isJiraIntegration]);

  const price = useMemo(() => {
    if (isGitHub) {
      return "$19";
    }
    if (isCustomDomain) {
      return "$9";
    }
    if (isJiraIntegration) {
      return "$29";
    }
    return "";
  }, [isGitHub, isCustomDomain, isJiraIntegration]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: ["flex-start", "flex-start", "center", "center"],
        justifyContent: ["unset", "unset", "space-between", "space-between"],
        border: "1px solid rgba(27, 31, 35, 0.15)",
        borderRadius: "12px",
        opacity: 0.6,
        padding: "12px 20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flex: [1, 1, 1, 1],
        }}
      >
        <Box
          sx={{
            width: ["32px"],
            height: ["32px"],
            bg: "#F6F8FA",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ ml: ["8px", "8px", "16px", "16px"] }}>
          <Text
            as="p"
            sx={{
              color: "#30363D",
              fontWeight: 600,
              fontSize: ["13px", "13px", "20px", "20px"],
              lineHeight: ["18px", "18px", "30px", "30px"],
            }}
          >
            {heading}
          </Text>
          <Text
            as="p"
            sx={{
              color: "#484F58",
              fontSize: ["12px", "12px", "16px", "16px"],
              lineHeight: ["18px", "18px", "30px", "30px"],
            }}
          >
            {subHeading}
          </Text>
          <Box
            display={["flex", "flex", "none", "none"]}
            mt={"8px"}
            alignItems={"center"}
          >
            <Text
              as="p"
              sx={{
                color: "#30363D",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "20px",
              }}
            >
              {price}
            </Text>
            <Text
              as="p"
              sx={{
                color: "#30363D",
                fontSize: "13px",
                lineHeight: "18px",
              }}
            >
              /month
            </Text>
          </Box>
        </Box>
      </Box>
      <Box
        display={["none", "none", "flex", "flex"]}
        flex={["unset", "unset", 1, 1]}
        alignItems={"center"}
        justifyContent={"center"}
        ml={"80px"}
      >
        <Text
          as="p"
          sx={{
            color: "#30363D",
            fontWeight: 600,
            fontSize: "20px",
            lineHeight: "30px",
          }}
        >
          {price}
        </Text>
        <Text
          as="p"
          sx={{
            color: "#30363D",
            fontSize: "12px",
            lineHeight: "30px",
          }}
        >
          /month
        </Text>
      </Box>
      <Box
        sx={{
          ml: "20px",
          display: ["block", "block", "flex", "flex"],
          flex: ["unset", "unset", 1, 1],
          justifyContent: ["unset", "unset", "flex-end", "flex-end"],
        }}
      >
        {isCustomDomain ? null : (
          <Text
            as="p"
            sx={{
              padding: ["2px 8px", "2px 8px", "2px 12px", "2px 12px"],
              border: "1px solid #BEBEBE",
              borderRadius: ["60px", "60px", "100px", "100px"],
              fontWeight: 600,
              fontSize: "12px",
              lineHeight: "16px",
              color: "#24292F",
            }}
          >
            Coming Soon
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default Addon;
