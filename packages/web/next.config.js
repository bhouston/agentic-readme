/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@agentic-readme/shared'],
  output: 'standalone',
};

module.exports = nextConfig;