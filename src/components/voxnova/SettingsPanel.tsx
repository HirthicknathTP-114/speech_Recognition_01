import { useEffect, useRef } from "react";
import { Settings as SettingsIcon, X, Palette, Moon, Sun, Sliders, RefreshCw, Check } from "lucide-react";
import { useStore, DEFAULT_SETTINGS } from "@/store/useStore";
import { Btn, Field, Toggle } from "./ui";
import { saveSettings } from "@/services/storage";
import { cn } from "@/lib/utils";
import type { ColorPalette } from "@/types";

const PALETTES: { id: ColorPalette; name: string; dot: string; desc: string }[] = [
  { id: "violet", name: "Cyber Violet", dot: "bg-[#9333ea]", desc: "Electric purple & neon cyan" },
  { id: "emerald", name: "Emerald Studio", dot: "bg-[#10b981]", desc: "Clean studio emerald & mint" },
  { id: "azure", name: "Electric Azure", dot: "bg-[#2563eb]", desc: "Royal cobalt & ice flare" },
  { id: "amber", name: "Sunset Ember", dot: "bg-[#f97316]", desc: "Fiery coral & amber gold" },
];

export function SettingsPanel() {
  const open = useStore((s) => s.settingsOpen);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const set = useStore((s) => s.set);
  const toast = useStore((s) => s.toast);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") set({ settingsOpen: false });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, set]);

  if (!open) return null;

  const save = () => {
    saveSettings(settings);
    toast("Settings saved to storage", "success");
    set({ settingsOpen: false });
  };

  const reset = () => {
    updateSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    toast("Settings restored to defaults", "info");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-md transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) set({ settingsOpen: false });
      }}
    >
      <div
        ref={panelRef}
        className="card-surface section-in m-3 sm:m-4 w-full max-w-lg overflow-y-auto p-6 sm:p-7 shadow-2xl border border-border"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-sm">
              <SettingsIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                Preferences & Engine
              </h2>
              <p className="text-xs text-muted-foreground">Customize UI themes and ASR parameters</p>
            </div>
          </div>
          <button
            onClick={() => set({ settingsOpen: false })}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border/60 bg-surface-alt/70 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground cursor-pointer"
            aria-label="Close settings"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Color Scheme Palettes */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Palette className="h-3.5 w-3.5 text-accent" />
              Theme Color Scheme
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => updateSettings({ palette: pal.id })}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all cursor-pointer",
                    settings.palette === pal.id
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-border/60 bg-surface-alt/40 hover:bg-surface-alt hover:border-border"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <span className={cn("h-3 w-3 rounded-full shadow-xs ring-1 ring-white/20", pal.dot)} />
                      {pal.name}
                    </span>
                    {settings.palette === pal.id && (
                      <Check className="h-3.5 w-3.5 text-accent" />
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{pal.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dark / Light Appearance */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Appearance Mode
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ theme: "dark" })}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all cursor-pointer",
                  settings.theme === "dark"
                    ? "border-primary bg-primary/15 text-foreground font-bold"
                    : "border-border/60 bg-surface-alt/40 text-muted-foreground hover:bg-surface-alt"
                )}
              >
                <Moon className="h-4 w-4" /> Dark Mode
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: "light" })}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all cursor-pointer",
                  settings.theme === "light"
                    ? "border-primary bg-primary/15 text-foreground font-bold"
                    : "border-border/60 bg-surface-alt/40 text-muted-foreground hover:bg-surface-alt"
                )}
              >
                <Sun className="h-4 w-4 text-amber-500" /> Light Mode
              </button>
            </div>
          </div>

          {/* Engine Connection Settings */}
          <div className="space-y-4 pt-2 border-t border-border/40">
            <Field label="WebSocket Server URL" hint="Vosk Python server">
              <input
                value={settings.wsUrl}
                onChange={(e) => updateSettings({ wsUrl: e.target.value })}
                className="min-h-11 w-full rounded-xl border border-input bg-surface-alt/70 px-3.5 text-sm text-foreground transition-all focus:border-ring focus:bg-card focus:outline-none"
              />
            </Field>

            <Field label="Audio Sample Rate (Hz)" hint="Default: 16000 Hz">
              <input
                type="number"
                value={settings.sampleRate}
                onChange={(e) => updateSettings({ sampleRate: parseInt(e.target.value) || 16000 })}
                className="min-h-11 w-full rounded-xl border border-input bg-surface-alt/70 px-3.5 text-sm text-foreground transition-all focus:border-ring focus:bg-card focus:outline-none"
              />
            </Field>

            <Field label={`Confidence Filter Threshold: ${(settings.confThreshold * 100).toFixed(0)}%`}>
              <div className="space-y-1">
                <input
                  type="range"
                  min="0.5"
                  max="1"
                  step="0.05"
                  value={settings.confThreshold}
                  onChange={(e) => updateSettings({ confThreshold: parseFloat(e.target.value) })}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>50% (Permissive)</span>
                  <span>80% (Default)</span>
                  <span>100% (Strict)</span>
                </div>
              </div>
            </Field>

            <div className="space-y-2 rounded-2xl border border-border/60 bg-surface-alt/30 p-2">
              <Toggle
                checked={settings.showPartials}
                onChange={(v) => updateSettings({ showPartials: v })}
                label="Stream partial speech recognition"
                description="Displays words as they are recognized before sentence finalization"
              />
              <Toggle
                checked={settings.autoPunctuation}
                onChange={(v) => updateSettings({ autoPunctuation: v })}
                label="Automatic sentence capitalization & period"
                description="Capitalizes initial words and formats segment endings"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-3 border-t border-border/40">
            <Btn variant="primary" onClick={save} className="flex-1 h-11">
              Save Preferences
            </Btn>
            <Btn variant="outline" onClick={reset} className="h-11">
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              Reset
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
