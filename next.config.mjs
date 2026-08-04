/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1$/, "") || "http://localhost:4000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
