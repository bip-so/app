import { FC } from "react";
import { useTranslation } from "next-i18next";
import { Avatar, Box, Button, Text } from "@primer/react";
import Link from "next/link";
import TwitterIcon from "../../icons/TwitterIcon";
import DiscordIcon from "../../icons/DiscordIcon";
import Colors from "../../utils/Colors";
import SlackIcon from "../../icons/SlackIcon";
import LinkWithoutPrefetch from "../LinkWithoutPrefetch";
import { BIP_PRIVACY_POLICY_URL, BIP_TERMS_URL } from "../../core/constants";

interface FooterTextProps {
  text: string;
  ml?: string;
  fS?: string;
  isLink?: boolean;
  href?: string;
}

const FooterText: FC<FooterTextProps> = (props) =>
  props.isLink ? (
    <LinkWithoutPrefetch href={props.href || ""} passHref>
      <Text
        as="button"
        fontWeight={400}
        fontSize={props?.fS || ["14px", "14px", "14px", "16px"]}
        lineHeight={["20px", "20px", "20px", "24px"]}
        color="auth.home.footer.text"
        ml={props?.ml || "0px"}
      >
        {props.text}
      </Text>
    </LinkWithoutPrefetch>
  ) : (
    <Text
      as="p"
      fontWeight={400}
      fontSize={props?.fS || "1rem"}
      lineHeight={"1.625rem"}
      color="auth.home.footer.text"
      ml={props?.ml || "0px"}
    >
      {props.text}
    </Text>
  );

interface FooterProps {}

const Footer: FC<FooterProps> = () => {
  const { t } = useTranslation();

  const goToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      window?.scrollTo({ top: element?.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <Box
      bg={"rgb(33, 38, 45)"}
      display={"flex"}
      flexDirection="column"
      overflow="hidden"
      width={"100vw"}
      sx={{
        py: ["72px", "72px", "32px", "32px"],
        px: ["16px", "16px", "80px", "80px"],
      }}
    >
      {/* <Box
        className="flex"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
        }}
      > */}
      {/* <Box
          className="flex items-center justify-center gap-8"
        >
          <LinkWithoutPrefetch href="/">
            <div className="cursor-pointer">
              <Avatar src="favicon.ico" size={32} sx={{ ml: "10px" }} />
            </div>
          </LinkWithoutPrefetch>
          <Text
            sx={{ display: ["none", "none", "flex", "flex"] }}
            onClick={goToFeatures}
            className="text-gray-500 cursor-pointer hover:text-white"
          >
            Features
          </Text>
          <LinkWithoutPrefetch href="/pricing">
            <a target="_blank">
              <Text className="text-base text-gray-500 cursor-pointer hover:text-white">
                Pricing
              </Text>
            </a>
          </LinkWithoutPrefetch>
          <LinkWithoutPrefetch href="/explore">
            <a target="_blank">
              <Text className="text-base text-gray-500 cursor-pointer hover:text-white">
                Explore
              </Text>
            </a>
          </LinkWithoutPrefetch>
        </Box> */}
      {/* <LinkWithoutPrefetch href="mailto:hey@bip.so">
          <Text className="text-base text-gray-500 cursor-pointer hover:text-white">
            hey@bip.so
          </Text>
        </LinkWithoutPrefetch>
      </Box> */}
      {/* <hr className="mt-8 border-gray-600" /> */}
      <Box
        className="flex mt-8 text-center md:text-left"
        sx={{
          flexDirection: ["column", "column", "row", "row"],
          alignItems: "center",
        }}
      >
        <Box className="md:mr-20 ">
          <h4 className="text-xl font-semibold text-gray-600">Company</h4>
          <p className="mt-6 mb-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-white">
            <LinkWithoutPrefetch href="mailto:hey@bip.so">
              <a target="_blank">hey@bip.so</a>
            </LinkWithoutPrefetch>
          </p>
          <p className="mb-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-white">
            <LinkWithoutPrefetch href="/bip.so/what-is-bip-11419c">
              <a target="_blank">About</a>
            </LinkWithoutPrefetch>
          </p>

          <p className="mb-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-white">
            <LinkWithoutPrefetch href="/explore">
              <a target="_blank">Communities</a>
            </LinkWithoutPrefetch>
          </p>

          {/* <p className="text-base font-semibold text-gray-300 cursor-pointer hover:text-white my-7 ">
            Support
          </p> */}
        </Box>
        <Box
          className="md:mr-20"
          sx={{
            mb: ["0px", "0px", "2.45rem", "2.45rem"],
          }}
        >
          <h4 className="text-xl font-semibold text-gray-600">Resources</h4>
          <p className="mt-6 mb-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-white">
            <LinkWithoutPrefetch href="/bip.so/notion-vs-bip-11846c">
              <a target="_blank">bip vs Notion</a>
            </LinkWithoutPrefetch>
          </p>

          <p className="mb-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-white">
            <LinkWithoutPrefetch href="/bip.so/google-doc-vs-bip-11867c">
              <a target="_blank">bip vs Google docs</a>
            </LinkWithoutPrefetch>
          </p>

          {/* <p className="text-sm font-semibold text-gray-300 cursor-pointer hover:text-white my-7 ">
            Support
          </p> */}
        </Box>
        <Box sx={{ mt: ["0px", "0px", "0px", "0px"], mb: "2.45rem" }}>
          <h4 className="text-xl font-semibold text-gray-600">Legal</h4>
          <p className="mt-6 mb-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-white">
            <LinkWithoutPrefetch href={BIP_TERMS_URL}>
              <a target="_blank">Terms of service</a>
            </LinkWithoutPrefetch>
          </p>
          <p className="mb-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-white">
            <LinkWithoutPrefetch href={BIP_PRIVACY_POLICY_URL}>
              <a target="_blank">Privacy Policy</a>
            </LinkWithoutPrefetch>
          </p>
        </Box>
      </Box>
      <hr className="my-8 border-gray-600" />
      <Box className="flex justify-between">
        <Box
          className="text-gray-600"
          // sx={{
          //   color: Colors.gray["300"],

          // }}
        >
          <Text>bip.so © 2021</Text> <Text>All Rights reserved</Text>
        </Box>
        <Box className="flex items-center justify-center gap-8">
          <a href="https://discord.gg/WDWQUxE4yM">
            <div className="cursor-pointer ">
              <DiscordIcon
                fill={"transparent"}
                color={Colors.gray["300"]}
                size={30}
              />
            </div>
          </a>

          <a href="https://twitter.com/bip_so">
            <div className="cursor-pointer">
              <TwitterIcon height={20} width={20} color={Colors.gray["300"]} />
            </div>
          </a>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
