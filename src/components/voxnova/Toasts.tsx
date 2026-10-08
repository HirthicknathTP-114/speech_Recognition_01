import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col-reverse gap-2.5 max-w-sm" aria-live="polite">
      {toasts.map((t) => {
        const Icon =
          t.tone === "success"
            ? CheckCircle2
            : t.tone === "error"
              ? AlertCircle
              : Info;

        return (
          <div
            key={t.id}
            className={cn(
              "section-in card-surface flex items-center gap-3 px-4 py-3 text-xs sm:text-sm font-semibold shadow-2xl border backdrop-blur-xl",
              t.tone === "error" && "border-destructive/40 text-destructive bg-card/90",
              t.tone === "success" && "border-success/40 text-success bg-card/90",
              t.tone === "info" && "border-accent/40 text-foreground bg-card/90"
            )}
          >
            <span
              className={cn(
                "grid h-6 w-6 shrink-0 place-items-center rounded-full text-white shadow-xs",
                t.tone === "error"
                  ? "bg-destructive"
                  : t.tone === "success"
                    ? "bg-success"
                    : "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="leading-snug">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
