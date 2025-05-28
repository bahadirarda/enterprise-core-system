/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   optimizeCss: true,
  // },
  output: 'standalone',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig; 