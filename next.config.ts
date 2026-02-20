import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // allow loading user avatars from Google profile pictures
    remotePatterns: [
      {hostname:"lh3.googleusercontent.com"}
    ],
    // or use remotePatterns if you need more flexibility:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'lh3.googleusercontent.com',
    //     port: '',
    //     pathname: '/**',
    //   },
    // ],
  },
};

export default nextConfig;
