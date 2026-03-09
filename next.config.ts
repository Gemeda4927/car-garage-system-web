
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com"], // Add your image domains
  },
  turbopack: {
    root: path.join(__dirname), // Explicitly set the root directory
    // Optional: Add custom resolve extensions if needed
    resolveExtensions: [
      ".tsx",
      ".ts",
      ".jsx",
      ".js",
      ".json",
    ],
  },
};

module.exports = nextConfig;
