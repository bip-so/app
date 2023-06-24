import type { GetServerSideProps, NextPage } from "next";
import { getSession, signIn } from "next-auth/react";
import type { OAuthProviderType } from "next-auth/providers";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import SigninBox from "../../src/modules/Auth/components/SigninBox";
import BipRouteUtils from "../../src/core/routeUtils";
import { useRouter } from "next/router";
import { Box } from "@primer/react";

interface SignInProps {}

const SignInPage: NextPage<SignInProps> = ({}: SignInProps) => {
  const router = useRouter();
  const returnUrl = router.query.returnUrl as string;

  const handleSocialSignIn = async (provider: OAuthProviderType) => {
    signIn(provider, {
      callbackUrl: BipRouteUtils.getSocialRedirectRoute(provider, returnUrl),
    });
  };

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      backgroundColor={"auth.bg"}
      width={"full"}
      height={"100vh"}
    >
      {/* <div className="flex items-center w-full h-80v"> */}
      <SigninBox onSocialSignIn={handleSocialSignIn} />
      {/* </div> */}
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res, locale } = context;
  const session = await getSession({ req });

  if (session) {
    return {
      props: { ...(await serverSideTranslations(locale || "en")) },
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
  return {
    props: { ...(await serverSideTranslations(locale || "en")) },
  };
};

export default SignInPage;
