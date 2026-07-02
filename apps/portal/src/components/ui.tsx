import type { ReactNode } from "react";

/** Standard page heading with eyebrow + title + optional lede. */
export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-white/5 pb-8">
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-widest text-azure-400">
          {eyebrow}
        </span>
      )}
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h1>
      {lede && <p className="max-w-2xl text-base leading-7 text-slate-400">{lede}</p>}
    </header>
  );
}

/** A bordered surface card. */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-xl border border-white/10 bg-ink-900/60 p-5 backdrop-blur",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
