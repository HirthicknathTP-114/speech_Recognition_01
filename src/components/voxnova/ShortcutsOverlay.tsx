import { useEffect } from "react";
import { Keyboard, X, Mic, FileDown, Search, Sliders, Trash2 } from "lucide-react";
import { useStore } from "@/store/useStore";

const SHORTCUTS = [
  { key: "Space", desc: "Start / Pause voice recording", icon: Mic },
  { key: "Escape", desc: "Stop active recording session", icon: Mic },
  { key: "Ctrl + E", desc: "Export transcript as plain text (.txt)", icon: FileDown },
  { key: "Ctrl + Shift + E", desc: "Export transcript as PDF document", icon: FileDown },
  { key: "Ctrl + K", desc: "Focus transcript search input", icon: Search },
  { key: "Ctrl + ,", desc: "Open settings & preferences drawer", icon: Sliders },
  { key: "Ctrl + L", desc: "Clear current session transcript", icon: Trash2 },
  { key: "?", desc: "Toggle keyboard shortcuts overlay", icon: Keyboard },
];

export function ShortcutsOverlay() {
  const open = useStore((s) => s.shortcutsOpen);
  const set = useStore((s) => s.set);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") set({ shortcutsOpen: false });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, set]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) set({ shortcutsOpen: false });
      }}
    >
      <div className="card-surface section-in w-full max-w-xl p-6 sm:p-7 shadow-2xl border border-border">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-sm">
              <Keyboard className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-muted-foreground">Quick action keys for hands-free workflow</p>
            </div>
          </div>
          <button
            onClick={() => set({ shortcutsOpen: false })}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border/60 bg-surface-alt/70 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground cursor-pointer"
            aria-label="Close shortcuts overlay"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="grid gap-2">
          {SHORTCUTS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className="flex items-center justify-between rounded-xl border border-border/40 bg-surface-alt/30 px-3.5 py-2.5 text-xs sm:text-sm transition-colors hover:bg-surface-alt/80 hover:border-border"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-accent opacity-80">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium text-foreground">{s.desc}</span>
                </div>
                <kbd className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-xs font-bold text-foreground shadow-xs">
                  {s.key}
                </kbd>
              </div>
            );
          })}
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Press <kbd className="rounded bg-surface-alt border border-border px-1.5 py-0.5 font-mono text-foreground font-semibold">Esc</kbd> anytime to dismiss this overlay.
        </p>
      </div>
    </div>
  );
}
