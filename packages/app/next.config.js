/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: process.env.NODE_ENV !== 'development',
  swcMinify: true,
};

module.exports = nextConfig;
