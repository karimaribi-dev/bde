import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  experimental: {
    optimizePackageImports: ["@tiptap/react", "@tiptap/starter-kit", "browser-image-compression"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ofljafpnzpuaklmwklpy.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
