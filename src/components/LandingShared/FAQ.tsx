import { Box, Button, Text } from "@primer/react";
import { MailIcon } from "@primer/styled-octicons";
import { useTranslation } from "next-i18next";
import React, { FC } from "react";
import { FaDiscord } from "react-icons/fa";
import FAQItem from "../../modules/Pricing/components/FAQItem";

interface FAQProps {}

const FAQ: FC<FAQProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: ["column", "column", "row", "row"],
        mx: "5%",
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          width: ["unset", "unset", "40%", "40%"],
          padding: [
            "20px",
            "20px",
            "40px 32px 86px 32px",
            "40px 32px 86px 32px",
          ],
          // background: "url(background-pattern.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          bg: "landing.faq.box1.bg",
          borderRadius: "20px",
        }}
      >
        <Text
          as="p"
          sx={{
            fontWeight: 600,
            fontSize: ["18px", "18px", "24px", "24px"],
            lineHeight: ["26px", "26px", "32px", "32px"],
            color: "landing.faq.box1.heading",
          }}
        >
          {t("landing.faqs")}
        </Text>
        <Text
          as="p"
          sx={{
            mt: ["8px", "8px", "16px", "16px"],
            fontWeight: 600,
            fontSize: ["26px", "26px", "40px", "40px"],
            lineHeight: ["38px", "38px", "44px", "44px"],
            color: "landing.faq.box1.text",
          }}
        >
          {t("landing.faqsHeading")}
        </Text>
        <Text
          as="p"
          sx={{
            mt: ["12px", "12px", "32px", "32px"],
            fontSize: ["13px", "13px", "20px", "20px"],
            lineHeight: ["18px", "18px", "30px", "30px"],
            color: "landing.faq.box1.subText",
          }}
        >
          {t("landing.faqsSubHeading")}
        </Text>
        <Box
          sx={{
            display: "flex",
            flexDirection: ["column", "column", "row", "row"],
            flexWrap: "wrap",
            gap: "16px",
            mt: ["24px", "24px", "32px", "32px"],
            alignItems: ["flex-start"],
          }}
        >
          <Button
            variant="outline"
            leadingIcon={FaDiscord}
            sx={{
              alignItems: "center",
              color: "auth.signin.discordText",
              bg: "auth.signin.discordButton",
              ":hover:not([disabled])": {
                color: "auth.signin.discordText",
                bg: "auth.signin.discordButton",
              },
            }}
            onClick={() => {
              window.open("https://discord.gg/WDWQUxE4yM");
            }}
          >
            {t("landing.joinOurDiscordServer")}
          </Button>
          <Button
            variant="outline"
            leadingIcon={MailIcon}
            sx={{
              alignItems: "center",
              color: "landing.faq.text",
              border: 0,
              // border: "2px solid #DCE1E6",
              bg: "transparent",
              ":hover:not([disabled])": {
                color: "landing.faq.box1.text",
                bg: "transparent",
              },
            }}
            onClick={() => {
              window.open("mailto:hey@bip.so");
            }}
          >
            {t("landing.emailUs")}
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          ml: ["0px", "0px", "40px", "60px"],
          mt: ["40px", "40px", "0px", "0px"],
          width: ["100%", "100%", "60%", "60%"],
        }}
      >
        <FAQItem
          question={"Why are all features available in the free plan?"}
          answer={
            "We want you to have the complete experience of bip.so. Pay only once you start deriving value, which is when more documents are written on bip.so!"
          }
          defaultOpen={true}
        />
        <FAQItem
          question={
            "If I keep making all my old docs public, I can keep using bip.so free forever. Why are the plans structured that way?"
          }
          answer={
            "We want you to open source more of your documents. In the long run, we want to become the github for documents, and will be building workflows for people to build on top of each others knowledge bases. So either by paying to keep documents private or by making your documents public, you are helping us!"
          }
          defaultOpen={false}
        />
        <FAQItem
          question={
            "Every other tool charges per user or per editor, why are you charging per 1000 members?"
          }
          answer={
            "Our primary users are communities. If we charge per-editor, Admins may want to restrict the number of editors thereby restricting community participation."
          }
          defaultOpen={false}
        />
        <FAQItem
          question={"Tell me what's the total I need to pay per month?"}
          answer={
            "If you have less than 25 private canvases, you pay nothing. Else, you pay based on the number of members. Few examples below:"
          }
          tableRows={[
            [
              "Members",
              "750",
              "3750",
              "9760",
              "19750",
              "Whole of planet earth",
            ],
            [
              "Monthly Charge",
              "10 USD",
              "40 USD",
              "100 USD",
              "100 USD",
              "100 USD",
            ],
          ]}
        />
        <FAQItem
          question={"What's your refund policy?"}
          answer={
            "Any payment made within the last 30 days will be refunded, no questions asked! Just reach out to us at hey@bip.so"
          }
          defaultOpen={false}
        />
        <FAQItem
          question={
            "If members create multiple canvases but doesn't publish, are those counted towards the 25 limit?"
          }
          answer={
            "No. Every canvas in bip.so goes through a 'Publish' flow in which a moderator has to approve the canvas. Only published canvases are counted."
          }
          defaultOpen={false}
        />
        <FAQItem
          question={
            "Are members restricted from creating canvases once the 25 private canvases limit is hit?"
          }
          answer={
            "No. First, you get notified that the limit is hit. Then you have 24 hours to decide and do one of the following actions:"
          }
          bulletPoints={[
            "Upgrade to the 'Pro' plan",
            "Make any canvas public to bring your private canvas count to less than 25",
          ]}
          answerAfterPoints={
            "If neither happens, the newly published canvas will be made public. The same is followed for all new canvases are published after reaching 25 private canvases in your workspace!"
          }
          defaultOpen={false}
        />
      </Box>
    </Box>
  );
};

export default FAQ;
