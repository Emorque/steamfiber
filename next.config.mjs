/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'media.steampowered.com/steamcommunity/public/images/apps/',
            },
            {
                protocol: 'https',
                hostname: 'avatars.steamstatic.com/'
            }
        ]
    }
};

export default nextConfig;
