/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
//   generateEtags: false,
//   compress: true,
//   images: {
//     domains: ['github.com', 'localhost'],
//   },
//   // experimental: {
//   //   images: {allowFutureImage: true},
//   // }
// }
// module.exports = nextConfig

module.exports = {
  env: {
    NEXTAUTH_URL: 'http://localhost:3000/', // Next.js uygulamanızın URL'sini buraya ekleyin
    DATABASE_URL: 'postgresql://postgres:gzde1234@127.0.0.1:5432/crm-project', // PostgreSQL bağlantı URL'sini buraya ekleyin
  },
};



