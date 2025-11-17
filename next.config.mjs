/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimasi performa
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimasi file watching dan Fast Refresh
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
      // Memastikan Fast Refresh bekerja dengan baik
      if (!isServer) {
        config.optimization = {
          ...config.optimization,
          moduleIds: 'named',
        };
      }
    }
    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/wikipedia/commons/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
    ],
  },
  
};

export default nextConfig;
