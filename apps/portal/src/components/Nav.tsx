"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, type NavItem } from "@/lib/nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-azure-500/15 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
      ].join(" ")}
    >
      <span className="flex items-center gap-2">
        <span
          className={[
            "h-1.5 w-1.5 rounded-full transition-colors",
            active ? "bg-azure-400" : "bg-slate-600 group-hover:bg-slate-400",
          ].join(" ")}
        />
        {item.label}
      </span>
      {item.comingSoon && (
        <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
          Soon
        </span>
      )}
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const sections: NavItem["section"][] = ["Platform", "Capabilities"];

  return (
    <nav className="flex flex-col gap-6">
      {sections.map((section) => (
        <div key={section} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-600">
            {section}
          </p>
          {navItems
            .filter((item) => item.section === section)
            .map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
        </div>
      ))}
    </nav>
  );
}
