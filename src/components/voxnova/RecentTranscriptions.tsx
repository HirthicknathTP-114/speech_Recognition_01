import { useMemo, useState } from "react";
import { Clock, Download, ExternalLink, History, Search, Trash2, Calendar, FileText } from "lucide-react";
import { useStore } from "@/store/useStore";
import { formatShort, avgConfidence, countWords } from "@/utils/format";
import { exportTxt } from "@/services/exporters";
import { deleteAudio, saveHistory } from "@/services/storage";
import { Card, Btn, Badge } from "./ui";
import { cn } from "@/lib/utils";
import type { HistoryItem } from "@/types";

export function RecentTranscriptions() {
  const history = useStore((s) => s.history);
  const set = useStore((s) => s.set);
  const toast = useStore((s) => s.toast);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return history;
    const q = query.toLowerCase();
    return history.filter(
      (h) => h.title.toLowerCase().includes(q) || h.language.toLowerCase().includes(q)
    );
  }, [history, query]);

  const remove = (item: HistoryItem) => {
    const next = history.filter((h) => h.id !== item.id);
    set({ history: next });
    saveHistory(next);
    if (item.audio_blob_key) void deleteAudio(item.audio_blob_key);
    toast(`Deleted "${item.title}"`, "info");
  };

  const load = (item: HistoryItem) => {
    const st = useStore.getState();
    st.clearTranscript();
    st.set({ segments: item.segments, elapsed: item.duration, language: item.language });
    toast(`Loaded "${item.title}" into editor`, "success");
  };

  return (
    <Card
      title="TRANSCRIPTION LIBRARY"
      icon={<History className="h-4 w-4" />}
      subtitle="Past recognition sessions stored securely in local browser storage"
      action={
        <span className="text-xs font-semibold text-muted-foreground">
          {history.length} saved session{history.length !== 1 ? "s" : ""}
        </span>
      }
    >
      {/* Search filter */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter library by session title or language..."
          className="min-h-11 w-full rounded-xl border border-input bg-surface-alt/70 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-ring focus:bg-card focus:shadow-sm focus:outline-none"
        />
      </div>

      {/* Modern styled table */}
      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-surface-alt/20">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-surface-alt/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4">Title / Snippet</th>
              <th className="hidden py-3 px-3 sm:table-cell">Language</th>
              <th className="py-3 px-3 text-right">Duration</th>
              <th className="hidden py-3 px-3 text-right md:table-cell">Words</th>
              <th className="py-3 px-3 text-right">Confidence</th>
              <th className="py-3 px-3 text-right">Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <p className="font-semibold text-foreground">No sessions found</p>
                  <p className="mt-1 text-xs">
                    {query ? "No items matched your filter query." : "Record audio to automatically save your transcripts here."}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const conf = item.confidence || avgConfidence(item.segments);
                const words = countWords(item.segments);
                const date = new Date(item.created_at);

                return (
                  <tr
                    key={item.id}
                    className="group transition-colors duration-150 hover:bg-surface-alt/70"
                  >
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <FileText className="h-3.5 w-3.5" />
                        </span>
                        <span className="truncate max-w-[200px] sm:max-w-[280px]" title={item.title}>
                          {item.title}
                        </span>
                      </div>
                    </td>

                    <td className="hidden py-3.5 px-3 text-xs text-muted-foreground sm:table-cell">
                      <span className="rounded-md border border-border/80 bg-card px-2 py-0.5 font-medium">
                        {item.language}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {formatShort(item.duration)}
                    </td>

                    <td className="hidden py-3.5 px-3 text-right font-mono text-xs tabular-nums text-muted-foreground md:table-cell">
                      {words}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums",
                          conf >= 0.9
                            ? "border-success/30 bg-success/15 text-success"
                            : conf >= 0.75
                              ? "border-warning/30 bg-warning/15 text-warning"
                              : "border-destructive/30 bg-destructive/15 text-destructive"
                        )}
                      >
                        {(conf * 100).toFixed(0)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                      {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 sm:opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => load(item)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 bg-card text-foreground shadow-xs hover:border-primary hover:text-primary transition-colors cursor-pointer"
                          aria-label={`Load ${item.title}`}
                          title="Load into editor"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            exportTxt(item.segments, item.title);
                            toast(`Exported "${item.title}.txt"`, "success");
                          }}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 bg-card text-foreground shadow-xs hover:border-accent hover:text-accent transition-colors cursor-pointer"
                          aria-label={`Export ${item.title}`}
                          title="Export as TXT"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => remove(item)}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 bg-card text-destructive shadow-xs hover:bg-destructive/15 hover:border-destructive/40 transition-colors cursor-pointer"
                          aria-label={`Delete ${item.title}`}
                          title="Delete from history"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
