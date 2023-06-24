export type VerifyEmailType = {
  email: string;
};

export type SignupPayloadType = {
  email: string;
  is_social: boolean;
  password: string;
  social_provider: string;
  social_provider_id: string;
  social_provider_metadat: string;
  username: string;
  clientReferenceId: string;
};

export type LoginPayloadType = {
  username: string;
  password: string;
  otp: string;
};

export type VerifyUsernameType = {
  username: string;
};

export type ResetPasswordType = {
  password: string;
  token: string | string[] | undefined;
};

export type ForgotPasswordType = {
  email: string;
};

export type GetOTPType = {
  email: string;
};

export type RefreshTokenType = {
  refreshToken: string;
  AccessTokenID: string;
};
