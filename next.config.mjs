/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backend = (process.env.API_PROXY_TARGET || 'http://127.0.0.1:8000').replace(/\/$/, '')
    return [
      {source: '/api/v1/:path*/', destination: `${backend}/api/v1/:path*/`},
      {source: '/api/v1/:path*', destination: `${backend}/api/v1/:path*`},
    ]
  },
}

export default nextConfig
