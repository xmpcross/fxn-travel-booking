/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ['travel.originfacts.com'],
  images: {
    minimumCacheTTL: 2678400 * 6, // 3 months
    // Duffel returns airline logos as SVG (assets.duffel.com/.../AA.svg).
    // Next refuses SVG by default (XSS risk). Allow it, but sandbox so embedded scripts can't run.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.duffel.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
