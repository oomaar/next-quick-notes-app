"use client";

import { HomeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";

type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const ITEMS: NavItem[] = [{ href: "/", label: "Home", Icon: HomeIcon }];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-16 shrink-0 flex-col border-r border-border bg-surface py-4">
      <nav className="flex flex-col items-center gap-1">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`group relative flex size-10 items-center justify-center rounded-lg transition-colors ${
                active
                  ? "bg-foreground text-background"
                  : "text-muted hover:bg-foreground/10 hover:text-foreground"
              }`}
            >
              <Icon className="size-5" />
              <span
                className="pointer-events-none absolute left-full top-1/2 ml-2 -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-md border border-border bg-surface px-2 py-1 text-sm font-medium text-foreground opacity-0 shadow-md transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100"
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
