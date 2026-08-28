const backendUrl = process.env.BACKEND_ORIGIN || "http://localhost:4000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  }
};

export default nextConfig;