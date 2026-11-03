/** @type {import('next').NextConfig} */
const nextConfig = {
  // Megakadályozza, hogy a szerveroldali fordító újra-bundle-ölje az undici-t
  serverExternalPackages: ['undici'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Kliensoldalon kikapcsoljuk az undici betöltését, mert ott a natív fetch működik
      config.resolve.alias = {
        ...config.resolve.alias,
        undici: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
