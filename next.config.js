/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    'firebase',
    '@firebase/auth',
    '@firebase/firestore',
    '@firebase/app',
    '@firebase/component',
    '@firebase/util',
    '@firebase/logger',
    'undici'
  ],
};

module.exports = nextConfig;
