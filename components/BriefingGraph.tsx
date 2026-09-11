"use client";

import dynamic from "next/dynamic";

const NetworkGraph = dynamic(() => import("@/components/NetworkGraph").then((mod) => mod.NetworkGraph), {
  ssr: false,
  loading: () => <div className="h-full min-h-[380px] animate-pulse bg-[#070b14]" />,
});

export function BriefingGraph() {
  return <NetworkGraph />;
}
