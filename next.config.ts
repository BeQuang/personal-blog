import type { NextConfig } from "next";

function getR2RemotePattern(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (!publicBaseUrl) return [];

  try {
    const url = new URL(publicBaseUrl);
    if (
      (url.protocol !== "https:" && url.protocol !== "http:") ||
      url.username || url.password || url.search || url.hash
    ) return [];
    const basePath = url.pathname.replace(/\/+$/, "");
    return [{
      protocol: url.protocol.slice(0, -1) as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: `${basePath}/**`,
      search: "",
    }];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getR2RemotePattern(),
  },
};

export default nextConfig;
