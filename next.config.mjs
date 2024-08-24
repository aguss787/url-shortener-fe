/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ["admin.s.agus.dev", "localhost:8006"]
    }
  }
};

export default nextConfig;
