/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");

const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  reactStrictMode: false,
  i18n,
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["d1uyo0yzpsnvfq.cloudfront.net"],
  },
  redirects() {
    return [
      process.env.NEXT_PUBLIC_IN_MAINTENANCE === "1"
        ? {
            source: "/((?!maintenance).*)",
            destination: "/maintenance.html",
            permanent: false,
          }
        : null,
      {
        source: "/discord",
        destination: "https://discord.com/invite/WDWQUxE4yM",
        permanent: true,
      },
    ].filter(Boolean);
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
};

module.exports =
  process.env.NEXT_PUBLIC_ENVIRONMENT === "LOCAL"
    ? nextConfig
    : withSentryConfig(nextConfig);
