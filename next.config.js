/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  generateEtags: false,
  compress: true,
  images: {
    domains: ['github.com', 'localhost'],
  },
  // experimental: {
  //   images: {allowFutureImage: true},
  // }
}


module.exports = nextConfig
