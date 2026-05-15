/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["localhost", "ui-avatars.com", "images.unsplash.com"],
  },
};

module.exports = nextConfig;
