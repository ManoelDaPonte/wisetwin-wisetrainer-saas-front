/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 's.gravatar.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'cdn.auth0.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'webglbuilds.blob.core.windows.net',
          pathname: '/**',
        }
      ],
    },
    async headers() {
      return [
        {
          source: '/(.*)', // Appliquer cette règle à toutes les routes
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'ALLOW-FROM http://91.108.112.9 http://88.172.167.249',
            },
            {
              key: 'Content-Security-Policy',
              value: "frame-ancestors 'self' http://91.108.112.9 http://88.172.167.249",
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  