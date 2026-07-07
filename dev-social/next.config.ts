import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xxxxx.supabase.co", // remplace par ton sous-domaine projet
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
