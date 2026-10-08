import { useEffect, useRef, useState, type ReactNode } from "react";
import { Activity, Clock, Gauge, ShieldCheck, Type, Flame } from "lucide-react";
import { useStore } from "@/store/useStore";
import { avgConfidence, countWords, formatShort, wordsPerMinute } from "@/utils/format";
import { cn } from "@/lib/utils";

function useAnimated(value: number) {
  const [v, setV] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 320);
      const cur = a + (value - a) * (1 - (1 - p) ** 3);
      setV(cur);
      from.current = cur;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return v;
}

function Stat({
  icon,
  label,
  value,
  suffix,
  hint,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className="card-surface section-in relative overflow-hidden p-4 sm:p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          {label}
        </span>
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-alt text-accent border border-border/60 shadow-xs">
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-1 font-mono text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
        {value}
        {suffix && <span className="text-xs font-semibold text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

export function StatsRow() {
  const segments = useStore((s) => s.segments);
  const elapsed = useStore((s) => s.elapsed);
  const speech = useStore((s) => s.speechFrames);
  const total = useStore((s) => s.totalFrames);
  const lastEnd = segments[segments.length - 1]?.end ?? 0;
  const duration = Math.max(elapsed, lastEnd);

  const words = useAnimated(countWords(segments));
  const rawWpm = wordsPerMinute(countWords(segments), duration);
  const wpm = useAnimated(rawWpm);
  const conf = useAnimated(avgConfidence(segments) * 100);
  const detected = useAnimated(total ? (speech / total) * 100 : 0);

  const confColor =
    conf >= 90
      ? "bg-success text-success"
      : conf >= 75
        ? "bg-warning text-warning"
        : "bg-destructive text-destructive";

  const wpmTone =
    rawWpm > 170 ? "Fast tempo" : rawWpm > 110 ? "Optimal pace" : rawWpm > 0 ? "Measured pace" : "Ready";

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
      {/* 1. Words */}
      <Stat
        icon={<Type className="h-3.5 w-3.5 text-accent" />}
        label="Words Count"
        value={Math.round(words).toString()}
        hint={words > 0 ? `${segments.length} segment${segments.length !== 1 ? "s" : ""}` : "Awaiting input"}
      />

      {/* 2. Speech Rate */}
      <Stat
        icon={<Gauge className="h-3.5 w-3.5 text-accent" />}
        label="Speech Rate"
        value={Math.round(wpm).toString()}
        suffix="WPM"
        hint={wpmTone}
      />

      {/* 3. Confidence */}
      <Stat
        icon={<ShieldCheck className="h-3.5 w-3.5 text-accent" />}
        label="Confidence"
        value={conf ? conf.toFixed(1) : "—"}
        suffix={conf ? "%" : ""}
      >
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-alt border border-border/50">
          <div
            className={cn("h-full transition-all duration-300", confColor.split(" ")[0])}
            style={{ width: `${conf || 0}%` }}
          />
        </div>
      </Stat>

      {/* 4. Duration */}
      <Stat
        icon={<Clock className="h-3.5 w-3.5 text-accent" />}
        label="Active Time"
        value={formatShort(duration)}
        hint={elapsed > 0 ? "Elapsed recording" : "Standby"}
      />

      {/* 5. Speech Detected */}
      <Stat
        icon={<Activity className="h-3.5 w-3.5 text-accent" />}
        label="Voice Ratio"
        value={Math.round(detected).toString()}
        suffix="%"
        hint="VAD Speech Activity"
      >
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-alt border border-border/50">
          <div
            className="h-full bg-gradient-primary transition-all duration-300"
            style={{ width: `${detected || 0}%` }}
          />
        </div>
      </Stat>
    </div>
  );
}
