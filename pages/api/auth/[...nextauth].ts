import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import SlackProvider from "next-auth/providers/slack";
import TwitterProvider from "next-auth/providers/twitter";
import NextAuth, { NextAuthOptions } from "next-auth";
import { LoginPayloadType } from "../../../src/modules/Auth/types";
import { HttpStatusCode } from "../../../src/commons/enums";
import { SocialAuthProvidersEnum } from "../../../src/core/enums";
import { NextApiRequest, NextApiResponse } from "next";

// /**
//  * Takes a token, and returns a new token with updated
//  * `accessToken` and `accessTokenExpires`. If an error occurs,
//  * returns the old token and an error property
//  */
// async function refreshAccessToken(token) {
//   try {
//     const url =
//       "https://oauth2.googleapis.com/token?" +
//       new URLSearchParams({
//         client_id: process.env.GOOGLE_CLIENT_ID,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET,
//         grant_type: "refresh_token",
//         refresh_token: token.refreshToken,
//       });

//     const response = await fetch(url, {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       method: "POST",
//     });

//     const refreshedTokens = await response.json();

//     if (!response.ok) {
//       throw refreshedTokens;
//     }

//     return {
//       ...token,
//       accessToken: refreshedTokens.access_token,
//       accessTokenExpires: Date.now() + refreshedTokens.expires_at * 1000,
//       refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
//     };
//   } catch (error) {
//     console.log(error);

//     return {
//       ...token,
//       error: "RefreshAccessTokenError",
//     };
//   }
// }

type NextAuthOptionsCallback = (
  req: NextApiRequest,
  res: NextApiResponse
) => NextAuthOptions;

export const nextAuthOptions: NextAuthOptionsCallback = (req, res) => {
  return {
    // Configure one or more authentication providers
    providers: [
      DiscordProvider({
        clientId: process.env.DISCORD_CLIENT_ID || "",
        clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      }),
      SlackProvider({
        clientId: process.env.SLACK_CLIENT_ID || "",
        clientSecret: process.env.SLACK_CLIENT_SECRET || "",
      }),
      TwitterProvider({
        clientId: process.env.TWITTER_CLIENT_ID || "",
        clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      }),
      CredentialsProvider({
        // The name to display on the sign in form (e.g. 'Sign in with...')
        name: "bip",
        // The credentials is used to generate a suitable form on the sign in page.
        // You can specify whatever fields you are expecting to be submitted.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
          username: { label: "Username", type: "text", placeholder: "jsmith" },
          password: { label: "Password", type: "password" },
          otp: { label: "OTP", type: "text" },
        },
        async authorize(credentials, req) {
          try {
            const loginPayload: LoginPayloadType = {
              username: credentials?.username || "",
              password: credentials?.password || "",
              otp: credentials?.otp || "",
            };
            // const loginResp = await AuthService.login(loginPayload);
            const loginResp = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_BIP_API_VERSION}/auth/login`,
              {
                method: "POST",
                body: JSON.stringify(loginPayload),
                headers: {
                  "Content-Type": "application/json",
                  "bip-client-id": `${process.env.NEXT_PUBLIC_BIP_CLIENT_ID}`,
                },
              }
            );

            const loginData = await loginResp.json();

            if (loginResp.status === HttpStatusCode.OK) {
              const { data: user } = loginData;
              return user;
            }
          } catch (err) {
            const error = new Error("Invalid credentials");
            throw error;
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user, account }) {
        // Persist the OAuth access_token to the token right after signin
        if (user) {
          if (
            account?.provider === SocialAuthProvidersEnum.DISCORD ||
            account?.provider === SocialAuthProvidersEnum.SLACK ||
            account?.provider === SocialAuthProvidersEnum.TWITTER
          ) {
            //Rewardful
            let clientReferenceId = "na";
            const rewardfulCookie = req.cookies["rewardful.referral"];
            if (rewardfulCookie) {
              const parsedReferralCookie = JSON.parse(rewardfulCookie);
              clientReferenceId = parsedReferralCookie["id"];
            }

            const socialAuthPayload = {
              email: user.email,
              fullName: user.name,
              username: user.name,
              image: user.image,
              provider: account.provider,
              providerID: account.providerAccountId,
              access_token: account.access_token,
              clientReferenceId: clientReferenceId,
            };
            try {
              const socialAuthResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_BIP_API_VERSION}/auth/social-login`,
                {
                  method: "POST",
                  body: JSON.stringify(socialAuthPayload),
                  headers: {
                    "Content-Type": "application/json",
                    "bip-client-id": `${process.env.NEXT_PUBLIC_BIP_CLIENT_ID}`,
                  },
                }
              );
              const loginData = await socialAuthResponse.json();
              if (socialAuthResponse.status === HttpStatusCode.OK) {
                const { data: loggedInUser } = loginData;
                token = {
                  ...token,
                  ...loggedInUser,
                };
              }
            } catch (error) {
              console.log("JWT Error", error);
            }
          } else {
            token = {
              ...token,
              ...user,
            };
          }
        }

        // console.log("JWT", token);
        // // Return previous token if the access token has not expired yet
        // if (Date.now() < token.accessTokenExpires) {
        //   return token;
        // }
        return token;
      },
      async session({ session, token }) {
        // Persist the OAuth access_token to the token right after signin
        if (token) {
          session = {
            ...session,
            ...token,
          };
        }
        return Promise.resolve(session);
      },
      async redirect({ url, baseUrl }) {
        // Allows relative callback URLs
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        // Allows callback URLs on the same origin
        else if (new URL(url).origin === baseUrl) return url;
        return baseUrl;
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/signin",
    },
  };
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  return NextAuth(req, res, nextAuthOptions(req, res));
};
