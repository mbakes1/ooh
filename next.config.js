/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "res.cloudinary.com",
      "example.com",
      "via.placeholder.com",
      "picsum.photos",
      "images.unsplash.com",
    ],
  },
};

module.exports = nextConfig;
