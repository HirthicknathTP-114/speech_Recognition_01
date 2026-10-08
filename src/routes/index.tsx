import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo } from "react";
import { useRecorder } from "@/hooks/useRecorder";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useStore } from "@/store/useStore";
import { asrClient } from "@/services/asrClient";
import { loadHistory, loadSettings, saveHistory } from "@/services/storage";
import { uid, avgConfidence } from "@/utils/format";

import { Header, HeroStrip } from "@/components/voxnova/Header";
import { InputPanel } from "@/components/voxnova/InputPanel";
import { LiveTranscription } from "@/components/voxnova/LiveTranscription";
import { Recorder } from "@/components/voxnova/Recorder";
import { StatsRow } from "@/components/voxnova/StatsRow";
import { TranscriptEditor } from "@/components/voxnova/TranscriptEditor";
import { AudioPlayer } from "@/components/voxnova/AudioPlayer";
import { RecentTranscriptions } from "@/components/voxnova/RecentTranscriptions";
import { SettingsPanel } from "@/components/voxnova/SettingsPanel";
import { ShortcutsOverlay } from "@/components/voxnova/ShortcutsOverlay";
import { Toasts } from "@/components/voxnova/Toasts";

export const Route = createFileRoute("/")(
  {
    component: EchoWavePage,
    head: () => ({
      meta: [
        { title: "EchoWave — Automatic Speech Recognition" },
        { name: "description", content: "Convert speech into accurate text in real time with EchoWave. Record from your microphone or upload audio files. Powered by Vosk ASR." },
        { property: "og:title", content: "EchoWave — Automatic Speech Recognition" },
        { property: "og:description", content: "Real-time speech-to-text powered by Vosk. Record, transcribe, search, edit, and export." },
      ],
    }),
  },
);

function EchoWavePage() {
  const { start, togglePause, stop, transcribeFile } = useRecorder();

  // Apply theme class and color palette to <html>
  const theme = useStore((s) => s.settings.theme);
  const palette = useStore((s) => s.settings.palette) ?? "violet";
  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.setAttribute("data-palette", palette);
  }, [theme, palette]);

  // Hydrate from localStorage once
  useEffect(() => {
    const saved = loadSettings();
    if (Object.keys(saved).length) useStore.getState().updateSettings(saved);
    useStore.getState().set({ history: loadHistory() });
  }, []);

  // Configure ASR client whenever settings change
  const settings = useStore((s) => s.settings);
  useEffect(() => {
    asrClient.configure({ url: settings.wsUrl, sampleRate: settings.sampleRate });
  }, [settings.wsUrl, settings.sampleRate]);

  // Wire ASR callbacks
  useEffect(() => {
    const st = useStore.getState;
    const unsub = [
      asrClient.onPartial((p) => st().set({ partial: p })),
      asrClient.onFinal(({ text, words }) => st().addFinal(text, words)),
      asrClient.onError((msg) => st().toast(msg, "error")),
      asrClient.onStatus((s) => st().set({ connection: s })),
    ];
    asrClient.connect();
    return () => { unsub.forEach((u) => u()); asrClient.disconnect(); };
  }, []);

  // Save to history when recording finishes
  const status = useStore((s) => s.status);
  const segments = useStore((s) => s.segments);
  useEffect(() => {
    if (status !== "idle" || !segments.length) return;
    const st = useStore.getState();
    const item = {
      id: uid(),
      title: segments[0]?.text?.slice(0, 40).replace(/[.\s]+$/, "") || "Untitled",
      duration: st.elapsed,
      language: st.language,
      confidence: avgConfidence(segments),
      created_at: new Date().toISOString(),
      segments,
      audio_blob_key: "",
    };
    const next = [item, ...st.history].slice(0, 50);
    st.set({ history: next });
    saveHistory(next);
  }, [status, segments]);

  // Keyboard shortcuts
  const actions = useMemo(() => ({ onStart: start, onTogglePause: togglePause, onStop: stop }), [start, togglePause, stop]);
  useKeyboardShortcuts(actions);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[1360px] px-4 pb-20 sm:px-6">
        <HeroStrip />

        {/* Top section: Input + Live Transcription */}
        <div className="mb-5 grid gap-5 lg:grid-cols-[400px_1fr]">
          <InputPanel onFile={transcribeFile} />
          <LiveTranscription />
        </div>

        {/* Recorder / Visualizer */}
        <div className="mb-5">
          <Recorder onStart={start} onTogglePause={togglePause} onStop={stop} />
        </div>

        {/* Telemetry Stats */}
        <div className="mb-5">
          <StatsRow />
        </div>

        {/* Middle section: Transcript Editor + Audio Player + ASR Info */}
        <div className="mb-5 grid gap-5 lg:grid-cols-[1fr_380px]">
          <TranscriptEditor />
          <AudioPlayer />
        </div>

        {/* History Library */}
        <div className="mb-5">
          <RecentTranscriptions />
        </div>
      </main>

      {/* Overlays */}
      <SettingsPanel />
      <ShortcutsOverlay />
      <Toasts />
    </div>
  );
}
