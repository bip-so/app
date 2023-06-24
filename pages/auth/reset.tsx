import React, { useEffect, useState } from "react";
import { GetServerSideProps, NextPage } from "next";
import { getProviders, getSession } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { Box, Button, Text } from "@primer/react";
import { useTranslation } from "next-i18next";
import StyledTextInput from "../../src/components/StyledTextInput";
import AuthService from "../../src/modules/Auth/services";
import { useToasts } from "react-toast-notifications";

interface ResetPasswordProps {}

const ResetPassword: NextPage<ResetPasswordProps> = (props) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invalidPassword, setInValidPassword] = useState(false);
  const [mismatched, setMismatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { addToast } = useToasts();

  const router = useRouter();
  const { token, email } = router.query;

  useEffect(() => {
    if (!token || !email) {
      router.replace("/");
    }
  }, []);

  const isInvalidPassword = () => {
    return password.trim().length < 6;
  };

  const isPasswordMismatched = () => {
    return password !== confirmPassword;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const isInvalid = isInvalidPassword();
    const isMismatched = isPasswordMismatched();
    setInValidPassword(isInvalid);
    setMismatched(isMismatched);
    if (!isInvalid && !isMismatched && !loading) {
      resetPassword();
    }
  };

  const resetPassword = () => {
    setLoading(true);
    AuthService.resetPassoword({
      password: password,
      token: token,
    })
      .then((r) => {
        setLoading(false);
        if (r.data?.error) {
          addToast("Invalid magic link", {
            appearance: "error",
            autoDismiss: true,
          });
        } else {
          addToast("Password changed successfully. Please login", {
            appearance: "success",
            autoDismiss: true,
          });
          router.replace("/auth/signin");
        }
      })
      .catch((err) => {
        setLoading(false);
        addToast("Something went wrong. Please try again", {
          appearance: "error",
          autoDismiss: true,
        });
      });
  };

  return (
    <Box
      sx={{
        height: "100vh",
        bg: "auth.bg",
        width: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        display={"flex"}
        flexDirection="column"
        width={"20rem"}
        padding={"1rem"}
        borderRadius={"12px"}
        border={"1px solid"}
        borderColor={"auth.reset.border"}
        mx={"auto"}
        bg={"auth.reset.bg"}
      >
        <Box
          display={"flex"}
          justifyContent="center"
          py={"0.625rem"}
          mb="0.75rem"
        >
          <Text
            as={"p"}
            fontWeight={500}
            fontSize={"1rem"}
            lineHeight={"1.25rem"}
            textAlign="center"
            mr={"1rem"}
          >
            {t("auth.resetPassword")}
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <StyledTextInput
            aria-label="password"
            type="password"
            placeholder={t("auth.newPassword")}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            showError={invalidPassword}
            errorMessage={t("auth.passwordError")}
            sx={{ mt: "1rem" }}
            autoFocus
          />
          <StyledTextInput
            aria-label="confirm-password"
            type="password"
            placeholder={t("auth.confirmPassword")}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
            showWarning={mismatched}
            warningMessage={t("auth.passwordsMustMatch")}
            sx={{ mt: "0.75rem" }}
          />
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            sx={{
              width: "100%",
              mt: "0.75rem",
              mb: "1.375rem",
              ":focus:not([disabled])": { boxShadow: "none" },
            }}
          >
            {t("app.submit")}
          </Button>
        </form>
      </Box>
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

export default ResetPassword;
