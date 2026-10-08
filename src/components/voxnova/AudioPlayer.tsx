import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX, Radio, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { formatShort } from "@/utils/format";
import { Btn, Card } from "./ui";
import { cn } from "@/lib/utils";

export function AudioPlayer() {
  const audioUrl = useStore((s) => s.audioUrl);
  const seekCmd = useStore((s) => s.seek);
  const language = useStore((s) => s.language);
  const model = useStore((s) => s.model);
  const segments = useStore((s) => s.segments);
  const connection = useStore((s) => s.connection);
  const ref = useRef<HTMLAudioElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const durRef = useRef<HTMLSpanElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Seek from store (e.g. click on a timestamp in editor)
  useEffect(() => {
    if (seekCmd && ref.current && audioUrl) {
      ref.current.currentTime = seekCmd.t;
      if (ref.current.paused) {
        void ref.current.play().then(() => setIsPlaying(true));
      }
    }
  }, [seekCmd, audioUrl]);

  // Sync state with audio events
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  // Animation loop for timeline progress bar
  useEffect(() => {
    const tick = () => {
      const el = ref.current;
      if (el && barRef.current && thumbRef.current && timeRef.current && durRef.current) {
        const pct = el.duration ? (el.currentTime / el.duration) * 100 : 0;
        barRef.current.style.width = `${pct}%`;
        thumbRef.current.style.left = `${pct}%`;
        timeRef.current.textContent = formatShort(el.currentTime);
        durRef.current.textContent = formatShort(el.duration || 0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const togglePlay = useCallback(() => {
    const el = ref.current;
    if (!el || !audioUrl) return;
    if (el.paused) {
      void el.play().then(() => setIsPlaying(true));
    } else {
      el.pause();
      setIsPlaying(false);
    }
  }, [audioUrl]);

  const toggleMute = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = !el.muted;
    setIsMuted(el.muted);
  }, []);

  const scrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    const prog = progRef.current;
    if (!el || !prog || !el.duration) return;
    const rect = prog.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = pct * el.duration;
  }, []);

  const wordCount = segments.reduce((n, s) => n + s.text.split(/\s+/).filter(Boolean).length, 0);
  const avgConf = segments.length ? segments.reduce((a, s) => a + s.confidence, 0) / segments.length : 0;

  return (
    <div className="space-y-4">
      {/* Audio player card */}
      <Card
        title="AUDIO PLAYBACK"
        icon={<Volume2 className="h-4 w-4" />}
        subtitle="Review recorded or uploaded speech audio"
      >
        {audioUrl ? <audio ref={ref} src={audioUrl} preload="metadata" /> : <audio ref={ref} />}

        <div className="space-y-4">
          {/* Progress scrubber bar */}
          <div
            ref={progRef}
            className="group relative h-3 w-full cursor-pointer rounded-full bg-surface-alt border border-border/60 transition-all hover:h-3.5"
            onClick={scrub}
            title="Click or drag to scrub"
          >
            <div
              ref={barRef}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-primary transition-[width] duration-75"
            />
            <div
              ref={thumbRef}
              className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
            />
          </div>

          {/* Time & Controls */}
          <div className="flex items-center justify-between">
            <span ref={timeRef} className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
              00:00
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                title={isMuted ? "Unmute" : "Mute"}
                className="grid h-10 w-10 place-items-center rounded-xl border border-border/60 bg-surface-alt/70 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground cursor-pointer"
              >
                {isMuted ? <VolumeX className="h-4 w-4 text-destructive" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={togglePlay}
                disabled={!audioUrl}
                aria-label={isPlaying ? "Pause playback" : "Play playback"}
                title={isPlaying ? "Pause" : "Play"}
                className={cn(
                  "grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground transition-all duration-200 select-none cursor-pointer",
                  "bg-gradient-primary shadow-primary hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                )}
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current translate-x-0.5" />}
              </button>
            </div>

            <span ref={durRef} className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
              00:00
            </span>
          </div>

          {!audioUrl && (
            <p className="text-center text-xs text-muted-foreground pt-1">
              Record with microphone or upload an audio file to enable playback.
            </p>
          )}
        </div>
      </Card>

      {/* ASR Information Diagnostic card */}
      <Card
        title="ASR DIAGNOSTICS"
        icon={<Cpu className="h-4 w-4" />}
        subtitle="Vosk engine configuration & health"
      >
        <div className="grid grid-cols-2 gap-3.5 text-xs sm:text-sm">
          <InfoRow label="Active Language" value={language} />
          <InfoRow label="Acoustic Model" value={model.split("(")[0]?.trim() ?? model} />
          <InfoRow
            label="Engine Status"
            value={connection === "connected" ? "Live WebSocket" : "Standby"}
            badge={connection === "connected" ? "success" : "neutral"}
          />
          <InfoRow label="Sample Rate" value="16,000 Hz (PCM)" />
          <InfoRow label="Total Words" value={wordCount.toString()} />
          <InfoRow
            label="Avg Confidence"
            value={avgConf ? `${(avgConf * 100).toFixed(1)}%` : "—"}
            badge={avgConf >= 0.9 ? "success" : avgConf >= 0.75 ? "warning" : undefined}
          />
        </div>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: "success" | "warning" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-surface-alt/40 p-2.5">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
        {label}
      </span>
      <div className="flex items-center gap-1.5 font-semibold text-foreground">
        {badge === "success" && <span className="h-2 w-2 rounded-full bg-success" />}
        {badge === "warning" && <span className="h-2 w-2 rounded-full bg-warning" />}
        <span>{value}</span>
      </div>
    </div>
  );
}
