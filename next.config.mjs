/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "react-force-graph-2d",
    "force-graph",
    "graphology",
    "graphology-metrics",
    "graphology-communities-louvain",
  ],
};

export default nextConfig;
