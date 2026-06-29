import Link from "next/link";

const footerLinks = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/tools", label: "工具" },
  { href: "/about", label: "关于" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-4xl px-6 py-6 text-center text-sm text-zinc-500 dark:text-zinc-500">
        <nav className="mb-2 flex justify-center gap-4" aria-label="页脚导航">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        &copy; 2026 SpicySuiMai
      </div>
    </footer>
  );
}
