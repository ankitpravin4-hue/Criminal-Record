"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
          <svg
            viewBox="0 0 220 220"
            width="40"
            height="40"
            className="h-10 w-10 shrink-0"
            aria-hidden
          >
            <rect fill="#efe9dc" stroke="#c9c0aa" strokeWidth="1.5" x="20" y="20" width="180" height="180" rx="2" />
            <path
              stroke="#2c2a24"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              d="M46,112 L56,98 L64,124 L72,96 L80,112 Q80,86 108,86 Q140,86 140,110 Q140,132 116,132 Q92,132 92,114 Q92,100 108,100 Q120,100 124,110 L150,112"
            />
            <line stroke="#efe9dc" fill="none" strokeLinecap="butt" strokeWidth="7" x1="82" y1="106" x2="90" y2="118" />
          </svg>
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
