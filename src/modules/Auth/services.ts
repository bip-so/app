import ApiClient from "../../commons/ApiClient";
import {
  ForgotPasswordType,
  GetOTPType,
  LoginPayloadType,
  ResetPasswordType,
  SignupPayloadType,
  VerifyEmailType,
  VerifyUsernameType,
  RefreshTokenType,
} from "./types";

const AuthService = {
  login: (payload: LoginPayloadType) => ApiClient.post(`/auth/login`, payload),
  verifyEmail: (payload: VerifyEmailType) =>
    ApiClient.post("/auth/existing-email", payload),
  signup: (payload: SignupPayloadType) =>
    ApiClient.post("/auth/signup", payload),
  verifyUsername: (payload: VerifyUsernameType) =>
    ApiClient.post("/auth/existing-username", payload),
  resetPassoword: (payload: ResetPasswordType) =>
    ApiClient.post("/auth/reset-password", payload),
  forgotPassword: (payload: ForgotPasswordType) =>
    ApiClient.post("/auth/forgot-password", payload),
  getOTP: (payload: GetOTPType) => ApiClient.post("/auth/otp", payload),
  logout: () => ApiClient.post(`/auth/logout`, {}),
  refreshToken: (payload: RefreshTokenType) =>
    ApiClient.post(`auth/refresh-token`, payload),
};

export default AuthService;
