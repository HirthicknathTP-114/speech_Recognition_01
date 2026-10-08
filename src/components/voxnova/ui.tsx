import type { ButtonHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  title,
  icon,
  action,
  subtitle,
  className,
  children,
}: {
  title?: string;
  icon?: ReactNode;
  action?: ReactNode;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("card-surface section-in relative overflow-hidden p-5 sm:p-6", className)}>
      {/* Subtle top specular sheen line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {title && (
        <header className="mb-4 flex items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div className="flex items-center gap-2.5">
            {icon && (
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-alt text-accent shadow-sm border border-border/60">
                {icon}
              </span>
            )}
            <div>
              <h2 className="text-xs font-bold tracking-[0.18em] text-foreground/90 uppercase font-display">
                {title}
              </h2>
              {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-1.5">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-primary text-primary-foreground shadow-primary hover:brightness-110 active:scale-[0.98] border border-white/20 font-semibold",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-border/80 border border-border/50 active:scale-[0.98]",
  outline:
    "border border-border bg-surface-alt/40 text-foreground hover:bg-secondary hover:border-border/80 active:scale-[0.98]",
  ghost:
    "text-muted-foreground hover:bg-secondary hover:text-foreground active:scale-[0.98]",
  danger:
    "bg-destructive/15 text-destructive border border-destructive/20 hover:bg-destructive/25 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-xs rounded-lg gap-1.5",
  md: "min-h-11 px-4 text-sm rounded-xl gap-2",
  lg: "min-h-13 px-6 text-base rounded-2xl gap-2.5",
};

export function Btn({
  variant = "secondary",
  size = "md",
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none disabled:pointer-events-none disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variants[variant],
        sizes[size],
        className,
      )}
    />
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="block text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
        {hint && <span className="text-[11px] text-muted-foreground/80">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

export function Select({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...p}
        className={cn(
          "min-h-11 w-full appearance-none rounded-xl border border-input bg-surface-alt px-3.5 pr-9 text-sm text-foreground transition-all focus:border-ring focus:bg-card focus:shadow-sm focus:outline-none disabled:opacity-50",
          className,
        )}
      />
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between gap-3 text-left text-sm text-foreground hover:bg-surface-alt/40 p-2 rounded-xl transition-colors cursor-pointer"
    >
      <div>
        <span className="font-medium text-foreground block">{label}</span>
        {description && <span className="text-xs text-muted-foreground block">{description}</span>}
      </div>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 border border-transparent",
          checked ? "bg-primary shadow-sm" : "bg-border",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200",
            checked ? "translate-x-5.5" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: "neutral" | "success" | "warning" | "danger" | "accent";
  className?: string;
}) {
  const styles = {
    neutral: "bg-surface-alt text-muted-foreground border-border/60",
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    danger: "bg-destructive/15 text-destructive border-destructive/30",
    accent: "bg-accent/15 text-accent border-accent/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
