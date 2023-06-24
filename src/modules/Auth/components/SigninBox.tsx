import React, { FC, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Text,
  Avatar,
  TextInput,
  TextInputProps,
} from "@primer/react";
import { MailIcon, XIcon } from "@primer/octicons-react";
import { useTranslation } from "next-i18next";
import { FaDiscord, FaTwitter } from "react-icons/fa"; //todo: update to new pattern
import SlackIcon from "../../../icons/SlackIcon";
import { useRouter } from "next/router";
import { isValidEmail } from "../../../utils/Common";
import Auth from "../services";
import { getSession, signIn } from "next-auth/react";
import { HttpStatusCode } from "../../../commons/enums";
import { LoginPayloadType } from "../types";
import StyledTextInput from "../../../components/StyledTextInput";
import { useUser } from "../../../context/userContext";
import { useToasts } from "react-toast-notifications";
import BipRouteUtils from "../../../core/routeUtils";
import { SocialAuthProvidersEnum } from "../../../core/enums";
import { OAuthProviderType } from "next-auth/providers";
import Link from "next/link";
import { ChevronLeftIcon } from "@primer/styled-octicons";
import segmentEvents from "../../../insights/segment";
import { setCookie } from "cookies-next";
import LinkWithoutPrefetch from "../../../components/LinkWithoutPrefetch";
import AuthContainer from "./AuthContainer";
import { BIP_PRIVACY_POLICY_URL, BIP_TERMS_URL } from "../../../core/constants";
import { supabase } from "../../../utils/supabaseClient";
import { SUPABASE_TABLES } from "../../../realtime/constants";

interface HeadingBoxProps {
  back: Function;
  heading: string;
  email: string;
  text: string;
}

export const HeadingBox: FC<HeadingBoxProps> = (props) => (
  <Box
    display={"flex"}
    width={"95%"}
    flexDirection="column"
    alignItems="flex-start"
    // py={"0.625rem"}
    // mb="0.75rem"
  >
    <Box
      display={"flex"}
      flex="1"
      sx={{ gap: "1rem" }}
      alignItems="center"
      // justifyContent={"flex-start"}
      marginBottom="0.5rem"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={() => {
          props.back();
        }}
      >
        <ChevronLeftIcon
          color={"auth.signin.arrowIcon"}
          className="cursor-pointer"
          size={24}
        />
      </div>
      <Text
        as={"p"}
        fontWeight={600}
        // fontFamily={"Inter"}
        fontStyle={"normal"}
        fontSize={"1.25rem"}
        lineHeight={"2rem"}
        textAlign="center"
        mr={"1rem"}
      >
        {props.heading}
      </Text>
    </Box>
    {props.email && (
      <Box
        display="flex"
        alignItems={"center"}
        justifyContent="center"
        marginBottom={"0.5rem"}
      >
        <UserEmail email={props.email} />
      </Box>
    )}
    {props.text && (
      <Text
        as={"p"}
        fontWeight={500}
        style={{
          width: "100%",
        }}
        color="auth.signin.heading"
        fontStyle={"normal"}
        fontSize={"0.90rem"}
        lineHeight={"1.25rem"}
        // mr={"9rem"}
      >
        {props.text}
      </Text>
    )}
  </Box>
);

const PrivacyPolicyText = () => {
  const { t } = useTranslation();
  return (
    <>
      <Text
        as="p"
        fontSize={"0.75rem"}
        lineHeight="1.25rem"
        letterSpacing={"-0.009rem"}
        textAlign="center"
        color="auth.box2.link"
        // mb="0.625rem"
      >
        {t("auth.agreeText")}
        <LinkWithoutPrefetch href={BIP_TERMS_URL}>
          <a target="_blank">
            <Text
              sx={{ cursor: "pointer", fontWeight: 600 }}
              color={"black.appBlack"}
            >
              {t("auth.termsOfUse")}
            </Text>
          </a>
        </LinkWithoutPrefetch>
      </Text>
      <Text
        as="p"
        fontSize={"0.75rem"}
        lineHeight="1.25rem"
        letterSpacing={"-0.009rem"}
        textAlign="center"
        color="auth.box2.link"
        // mb="0.625rem"
      >
        {t("auth.readOur")}
        <LinkWithoutPrefetch href={BIP_PRIVACY_POLICY_URL}>
          <a target="_blank">
            <Text
              sx={{ cursor: "pointer", fontWeight: 600 }}
              color={"black.appBlack"}
            >
              {t("auth.privacyPolicy")}
            </Text>
          </a>
        </LinkWithoutPrefetch>
      </Text>
    </>
  );
};

interface DiscordComponentsProps {
  onClickDiscord: Function;
  onClickTwitter: Function;
  onClickSlack: Function;
  onClickMail: Function;
  back: Function;
}

const DiscordComponents: FC<DiscordComponentsProps> = (props) => {
  const { t } = useTranslation();

  return (
    <Box
      display={"flex"}
      flexDirection="column"
      width={["100%", "100%", "648px", "648px"]}
      // height={"654px"}
      borderRadius={"12px"}
      alignItems={"center"}
      mx={["20px", "20px", "auto", "auto"]}
      sx={{
        boxShadow:
          " 0px 8px 24px rgba(66, 74, 83, 0.12), 0px 1px 3px rgba(27, 31, 36, 0.12)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "auth.signin.border",
      }}
    >
      {/* <Box display={["none", "flex", "flex", "flex"]}>
        <img
          src="/supporting-image1.png"
          alt="supporting bip image"
          height="210px"
          style={{
            borderRadius: "12px",
          }}
        />
      </Box> */}
      <AuthContainer
        hideAppDescription={false}
        header={
          <HeadingBox
            back={props.back}
            heading={t("auth.loginOrSignup")}
            email={""}
            text={t("auth.loginMessage")}
          />
        }
      >
        <Box
          display={"flex"}
          flexDirection="column"
          alignItems="center"
          height={"244px"}
          width={"100%"}
          // justifyContent={"space-between"}
          sx={{ gap: "12px" }}
          // mb="1.375rem"
        >
          <Button
            size="large"
            sx={{
              // paddingLeft: "5rem",
              // paddingRight: "5rem",
              width: "75%",
              bg: "auth.signin.discordButton",
              border: "1px solid",
              borderColor: "auth.signin.discordBorder",
              color: "auth.signin.discordText",
              ":hover:not([disabled])": {
                bg: "auth.signin.discordButton",
                boxShadow: "0px 0px 0px 3px rgba(88, 101, 242, 0.4)",
              },
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            leadingIcon={FaDiscord}
            onClick={() => {
              segmentEvents.loginDiscordSelected();
              props.onClickDiscord();
            }}
          >
            {t("auth.loginWithDiscord")}
          </Button>
          <Button
            size="large"
            leadingIcon={SlackIcon}
            sx={{
              width: "75%",
              border: "1px solid",
              borderColor: "auth.signin.border",
              bg: "auth.signin.iconsBg",
              ":hover:not([disabled])": {
                bg: "auth.signin.iconsBg",
              },
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => {
              segmentEvents.loginSlackSelected();
              props.onClickSlack();
            }}
          >
            {t("auth.loginWithSlack")}
          </Button>
          <Button
            size="large"
            // aria-label="Twitter"
            leadingIcon={FaTwitter}
            sx={{
              width: "75%",
              border: "none",
              bg: "auth.signin.bg",
              color: "auth.signin.twitterText",
              ":hover:not([disabled])": {
                bg: "auth.signin.iconsBg",
              },
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => {
              segmentEvents.loginTwitterSelected;
              props.onClickTwitter();
            }}
          >
            {t("auth.loginWithTwitter")}
          </Button>
          <Button
            size="large"
            leadingIcon={MailIcon}
            sx={{
              width: "75%",
              border: "none",
              bg: "auth.signin.bg",
              color: "auth.signin.mail",
              ":hover:not([disabled])": {
                bg: "auth.signin.iconsBg",
              },
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => {
              segmentEvents.loginEmailSelected();
              props.onClickMail();
            }}
          >
            {t("auth.loginWithEmail")}
          </Button>
          <Box display={"flex"} flexDirection={"column"} height={"36px"}>
            <PrivacyPolicyText />
          </Box>
        </Box>
      </AuthContainer>
    </Box>
  );
};

interface LoginOrSignupProps {
  onExistingUserLogin: Function;
  onNewUserLogin: Function;
  back: Function;
  returnToSocialSignUp: Function;
}

const LoginOrSignup: FC<LoginOrSignupProps> = (props) => {
  const [email, setEmail] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();

  const validateEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!verifying) {
      if (isValidEmail(email)) {
        setInvalidEmail(false);
        setVerifying(true);
        Auth.verifyEmail({ email })
          .then((r) => {
            segmentEvents.loginEmailInput(email);
            setVerifying(false);
            props.onExistingUserLogin(email);
          })
          .catch((error) => {
            if (error.status === HttpStatusCode.NOT_FOUND) {
              props.onNewUserLogin(email);
            }
            setVerifying(false);
          });
      } else {
        setInvalidEmail(true);
      }
    }
    setLoading(false);
  };

  return (
    <AuthContainer
      header={
        <HeadingBox
          back={props.back}
          heading={t("auth.loginWithEmail")}
          email={""}
          text={t("auth.emailMessage")}
        />
      }
    >
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "112px",
          width: "100%",
          justifyContent: "space-between",
        }}
        onSubmit={validateEmail}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "56px",
          }}
        >
          <Text
            as="p"
            sx={{
              fontSize: "14px",
              lineHeight: "18px",
              fontWeight: 600,
              mb: "8px",
              color: "studioSettings.tab.name",
            }}
          >
            Email address
          </Text>
          <StyledTextInput
            sx={{
              width: "322px",
            }}
            aria-label="email"
            placeholder="Ex. hey@bip.so"
            validationStatus={invalidEmail ? "error" : "success"}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            showError={invalidEmail}
            errorMessage={t("auth.enterValidEmail")}
            autoFocus
            autoComplete="email"
          />
        </Box>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || verifying}
          sx={{
            // mt: "0.75rem",
            // mb: "1.375rem",
            width: "322px",
            ":focus:not([disabled])": { boxShadow: "none" },
          }}
        >
          {/* {verifying
                ? `${t("auth.verifying")}...`
                : t("auth.loginOrSignup")} */}
          {t("auth.continue")}
        </Button>
        {/* <PrivacyPolicyText /> */}
      </form>
    </AuthContainer>
  );
};

interface UserEmailProps {
  email: string;
}

const UserEmail: FC<UserEmailProps> = (props) => {
  return (
    <Box
      p={"3px 12px"}
      border="1px solid"
      borderColor={"auth.signin.emailBorder"}
      borderRadius={"100px"}
      display="flex"
      alignItems={"center"}
      justifyContent="center"
    >
      <Text
        as="p"
        color={"auth.signin.emailText"}
        fontWeight={600}
        fontSize={"0.75rem"}
        lineHeight={"1.125rem"}
      >
        {props.email}
      </Text>
    </Box>
  );
};

interface ForgotPasswordProps {
  email: string;
  back: Function;
}

const ForgotPassword: FC<ForgotPasswordProps> = (props) => {
  const { t } = useTranslation();

  return (
    <AuthContainer
      header={
        <HeadingBox
          back={props.back}
          heading={t("auth.forgotPassword")}
          email={props.email}
          text={""}
        />
      }
    >
      <Text
        as="p"
        color={"auth.signin.forgotMessage"}
        fontWeight={400}
        fontSize={"0.75rem"}
        lineHeight={"1.125rem"}
        textAlign="center"
        px={"2.563rem"}
        mt="1rem"
      >
        We sent you an email! Click on the <b>Magic Link</b> that's sent to you.
      </Text>
    </AuthContainer>
  );
};

interface SignupBoxProps {
  back: Function;
  email: string;
  onSignupSuccess?: Function;
}

const SignupBox: FC<SignupBoxProps> = (props) => {
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invalidPassword, setInValidPassword] = useState(false);
  const [mismatched, setMismatched] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();

  const getClientReferenceId = () => {
    return (window?.Rewardful && window?.Rewardful?.referral) || "na";
  };

  const insertCampaignEntry = async (
    user_id: number,
    email: string,
    campaignMeta: any
  ) => {
    const { data, error } = await supabase
      .from(SUPABASE_TABLES.CAMPAIGN)
      .insert({ signup_meta: campaignMeta, email, user_id });
  };

  const signup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loading) {
      setInValidPassword(password.length < 6);
      setMismatched(confirmPassword !== password);
      if (password.length >= 6 && confirmPassword === password) {
        setLoading(true);
        Auth.signup({
          email: props.email,
          password: password,
          is_social: false,
          social_provider: "",
          social_provider_id: "",
          social_provider_metadat: "",
          username: "",
          clientReferenceId: getClientReferenceId(),
        })
          .then((response) => {
            const campaignMeta = localStorage.getItem("bip-campaign-meta");
            if (campaignMeta) {
              insertCampaignEntry(
                response.data.data.id,
                props.email,
                campaignMeta
              );
              localStorage.removeItem("bip-campaign-meta");
            }
            props.onSignupSuccess &&
              props.onSignupSuccess({
                username: props.email,
                password: password,
              });
            // setLoading(false);
          })
          .catch((err) => {
            setLoading(false);
            addToast("Something went wrong. Please try again!", {
              appearance: "error",
              autoDismiss: true,
            });
          });
      }
    }
  };

  return (
    <AuthContainer
      header={
        <>
          <HeadingBox
            back={props.back}
            heading={t("auth.signUp")}
            email={""}
            text={""}
          />
          <Box display="flex" alignItems={"center"} justifyContent="center">
            <UserEmail email={props.email} />
          </Box>
        </>
      }
    >
      <Box width={"60%"}>
        <form onSubmit={signup}>
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
            {t("auth.signUp")}
          </Button>
        </form>
        <PrivacyPolicyText />
      </Box>
    </AuthContainer>
  );
};

interface LoginBoxProps {
  back: Function;
  email: string;
  forgotPassword: Function;
  onLoginSuccess?: Function;
  returnToSocialSignUp: Function;
}

const LoginBox: FC<LoginBoxProps> = (props) => {
  const { t } = useTranslation();
  const router = useRouter();

  const { saveUser } = useUser();

  const [type, setType] = useState("password");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [invalidPassword, setInValidPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);
  const [gettingOTP, setGettingOTP] = useState(false);

  const login = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loading) {
      const loginData =
        type === "password"
          ? { username: props.email, password: password, otp: "" }
          : { username: props.email, password: "", otp: otp };
      setInValidPassword(false);
      setLoading(true);
      signIn("credentials", {
        ...loginData,
        redirect: false,
      })
        .then(async (r: any) => {
          const session = await getSession();

          setLoading(false);
          if (r?.status === HttpStatusCode.UNAUTHORIZED) {
            setInValidPassword(true);
          } else {
            await saveUser(session);
            if (password.length !== 0) {
              segmentEvents.loggedIn(
                "email-pwd",
                session?.username!,
                session?.id,
                false
              );
            } else if (otp.length !== 0) {
              segmentEvents.loggedIn(
                "email-otp",
                session?.username!,
                session?.id,
                false
              );
            }
            if (session && session?.isSetupDone) {
              const nextRoute = router.query.returnUrl
                ? (router.query.returnUrl as string)
                : BipRouteUtils.getHomeRoute();
              router.push(nextRoute);
            } else {
              router.push(BipRouteUtils.getSetupRoute());
            }
            props.onLoginSuccess && props.onLoginSuccess();
          }
        })
        .catch((e) => {
          setLoading(false);
          setInValidPassword(true);
        });
    }
  };

  const forgotPassword = () => {
    setSendingResetEmail(true);
    Auth.forgotPassword({ email: props.email })
      .then((r) => {
        setSendingResetEmail(false);
        props.forgotPassword();
      })
      .catch((err) => {
        setSendingResetEmail(false);
      });
  };

  const getOTP = () => {
    setGettingOTP(true);
    Auth.getOTP({ email: props.email })
      .then((r) => {
        setGettingOTP(false);
      })
      .catch((err) => {
        setGettingOTP(false);
      });
  };

  return (
    <AuthContainer
      header={
        <HeadingBox
          back={props.back}
          heading={t("auth.password")}
          email={props.email}
          text={
            type === "password"
              ? t("auth.passwordMessage")
              : t("auth.OtpMessage")
          }
        />
      }
    >
      <form
        onSubmit={login}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "166px",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        {type === "password" ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100px",
            }}
          >
            <Text
              as="p"
              sx={{
                fontSize: "14px",
                lineHeight: "18px",
                fontWeight: 600,
                mb: "8px",
                color: "auth.setup.text",
              }}
            >
              {t("auth.password")}
            </Text>
            <StyledTextInput
              aria-label="password"
              type="password"
              placeholder={t("auth.enterPassword")}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              showError={invalidPassword}
              errorMessage={t("auth.invalidCredentials")}
              sx={{ width: "322px" }}
              // trailingAction={
              // }
              autoFocus
            />
            <Text
              as="button"
              color="auth.signin.otp"
              type="button"
              fontWeight={600}
              fontSize={"0.90rem"}
              lineHeight={"1.125rem"}
              whiteSpace="nowrap"
              onClick={(e: any) => {
                segmentEvents.loginOTPSelected();
                e.stopPropagation();
                setType("otp");
                getOTP();
              }}
              mr={"8px"}
              mb={"8px"}
            >
              {t("auth.loginUsingOtp")}
            </Text>
          </Box>
        ) : (
          <Box
            height={["140px", "100px", "100px", "100px"]}
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Text
              as="p"
              fontSize={"1rem"}
              lineHeight="1.25rem"
              fontWeight={600}
              letterSpacing={"-0.009rem"}
              // textAlign="center"
              color="auth.setup.text"
              // mt="2.5rem"
              mb="8px"
            >
              {t("auth.otp")}
            </Text>
            <StyledTextInput
              aria-label="otp"
              type="text"
              placeholder={t("auth.enterOtp")}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
              }}
              sx={{ width: "322px" }}
              showError={invalidPassword}
              errorMessage={t("auth.invalidOTP")}
              autoFocus
            />
            <Box
              display={"flex"}
              flexDirection={["column-reverse", "unset", "unset", "unset"]}
              alignItems={["center", "flex-start", "flex-start", "flex-start"]}
              justifyContent={"space-between"}
              mb="0.25rem"
            >
              <Button
                variant="invisible"
                size="medium"
                type="button"
                sx={{
                  paddingTop: "0px",
                  width: "177px",
                  color: "auth.signin.otp",
                  fontWeight: 600,
                  ":hover:not([disabled])": {
                    bg: "unset",
                  },
                }}
                onClick={() => {
                  setType("password");
                  setOtp("");
                }}
              >
                {t("auth.loginUsingPassword")}
              </Button>
              <Button
                variant="invisible"
                size="medium"
                type="button"
                disabled={gettingOTP}
                sx={{
                  paddingTop: "0px",
                  width: "114px",
                  color: "auth.onboarding.description",
                  fontWeight: 600,
                  ":hover:not([disabled])": {
                    bg: "unset",
                  },
                }}
                onClick={getOTP}
              >
                {t("auth.resendOtp")}
              </Button>
            </Box>
          </Box>
        )}
        <Button
          variant="primary"
          type="submit"
          sx={{
            width: "322px",
            // mt: "0.75rem",
            // mb: "1.375rem",
            ":focus:not([disabled])": { boxShadow: "none" },
          }}
          disabled={loading}
        >
          {t("auth.continue")}
        </Button>
        {type === "password" ? (
        <Box display={"flex"} justifyContent="center">
          <Button
            variant="invisible"
            type="button"
            disabled={loading || sendingResetEmail}
            size="medium"
            sx={{
              color: "auth.signin.otpMessage",
              fontWeight: 600,
              ":hover:not([disabled])": {
                bg: "unset",
              },
            }}
            onClick={forgotPassword}
          >
            {t("auth.forgotPassword")}
          </Button>
        </Box>
      ) : (
        <PrivacyPolicyText />
      )}
      </form>
    </AuthContainer>
  );
};

interface SigninBoxProps {
  onSocialSignIn: (provider: OAuthProviderType) => void;
}

const SigninBox: FC<SigninBoxProps> = (props) => {
  const [signinState, setSigninState] = useState("discord");
  const [userEmail, setUserEmail] = useState("");

  const { saveUser } = useUser();

  const { t } = useTranslation();
  const router = useRouter();

  const goBack = () => {
    if (signinState === "discord") {
      router.replace("/");
    } else if (signinState === "mail") {
      setSigninState("discord");
    } else if (signinState === "login" || signinState === "signup") {
      setSigninState("mail");
    } else if (signinState === "forgot-password") {
      setSigninState("login");
    }
  };

  const handleExistingUserLogin = (email: string) => {
    setUserEmail(email);
    setSigninState("login");
  };

  const handleNewUserLogin = (email: string) => {
    setUserEmail(email);
    setSigninState("signup");
  };

  const onSignupSuccess = (loginPayload: LoginPayloadType) => {
    // handling needed to show profile-setup after login for first time signup
    signIn("credentials", { ...loginPayload, redirect: false })
      .then(async (r: any) => {
        const session = await getSession();
        if (r?.error === "Invalid credentials") {
        } else {
          await saveUser(session);

          // segmentEvents.loggedIn("email-pwd",session?.)
          localStorage.setItem("user", JSON.stringify(session));
          setCookie("access-token", session?.accessToken);
          router.push(
            BipRouteUtils.getSetupRoute(router.query.returnUrl as string)
          );
        }
      })
      .catch((e) => {});
  };

  const onLoginSuccess = () => {};

  const returnToSocialSignUp = () => {
    setSigninState("discord");
  };

  const forgotPassword = () => {
    setSigninState("forgot-password");
  };

  return signinState === "mail" ? (
    <LoginOrSignup
      onNewUserLogin={handleNewUserLogin}
      onExistingUserLogin={handleExistingUserLogin}
      back={goBack}
      returnToSocialSignUp={returnToSocialSignUp}
    />
  ) : signinState === "login" ? (
    <LoginBox
      back={goBack}
      email={userEmail}
      onLoginSuccess={onLoginSuccess}
      forgotPassword={forgotPassword}
      returnToSocialSignUp={returnToSocialSignUp}
    />
  ) : signinState === "forgot-password" ? (
    <ForgotPassword back={goBack} email={userEmail} />
  ) : signinState === "signup" ? (
    <SignupBox
      back={goBack}
      email={userEmail}
      onSignupSuccess={onSignupSuccess}
    />
  ) : (
    <DiscordComponents
      onClickDiscord={() =>
        props.onSocialSignIn(SocialAuthProvidersEnum.DISCORD)
      }
      onClickMail={() => {
        setSigninState("mail");
      }}
      onClickSlack={() => props.onSocialSignIn(SocialAuthProvidersEnum.SLACK)}
      onClickTwitter={() =>
        props.onSocialSignIn(SocialAuthProvidersEnum.TWITTER)
      }
      back={goBack}
    />
  );
};

export default SigninBox;
