/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/registration',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig