/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Increase timeout for API routes to allow for longer-running operations
  serverRuntimeConfig: {
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
      responseLimit: '10mb',
    },
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,
  // Configure image domains if needed
  images: {
    domains: ['npmjs.com', 'npmjs.org'],
  },
};

module.exports = nextConfig;