import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "default" | "empty" | "error";
};

export function Card({
  title,
  action,
  children,
  className = "",
  variant = "default",
}: CardProps) {
  const base = "rounded-2xl p-6 shadow-sm";
  const variants: Record<NonNullable<CardProps["variant"]>, string> = {
    default: "border border-slate-200 bg-white",
    empty: "border border-dashed border-slate-300 bg-white/60",
    error: "border border-rose-200 bg-rose-50",
  };

  return (
    <section className={`${base} ${variants[variant]} ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          {title ? (
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          ) : (
            <span />
          )}
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
