import { useEffect, useRef, useState } from "react";
import { ArrowDown, MessageSquareText, Radio, Sparkles } from "lucide-react";
import { useStore } from "@/store/useStore";
import { Card } from "./ui";
import { cn } from "@/lib/utils";

export function LiveTranscription() {
  const segments = useStore((s) => s.segments);
  const partial = useStore((s) => s.partial);
  const showPartials = useStore((s) => s.settings.showPartials);
  const status = useStore((s) => s.status);
  const ref = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    if (pinned && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [segments, partial, pinned]);

  const onScroll = () => {
    const el = ref.current;
    if (el) {
      setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 28);
    }
  };

  const totalWords = segments.reduce((sum, seg) => sum + seg.text.split(/\s+/).filter(Boolean).length, 0);
  const empty = !segments.length && !partial;

  return (
    <Card
      title="LIVE TRANSCRIPTION"
      icon={<MessageSquareText className="h-4 w-4" />}
      subtitle="Real-time speech streaming feed"
      className="flex flex-col"
      action={
        status === "recording" ? (
          <span className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/15 px-2.5 py-1 text-xs font-bold text-destructive">
            <span className="h-2 w-2 animate-ping rounded-full bg-destructive" />
            LIVE STREAM
          </span>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            {segments.length} segment{segments.length !== 1 ? "s" : ""}
          </span>
        )
      }
    >
      <div className="relative flex-1">
        <div
          ref={ref}
          onScroll={onScroll}
          aria-live="polite"
          aria-label="Live transcript stream"
          className="h-72 overflow-y-auto rounded-2xl border border-border/60 bg-surface-alt/40 p-5 text-base sm:text-lg leading-relaxed lg:h-[350px] transition-colors"
        >
          {empty ? (
            <div className="flex h-full flex-col items-center justify-center p-4 text-center">
              <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-2xl border border-border/80 shadow-md">
                <img
                  src="/mic-illustration.jpg"
                  alt="Speech recognition illustration"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
              <p className="font-display font-bold text-foreground text-base sm:text-lg">
                Ready for Voice Input
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                Click the microphone button or press <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono text-[11px] text-foreground">Space</kbd> to begin speaking. Words will stream here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-foreground font-normal tracking-wide">
                {segments.map((s) => (
                  <span key={s.id} className="transition-opacity duration-200">
                    {s.text}{" "}
                  </span>
                ))}
                {showPartials && partial && (
                  <span className="italic text-accent/90 underline decoration-accent/40 decoration-wavy underline-offset-4 animate-pulse">
                    {partial}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Jump to latest floating pill */}
        {!pinned && (
          <button
            onClick={() => setPinned(true)}
            className="absolute bottom-4 left-1/2 flex min-h-9 -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-primary transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer z-10"
          >
            <ArrowDown className="h-3.5 w-3.5 animate-bounce" /> Jump to latest
          </button>
        )}
      </div>

      {/* Footer bar with word counter */}
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-2.5">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Vosk Continuous Recognition
        </span>
        <span className="font-mono tabular-nums font-medium">
          {totalWords} word{totalWords !== 1 ? "s" : ""}
        </span>
      </div>
    </Card>
  );
}
