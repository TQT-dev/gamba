"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/profile", label: "Profile" },
  { href: "/leaderboards", label: "Leaderboards" },
];

export function Header() {
  const path = usePathname();
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <p className="text-xs uppercase text-white/50 tracking-wide">Gamba Arcade</p>
        <h1 className="text-2xl font-bold">Skill + Luck Lab</h1>
      </div>
      <nav className="flex gap-2 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-lg hover:bg-white/10 ${
              path === link.href ? "bg-white/10" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
