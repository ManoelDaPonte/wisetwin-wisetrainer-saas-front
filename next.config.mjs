/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 's.gravatar.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
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
        },
        {
          protocol: 'https',
          hostname: 'asset.cloudinary.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'res.cloudinary.com',
          pathname: '/**',
        },
      ],
    },
  };
  export default nextConfig;
  