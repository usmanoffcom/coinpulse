import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "assets.coingecko.com",
            }, {
                protocol: "https",
                hostname: "coin-images.coingecko.com",
            }, {
                protocol: "https",
                hostname: "s2.coinmarketcap.com",
            },
        ]
    }
};

export default nextConfig;
