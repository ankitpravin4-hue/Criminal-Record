/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "react-force-graph-2d",
    "force-graph",
    "graphology",
    "graphology-metrics",
    "graphology-communities-louvain",
  ],
}

export default nextConfig
