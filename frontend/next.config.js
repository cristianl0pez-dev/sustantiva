/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://symmetrical-dollop-wr66gqv4vjw92gwgr-8000.app.github.dev/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
