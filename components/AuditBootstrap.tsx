"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export function AuditBootstrap({ children }: { children: React.ReactNode }) {
  const initChain = useAppStore((s) => s.initChain);

  useEffect(() => {
    void initChain();
  }, [initChain]);

  return <>{children}</>;
}
