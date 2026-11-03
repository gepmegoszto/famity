/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Szerver ÉS kliens oldalon is felülírjuk az undici-t egy üres modullal,
    // így a Webpack meg sem kísérli beolvasni a nem támogatott szintaxisú fájlt.
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: false,
    };
    return config;
  },
};

module.exports = nextConfig;
