import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { oldSiteRedirects } from "./lib/redirects";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.suenoenlafabrica.com",
      },
    ],
  },
  async redirects() {
    return oldSiteRedirects;
  },
};

export default withNextIntl(nextConfig);
