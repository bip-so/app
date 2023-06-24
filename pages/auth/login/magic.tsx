import { Box } from "@primer/react";
import { GetServerSideProps, NextPage } from "next";
import { getProviders, getSession, signIn } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useToasts } from "react-toast-notifications";
import { HttpStatusCode } from "../../../src/commons/enums";
import BipLoader from "../../../src/components/BipLoader";
import { useUser } from "../../../src/context/userContext";
import BipRouteUtils from "../../../src/core/routeUtils";

interface LoginWithMagicLinkProps {}

const LoginWithMagicLink: NextPage<LoginWithMagicLinkProps> = (props) => {
  const { addToast } = useToasts();
  const router = useRouter();
  const { token } = router.query;
  const { saveUser } = useUser();

  let email = "";
  const parsedLink = router.asPath.split("email=");
  if (parsedLink.length === 2) {
    email = parsedLink[1];
  }

  useEffect(() => {
    if (!token || !email) {
      errorToast();
      router.replace("/");
    } else {
      login();
    }
  }, []);

  const errorToast = () => {
    addToast("Magic link is invalid.", {
      appearance: "error",
      autoDismiss: true,
    });
  };

  const login = () => {
    const loginData = {
      username: email,
      password: "",
      otp: token,
    };
    signIn("credentials", {
      ...loginData,
      redirect: false,
    })
      .then(async (r: any) => {
        const session = await getSession();
        if (r?.status === HttpStatusCode.UNAUTHORIZED) {
          errorToast();
        } else {
          await saveUser(session);
          if (session && session?.isSetupDone) {
            router.replace(BipRouteUtils.getHomeRoute());
          } else {
            router.push(BipRouteUtils.getSetupRoute());
          }
        }
      })
      .catch((e) => {
        errorToast();
      });
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: "16px",
      }}
    >
      <BipLoader />
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders();
  const { locale, req } = context;
  const session = await getSession({ req });

  if (session) {
    return {
      props: { providers, ...(await serverSideTranslations(locale || "en")) },
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
  return {
    props: { providers, ...(await serverSideTranslations(locale || "en")) },
  };
};

export default LoginWithMagicLink;
