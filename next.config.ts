import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repoBase = "/HUMANMADE";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isGithubActions ? repoBase : "",
  assetPrefix: isGithubActions ? repoBase : "",
};

export default nextConfig;
