import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

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

export default withNextIntl(nextConfig);
