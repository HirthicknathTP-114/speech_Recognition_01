import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, FileText, Pen, Search, Subtitles, X, Check, Clock, Sparkles } from "lucide-react";
import { useStore } from "@/store/useStore";
import { formatShort } from "@/utils/format";
import { exportPdf, exportSrt, exportTxt } from "@/services/exporters";
import { Card, Btn } from "./ui";
import { cn } from "@/lib/utils";

export function TranscriptEditor() {
  const segments = useStore((s) => s.segments);
  const confThreshold = useStore((s) => s.settings.confThreshold);
  const editSegment = useStore((s) => s.editSegment);
  const seekTo = useStore((s) => s.seekTo);
  const toast = useStore((s) => s.toast);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    if (!query.trim()) return new Set<string>();
    const q = query.toLowerCase();
    return new Set(segments.filter((s) => s.text.toLowerCase().includes(q)).map((s) => s.id));
  }, [query, segments]);

  const startEdit = useCallback((id: string, text: string) => {
    setEditing(id);
    setEditText(text);
  }, []);

  const commitEdit = useCallback(() => {
    if (editing && editText.trim()) {
      editSegment(editing, editText.trim());
      toast("Segment updated", "success");
    }
    setEditing(null);
  }, [editing, editText, editSegment, toast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editing) setEditing(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editing]);

  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const q = query.toLowerCase();
    const parts: { text: string; match: boolean }[] = [];
    let remaining = text;
    while (remaining.length) {
      const idx = remaining.toLowerCase().indexOf(q);
      if (idx === -1) {
        parts.push({ text: remaining, match: false });
        break;
      }
      if (idx > 0) parts.push({ text: remaining.slice(0, idx), match: false });
      parts.push({ text: remaining.slice(idx, idx + q.length), match: true });
      remaining = remaining.slice(idx + q.length);
    }
    return parts.map((p, i) =>
      p.match ? (
        <mark key={i} className="rounded-md bg-accent/30 px-1 py-0.5 text-accent-foreground font-semibold">
          {p.text}
        </mark>
      ) : (
        <span key={i}>{p.text}</span>
      )
    );
  };

  return (
    <Card
      title="TRANSCRIPT EDITOR"
      icon={<Pen className="h-4 w-4" />}
      subtitle="Interactive timestamps, inline correction & export"
      className="flex flex-col"
      action={
        segments.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Btn
              variant="outline"
              onClick={() => {
                exportTxt(segments);
                toast("Exported TXT file", "success");
              }}
              aria-label="Export TXT"
              title="Export plain text (.txt)"
              className="h-8 px-2.5 text-xs rounded-lg"
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold">TXT</span>
            </Btn>
            <Btn
              variant="outline"
              onClick={() =>
                exportPdf(segments)
                  .then(() => toast("Exported PDF document", "success"))
                  .catch(() => toast("PDF export failed", "error"))
              }
              aria-label="Export PDF"
              title="Export formatted PDF"
              className="h-8 px-2.5 text-xs rounded-lg"
            >
              <Download className="h-3.5 w-3.5 text-accent" />
              <span className="font-semibold">PDF</span>
            </Btn>
            <Btn
              variant="outline"
              onClick={() => {
                exportSrt(segments);
                toast("Exported SRT subtitles", "success");
              }}
              aria-label="Export SRT"
              title="Export subtitle track (.srt)"
              className="h-8 px-2.5 text-xs rounded-lg"
            >
              <Subtitles className="h-3.5 w-3.5 text-warning" />
              <span className="font-semibold">SRT</span>
            </Btn>
          </div>
        )
      }
    >
      {/* Search bar */}
      <div className="relative mb-3.5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search speech transcript words..."
          className="min-h-11 w-full rounded-xl border border-input bg-surface-alt/70 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-ring focus:bg-card focus:shadow-sm focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {query.trim() && (
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Search results for <strong className="text-foreground">"{query}"</strong>
          </span>
          <span className="font-semibold text-accent">
            {matches.size} segment{matches.size !== 1 ? "s" : ""} matched
          </span>
        </div>
      )}

      {/* Segments list */}
      <div
        className="max-h-80 space-y-1.5 overflow-y-auto pr-1 lg:max-h-[440px]"
        aria-label="Editable speech transcript list"
      >
        {segments.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm font-semibold text-foreground">No segments transcribed yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Begin recording with the microphone or drop an audio file to view editable transcript segments.
            </p>
          </div>
        ) : (
          segments.map((seg) => {
            const hidden = query.trim() && !matches.has(seg.id);
            if (hidden) return null;

            const isEditing = editing === seg.id;
            const isMatch = query.trim() && matches.has(seg.id);

            return (
              <div
                key={seg.id}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all duration-150 hover:bg-surface-alt/60 hover:border-border/60",
                  isMatch && "border-accent/40 bg-accent/5",
                  isEditing && "bg-surface-alt border-ring"
                )}
              >
                {/* Clickable timestamp pill */}
                <button
                  onClick={() => seekTo(seg.start)}
                  className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary transition-all duration-150 hover:bg-primary hover:text-primary-foreground hover:shadow-xs cursor-pointer"
                  title={`Seek audio to ${formatShort(seg.start)}`}
                >
                  <Clock className="h-3 w-3" />
                  {formatShort(seg.start)}
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitEdit();
                        }}
                        onBlur={commitEdit}
                        className="min-h-9 flex-1 rounded-lg border border-ring bg-card px-3 text-sm text-foreground shadow-xs focus:outline-none"
                      />
                      <button
                        onClick={commitEdit}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm hover:brightness-110 cursor-pointer"
                        title="Save edit"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <p
                      className="cursor-pointer text-sm leading-relaxed text-foreground select-text"
                      onDoubleClick={() => startEdit(seg.id, seg.text)}
                      title="Double-click to edit text"
                    >
                      {seg.words.length > 0
                        ? seg.words.map((w, i) => (
                            <span
                              key={i}
                              className={cn(w.conf < confThreshold && "low-conf")}
                              title={
                                w.conf < confThreshold
                                  ? `Confidence: ${(w.conf * 100).toFixed(0)}%`
                                  : undefined
                              }
                            >
                              {w.word}{" "}
                            </span>
                          ))
                        : highlight(seg.text)}
                    </p>
                  )}
                </div>

                {/* Confidence percentage badge & Edit trigger button */}
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "font-mono text-[11px] font-semibold tabular-nums",
                      seg.confidence >= 0.9
                        ? "text-success"
                        : seg.confidence >= 0.75
                          ? "text-warning"
                          : "text-destructive"
                    )}
                  >
                    {(seg.confidence * 100).toFixed(0)}%
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(seg.id, seg.text)}
                      className="opacity-0 transition-opacity group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-md hover:bg-card"
                      title="Edit this segment"
                    >
                      <Pen className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
