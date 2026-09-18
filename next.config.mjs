/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "preprod.mstoo.co.in" },
      { protocol: "https", hostname: "api.mstoo.co.in" },
      { protocol: "http", hostname: "preprod.mstoo.co.in" },
      { protocol: "http", hostname: "api.mstoo.co.in" },
    ],
  },
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
    ];
  },
};

export default nextConfig;
