"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/tools", label: "工具" },
  { href: "/about", label: "关于" },
];

export function Navbar() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setAuthed(d.authed))
      .catch(() => {});
  }, []);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          SpicySuiMai
        </Link>
        <ul className="flex gap-6 text-sm">
          {links.map((link) => {
            const isActive = link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={
                    isActive
                      ? "font-medium text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          {authed && (
            <li>
              <Link
                href="/dashboard"
                className={
                  pathname === "/dashboard"
                    ? "font-medium text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }
              >
                控制台
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
