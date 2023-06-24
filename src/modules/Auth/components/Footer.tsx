import { FC } from "react";
import { useTranslation } from "next-i18next";
import { Box, Text } from "@primer/react";
import Link from "next/link";
import TwitterIcon from "../../../icons/TwitterIcon";
import DiscordIcon from "../../../icons/DiscordIcon";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";

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
  return (
    <Box
      height="17.75rem"
      px="2rem"
      bg={"auth.home.footer.bg"}
      display={"flex"}
      flexDirection="column"
      justifyContent={"center"}
    >
      <Box
        display={"flex"}
        alignItems="center"
        justifyContent={"space-between"}
        flexDirection={["column", "row", "row", "row"]}
        flexWrap={"wrap"}
      >
        <Box display={"flex"}>
          <FooterText
            text={t("auth.openCompany")}
            isLink
            href="https://bip.so/bip.so/c/hfAgL/11739/why-we-are-building-bip"
          />
          <FooterText
            text={t("auth.terms")}
            ml="3rem"
            isLink
            href="https://bip.so/bip.so/c/klnmF/19765/terms-of-use"
          />
          <FooterText
            text={t("auth.privacy")}
            ml="3rem"
            isLink
            href="https://bip.so/bip.so/c/xulEV/19921/privacy-policy"
          />
        </Box>
        <Box
          display={"flex"}
          flexDirection="column"
          mt={["16px", "0px", "0px", "0px"]}
        >
          <FooterText text={"5200 Summit Ridge Dr, Apt 2811"} fS="0.938rem" />
          <FooterText text={"Reno, NV - 89523"} fS="0.938rem" />
          <FooterText text={"Email: hey@bip.so"} fS="0.938rem" />
          <Box display={"flex"} alignItems={"center"} sx={{ gap: 1 }}>
            <a href={`https://twitter.com/bip_so`}>
              <TwitterIcon height={16} width={16} color={"white"} />
            </a>
            <a href={`https://discord.gg/WDWQUxE4yM`}>
              <DiscordIcon size={30} color={"white"} fill={"none"} />
            </a>
          </Box>
        </Box>
      </Box>
      <Box display={"flex"} justifyContent="center">
        <Text
          as="p"
          fontWeight={400}
          fontSize={"12px"}
          lineHeight={"18px"}
          color="auth.home.footer.text"
          textAlign={"center"}
          mt={"4.063rem"}
        >
          {"Digilet Labs © 2020"}
        </Text>
      </Box>
    </Box>
  );
};

export default Footer;
