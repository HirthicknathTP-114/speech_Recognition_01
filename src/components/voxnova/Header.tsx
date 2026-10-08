import { useState, useRef, useEffect } from "react";
import { AudioLines, Keyboard, Moon, Palette, Settings, Sun, Sparkles, Shield, Zap, FileSpreadsheet } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import type { ColorPalette } from "@/types";

const pill = {
  connected: { label: "Vosk Live", cls: "bg-success/15 text-success border-success/30", dot: "bg-success" },
  connecting: { label: "Connecting", cls: "bg-warning/15 text-warning border-warning/30", dot: "bg-warning" },
  disconnected: { label: "Server Offline", cls: "bg-destructive/15 text-destructive border-destructive/30", dot: "bg-destructive" },
};

const PALETTES: { id: ColorPalette; name: string; dot: string; border: string }[] = [
  { id: "violet", name: "Cyber Violet", dot: "bg-[#9333ea]", border: "hover:border-[#9333ea]" },
  { id: "emerald", name: "Emerald Studio", dot: "bg-[#10b981]", border: "hover:border-[#10b981]" },
  { id: "azure", name: "Electric Azure", dot: "bg-[#2563eb]", border: "hover:border-[#2563eb]" },
  { id: "amber", name: "Sunset Ember", dot: "bg-[#f97316]", border: "hover:border-[#f97316]" },
];

function EchoWaveIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Echo resonance arcs */}
      <path d="M9 16A14 14 0 0 0 9 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <path d="M14 19A9 9 0 0 0 14 29" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      <circle cx="18" cy="24" r="2" fill="currentColor" />
      {/* Soundwave crest */}
      <path
        d="M18 24C22 24 23 13 27 13C31 13 32 35 36 35C39 35 40 24 43 24"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Header() {
  const connection = useStore((s) => s.connection);
  const theme = useStore((s) => s.settings.theme);
  const currentPalette = useStore((s) => s.settings.palette) ?? "violet";
  const set = useStore((s) => s.set);
  const updateSettings = useStore((s) => s.updateSettings);
  const toast = useStore((s) => s.toast);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const p = pill[connection];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setPaletteOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const changePalette = (pal: ColorPalette) => {
    updateSettings({ palette: pal });
    setPaletteOpen(false);
    const palObj = PALETTES.find((x) => x.id === pal);
    toast(`Color scheme: ${palObj?.name ?? pal}`, "info");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Brand logo */}
        <a href="/" className="group flex items-center gap-3 select-none" aria-label="EchoWave Home">
          <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-primary transition-transform duration-300 group-hover:scale-105">
            <EchoWaveIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl font-extrabold tracking-tight">
                Echo<span className="bg-gradient-primary bg-clip-text text-transparent">Wave</span>
              </span>
              <span className="rounded-md bg-surface-alt px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase text-accent border border-border/60">
                ASR
              </span>
            </div>
            <p className="hidden text-[10px] font-medium text-muted-foreground sm:block tracking-wide">
              Speech Recognition Engine
            </p>
          </div>
        </a>

        {/* Action controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Server status pill */}
          <span
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-all",
              p.cls
            )}
            role="status"
            title={
              connection === "connected"
                ? "Connected to Vosk ASR server (ws://localhost:2700)"
                : connection === "connecting"
                  ? "Connecting to Vosk ASR server..."
                  : "Disconnected — Ensure Python server is running on ws://localhost:2700"
            }
          >
            <span className="relative flex h-2 w-2">
              <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-70", p.dot)} />
              <span className={cn("relative inline-flex h-2 w-2 rounded-full", p.dot)} />
            </span>
            <span>{p.label}</span>
          </span>

          {/* Color Scheme Picker Popover */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setPaletteOpen(!paletteOpen)}
              aria-label="Change color theme scheme"
              title="Change color scheme"
              className={cn(
                "flex h-10 items-center gap-2 rounded-xl border border-border/60 bg-surface-alt/70 px-3 text-xs font-semibold text-foreground transition-all hover:bg-secondary hover:border-border cursor-pointer",
                paletteOpen && "ring-2 ring-ring border-accent"
              )}
            >
              <Palette className="h-4 w-4 text-accent" />
              <span className="hidden md:inline capitalize">{currentPalette}</span>
              <span className="h-2 w-2 rounded-full bg-accent" />
            </button>

            {paletteOpen && (
              <div className="card-surface section-in absolute right-0 top-12 z-50 w-56 p-2 shadow-xl border border-border">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Theme Color Scheme
                </div>
                <div className="space-y-1 mt-1">
                  {PALETTES.map((pal) => (
                    <button
                      key={pal.id}
                      onClick={() => changePalette(pal.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors cursor-pointer",
                        currentPalette === pal.id
                          ? "bg-primary/15 text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-surface-alt hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={cn("h-3 w-3 rounded-full shadow-sm ring-1 ring-white/20", pal.dot)} />
                        {pal.name}
                      </span>
                      {currentPalette === pal.id && (
                        <span className="text-[10px] text-accent font-bold">Active</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Keyboard shortcuts modal trigger */}
          <button
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
            onClick={() => set({ shortcutsOpen: true })}
            className="hidden h-10 w-10 place-items-center rounded-xl border border-border/60 bg-surface-alt/70 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:border-border sm:grid cursor-pointer"
          >
            <Keyboard className="h-4 w-4" />
          </button>

          {/* Theme mode toggle (Dark/Light) */}
          <button
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => updateSettings({ theme: theme === "dark" ? "light" : "dark" })}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border/60 bg-surface-alt/70 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:border-border cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-500 transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Settings modal trigger */}
          <button
            aria-label="Open settings"
            title="Settings (Ctrl+,)"
            onClick={() => set({ settingsOpen: true })}
            className="grid h-10 w-10 place-items-center rounded-xl border border-border/60 bg-surface-alt/70 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground hover:border-border cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function HeroStrip() {
  return (
    <div className="section-in relative my-6 overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-10 text-center shadow-lg backdrop-blur-md">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

      {/* Hero background image */}
      <img
        src="/hero-waveform.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-luminosity"
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Badge strip */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface-alt/80 px-3.5 py-1 text-xs font-semibold text-muted-foreground backdrop-blur-md shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
          <span className="font-mono tracking-wider text-accent uppercase">VOSK REAL-TIME ASR</span>
          <span className="text-muted-foreground/40">·</span>
          <span>100% Offline-Ready</span>
          <span className="text-muted-foreground/40">·</span>
          <span>Zero Telemetry</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
          REAL-TIME <span className="bg-gradient-primary bg-clip-text text-transparent">SPEECH</span> INTELLIGENCE
        </h1>

        {/* Subtitle */}
        <p className="mt-3.5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          High-precision speech-to-text recognition with real-time word confidence, audio wave analysis, and instantaneous document exports.
        </p>

        {/* Feature badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-foreground/80 font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface-alt/60 px-3 py-1.5 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-accent" /> Sub-second Latency
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface-alt/60 px-3 py-1.5 backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5 text-success" /> Local Privacy
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface-alt/60 px-3 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-warning" /> Word Timestamps
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-surface-alt/60 px-3 py-1.5 backdrop-blur-sm">
            <FileSpreadsheet className="h-3.5 w-3.5 text-primary" /> TXT / PDF / SRT
          </span>
        </div>
      </div>
    </div>
  );
}
