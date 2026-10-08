import { useEffect, useRef } from "react";
import { Loader2, Mic, Pause, Play, Square, Trash2, Activity } from "lucide-react";
import { useStore } from "@/store/useStore";
import { formatClock } from "@/utils/format";
import { Btn } from "./ui";
import { cn } from "@/lib/utils";

function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyser = useStore((s) => s.analyser);
  const status = useStore((s) => s.status);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof canvas.getContext !== "function") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue("--primary").trim() || "#9333ea";
    const accent = styles.getPropertyValue("--accent").trim() || "#06b6d4";
    const data = new Uint8Array(analyser?.frequencyBinCount ?? 128);
    let raf = 0;
    let t = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, primary);
      grad.addColorStop(0.5, accent);
      grad.addColorStop(1, primary);

      t += 0.035;

      if (analyser && status === "recording") {
        analyser.getByteFrequencyData(data);
        const bars = Math.min(84, Math.floor(w / 10));
        const bw = w / bars;
        ctx.fillStyle = grad;

        for (let i = 0; i < bars; i++) {
          // Mirror around center for symmetrical studio visualizer
          const idx = Math.floor((Math.abs(i - bars / 2) / (bars / 2)) * data.length * 0.75);
          const v = (data[idx] ?? 0) / 255;
          const bh = Math.max(4, v * h * 0.88);
          ctx.beginPath();
          ctx.roundRect(i * bw + 2, (h - bh) / 2, Math.max(3, bw - 4), bh, 4);
          ctx.fill();
        }
      } else {
        // Multi-frequency ambient waveform in idle / paused mode
        ctx.strokeStyle = grad;
        ctx.lineWidth = status === "paused" ? 1.5 : 2.5;
        ctx.globalAlpha = status === "paused" ? 0.35 : 0.75;

        // Wave 1
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const y = h / 2 + Math.sin(x * 0.025 + t) * 6 * Math.sin(x * 0.006 + t * 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Wave 2 (counter-harmonic)
        ctx.beginPath();
        ctx.globalAlpha = status === "paused" ? 0.2 : 0.45;
        for (let x = 0; x <= w; x += 4) {
          const y = h / 2 + Math.cos(x * 0.02 - t * 0.8) * 4 * Math.sin(x * 0.008 + t * 0.2);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser, status]);

  return <canvas ref={canvasRef} className="h-32 w-full sm:h-44" aria-hidden="true" />;
}

interface Props {
  onStart: () => void;
  onTogglePause: () => void;
  onStop: () => void;
}

export function Recorder({ onStart, onTogglePause, onStop }: Props) {
  const status = useStore((s) => s.status);
  const elapsed = useStore((s) => s.elapsed);
  const source = useStore((s) => s.source);
  const clearTranscript = useStore((s) => s.clearTranscript);
  const toast = useStore((s) => s.toast);
  const recording = status === "recording";
  const active = recording || status === "paused";
  const busy = status === "processing" || status === "requesting_permission";

  const handleClear = () => {
    clearTranscript();
    toast("Transcript cleared", "info");
  };

  return (
    <section
      className="card-surface section-in relative overflow-hidden p-5 sm:p-7"
      aria-label="Audio Recorder and Visualizer"
    >
      {/* Top reflection line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      {/* Header bar */}
      <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-alt text-accent border border-border/60">
            <Activity className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-xs font-bold tracking-[0.18em] text-foreground/90 uppercase">
              AUDIO VISUALIZER & RECORDING
            </h2>
          </div>
        </div>

        {/* Live timer badge */}
        <div className="flex items-center gap-2.5 rounded-full border border-border/60 bg-surface-alt/70 px-3.5 py-1.5 shadow-sm">
          {recording && <span className="h-2 w-2 animate-ping rounded-full bg-destructive" />}
          <span
            className={cn(
              "text-xs font-semibold tracking-wide",
              recording
                ? "text-destructive font-bold"
                : status === "paused"
                  ? "text-warning"
                  : status === "processing"
                    ? "text-accent"
                    : "text-muted-foreground"
            )}
          >
            {recording ? "RECORDING" : status === "paused" ? "PAUSED" : status === "processing" ? "PROCESSING" : "IDLE"}
          </span>
          <span className="text-muted-foreground/40">|</span>
          <span className="font-mono text-xs font-bold tabular-nums text-foreground">
            {formatClock(elapsed)}
          </span>
        </div>
      </div>

      {/* Visualizer canvas */}
      <div className="rounded-2xl border border-border/40 bg-surface-alt/30 p-2 backdrop-blur-sm">
        <Visualizer />
      </div>

      {/* Recording controls bar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
        {/* Pause/Resume button */}
        <Btn
          variant="outline"
          onClick={onTogglePause}
          disabled={!active}
          aria-label={status === "paused" ? "Resume recording" : "Pause recording"}
          title={status === "paused" ? "Resume (Space)" : "Pause (Space)"}
          className="h-12 px-5 rounded-2xl"
        >
          {status === "paused" ? <Play className="h-4 w-4 text-accent fill-current" /> : <Pause className="h-4 w-4 text-warning" />}
          <span className="font-semibold">{status === "paused" ? "Resume" : "Pause"}</span>
        </Btn>

        {/* Big action button */}
        <div className="relative">
          {recording && (
            <span className="pointer-events-none absolute -inset-2.5 rounded-full bg-destructive/20 animate-ping opacity-60" />
          )}
          <button
            onClick={active ? onStop : onStart}
            disabled={busy || source === "upload"}
            aria-label={active ? "Stop recording" : "Start recording"}
            title={active ? "Stop (Esc)" : "Start (Space)"}
            className={cn(
              "relative grid h-20 w-20 place-items-center rounded-full text-primary-foreground transition-all duration-300 cursor-pointer select-none",
              active
                ? "bg-destructive shadow-glow hover:scale-105 active:scale-95"
                : "bg-gradient-primary shadow-primary hover:scale-108 hover:brightness-110 active:scale-95",
              busy || source === "upload" ? "opacity-40 cursor-not-allowed hover:scale-100" : ""
            )}
          >
            {busy ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : active ? (
              <Square className="h-7 w-7 fill-current" />
            ) : (
              <Mic className="h-9 w-9 stroke-[2.2]" />
            )}
          </button>
        </div>

        {/* Stop button */}
        <Btn
          variant="outline"
          onClick={onStop}
          disabled={!active}
          aria-label="Stop recording"
          title="Stop recording (Esc)"
          className="h-12 px-5 rounded-2xl hover:border-destructive/40 hover:text-destructive"
        >
          <Square className="h-4 w-4 text-destructive" />
          <span className="font-semibold">Stop</span>
        </Btn>

        {/* Clear transcript button */}
        <Btn
          variant="ghost"
          onClick={handleClear}
          disabled={active || busy}
          aria-label="Clear current transcript"
          title="Clear transcript (Ctrl+L)"
          className="h-12 px-4 rounded-2xl"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
          <span className="hidden sm:inline font-semibold">Clear</span>
        </Btn>
      </div>

      {source === "upload" && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Audio source is currently set to <strong className="text-foreground">Upload</strong>. Switch source to <strong className="text-foreground">Record</strong> in the Input panel to use the live microphone.
        </p>
      )}
    </section>
  );
}
