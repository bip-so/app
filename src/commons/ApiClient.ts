import axios, { AxiosError, AxiosInstance } from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { STATUS_CODES } from "http";
import { getSession, signOut } from "next-auth/react";
import { useStudio } from "../context/studioContext";
import BipRouteUtils from "../core/routeUtils";
import { refreshToken } from "../modules/Auth/actions";
import { IBipUser } from "../modules/User/interfaces/IUser";
import { isEmpty } from "../utils/Common";
import { HttpStatusCode } from "./enums";

const securityLogout = async () => {
  signOut().then(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    deleteCookie("bip-studio-id");
    deleteCookie("access-token");
    alert("Login expired for your security. Please login again!");
    window.location.replace(
      `${BipRouteUtils.getSignInRoute(window.location.pathname)}`
    );
  });
};

const ApiClient = () => {
  const defaultOptions = {
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_BIP_API_VERSION}`,
    headers: {
      "Content-Type": "application/json",
      // "Content-Security-Policy": "upgrade-insecure-requests",
      "bip-client-id": `${process.env.NEXT_PUBLIC_BIP_CLIENT_ID}`,
    },
  };

  const instance: AxiosInstance = axios.create(defaultOptions);

  instance.interceptors.request.use(async (request) => {
    const accessToken = getCookie("access-token");
    // const localUser = JSON.parse(window.localStorage.getItem("user") || "{}");
    // if (localUser && !isEmpty(localUser)) {
    // request.headers = {
    //   ...request.headers,
    //   Authorization: `Bearer ${localUser.accessToken}`,
    // };
    // }
    if (accessToken) {
      request.headers = {
        ...request.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
    if (typeof sessionStorage !== "undefined") {
      const currentStudio = JSON.parse(
        sessionStorage.getItem("currentStudio") || "{}"
      );
      const tmpStudioId = sessionStorage.getItem("bip-studio-id-tmp");
      // const tmpStudioId = getCookie("bip-studio-id-tmp");
      // const currentStudioId = getCookie("bip-studio-id");
      if (tmpStudioId) {
        request.headers = {
          ...request.headers,
          "bip-studio-id": parseInt(tmpStudioId as string),
        };
      } else if (currentStudio && !isEmpty(currentStudio)) {
        // } else if (currentStudioId) {
        request.headers = {
          ...request.headers,
          "bip-studio-id": currentStudio.id,
        };
      }
      if (tmpStudioId) {
        sessionStorage.removeItem("bip-studio-id-tmp");
        deleteCookie("bip-studio-id-tmp");
      }
    }
    if (request.url?.includes("/notifications?type=studio")) {
      const studioId = request.url?.split("=").slice(-1)[0];
      request = {
        ...request,
        headers: {
          ...request.headers,
          "bip-studio-id": studioId,
        },
        url: "/notifications?type=studio",
      };
    }
    return request;
  });

  let refreshingToken = false;

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalConfig = error.config;
      if (
        error.response &&
        error.response.status === HttpStatusCode.UNAUTHORIZED &&
        !error.config.url.includes("auth/refresh-token") &&
        error.response.headers["bip-token-invalid"] === "TOKEN_INVALID" &&
        !originalConfig._retry
      ) {
        const localUser: IBipUser = JSON.parse(
          window.localStorage.getItem("user")!
        );
        if (localUser) {
          originalConfig._retry = true;
          if (!refreshingToken) {
            refreshingToken = true;
            const { data } = await refreshToken(localUser);
            const updatedUser: IBipUser = {
              ...localUser,
              accessTokenId: data.data.accessTokenID,
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
              refreshTokenId: data.data.refreshTokenID,
            };
            window.localStorage.setItem("user", JSON.stringify(updatedUser));
            setCookie("access-token", data.data.accessToken);

            originalConfig.headers["Authorization"] =
              "Bearer " + data.data.accessToken;
            refreshingToken = false;
            return instance(originalConfig);
          }
        }
        return Promise.reject(error.response);
      } else if (
        error.response &&
        error.response.status === HttpStatusCode.UNAUTHORIZED &&
        (error.response.headers["bip-token-invalid"] === "TOKEN_INVALID" ||
          error.config.url.includes("auth/refresh-token"))
      ) {
        await securityLogout();
        refreshingToken = false;
      } else {
        return Promise.reject(error.response);
      }
    }
  );

  return instance;
};

export default ApiClient();
