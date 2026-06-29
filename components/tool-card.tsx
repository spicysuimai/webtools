import Link from "next/link";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export function ToolCard({ title, description, href, icon }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 p-6 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
    >
      <span className="text-2xl" role="img" aria-hidden="true">{icon}</span>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </Link>
  );
}
