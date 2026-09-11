"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

const links = [
  { href: "/", label: "Briefing" },
  { href: "/dashboard", label: "Live graph" },
  { href: "/audit", label: "Audit trail" },
  { href: "/case-builder", label: "Case builder" },
  { href: "/about", label: "Architecture" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-ink-900/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-accent-cyan">
            <Shield size={16} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-wide text-slate-100">GraphSentry</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Network intelligence
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto text-sm">
          {links.map((link) => {
            const active =
              pathname === link.href || (link.href === "/dashboard" && pathname === "/live-graph");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 transition ${
                  active
                    ? "bg-slate-800 text-cyan-200"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-amber-200/80 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          Synthetic case · not real persons
        </div>
      </div>
    </header>
  );
}
