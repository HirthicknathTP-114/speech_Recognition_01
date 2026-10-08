import { useEffect, useRef, useState } from "react";
import { FileAudio, Mic, SlidersHorizontal, Upload, Globe2, Cpu, CheckCircle2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Card, Field, Select } from "./ui";
import { cn } from "@/lib/utils";

const LANGS = [
  { code: "English", label: "English (US / UK / IN)" },
  { code: "Tamil", label: "Tamil (தமிழ்)" },
  { code: "Hindi", label: "Hindi (हिन्दी)" },
  { code: "Telugu", label: "Telugu (తెలుగు)" },
  { code: "Spanish", label: "Spanish (Español)" },
  { code: "French", label: "French (Français)" },
  { code: "German", label: "German (Deutsch)" },
];

const MODELS = [
  { id: "Vosk Accurate (en-us 0.22)", tag: "High Accuracy" },
  { id: "Vosk Highest Accuracy (en-us 0.42 Gigaspeech)", tag: "Studio" },
  { id: "Vosk Higher Accuracy (en-us lgraph)", tag: "Balanced" },
  { id: "Vosk Small (en-us 0.15)", tag: "Ultra Fast" },
  { id: "Vosk Small (en-in 0.4)", tag: "Indian Accent" },
  { id: "Vosk Hindi (hi 0.22)", tag: "Hindi Engine" },
];

const ACCEPT = ".wav,.mp3,.m4a,.webm,.ogg,audio/*";

export function InputPanel({ onFile }: { onFile: (f: File) => void }) {
  const { language, model, deviceId, source, status, uploadProgress, set } = useStore();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = status !== "idle" && status !== "error";

  useEffect(() => {
    const load = () =>
      navigator.mediaDevices
        ?.enumerateDevices()
        .then((d) => setDevices(d.filter((x) => x.kind === "audioinput")))
        .catch(() => setDevices([]));
    load();
    navigator.mediaDevices?.addEventListener("devicechange", load);
    return () => navigator.mediaDevices?.removeEventListener("devicechange", load);
  }, [status]);

  const accept = (f?: File) => {
    if (!f) return;
    if (!/\.(wav|mp3|m4a|webm|ogg)$/i.test(f.name) && !f.type.startsWith("audio/")) {
      useStore.getState().toast("Unsupported file format. Please upload .wav, .mp3, .m4a or .webm", "error");
      return;
    }
    onFile(f);
  };

  return (
    <Card
      title="AUDIO INPUT & ENGINE"
      icon={<SlidersHorizontal className="h-4 w-4" />}
      subtitle="Source, language, and Vosk recognition model"
    >
      <div className="space-y-4">
        {/* Audio source segmented control */}
        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Input Mode
          </span>
          <div role="radiogroup" className="grid grid-cols-2 gap-1.5 rounded-2xl bg-surface-alt p-1.5 border border-border/50">
            {(["record", "upload"] as const).map((v) => (
              <button
                key={v}
                role="radio"
                aria-checked={source === v}
                disabled={busy}
                onClick={() => set({ source: v })}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none",
                  source === v
                    ? "bg-card text-foreground shadow-sm border border-border/80 text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
              >
                {v === "record" ? <Mic className="h-4 w-4 text-accent" /> : <Upload className="h-4 w-4 text-accent" />}
                {v === "record" ? "Live Microphone" : "Audio File"}
              </button>
            ))}
          </div>
        </div>

        {/* Microphone hardware select */}
        {source === "record" && (
          <Field label="Microphone Device" hint={`${devices.length || 1} available`}>
            <Select value={deviceId} onChange={(e) => set({ deviceId: e.target.value })} disabled={busy}>
              <option value="default">Default Audio Device</option>
              {devices
                .filter((d) => d.deviceId && d.deviceId !== "default")
                .map((d, i) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Microphone ${i + 1}`}
                  </option>
                ))}
            </Select>
          </Field>
        )}

        {/* Language & Model */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Language">
            <Select value={language} onChange={(e) => set({ language: e.target.value })} disabled={busy}>
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Vosk Model">
            <Select value={model} onChange={(e) => set({ model: e.target.value })} disabled={busy}>
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Dynamic drop zone or shortcut instructions */}
        {source === "upload" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              accept(e.dataTransfer.files[0]);
            }}
            className={cn(
              "relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 backdrop-blur-sm",
              drag
                ? "border-accent bg-accent/15 scale-[1.01]"
                : "border-border/80 bg-surface-alt/40 hover:border-accent/60"
            )}
          >
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-surface-alt text-accent border border-border/80 shadow-sm">
              <FileAudio className="h-6 w-6" />
            </div>
            <p className="font-semibold text-foreground text-sm">Drop audio recording here</p>
            <p className="mt-1 text-xs text-muted-foreground">Supported formats: .WAV, .MP3, .M4A, .WEBM</p>

            <div className="mt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-secondary hover:border-accent/40 active:scale-98 cursor-pointer disabled:opacity-40"
              >
                Browse Local Files
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                accept(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            {uploadProgress !== null && (
              <div className="mt-4 pt-3 border-t border-border/60" aria-live="polite">
                <div className="mb-1.5 flex justify-between font-mono text-xs">
                  <span className="text-foreground font-semibold flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-accent animate-spin" /> Processing ASR...
                  </span>
                  <span className="text-accent font-bold">{uploadProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-alt border border-border/50">
                  <div
                    className="h-full bg-gradient-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-surface-alt/50 p-3.5 text-xs text-muted-foreground flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-card border border-border text-accent">
              <Mic className="h-4 w-4" />
            </span>
            <div className="leading-snug">
              Press <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-foreground font-bold shadow-xs">Space</kbd> to record or pause, and <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[11px] text-foreground font-bold shadow-xs">Esc</kbd> to finish.
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
