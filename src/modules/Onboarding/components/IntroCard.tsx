import { XIcon } from "@primer/octicons-react";
import { Box, IconButton, Text } from "@primer/react";
import Image from "next/image";
import { Divider } from "../../../components/TableOfContents/styledComponents";

interface IOnboardingIntroCardProps {
  imageUrl: string;
  title: string;
  description: string;
  subtext?: string;
  closeHandler: () => void;
}

const OnboardingIntroCard: React.FunctionComponent<
  IOnboardingIntroCardProps
> = ({ imageUrl, title, description, subtext, closeHandler }) => {
  return (
    <>
      <Box
        borderRadius={"6px"}
        bg={"postInFeed.cardBg"}
        display="flex"
        borderColor={"postInFeed.border"}
        sx={{
          width: ["360px", "500px", "600px", "600px"],
          position: "relative",
        }}
      >
        <div className="absolute flex justify-end top-2 right-2">
          <IconButton
            icon={XIcon}
            variant="invisible"
            sx={{ zIndex: 1, color: "modal.xIcon" }}
            onClick={closeHandler}
          />
        </div>
        <Image
          src={imageUrl}
          alt="create-studio"
          height={"185px"}
          width={"185px"}
          style={{
            objectFit: "fill",
            flex: "2 1 auto",
          }}
        />
        <Box
          padding={"16px"}
          sx={{
            margin: "0 auto",
            width: "65%",
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Text
            as={"h1"}
            sx={{
              fontWeight: 600,
              fontSize: "18px",
              lineHeight: "30px",
              letterSpacing: "0.2px",
            }}
          >
            {title}
          </Text>
          <Text
            sx={{
              fontSize: "14px",
              margin: "14px 0",
            }}
          >
            {description}
          </Text>
          {subtext && (
            <Text
              sx={{
                fontSize: "14px",
                margin: "4px 0",
              }}
            >
              {subtext}
            </Text>
          )}
        </Box>
      </Box>
      <Box
        bg={"postInFeed.border"}
        height={"1px"}
        marginY={"32px"}
        sx={{
          width: ["360px", "500px", "600px", "600px"],
        }}
      />
    </>
  );
};

export default OnboardingIntroCard;
